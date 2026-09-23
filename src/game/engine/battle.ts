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
  const lv = Math.max(1, level)
  // 高难度怪物能力：随等级增长，Boss 更强
  const tier = Math.min(1, lv / 40)
  const shieldMax = boss
    ? Math.round(s.hp * (0.45 + tier * 0.35))
    : Math.round(s.hp * (0.12 + tier * 0.25))
  const shieldRegen = boss
    ? Math.round(s.hp * (0.05 + tier * 0.04))
    : Math.round(s.hp * (0.02 + tier * 0.03))
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
    crit: 0.1 + tier * 0.15,
    lifesteal: boss ? 0.2 + tier * 0.12 : tier * 0.07,
    doubleHit: boss ? 0.3 + tier * 0.18 : tier * 0.13,
    regen: 0,
    boss,
    shield: shieldMax,
    shieldRegen,
    pctDmgChance: boss ? 0.5 + tier * 0.3 : 0.12 + tier * 0.28,
    pctDmgPower: boss ? 0.12 + tier * 0.08 : 0.06 + tier * 0.07,
    healReduceTurns: boss ? 3 : 2,
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
    // 百分比伤害：按目标最大生命计算，无视防御
    if (attacker.side === 'enemy' && chance(attacker.pctDmgChance ?? 0)) {
      const pct = Math.round(target.maxHp * (attacker.pctDmgPower ?? 0))
      dmg += pct
      addLog(events.logs, `${attacker.name} 释放腐蚀之力，对 ${target.name} 造成 ${pct} 百分比伤害`, 'crit')
    }
    dmg = Math.max(1, Math.round(dmg * (i === 1 ? 0.8 : 1)))
    // 护盾优先吸收
    let remain = dmg
    if (target.shield && target.shield > 0) {
      const absorbed = Math.min(target.shield, remain)
      target.shield -= absorbed
      remain -= absorbed
      if (absorbed > 0)
        addFloat(events, target, `护盾-${absorbed}`, false)
    }
    if (remain > 0) {
      target.hp -= remain
      addFloat(events, target, `-${remain}`, isCrit)
    }
    addLog(
      events.logs,
      `${attacker.name} ${hits === 2 && i === 1 ? '连击' : '攻击'} ${target.name}，${isCrit ? '暴击 ' : ''}造成 ${dmg} 伤害`,
      isCrit ? 'crit' : 'hit',
    )
    // 敌人攻击附加减治疗 debuff
    if (attacker.side === 'enemy' && target.side !== 'enemy' && chance(0.45)) {
      target.healReduce = Math.min(0.85, (target.healReduce ?? 0) + 0.35)
      target.healReduceTurns = (target.healReduceTurns ?? 0) + (attacker.healReduceTurns ?? 2)
      addLog(events.logs, `${target.name} 被施加了治疗削减效果`, 'hit')
    }
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
    // 敌人每回合恢复护盾
    if (u.side === 'enemy' && u.shieldRegen && u.shieldRegen > 0) {
      u.shield = Math.min((u.shield ?? 0) + u.shieldRegen, u.maxHp)
    }
    if (u.regen > 0) {
      const heal = Math.round(u.maxHp * u.regen * (1 - (u.healReduce ?? 0)))
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

  // 回合结束：技能冷却 -1，减治疗回合 -1
  for (const u of units) {
    if (u.skillCd && u.skillCd > 0)
      u.skillCd = Math.max(0, u.skillCd - 1)
    if (u.healReduceTurns && u.healReduceTurns > 0) {
      u.healReduceTurns -= 1
      if (u.healReduceTurns <= 0) {
        u.healReduce = 0
        u.healReduceTurns = 0
      }
    }
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
      const heal = Math.round(hero.maxHp * skill.power * (1 - (hero.healReduce ?? 0)))
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
