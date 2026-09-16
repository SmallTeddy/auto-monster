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
      skillCd: 0,
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

  // 回合结束：所有单位技能冷却 -1
  for (const u of units) {
    if (u.skillCd && u.skillCd > 0)
      u.skillCd = Math.max(0, u.skillCd - 1)
  }

  const hero = units.find(u => u.side === 'hero')!
  if (!hero.alive)
    return 'lost'
  if (!units.some(u => u.side === 'enemy' && u.alive))
    return 'won'
  return 'fighting'
}

/** 释放英雄主动技能，返回是否释放成功 */
export function castHeroSkill(units: BattleUnit[], heroDefId: string, events: BattleEvents): boolean {
  const hero = units.find(u => u.side === 'hero')
  if (!hero || !hero.alive)
    return false
  if (hero.skillCd && hero.skillCd > 0)
    return false

  const foes = units.filter(u => u.side === 'enemy' && u.alive)
  if (!foes.length)
    return false

  const heroDef = getHero(heroDefId)
  const skill = heroDef.active
  if (!skill)
    return false

  switch (skill.type) {
    case 'heal': {
      const heal = Math.round(hero.maxHp * skill.power)
      hero.hp = Math.min(hero.maxHp, hero.hp + heal)
      addFloat(events, hero, `+${heal}`, false)
      addLog(events.logs, `${hero.name} 释放【${skill.name}】，恢复 ${heal} 生命`, 'heal')
      break
    }
    case 'burst': {
      const target = pick(foes)
      const dmg = Math.max(1, Math.round(hero.atk * skill.power - target.def * 0.5))
      target.hp -= dmg
      addFloat(events, target, `-${dmg}`, true)
      addLog(events.logs, `${hero.name} 释放【${skill.name}】，对 ${target.name} 造成 ${dmg} 爆发伤害`, 'crit')
      if (target.hp <= 0) {
        target.alive = false
        target.hp = 0
        addLog(events.logs, `${target.name} 被击败了！`, 'kill')
      }
      break
    }
    case 'aoe': {
      for (const target of foes) {
        const dmg = Math.max(1, Math.round(hero.atk * skill.power - target.def * 0.5))
        target.hp -= dmg
        addFloat(events, target, `-${dmg}`, false)
        if (target.hp <= 0) {
          target.alive = false
          target.hp = 0
          addLog(events.logs, `${target.name} 被击败了！`, 'kill')
        }
      }
      addLog(events.logs, `${hero.name} 释放【${skill.name}】，对所有敌人造成范围伤害`, 'crit')
      break
    }
    case 'lifesteal': {
      const target = pick(foes)
      const dmg = Math.max(1, Math.round(hero.atk * skill.power - target.def * 0.5))
      target.hp -= dmg
      addFloat(events, target, `-${dmg}`, true)
      const heal = Math.round(dmg * skill.power * 0.5)
      hero.hp = Math.min(hero.maxHp, hero.hp + heal)
      addFloat(events, hero, `+${heal}`, false)
      addLog(events.logs, `${hero.name} 释放【${skill.name}】，对 ${target.name} 造成 ${dmg} 伤害并吸取 ${heal} 生命`, 'crit')
      if (target.hp <= 0) {
        target.alive = false
        target.hp = 0
        addLog(events.logs, `${target.name} 被击败了！`, 'kill')
      }
      break
    }
  }

  // 进入冷却
  hero.skillCd = skill.cd
  return true
}
