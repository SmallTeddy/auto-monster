export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
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

export interface Profile {
  heroId: string
  level: number
  exp: number
  gold: number
  soul: number
  stone: number
  bag: BagItem[]
  equipped: { weapon?: BagItem, armor?: BagItem, accessory?: BagItem }
  pets: Pet[]
  bestFloor: number
  boons: string[]
  shop: { stock: ShopSlot[], sold: boolean[], refreshCount: number }
  daily: { date: string, progress: Record<string, number>, claimed: Record<string, boolean> }
  achievements: { progress: Record<string, number>, claimed: Record<string, boolean> }
  stats: Record<string, number>
  stamina: number
  staminaAt: number
  dungeonCount: Record<string, number>
  createdAt: number
}
