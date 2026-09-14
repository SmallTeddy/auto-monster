import type { BattleUnit, FloatText, LogLine, Profile } from '../types'
import { spriteByName, type MonsterSprite } from '../assets'
import { getHero } from '../data/heroes'
import { enemyStats } from './loot'
import { boonsToBonus, heroCombatStats, petCombatStats } from './stats'
import { chance, pick, uid } from './rng'

let logId = 1
let floatId = 1

function makeUnit(o: Omit<BattleUnit, 'id' | 'alive' | 'critMul'>): BattleUnit {
  return { ...o, id: uid('u_'), alive: true, critMul: 1.6 }
}

export function createEnemyUnit(level: number, sprite: MonsterSprite, boss: boolean): BattleUnit {
  const s = enemyStats(level, boss)
  return makeUnit({
    name: boss ? sprite.name : sprite.name,
    sprite: sprite.url,
    side: 'enemy',
    level,
    hp: s.hp,
    maxHp: s.hp,
    atk: s.atk,
    def: s.def,
    spd: s.spd,
    crit: 0.08,
    lifesteal: 0,
    doubleHit: 0,
    regen: 0,
    boss,
  })
}

export function createHeroUnits(p: Profile): BattleUnit[] {
  const bonus = boonsToBonus(p.boons)
  const hs = heroCombatStats(p.heroId, p.level, p.equipped, bonus)
  const hero = getHero(p.heroId)
  const units: BattleUnit[] = [
    makeUnit({
      name: hero.name,
      sprite: spriteByName(hero.sprite).url,
      side: 'hero',
      level: p.level,
      hp: hs.hp,
      maxHp: hs.hp,
      atk: hs.atk,
      def: hs.def,
      spd: hs.spd,
      crit: hs.crit,
      lifesteal: hs.lifesteal,
      doubleHit: hs.doubleHit,
      regen: hs.regen,
      boss: false,
    }),
  ]
  for (const pet of p.pets.filter(x => x.deployed)) {
    const ps = petCombatStats(pet, bonus)
    units.push(makeUnit({
      name: pet.name,
      sprite: pet.sprite,
      side: 'pet',
      level: pet.level,
      hp: ps.hp,
      maxHp: ps.hp,
      atk: ps.atk,
      def: ps.def,
      spd: ps.spd,
      crit: 0.08,
      lifesteal: 0,
      doubleHit: 0,
      regen: 0,
      boss: false,
    }))
  }
  return units
}

export interface BattleEvents {
  logs: LogLine[]
  floats: FloatText[]
}

function addLog(logs: LogLine[], text: string, type: LogLine['type'] = 'hit') {
  logs.push({ id: logId++, text, type })
  if (logs.length > 80)
    logs.shift()
}

function addFloat(events: BattleEvents, unit: BattleUnit, text: string, crit: boolean) {
  events.floats.push({ id: floatId++, uid: unit.id, text, crit })
  if (events.floats.length > 24)
    events.floats.shift()
}

function attack(attacker: BattleUnit, foes: BattleUnit[], events: BattleEvents) {
  const target = pick(foes)
  const hits = chance(attacker.doubleHit) ? 2 : 1
  for (let i = 0; i < hits; i++) {
    if (!target.alive)
      return
    const isCrit = chance(attacker.crit)
    const variance = 0.9 + Math.random() * 0.2
    let dmg = attacker.atk * variance * (isCrit ? attacker.critMul : 1) - target.def * 0.5
    dmg = Math.max(1, Math.round(dmg * (i === 1 ? 0.8 : 1)))
    target.hp -= dmg
    addFloat(events, target, `-${dmg}`, isCrit)
    addLog(
      events.logs,
      `${attacker.name} ${hits === 2 && i === 1 ? '连击' : '攻击'} ${target.name}，${isCrit ? '暴击 ' : ''}造成 ${dmg} 伤害`,
      isCrit ? 'crit' : 'hit',
    )
    if (attacker.lifesteal > 0) {
      const heal = Math.round(dmg * attacker.lifesteal)
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal)
      if (heal > 0)
        addFloat(events, attacker, `+${heal}`, false)
    }
    if (target.hp <= 0) {
      target.alive = false
      target.hp = 0
      addLog(events.logs, `${target.name} 被击败了！`, 'kill')
      return
    }
  }
}

/** 执行一个回合，返回是否战斗结束 */
export function stepRound(units: BattleUnit[], events: BattleEvents): 'fighting' | 'won' | 'lost' {
  events.floats.length = 0
  const order = [...units].filter(u => u.alive).sort((a, b) => b.spd - a.spd)
  for (const u of order) {
    if (!u.alive)
      continue
    if (u.regen > 0) {
      const heal = Math.round(u.maxHp * u.regen)
      if (heal > 0 && u.hp < u.maxHp) {
        u.hp = Math.min(u.maxHp, u.hp + heal)
        addFloat(events, u, `+${heal}`, false)
      }
    }
    const foes = units.filter(x => x.alive && (x.side === 'enemy') !== (u.side === 'enemy'))
    if (!foes.length)
      break
    attack(u, foes, events)
  }

  const hero = units.find(u => u.side === 'hero')!
  if (!hero.alive)
    return 'lost'
  if (!units.some(u => u.side === 'enemy' && u.alive))
    return 'won'
  return 'fighting'
}
