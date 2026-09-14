import type { BagItem, Pet, Profile, Rarity, Stats } from '../types'
import { getBoon } from '../data/boons'
import { getEquipDef } from '../data/catalog'
import { getHero } from '../data/heroes'
import { weighted } from './rng'

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary']

export const RARITY_META: Record<Rarity, { mul: number, color: string, next?: Rarity }> = {
  common: { mul: 1, color: '#9ca3af', next: 'rare' },
  rare: { mul: 1.7, color: '#38bdf8', next: 'epic' },
  epic: { mul: 2.6, color: '#c084fc', next: 'legendary' },
  legendary: { mul: 4, color: '#fbbf24' },
}

/** 塔层/幸运值影响品质权重 */
export function rollRarity(floor: number, luckBonus = 0): Rarity {
  const rare = 22 + floor * 0.8 + luckBonus * 100
  const epic = 7 + floor * 0.5 + luckBonus * 60
  const legend = 1.2 + floor * 0.12 + luckBonus * 25
  return weighted<Rarity>([
    ['common', Math.max(20, 100 - rare - epic - legend)],
    ['rare', rare],
    ['epic', epic],
    ['legendary', legend],
  ])
}

/** 装备实例的实际属性 */
export function equipStats(item: BagItem): Stats {
  const def = getEquipDef(item.defId)
  const rarityMul = RARITY_META[item.rarity ?? 'common'].mul
  const lvMul = 1 + ((item.itemLevel ?? 1) - 1) * 0.09
  const enhMul = 1 + (item.enhance ?? 0) * 0.08
  const k = rarityMul * lvMul * enhMul
  return {
    hp: Math.round((def.base.hp ?? 0) * k),
    atk: Math.round((def.base.atk ?? 0) * k),
    def: Math.round((def.base.def ?? 0) * k),
    spd: Math.round((def.base.spd ?? 0) * k),
  }
}

export function equipPrice(item: BagItem): number {
  const def = getEquipDef(item.defId)
  return Math.round(def.price * RARITY_META[item.rarity ?? 'common'].mul * (1 + (item.enhance ?? 0) * 0.12))
}

/** 装备出售价 */
export function sellPrice(item: BagItem): number {
  if (item.kind === 'equip')
    return Math.max(6, Math.floor(equipPrice(item) * 0.4))
  return 0
}

/** 回收收益 */
export function recycleGain(item: BagItem): { stone: number, soul: number } {
  if (item.kind !== 'equip')
    return { stone: 0, soul: 0 }
  const idx = RARITY_ORDER.indexOf(item.rarity ?? 'common')
  return {
    stone: idx + 1 + Math.floor((item.enhance ?? 0) / 5),
    soul: [1, 3, 8, 20][idx] + (item.enhance ?? 0),
  }
}

export interface CombatBonus {
  hpPct: number
  atkPct: number
  defPct: number
  spdPct: number
  crit: number
  lifesteal: number
  doubleHit: number
  regen: number
  petBonus: number
  goldBonus: number
  dropBonus: number
}

export function boonsToBonus(boonIds: string[]): CombatBonus {
  const b: CombatBonus = {
    hpPct: 0, atkPct: 0, defPct: 0, spdPct: 0,
    crit: 0, lifesteal: 0, doubleHit: 0, regen: 0,
    petBonus: 0, goldBonus: 0, dropBonus: 0,
  }
  for (const id of boonIds) {
    const boon = getBoon(id)
    b.hpPct += boon.apply.hp
    b.atkPct += boon.apply.atk
    b.defPct += boon.apply.def
    b.spdPct += boon.apply.spd
    b.crit += boon.apply.crit ?? 0
    b.lifesteal += boon.apply.lifesteal ?? 0
    b.doubleHit += boon.apply.doubleHit ?? 0
    b.regen += boon.apply.regen ?? 0
    b.petBonus += boon.apply.petBonus ?? 0
    b.goldBonus += boon.apply.goldBonus ?? 0
    b.dropBonus += boon.apply.dropBonus ?? 0
  }
  return b
}

/** 英雄等级成长属性（不含装备/祝福） */
export function heroBaseStats(heroId: string, level: number): Stats {
  const h = getHero(heroId)
  const k = level - 1
  return {
    hp: Math.round(h.base.hp + h.grow.hp * k),
    atk: Math.round(h.base.atk + h.grow.atk * k),
    def: Math.round(h.base.def + h.grow.def * k),
    spd: Math.round((h.base.spd + h.grow.spd * k) * 10) / 10,
  }
}

/** 英雄战斗属性（等级 + 装备 + 祝福） */
export function heroCombatStats(
  heroId: string,
  level: number,
  equipped: Profile['equipped'],
  bonus: CombatBonus,
): Stats & { crit: number, lifesteal: number, doubleHit: number, regen: number } {
  const base = heroBaseStats(heroId, level)
  const gear: Stats = { hp: 0, atk: 0, def: 0, spd: 0 }
  for (const slot of ['weapon', 'armor', 'accessory'] as const) {
    const it = equipped[slot]
    if (!it)
      continue
    const s = equipStats(it)
    gear.hp += s.hp
    gear.atk += s.atk
    gear.def += s.def
    gear.spd += s.spd
  }
  const hero = getHero(heroId)
  return {
    hp: Math.round((base.hp + gear.hp) * (1 + bonus.hpPct / 100)),
    atk: Math.round((base.atk + gear.atk) * (1 + bonus.atkPct / 100)),
    def: Math.round((base.def + gear.def) * (1 + bonus.defPct / 100)),
    spd: Math.round(((base.spd + gear.spd) * (1 + bonus.spdPct / 100)) * 10) / 10,
    crit: (hero.skill.crit ?? 0.05) + bonus.crit,
    lifesteal: (hero.skill.lifesteal ?? 0) + bonus.lifesteal,
    doubleHit: (hero.skill.doubleHit ?? 0) + bonus.doubleHit,
    regen: (hero.skill.regen ?? 0) + bonus.regen,
  }
}

/** 宠物战斗属性（等级 + 训练 + 兽王祝福） */
export function petCombatStats(pet: Pet, bonus: CombatBonus): Stats {
  const k = 1 + (pet.level - 1) * 0.11
  const t = 1 + pet.train * 0.06
  const b = 1 + bonus.petBonus / 100
  return {
    hp: Math.round(pet.base.hp * k * t * b),
    atk: Math.round(pet.base.atk * k * t * b),
    def: Math.round(pet.base.def * k * t * b),
    spd: Math.round(pet.base.spd * k * t * b * 10) / 10,
  }
}

export function enhanceCost(rarityIdx: number, enhance: number): { gold: number, stone: number, rate: number } {
  return {
    gold: 40 * (enhance + 1) * (rarityIdx + 1),
    stone: 1 + Math.floor(enhance / 5),
    rate: Math.max(0.35, 0.95 - enhance * 0.035),
  }
}

export const UPGRADE_SOUL_COST = [6, 18, 45]
export const UPGRADE_GOLD_COST = [300, 900, 3000]

export function expNeed(level: number): number {
  return 50 + level * 30
}

export function petExpNeed(level: number): number {
  return 40 + level * 30
}

/** 综合战力 */
export function powerOf(s: Stats): number {
  return Math.round(s.hp * 0.5 + s.atk * 6 + s.def * 4 + s.spd * 2)
}
