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
    const count = Math.min(12, 1 + Math.floor(floor / 4))
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
    // 首领带 2-4 个小怪
    const adds = themePool(def.theme).filter(s => s.name !== def.boss)
    for (let i = 0; i < Math.min(4, adds.length); i++)
      units.push(createEnemyUnit(level, pick(adds), false))
  }
  else {
    let pool = themePool(def.theme)
    if (!pool.length)
      pool = mobPool(1, 5)
    const count = Math.min(6, 2 + Math.floor(waveIndex / 2))
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

/** Roguelike 祝福三选一（允许重复获得，叠加效果） */
export function genBoonOffer(_owned: string[]): string[] {
  const ids = BOONS.map(b => b.id)
  const result: string[] = []
  const pool = [...ids]
  while (result.length < 3 && pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

export function newRunId(): string {
  return uid('run')
}
