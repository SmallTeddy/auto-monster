import type { BagItem, EquipSlot, Pet, Rarity, ShopSlot, Stats } from '../types'
import { SPRITES, spriteByName } from '../assets'
import { EQUIPS, getEquipDef } from '../data/catalog'
import { RARITY_META, RARITY_ORDER, rollRarity } from './stats'
import { chance, pick, randInt, uid, weighted } from './rng'

// ---------------- 敌人属性 ----------------
export function enemyStats(level: number, boss: boolean, rarityMul = 1): Stats {
  const lv = Math.max(1, level)
  const s: Stats = {
    hp: Math.round(70 * lv ** 1.3),
    atk: Math.round(10 + lv * 3.2),
    def: Math.round(lv * 1.25),
    spd: Math.round((7 + lv * 0.25) * 10) / 10,
  }
  const v = 0.9 + Math.random() * 0.2
  s.hp = Math.round(s.hp * v * rarityMul)
  s.atk = Math.round(s.atk * v * rarityMul)
  s.def = Math.round(s.def * v * rarityMul)
  if (boss) {
    s.hp = Math.round(s.hp * 5)
    s.atk = Math.round(s.atk * 2.2)
    s.def = Math.round(s.def * 2.1)
    s.spd = Math.round(s.spd * 1.2 * 10) / 10
  }
  return s
}

// ---------------- 装备生成 ----------------
export function genEquip(floor: number, rarity?: Rarity, slot?: EquipSlot): BagItem {
  const pool = EQUIPS.filter(e => e.floor <= floor + 2)
  const slotPool = slot ? pool.filter(e => e.slot === slot) : pool
  const def = pick(slotPool.length ? slotPool : pool)
  return {
    uid: uid('eq'),
    kind: 'equip',
    defId: def.id,
    count: 1,
    rarity: rarity ?? rollRarity(floor),
    enhance: 0,
    itemLevel: Math.max(1, floor),
  }
}

// ---------------- 宠物生成 ----------------
const PET_RARITY_WEIGHT: [Rarity, number][] = [
  ['common', 62],
  ['rare', 27],
  ['epic', 9],
  ['legendary', 2],
]

export function rollPetRarity(luck = 0): Rarity {
  return weighted<Rarity>([
    ['common', Math.max(15, 62 - luck * 20)],
    ['rare', 27 + luck * 10],
    ['epic', 9 + luck * 7],
    ['legendary', 2 + luck * 3],
  ])
}

export function genPet(level: number, rarity?: Rarity, fixedName?: string): Pet {
  const lv = Math.max(1, level)
  const r = rarity ?? rollPetRarity()
  const sp = fixedName
    ? spriteByName(fixedName)
    : pick(SPRITES.filter(s => !s.boss).length ? SPRITES.filter(s => !s.boss) : SPRITES)
  // 捕捉强度按等级的敌人 *0.75，再折算回 1 级基础值
  const target = enemyStats(lv, false)
  const k = 1 + (lv - 1) * 0.11
  const mul = RARITY_META[r].mul * 0.78
  return {
    uid: uid('pet'),
    name: sp.name,
    sprite: sp.url,
    rarity: r,
    level: 1,
    xp: 0,
    train: 0,
    base: {
      hp: Math.max(20, Math.round(target.hp * mul / k)),
      atk: Math.max(4, Math.round(target.atk * mul / k)),
      def: Math.max(1, Math.round(target.def * mul / k)),
      spd: Math.max(4, Math.round(target.spd * mul / k * 10) / 10),
    },
    deployed: false,
  }
}

// ---------------- 掉落 ----------------
export function rollDrop(floor: number, dropBonus = 0, boss = false): BagItem | null {
  if (boss) {
    const eq = genEquip(floor)
    return eq
  }
  const roll = Math.random()
  const equipP = 0.16 + dropBonus
  const potionP = 0.22
  const stoneP = 0.16
  if (roll < equipP)
    return genEquip(floor)
  if (roll < equipP + potionP)
    return { uid: uid('it'), kind: 'consumable', defId: chance(0.7) ? 'potion_s' : 'potion_l', count: 1 }
  if (roll < equipP + potionP + stoneP)
    return { uid: uid('it'), kind: 'material', defId: 'stone', count: randInt(1, 2) }
  return null
}

// ---------------- 商店 ----------------
export function genShopStock(level: number): ShopSlot[] {
  const slots: ShopSlot[] = []
  const floor = Math.max(1, level + randInt(-1, 2))
  slots.push({ kind: 'equip', level: floor, rarity: rollRarity(floor, -0.3), equip: genEquip(floor, rollRarity(floor, -0.3)) })
  slots.push({ kind: 'equip', level: floor, rarity: rollRarity(floor, -0.4), equip: genEquip(floor, rollRarity(floor, -0.4)) })
  slots.push({ kind: 'consumable', defId: 'potion_s', level })
  slots.push({ kind: 'consumable', defId: chance(0.5) ? 'potion_l' : 'potion_s', level })
  slots.push({ kind: 'material', defId: 'stone', level })
  slots.push({ kind: 'pet', level: Math.max(1, floor), rarity: rollPetRarity(0.1) })
  return slots
}

export function shopSlotPrice(slot: ShopSlot): number {
  if (slot.kind === 'equip') {
    // 预览装备：用同层模板均价
    const pool = EQUIPS.filter(e => e.floor <= slot.level + 2)
    const avg = pool.reduce((s, e) => s + e.price, 0) / pool.length
    return Math.round(avg * RARITY_META[slot.rarity ?? 'common'].mul * 0.9)
  }
  if (slot.kind === 'pet')
    return Math.round(80 * slot.level ** 1.2 * RARITY_META[slot.rarity ?? 'common'].mul * 0.9)
  if (slot.kind === 'consumable')
    return slot.defId === 'potion_l' ? 120 : 40
  return 25
}

export function shopSlotPreviewEquip(slot: ShopSlot): BagItem {
  // 购买前展示用的临时装备
  return genEquip(slot.level, slot.rarity)
}

// ---------------- 工具 ----------------
export function stackIntoBag(bag: BagItem[], item: BagItem): boolean {
  if (item.kind !== 'equip') {
    const exist = bag.find(b => b.kind === item.kind && b.defId === item.defId)
    if (exist) {
      exist.count += item.count
      return true
    }
  }
  if (bag.length >= BAG_CAP)
    return false
  bag.push(item)
  return true
}

export const BAG_CAP = 30

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function rarityIndex(r: Rarity): number {
  return RARITY_ORDER.indexOf(r)
}

export function equipDefOf(item: BagItem) {
  return getEquipDef(item.defId)
}
