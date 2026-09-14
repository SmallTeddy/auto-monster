import type { BattleUnit, DungeonDef } from '../types'
import { bossPool, mobPool, randomOf, spriteByName, themePool, type MonsterSprite } from '../assets'
import { BOONS } from '../data/boons'
import { createEnemyUnit } from './battle'
import { clamp, pick, randInt, uid } from './rng'

function tierRange(floor: number): [number, number] {
  const min = clamp(1 + Math.floor((floor - 1) / 8), 1, 4)
  return [min, Math.min(5, min + 1)]
}

/** 生成无尽魔塔某一层的敌人 */
export function genTowerWave(floor: number): BattleUnit[] {
  const [tMin, tMax] = tierRange(floor)
  const units: BattleUnit[] = []
  if (floor % 5 === 0) {
    // 首领层
    const pool = bossPool(tMin, tMax)
    const sp = pool.length ? randomOf(pool) : randomOf(mobPool(tMin, tMax))
    units.push(createEnemyUnit(floor + 1, sp, true))
  }
  else {
    const count = Math.min(3, 1 + Math.floor(floor / 5))
    const pool = mobPool(tMin, tMax)
    const chosen = new Set<string>()
    for (let i = 0; i < count; i++) {
      let sp: MonsterSprite | undefined
      for (let tries = 0; tries < 8 && pool.length; tries++) {
        const cand = randomOf(pool)
        if (!chosen.has(cand.name)) {
          sp = cand
          chosen.add(cand.name)
          break
        }
      }
      sp ??= pool[0]
      if (sp)
        units.push(createEnemyUnit(floor + randInt(0, 1), sp, false))
    }
  }
  return units
}

/** 生成副本某一波敌人 */
export function genDungeonWave(def: DungeonDef, waveIndex: number): BattleUnit[] {
  const isBoss = waveIndex === def.waves - 1
  const level = def.level + waveIndex
  const units: BattleUnit[] = []
  if (isBoss) {
    units.push(createEnemyUnit(level + 2, spriteByName(def.boss), true))
    // 首领带 1-2 个小怪
    const adds = themePool(def.theme).filter(s => s.name !== def.boss)
    for (let i = 0; i < Math.min(2, adds.length); i++)
      units.push(createEnemyUnit(level, pick(adds), false))
  }
  else {
    let pool = themePool(def.theme)
    if (!pool.length)
      pool = mobPool(1, 5)
    const count = 2 + Math.min(1, Math.floor(waveIndex / 2))
    const chosen = new Set<string>()
    for (let i = 0; i < count; i++) {
      let sp: MonsterSprite | undefined
      for (let tries = 0; tries < 8; tries++) {
        const cand = randomOf(pool)
        if (!chosen.has(cand.name)) {
          sp = cand
          chosen.add(cand.name)
          break
        }
      }
      sp ??= pool[0]
      units.push(createEnemyUnit(level, sp, false))
    }
  }
  return units
}

/** Roguelike 祝福三选一 */
export function genBoonOffer(owned: string[]): string[] {
  const pool = BOONS.filter(b => !owned.includes(b.id))
  const usable = pool.length >= 3 ? pool : BOONS
  const ids = usable.map(b => b.id)
  const result: string[] = []
  while (result.length < 3 && ids.length) {
    const idx = Math.floor(Math.random() * ids.length)
    result.push(ids.splice(idx, 1)[0])
  }
  return result
}

export function newRunId(): string {
  return uid('run')
}
