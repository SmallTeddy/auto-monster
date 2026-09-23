export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'red'
export type EquipSlot = 'weapon' | 'armor' | 'accessory'
export type ItemKind = 'equip' | 'consumable' | 'material'

export interface Stats {
  hp: number
  atk: number
  def: number
  spd: number
}

export interface HeroDef {
  id: string
  name: string
  sprite: string
  desc: string
  base: Stats
  /** 每级成长 */
  grow: Stats
  skill: {
    name: string
    desc: string
    crit?: number
    lifesteal?: number
    dodge?: number
    regen?: number
    doubleHit?: number
  }
  /** 主动技能（战斗中手动释放，带冷却） */
  active: ActiveSkill
}

/** 主动技能定义 */
export interface ActiveSkill {
  id: string
  name: string
  desc: string
  icon: string
  /** 冷却回合数 */
  cd: number
  /**
   * 效果类型
   * - heal：治疗自身（按 maxHp * power 比例）
   * - burst：对单体爆发伤害（按 atk * power）
   * - aoe：对所有敌人造成伤害（按 atk * power）
   * - lifesteal：对单体造成伤害并吸血（按 atk * power 伤害，按伤害 * power 回血）
   */
  type: 'heal' | 'burst' | 'aoe' | 'lifesteal'
  /** 效果强度系数 */
  power: number
}

export interface EquipDef {
  id: string
  name: string
  slot: EquipSlot
  base: Partial<Stats>
  /** 出现的最低塔层 */
  floor: number
  price: number
}

export interface ConsumableDef {
  id: string
  name: string
  icon: string
  desc: string
  price: number
  heal?: number
}

export interface MaterialDef {
  id: string
  name: string
  icon: string
  desc: string
  price: number
}

/** 背包物品实例 */
export interface BagItem {
  uid: string
  kind: ItemKind
  defId: string
  count: number
  /** 装备实例 */
  rarity?: Rarity
  enhance?: number
  itemLevel?: number
}

export interface Pet {
  uid: string
  name: string
  sprite: string
  rarity: Rarity
  level: number
  xp: number
  train: number
  base: Stats
  deployed: boolean
}

export interface BoonDef {
  id: string
  name: string
  desc: string
  icon: string
  apply: Stats & {
    crit?: number
    lifesteal?: number
    regen?: number
    doubleHit?: number
    petBonus?: number
    goldBonus?: number
    dropBonus?: number
  }
}

export interface DungeonDef {
  id: string
  name: string
  desc: string
  needLevel: number
  cost: number
  waves: number
  theme: RegExp
  boss: string
  level: number
  rewards: {
    gold: number
    exp: number
    items: { defId: string, count: number }[]
    egg?: boolean
  }
}

export interface QuestDef {
  id: string
  name: string
  desc: string
  target: number
  event: string
  rewards: { gold?: number, exp?: number, stone?: number, soul?: number, item?: { defId: string, count: number } }
  daily: boolean
}

export interface BattleUnit {
  id: string
  name: string
  sprite: string
  side: 'hero' | 'pet' | 'enemy'
  level: number
  hp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  crit: number
  critMul: number
  lifesteal: number
  doubleHit: number
  regen: number
  boss: boolean
  alive: boolean
  /** 护盾值，优先吸收伤害 */
  shield?: number
  /** 每回合自动恢复的护盾值 */
  shieldRegen?: number
  /** 对目标造成最大生命百分比伤害的概率（0~1） */
  pctDmgChance?: number
  /** 百分比伤害强度（0~1，按目标 maxHp 计算） */
  pctDmgPower?: number
  /** 施加给目标的治疗削减回合数 */
  healReduceTurns?: number
  /** 当前单位受到的治疗削减（0~1，1 表示完全无法治疗） */
  healReduce?: number
  /** 主动技能当前剩余冷却回合（仅 hero 使用，0 表示可释放） */
  skillCd?: number
}

export interface LogLine {
  id: number
  text: string
  type: 'hit' | 'crit' | 'kill' | 'sys' | 'heal' | 'reward'
}

export interface FloatText {
  id: number
  uid: string
  text: string
  crit: boolean
}

export interface ShopSlot {
  kind: 'equip' | 'consumable' | 'material' | 'pet'
  defId?: string
  rarity?: Rarity
  level: number
  /** 装备槽位的具体装备实例 */
  equip?: BagItem
}

/** 自动处理（回收/出售）配置 */
export interface AutoHandleCfg {
  enabled: boolean
  /** 物品等级下限（含） */
  minLevel: number
  /** 物品等级上限（含） */
  maxLevel: number
  /** 命中的品阶列表 */
  rarities: Rarity[]
}

export interface Profile {
  heroId: string
  level: number
  exp: number
  gold: number
  soul: number
  stone: number
  bag: BagItem[]
  equipped: { weapon?: BagItem, armor?: BagItem, accessory?: BagItem }
  /** 装备栏位保留的强化等级（卖出装备时强化不丢失） */
  slotEnhance: { weapon: number, armor: number, accessory: number }
  pets: Pet[]
  bestFloor: number
  /** 已领取祝福的最高层数（每 5 层一次，刷新/重开后不再重复领取） */
  lastBoonFloor: number
  boons: string[]
  /** 持久化的冒险层数（刷新页面后恢复） */
  runFloor: number
  /** 持久化的冒险模式 */
  runMode: 'tower' | 'dungeon'
  /** 持久化的副本 ID */
  runDungeonDefId: string
  /** 持久化的副本波次 */
  runDungeonWave: number
  /** 背包容量上限（可花费金币提升） */
  bagCap: number
  shop: { stock: ShopSlot[], sold: boolean[], refreshCount: number }
  daily: { date: string, progress: Record<string, number>, claimed: Record<string, boolean>, refreshCount: number }
  achievements: { progress: Record<string, number>, claimed: Record<string, boolean> }
  stats: Record<string, number>
  stamina: number
  staminaAt: number
  dungeonCount: Record<string, number>
  /** 自动回收配置 */
  autoRecycleCfg: AutoHandleCfg
  /** 自动出售配置 */
  autoSellCfg: AutoHandleCfg
  createdAt: number
}
