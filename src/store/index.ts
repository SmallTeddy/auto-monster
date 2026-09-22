import { computed, reactive, ref } from 'vue'
import { createGlobalState, useStorage } from '@vueuse/core'
import type {
  AutoHandleCfg, BagItem, BattleUnit, DungeonDef, FloatText, LogLine, Pet, Profile,
} from '@/game/types'
import { i18n } from '@/locales'
import { spriteByName } from '@/game/assets'
import { DUNGEONS } from '@/game/data/dungeons'
import { QUESTS } from '@/game/data/quests'
import { getHero } from '@/game/data/heroes'
import { getConsumableDef, getMaterialDef } from '@/game/data/catalog'
import { RARITY_META, RARITY_ORDER, UPGRADE_GOLD_COST, UPGRADE_SOUL_COST, boonsToBonus, enhanceCost, expNeed, petExpNeed, recycleGain, sellPrice } from '@/game/engine/stats'
import {
  BAG_CAP, genPet, genShopStock, rollDrop, shopSlotPrice, stackIntoBag, todayStr,
} from '@/game/engine/loot'
import { castHeroSkill, createHeroUnits, stepRound } from '@/game/engine/battle'
import { genBoonOffer, genDungeonWave, genTowerWave } from '@/game/engine/run'
import { chance, uid } from '@/game/engine/rng'

export interface Toast {
  id: number
  text: string
  type: 'info' | 'success' | 'error'
}

export interface ConfirmState {
  open: boolean
  title: string
  message: string
  /** 自动确认倒计时（秒），-1 表示不自动确认 */
  countdown: number
  resolve?: (value: boolean) => void
}

export interface RewardInfo {
  gold: number
  exp: number
  drops: BagItem[]
  stone: number
  egg?: boolean
}

export type RunStatus =
  | 'idle' | 'fighting' | 'waveClear' | 'boon'
  | 'runOver' | 'dungeonClear' | 'dungeonLost'

export interface RunState {
  started: boolean
  mode: 'tower' | 'dungeon'
  status: RunStatus
  floor: number
  units: BattleUnit[]
  round: number
  logs: LogLine[]
  floats: FloatText[]
  boonOffer: string[]
  dungeonDefId: string
  dungeonWave: number
  lastReward: RewardInfo | null
  goldGained: number
}

function defaultProfile(heroId: string): Profile {
  const starter = genPet(1, 'common', '狼')
  starter.deployed = true
  return {
    heroId,
    level: 1,
    exp: 0,
    gold: 200,
    soul: 0,
    stone: 5,
    bag: [
      { uid: uid('it'), kind: 'consumable', defId: 'potion_s', count: 3 },
    ],
    equipped: {},
    slotEnhance: { weapon: 0, armor: 0, accessory: 0 },
    pets: [starter],
    bestFloor: 0,
    boons: [],
    bagCap: 30,
    shop: { stock: genShopStock(1), sold: [false, false, false, false, false, false], refreshCount: 0 },
    daily: { date: todayStr(), progress: {}, claimed: {}, refreshCount: 0 },
    achievements: { progress: {}, claimed: {} },
    stats: {},
    stamina: 1000,
    staminaAt: Date.now(),
    dungeonCount: {},
    autoRecycleCfg: { enabled: false, minLevel: 1, maxLevel: 999, rarities: ['common'] },
    autoSellCfg: { enabled: false, minLevel: 1, maxLevel: 999, rarities: ['common'] },
    createdAt: Date.now(),
  }
}

const STAMINA_MAX = 1000
const STAMINA_REGEN_MS = 30_000
/** 每次购买体力恢复量 */
const STAMINA_BUY_AMOUNT = 100
/** 购买体力基础金币消耗 */
const STAMINA_BUY_COST = 50

export const useGlobalState = createGlobalState(() => {
  // 注意：默认值为 null 时 VueUse 会推断为 any 序列化器（String(v)），
  // 导致对象被存成 "[object Object]"，必须显式指定 JSON 序列化
  const profile = useStorage<Profile | null>(
    'auto-monster-profile',
    null,
    undefined,
    {
      serializer: {
        read: (v: string) => {
          if (!v)
            return null
          try {
            return JSON.parse(v) as Profile
          }
          catch {
            return null
          }
        },
        write: (v: Profile | null) => (v ? JSON.stringify(v) : ''),
      },
    },
  )
  const lang = useStorage<'zh-CN' | 'en-US'>('auto-monster-lang', 'zh-CN')
  i18n.global.locale.value = lang.value

  // 损坏/过旧存档直接废弃；旧存档迁移：背包中的强化石材料合并为货币
  if (profile.value && (!profile.value.heroId || !Array.isArray(profile.value.bag))) {
    profile.value = null
  }
  if (profile.value) {
    const pf = profile.value
    let merged = 0
    pf.bag = pf.bag.filter((b) => {
      if (b.kind === 'material' && b.defId === 'stone') {
        merged += b.count
        return false
      }
      return true
    })
    if (merged)
      pf.stone = (pf.stone ?? 0) + merged
    // 旧存档迁移：补充新增字段
    const anyPf = pf as any
    if (!pf.slotEnhance)
      pf.slotEnhance = { weapon: 0, armor: 0, accessory: 0 }
    if (!pf.daily.refreshCount)
      pf.daily.refreshCount = 0
    if (pf.autoRecycleCfg === undefined) {
      // 兼容旧的 autoRecycle 布尔字段
      const oldRecycle = anyPf.autoRecycle === true
      pf.autoRecycleCfg = { enabled: oldRecycle, minLevel: 1, maxLevel: 999, rarities: ['common'] }
    }
    if (pf.autoSellCfg === undefined)
      pf.autoSellCfg = { enabled: false, minLevel: 1, maxLevel: 999, rarities: ['common'] }
    if (pf.bagCap === undefined)
      pf.bagCap = BAG_CAP
  }

  const toasts = ref<Toast[]>([])
  let toastId = 1
  function toast(text: string, type: Toast['type'] = 'info') {
    const id = toastId++
    toasts.value.push({ id, text, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 2200)
  }

  // ---------------- 全局确认弹框（10s 自动确认） ----------------
  const confirmDialog = reactive<ConfirmState>({
    open: false,
    title: '',
    message: '',
    countdown: -1,
  })
  let confirmTimer: ReturnType<typeof setInterval> | null = null

  function confirm(message: string, title = '提示'): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // 若已有弹框，先关闭
      resolveConfirm(false)
      confirmDialog.title = title
      confirmDialog.message = message
      confirmDialog.countdown = 5
      confirmDialog.resolve = resolve
      confirmDialog.open = true
      // 每秒递减，到 0 自动确认
      if (confirmTimer)
        clearInterval(confirmTimer)
      confirmTimer = setInterval(() => {
        confirmDialog.countdown -= 1
        if (confirmDialog.countdown <= 0) {
          if (confirmTimer) {
            clearInterval(confirmTimer)
            confirmTimer = null
          }
          resolveConfirm(true)
        }
      }, 1000)
    })
  }

  function resolveConfirm(value: boolean) {
    if (confirmTimer) {
      clearInterval(confirmTimer)
      confirmTimer = null
    }
    const resolve = confirmDialog.resolve
    confirmDialog.open = false
    confirmDialog.resolve = undefined
    confirmDialog.countdown = -1
    resolve?.(value)
  }

  const run = reactive<RunState>({
    started: false,
    mode: 'tower',
    status: 'idle',
    floor: 1,
    units: [],
    round: 0,
    logs: [],
    floats: [],
    boonOffer: [],
    dungeonDefId: '',
    dungeonWave: 0,
    lastReward: null,
    goldGained: 0,
  })

  const activePanel = ref<'' | 'bag' | 'shop' | 'pet' | 'dungeon' | 'quest'>('')

  const hasSave = computed(() => !!profile.value && !!profile.value.heroId)
  const p = () => profile.value!

  // ---------------- 存档 ----------------
  function createSave(heroId: string) {
    profile.value = defaultProfile(heroId)
    startRun()
  }
  function deleteSave() {
    profile.value = null
    run.started = false
    run.status = 'idle'
    run.units = []
  }
  function toggleLang() {
    lang.value = lang.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    i18n.global.locale.value = lang.value
  }
  function toggleAutoRecycle() {
    const pf = p()
    pf.autoRecycleCfg.enabled = !pf.autoRecycleCfg.enabled
    toast(pf.autoRecycleCfg.enabled ? '自动回收已开启' : '自动回收已关闭', pf.autoRecycleCfg.enabled ? 'success' : 'info')
  }
  function toggleAutoSell() {
    const pf = p()
    pf.autoSellCfg.enabled = !pf.autoSellCfg.enabled
    toast(pf.autoSellCfg.enabled ? '自动出售已开启' : '自动出售已关闭', pf.autoSellCfg.enabled ? 'success' : 'info')
  }
  function updateAutoCfg(kind: 'recycle' | 'sell', patch: Partial<AutoHandleCfg>) {
    const pf = p()
    const cfg = kind === 'recycle' ? pf.autoRecycleCfg : pf.autoSellCfg
    Object.assign(cfg, patch)
  }

  // ---------------- 刷新日常任务 ----------------
  const DAILY_REFRESH_COST = 100
  function refreshDaily(): boolean {
    const pf = p()
    if (pf.gold < DAILY_REFRESH_COST) {
      toast(`金币不足（需 ${DAILY_REFRESH_COST}）`, 'error')
      return false
    }
    pf.gold -= DAILY_REFRESH_COST
    pf.daily.refreshCount += 1
    // 重置所有日常任务进度与领取状态
    pf.daily.progress = {}
    pf.daily.claimed = {}
    toast('日常任务已刷新', 'success')
    return true
  }

  // ---------------- 任务事件 ----------------
  function ensureDaily() {
    const pf = p()
    if (pf.daily.date !== todayStr()) {
      pf.daily = { date: todayStr(), progress: {}, claimed: {}, refreshCount: 0 }
    }
  }
  function track(event: string, value = 1, mode: 'inc' | 'max' = 'inc') {
    ensureDaily()
    const pf = p()
    if (mode === 'max') {
      pf.daily.progress[event] = Math.max(pf.daily.progress[event] ?? 0, value)
      pf.achievements.progress[event] = Math.max(pf.achievements.progress[event] ?? 0, value)
    }
    else {
      pf.daily.progress[event] = (pf.daily.progress[event] ?? 0) + value
      pf.achievements.progress[event] = (pf.achievements.progress[event] ?? 0) + value
    }
  }

  function questProgress(qid: string): { current: number, claimable: boolean, claimed: boolean } {
    const def = QUESTS.find(q => q.id === qid)!
    const pf = p()
    const store = def.daily ? pf.daily : pf.achievements
    const current = store.progress[def.event] ?? 0
    const claimed = !!store.claimed[qid]
    return { current: Math.min(current, def.target), claimable: current >= def.target && !claimed, claimed }
  }
  function claimableCount(): number {
    return QUESTS.reduce((n, q) => n + (questProgress(q.id).claimable ? 1 : 0), 0)
  }
  function claimQuest(qid: string) {
    const def = QUESTS.find(q => q.id === qid)!
    const info = questProgress(qid)
    if (!info.claimable)
      return
    const pf = p()
    const store = def.daily ? pf.daily : pf.achievements
    store.claimed[qid] = true
    if (def.rewards.gold)
      pf.gold += def.rewards.gold
    if (def.rewards.stone)
      pf.stone += def.rewards.stone
    if (def.rewards.soul)
      pf.soul += def.rewards.soul
    if (def.rewards.exp)
      gainExp(def.rewards.exp)
    if (def.rewards.item) {
      stackIntoBag(pf.bag, {
        uid: uid('it'),
        kind: 'consumable',
        defId: def.rewards.item.defId,
        count: def.rewards.item.count,
      }, pf.bagCap)
    }
    toast(`任务奖励已领取`, 'success')
  }

  // ---------------- 体力 ----------------
  function syncStamina() {
    if (!profile.value)
      return
    const pf = profile.value
    if (pf.stamina >= STAMINA_MAX) {
      pf.staminaAt = Date.now()
      return
    }
    const gain = Math.floor((Date.now() - pf.staminaAt) / STAMINA_REGEN_MS)
    if (gain > 0) {
      pf.stamina = Math.min(STAMINA_MAX, pf.stamina + gain)
      pf.staminaAt += gain * STAMINA_REGEN_MS
      if (pf.stamina >= STAMINA_MAX)
        pf.staminaAt = Date.now()
    }
  }

  /** 花金币购买体力 */
  function buyStamina(): boolean {
    const pf = p()
    if (pf.stamina >= STAMINA_MAX) {
      toast('体力已满', 'error')
      return false
    }
    if (pf.gold < STAMINA_BUY_COST) {
      toast(`金币不足（需 ${STAMINA_BUY_COST}）`, 'error')
      return false
    }
    pf.gold -= STAMINA_BUY_COST
    pf.stamina = Math.min(STAMINA_MAX, pf.stamina + STAMINA_BUY_AMOUNT)
    pf.staminaAt = Date.now()
    toast(`+${STAMINA_BUY_AMOUNT} 体力`, 'success')
    return true
  }

  // ---------------- 经验 / 物品 ----------------
  function gainExp(amount: number) {
    const pf = p()
    pf.exp += amount
    while (pf.exp >= expNeed(pf.level)) {
      pf.exp -= expNeed(pf.level)
      pf.level += 1
      track('level', pf.level, 'max')
      toast(`角色升到 ${pf.level} 级！`, 'success')
    }
  }

  // 判断装备是否命中自动处理配置
  function matchAutoCfg(item: BagItem, cfg: AutoHandleCfg): boolean {
    if (!cfg.enabled || item.kind !== 'equip')
      return false
    const lv = item.itemLevel ?? 1
    if (lv < cfg.minLevel || lv > cfg.maxLevel)
      return false
    return cfg.rarities.includes(item.rarity ?? 'common')
  }

  function addItem(item: BagItem): { added: boolean, autoSold: number, autoRecycled: boolean } {
    const pf = p()
    if (stackIntoBag(pf.bag, item, pf.bagCap))
      return { added: true, autoSold: 0, autoRecycled: false }
    // 背包满：自动回收优先
    if (matchAutoCfg(item, pf.autoRecycleCfg)) {
      const gain = recycleGain(item)
      pf.stone += gain.stone
      pf.soul += gain.soul
      return { added: false, autoSold: 0, autoRecycled: true }
    }
    if (matchAutoCfg(item, pf.autoSellCfg)) {
      const gold = sellPrice(item)
      pf.gold += gold
      return { added: false, autoSold: gold, autoRecycled: false }
    }
    // 新装备不在清理范围时，优先替换背包内命中的旧装备
    if (item.kind === 'equip') {
      const oldIdx = pf.bag.findIndex(b => matchAutoCfg(b, pf.autoRecycleCfg))
      if (oldIdx !== -1) {
        const [old] = pf.bag.splice(oldIdx, 1)
        const gain = recycleGain(old)
        pf.stone += gain.stone
        pf.soul += gain.soul
        pf.bag.push(item)
        return { added: true, autoSold: 0, autoRecycled: false }
      }
      const sellIdx = pf.bag.findIndex(b => matchAutoCfg(b, pf.autoSellCfg))
      if (sellIdx !== -1) {
        const [old] = pf.bag.splice(sellIdx, 1)
        pf.gold += sellPrice(old)
        pf.bag.push(item)
        return { added: true, autoSold: 0, autoRecycled: false }
      }
    }
    // 背包满：装备自动出售，其余丢弃
    const gold = item.kind === 'equip' ? sellPrice(item) : 0
    pf.gold += gold
    return { added: false, autoSold: gold, autoRecycled: false }
  }

  function addPet(pet: Pet) {
    p().pets.push(pet)
    track('petGain', p().pets.length, 'max')
  }

  // ---------------- 背包：整理 / 出售 / 回收 / 使用 ----------------
  const SORT_ORDER = { equip: 0, consumable: 1, material: 2 }
  function sortBag() {
    const pf = p()
    pf.bag.sort((a, b) => {
      const sa = SORT_ORDER[a.kind] - SORT_ORDER[b.kind]
      if (sa !== 0)
        return sa
      if (a.kind === 'equip') {
        const ri = RARITY_ORDER.indexOf(b.rarity ?? 'common') - RARITY_ORDER.indexOf(a.rarity ?? 'common')
        if (ri !== 0)
          return ri
        return (b.enhance ?? 0) - (a.enhance ?? 0)
      }
      return a.defId.localeCompare(b.defId)
    })
    toast(i18n.global.t('bag.sortDone'), 'success')
  }

  function sellItem(itemUid: string) {
    const pf = p()
    // 先查背包
    const idx = pf.bag.findIndex(b => b.uid === itemUid)
    if (idx !== -1) {
      const [item] = pf.bag.splice(idx, 1)
      if (item.kind === 'equip') {
        pf.gold += sellPrice(item)
        toast(`+${sellPrice(item)} 金币`, 'success')
      }
      else {
        const def = item.kind === 'consumable' ? getConsumableDef(item.defId) : getMaterialDef(item.defId)
        const total = def.price * item.count
        pf.gold += total
        toast(`+${total} 金币`, 'success')
      }
      return
    }
    // 再查装备栏位：卖出后强化保留在栏位上
    for (const slot of ['weapon', 'armor', 'accessory'] as const) {
      const item = pf.equipped[slot]
      if (item && item.uid === itemUid) {
        pf.gold += sellPrice(item)
        pf.equipped[slot] = undefined
        // slotEnhance 保留，不重置
        toast(`+${sellPrice(item)} 金币（强化已保留在栏位）`, 'success')
        return
      }
    }
  }

  function recycleItem(itemUid: string) {
    const pf = p()
    const idx = pf.bag.findIndex(b => b.uid === itemUid)
    if (idx === -1)
      return
    const [item] = pf.bag.splice(idx, 1)
    if (item.kind !== 'equip') {
      pf.bag.splice(idx, 0, item)
      toast('只有装备可以回收', 'error')
      return
    }
    const gain = recycleGain(item)
    pf.stone += gain.stone
    pf.soul += gain.soul
    track('recycle', 1)
    toast(`回收获得 ${gain.stone} 强化石、${gain.soul} 结晶`, 'success')
  }

  /** 一键出售背包中所有非装备（消耗品/材料）及可选装备 */
  function sellAllEquips() {
    const pf = p()
    const before = pf.bag.length
    let gold = 0
    pf.bag = pf.bag.filter((it) => {
      if (it.kind === 'equip') {
        gold += sellPrice(it)
        return false
      }
      return true
    })
    pf.gold += gold
    const cnt = before - pf.bag.length
    if (cnt > 0)
      toast(`一键出售 ${cnt} 件装备，+${gold} 金币`, 'success')
    else
      toast('背包中没有装备', 'info')
  }

  /** 一键回收背包中所有装备 */
  function recycleAllEquips() {
    const pf = p()
    const before = pf.bag.length
    let stone = 0
    let soul = 0
    pf.bag = pf.bag.filter((it) => {
      if (it.kind === 'equip') {
        const g = recycleGain(it)
        stone += g.stone
        soul += g.soul
        return false
      }
      return true
    })
    pf.stone += stone
    pf.soul += soul
    const cnt = before - pf.bag.length
    if (cnt > 0) {
      track('recycle', cnt)
      toast(`一键回收 ${cnt} 件装备，+${stone} 强化石、+${soul} 结晶`, 'success')
    }
    else {
      toast('背包中没有装备', 'info')
    }
  }

  /** 购买背包容量：每次 +5 格，价格递增 */
  const BAG_SLOT_STEP = 5
  const BAG_MAX_CAP = 200
  function bagSlotCost(): number {
    const pf = p()
    const steps = Math.floor((pf.bagCap - BAG_CAP) / BAG_SLOT_STEP)
    return Math.round(200 * (1 + steps * 0.5))
  }
  function buyBagSlot(): boolean {
    const pf = p()
    if (pf.bagCap >= BAG_MAX_CAP) {
      toast('背包已达最大容量', 'error')
      return false
    }
    const cost = bagSlotCost()
    if (pf.gold < cost) {
      toast(`金币不足（需 ${cost}）`, 'error')
      return false
    }
    pf.gold -= cost
    pf.bagCap = Math.min(BAG_MAX_CAP, pf.bagCap + BAG_SLOT_STEP)
    toast(`背包容量提升至 ${pf.bagCap}`, 'success')
    return true
  }

  function usePotion(itemUid?: string): boolean {
    const pf = p()
    const hero = run.units.find(u => u.side === 'hero')
    const item = itemUid
      ? pf.bag.find(b => b.uid === itemUid)
      : pf.bag.find(b => b.kind === 'consumable' && b.defId === 'potion_s')
        ?? pf.bag.find(b => b.kind === 'consumable' && b.defId === 'potion_l')
    if (!item || item.kind !== 'consumable')
      return false
    if (!hero || !hero.alive) {
      toast('仅能在战斗中使用药水', 'error')
      return false
    }
    const def = getConsumableDef(item.defId)
    const heal = Math.round(hero.maxHp * (def.heal ?? 0) * (1 - (hero.healReduce ?? 0)))
    hero.hp = Math.min(hero.maxHp, hero.hp + heal)
    run.floats.push({ id: Date.now(), uid: hero.id, text: `+${heal}`, crit: false })
    pushLog(`${def.name}：恢复 ${heal} 生命`, 'heal')
    item.count -= 1
    if (item.count <= 0) {
      const idx = pf.bag.findIndex(b => b.uid === item.uid)
      if (idx !== -1)
        pf.bag.splice(idx, 1)
    }
    return true
  }

  // ---------------- 装备：穿戴 / 卸下 / 强化 / 升级 ----------------
  function equipItem(itemUid: string) {
    const pf = p()
    const idx = pf.bag.findIndex(b => b.uid === itemUid)
    if (idx === -1)
      return
    const item = pf.bag[idx]
    if (item.kind !== 'equip')
      return
    pf.bag.splice(idx, 1)
    // 借助装备 defId 首字母查槽位（w/a/c）
    const slot = (() => {
      const m = item.defId[0]
      return m === 'w' ? 'weapon' : m === 'a' ? 'armor' : 'accessory'
    })()
    const old = pf.equipped[slot]
    // 新装备继承槽位强化等级
    item.enhance = pf.slotEnhance[slot]
    pf.equipped[slot] = item
    if (old)
      pf.bag.push(old)
    if ((item.rarity ?? 'common') !== 'common' && (item.rarity ?? 'common') !== 'rare')
      track('equipEpic', 1, 'max')
    toast('装备成功', 'success')
  }

  function unequipItem(slot: 'weapon' | 'armor' | 'accessory') {
    const pf = p()
    const item = pf.equipped[slot]
    if (!item)
      return
    if (pf.bag.length >= pf.bagCap) {
      toast(i18n.global.t('bag.bagFull'), 'error')
      return
    }
    pf.bag.push(item)
    pf.equipped[slot] = undefined
  }

  const MAX_ENHANCE = 99
  function enhanceItem(slot: 'weapon' | 'armor' | 'accessory') {
    const pf = p()
    const item = pf.equipped[slot]
    if (!item)
      return
    const e = pf.slotEnhance[slot]
    if (e >= MAX_ENHANCE) {
      toast(i18n.global.t('bag.enhanceMax'), 'error')
      return
    }
    const rIdx = RARITY_ORDER.indexOf(item.rarity ?? 'common')
    const cost = enhanceCost(rIdx, e)
    if (pf.gold < cost.gold) {
      toast(i18n.global.t('bag.goldLack'), 'error')
      return
    }
    if (pf.stone < cost.stone) {
      toast(i18n.global.t('bag.materialLack'), 'error')
      return
    }
    pf.gold -= cost.gold
    pf.stone -= cost.stone
    track('enhance', 1)
    if (chance(cost.rate)) {
      pf.slotEnhance[slot] = e + 1
      item.enhance = e + 1
      toast(`${i18n.global.t('bag.enhanceSuccess')} +${pf.slotEnhance[slot]}`, 'success')
    }
    else {
      toast(i18n.global.t('bag.enhanceFail'), 'error')
    }
  }

  function upgradeItem(slot: 'weapon' | 'armor' | 'accessory') {
    const pf = p()
    const item = pf.equipped[slot]
    if (!item)
      return
    const r = item.rarity ?? 'common'
    const next = RARITY_META[r].next
    if (!next) {
      toast('已达最高品阶', 'error')
      return
    }
    if (pf.slotEnhance[slot] < 5) {
      toast('需要强化等级 +5 以上', 'error')
      return
    }
    const idx = RARITY_ORDER.indexOf(r)
    const soulCost = UPGRADE_SOUL_COST[idx]
    const goldCost = UPGRADE_GOLD_COST[idx]
    if (pf.soul < soulCost || pf.gold < goldCost) {
      toast(i18n.global.t('bag.materialLack'), 'error')
      return
    }
    pf.soul -= soulCost
    pf.gold -= goldCost
    item.rarity = next
    pf.slotEnhance[slot] = Math.max(0, pf.slotEnhance[slot] - 5)
    item.enhance = pf.slotEnhance[slot]
    toast(i18n.global.t('bag.upgradeSuccess'), 'success')
  }

  // ---------------- 商店 ----------------
  function refreshShop() {
    const pf = p()
    const cost = Math.min(200, 25 * (pf.shop.refreshCount + 1))
    if (pf.gold < cost) {
      toast(i18n.global.t('bag.goldLack'), 'error')
      return
    }
    pf.gold -= cost
    pf.shop.refreshCount += 1
    pf.shop.stock = genShopStock(pf.level)
    pf.shop.sold = pf.shop.stock.map(() => false)
    toast(i18n.global.t('shop.refreshed'), 'success')
  }

  function buyShop(index: number) {
    const pf = p()
    const slot = pf.shop.stock[index]
    if (!slot || pf.shop.sold[index])
      return
    const price = shopSlotPrice(slot)
    if (pf.gold < price) {
      toast(i18n.global.t('bag.goldLack'), 'error')
      return
    }
    if (slot.kind === 'pet') {
      pf.gold -= price
      const pet = genPet(slot.level, slot.rarity)
      addPet(pet)
      pf.shop.sold[index] = true
      toast(`获得宠物：${pet.name}`, 'success')
      return
    }
    if (slot.kind === 'equip') {
      if (pf.bag.length >= pf.bagCap) {
        toast('背包已满', 'error')
        return
      }
      pf.gold -= price
      pf.bag.push(slot.equip!)
    }
    else if (slot.kind === 'material') {
      pf.gold -= price
      pf.stone += 1
    }
    else {
      pf.gold -= price
      addItem({ uid: uid('it'), kind: slot.kind, defId: slot.defId!, count: 1 })
    }
    pf.shop.sold[index] = true
    track('shopBuy', 1)
    toast(i18n.global.t('shop.bought'), 'success')
  }

  // ---------------- 宠物：出战 / 训练 / 出售 / 回收 ----------------
  function deployPet(petUid: string) {
    const pf = p()
    const count = pf.pets.filter(x => x.deployed).length
    if (count >= 5) {
      toast(i18n.global.t('pet.deployLimit', { n: 5 }), 'error')
      return
    }
    const pet = pf.pets.find(x => x.uid === petUid)
    if (pet)
      pet.deployed = true
  }
  function withdrawPet(petUid: string) {
    const pet = p().pets.find(x => x.uid === petUid)
    if (pet)
      pet.deployed = false
  }
  function trainPet(petUid: string) {
    const pf = p()
    const pet = pf.pets.find(x => x.uid === petUid)
    if (!pet)
      return
    if (pet.train >= 10) {
      toast(i18n.global.t('pet.trainMax'), 'error')
      return
    }
    const cost = 60 * pet.level * (pet.train + 1)
    if (pf.gold < cost) {
      toast(i18n.global.t('bag.goldLack'), 'error')
      return
    }
    pf.gold -= cost
    pet.train += 1
    toast('训练成功', 'success')
  }
  function petSellPrice(pet: Pet): number {
    return Math.round(50 * pet.level ** 1.1 * RARITY_META[pet.rarity].mul)
  }
  function sellPet(petUid: string) {
    const pf = p()
    const idx = pf.pets.findIndex(x => x.uid === petUid)
    if (idx === -1)
      return
    const [pet] = pf.pets.splice(idx, 1)
    pf.gold += petSellPrice(pet)
    toast(`+${petSellPrice(pet)} 金币`, 'success')
  }
  function recyclePet(petUid: string) {
    const pf = p()
    const idx = pf.pets.findIndex(x => x.uid === petUid)
    if (idx === -1)
      return
    const [pet] = pf.pets.splice(idx, 1)
    const soul = [3, 7, 18, 40][RARITY_ORDER.indexOf(pet.rarity)]
    pf.soul += soul
    track('recycle', 1)
    toast(`回收获得 ${soul} 结晶`, 'success')
  }

  // ---------------- 副本 ----------------
  function dungeonDef(id: string): DungeonDef {
    return DUNGEONS.find(d => d.id === id) ?? DUNGEONS[0]
  }
  function enterDungeon(id: string) {
    syncStamina()
    const pf = p()
    const def = dungeonDef(id)
    if (pf.level < def.needLevel) {
      toast(i18n.global.t('common.locked'), 'error')
      return
    }
    if (pf.stamina < def.cost) {
      toast(i18n.global.t('dungeon.staminaLack'), 'error')
      return
    }
    pf.stamina -= def.cost
    pf.staminaAt = Date.now()
    run.mode = 'dungeon'
    run.dungeonDefId = id
    run.dungeonWave = 0
    activePanel.value = ''
    loadDungeonWave()
  }
  // 副本扫荡：已通关的副本可消耗双倍体力立即结算奖励
  function sweepDungeon(id: string) {
    syncStamina()
    const pf = p()
    const def = dungeonDef(id)
    if (!pf.dungeonCount[id]) {
      toast('需先通关该副本', 'error')
      return
    }
    const cost = def.cost * 2
    if (pf.stamina < cost) {
      toast(`体力不足（需 ${cost}）`, 'error')
      return
    }
    pf.stamina -= cost
    pf.staminaAt = Date.now()
    // 直接发放奖励
    pf.gold += def.rewards.gold
    run.goldGained += def.rewards.gold
    gainExp(def.rewards.exp)
    for (const item of def.rewards.items) {
      if (item.defId === 'stone')
        pf.stone += item.count
      else
        addItem({ uid: uid('it'), kind: 'consumable', defId: item.defId, count: item.count })
    }
    if (def.rewards.egg) {
      const pet = genPet(def.level, undefined)
      addPet(pet)
    }
    pf.dungeonCount[id] += 1
    track('dungeonClear', 1)
    run.lastReward = {
      gold: def.rewards.gold,
      exp: def.rewards.exp,
      drops: [],
      stone: def.rewards.items.find(i => i.defId === 'stone')?.count ?? 0,
      egg: def.rewards.egg,
    }
    toast(`扫荡【${def.name}】成功！`, 'success')
  }
  function loadDungeonWave() {
    const def = dungeonDef(run.dungeonDefId)
    run.units = [...createHeroUnits(p()), ...genDungeonWave(def, run.dungeonWave)]
    run.round = 0
    run.status = 'fighting'
    run.floats = []
  }
  function nextDungeonWave() {
    const def = dungeonDef(run.dungeonDefId)
    if (run.dungeonWave < def.waves - 1) {
      run.dungeonWave += 1
      loadDungeonWave()
    }
  }
  function abandonDungeon() {
    exitToTower()
  }
  function exitToTower() {
    run.mode = 'tower'
    run.dungeonDefId = ''
    run.dungeonWave = 0
    loadTowerWave()
  }

  // ---------------- 无尽魔塔 / 战斗 ----------------
  function pushLog(text: string, type: LogLine['type'] = 'sys') {
    run.logs.push({ id: Date.now() + Math.random(), text, type })
    if (run.logs.length > 80)
      run.logs.shift()
  }

  function loadTowerWave() {
    run.units = [...createHeroUnits(p()), ...genTowerWave(run.floor)]
    run.round = 0
    run.status = 'fighting'
    run.floats = []
  }

  function startRun() {
    run.started = true
    run.mode = 'tower'
    run.floor = 1
    run.goldGained = 0
    run.logs = []
    run.boonOffer = []
    // 祝福（boons）与等级、宠物一样属于永久成长，跨次冒险保留
    loadTowerWave()
    pushLog('冒险开始！无尽魔塔第 1 层', 'sys')
  }

  function nextTowerFloor() {
    run.floor += 1
    loadTowerWave()
    pushLog(`进入第 ${run.floor} 层`, 'sys')
  }

  function chooseBoon(boonId: string) {
    p().boons.push(boonId)
    run.boonOffer = []
    nextTowerFloor()
  }

  function settleTowerVictory(): RewardInfo {
    const pf = p()
    const bonus = boonsToBonus(pf.boons)
    const boss = run.floor % 5 === 0
    const gold = Math.round((12 + run.floor * 4) * (boss ? 3 : 1) * (1 + bonus.goldBonus / 100))
    const exp = Math.round((12 + run.floor * 4) * (boss ? 2.5 : 1))
    pf.gold += gold
    run.goldGained += gold
    gainExp(exp)
    const drop = rollDrop(run.floor, bonus.dropBonus / 100, boss)
    const drops: BagItem[] = []
    let stone = 0
    if (drop) {
      if (drop.kind === 'equip') {
        const r = addItem(drop)
        if (r.added)
          drops.push(drop)
        else if (r.autoRecycled)
          toast('背包已满，普通装备已自动回收', 'info')
        else
          toast(`${i18n.global.t('bag.bagFull')} (+${r.autoSold})`, 'info')
      }
      else if (drop.kind === 'material') {
        pf.stone += drop.count
        stone = drop.count
      }
      else {
        addItem(drop)
        drops.push(drop)
      }
    }
    // 出战宠物获得经验
    for (const pet of pf.pets.filter(x => x.deployed)) {
      pet.xp += Math.round(exp * 0.6)
      while (pet.xp >= petExpNeed(pet.level)) {
        pet.xp -= petExpNeed(pet.level)
        pet.level += 1
      }
    }
    pf.bestFloor = Math.max(pf.bestFloor, run.floor)
    track('battle', 1)
    track('floor', run.floor, 'max')
    return { gold, exp, drops, stone }
  }

  function settleDungeonVictory() {
    const pf = p()
    const def = dungeonDef(run.dungeonDefId)
    pf.gold += def.rewards.gold
    run.goldGained += def.rewards.gold
    gainExp(def.rewards.exp)
    for (const item of def.rewards.items) {
      if (item.defId === 'stone')
        pf.stone += item.count
      else
        addItem({ uid: uid('it'), kind: 'consumable', defId: item.defId, count: item.count })
    }
    if (def.rewards.egg) {
      const pet = genPet(def.level, undefined)
      addPet(pet)
    }
    pf.dungeonCount[def.id] = (pf.dungeonCount[def.id] ?? 0) + 1
    track('dungeonClear', 1)
    run.lastReward = {
      gold: def.rewards.gold,
      exp: def.rewards.exp,
      drops: [],
      stone: def.rewards.items.find(i => i.defId === 'stone')?.count ?? 0,
      egg: def.rewards.egg,
    }
  }

  function battleTick() {
    if (run.status !== 'fighting' || !run.units.length)
      return
    run.round += 1
    const result = stepRound(run.units, { logs: run.logs, floats: run.floats })
    if (result === 'fighting')
      return
    if (result === 'lost') {
      pushLog('英雄阵亡，本次冒险结束', 'kill')
      run.status = run.mode === 'tower' ? 'runOver' : 'dungeonLost'
      return
    }
    // 胜利
    if (run.mode === 'tower') {
      const reward = settleTowerVictory()
      run.lastReward = reward
      pushLog(`第 ${run.floor} 层胜利！+${reward.gold} 金币 +${reward.exp} 经验`, 'reward')
      if (run.floor % 5 === 0) {
        run.boonOffer = genBoonOffer(p().boons)
        run.status = 'boon'
      }
      else {
        run.status = 'waveClear'
      }
    }
    else {
      const def = dungeonDef(run.dungeonDefId)
      if (run.dungeonWave === def.waves - 1) {
        settleDungeonVictory()
        pushLog(`副本【${def.name}】通关！`, 'reward')
        run.status = 'dungeonClear'
      }
      else {
        run.status = 'waveClear'
      }
    }
  }

  /** 释放英雄主动技能 */
  function castSkill(): boolean {
    if (run.status !== 'fighting')
      return false
    const pf = p()
    const ok = castHeroSkill(run.units, pf.heroId, { logs: run.logs, floats: run.floats })
    if (!ok) {
      toast('技能冷却中或无法释放', 'error')
      return false
    }
    // 技能可能直接清场，立即结算
    const enemyAlive = run.units.some(u => u.side === 'enemy' && u.alive)
    if (!enemyAlive)
      battleTick()
    return true
  }

  /** 当前英雄的主动技能定义（供 UI 展示） */
  function heroActiveSkill() {
    const pf = p()
    return getHero(pf.heroId).active
  }
  /** 当前英雄单位技能剩余冷却 */
  function heroSkillCd(): number {
    const hero = run.units.find(u => u.side === 'hero')
    return hero?.skillCd ?? 0
  }

  /** 自动补满宠物精灵 url（旧存档容错） */
  function fixPetSprites() {
    if (!profile.value)
      return
    for (const pet of profile.value.pets) {
      if (!pet.sprite)
        pet.sprite = spriteByName(pet.name)?.url ?? ''
    }
  }
  fixPetSprites()

  return {
    profile, lang, toasts, toast, run, activePanel, hasSave,
    confirmDialog, confirm, resolveConfirm,
    createSave, deleteSave, toggleLang, toggleAutoRecycle, toggleAutoSell, updateAutoCfg, refreshDaily, DAILY_REFRESH_COST,
    questProgress, claimableCount, claimQuest,
    syncStamina, buyStamina, STAMINA_BUY_COST, STAMINA_BUY_AMOUNT, gainExp, addItem, addPet,
    sortBag, sellItem, recycleItem, sellAllEquips, recycleAllEquips, buyBagSlot, bagSlotCost, usePotion,
    equipItem, unequipItem, enhanceItem, upgradeItem, MAX_ENHANCE,
    refreshShop, buyShop,
    deployPet, withdrawPet, trainPet, petSellPrice, sellPet, recyclePet,
    dungeonDef, enterDungeon, sweepDungeon, nextDungeonWave, abandonDungeon, exitToTower,
    startRun, nextTowerFloor, chooseBoon, battleTick,
    castSkill, heroActiveSkill, heroSkillCd,
    track, STAMINA_MAX,
  }
})
