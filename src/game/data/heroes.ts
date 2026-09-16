import type { HeroDef } from '../types'

export const HEROES: HeroDef[] = [
  {
    id: 'paladin',
    name: '圣骑士',
    sprite: '圣骑士',
    desc: '高生命高防御，每回合自动恢复生命，稳健的队伍核心。',
    base: { hp: 130, atk: 14, def: 9, spd: 8 },
    grow: { hp: 16, atk: 2.2, def: 1.5, spd: 0.35 },
    skill: { name: '圣光庇护', desc: '每回合恢复 3% 生命，暴击率 +8%', crit: 0.08, regen: 0.03 },
    active: {
      id: 'holy_light',
      name: '圣光治愈',
      desc: '立即恢复自身 45% 最大生命',
      icon: 'i-mdi-hospital-box-outline',
      cd: 4,
      type: 'heal',
      power: 0.45,
    },
  },
  {
    id: 'berserker',
    name: '狂战士',
    desc: '极限攻击力，20% 概率连击两次，不是你死就是我亡。',
    sprite: '狂战士',
    base: { hp: 100, atk: 21, def: 5, spd: 10 },
    grow: { hp: 11, atk: 3.2, def: 0.9, spd: 0.5 },
    skill: { name: '嗜血连击', desc: '20% 概率攻击两次，暴击率 +10%', crit: 0.1, doubleHit: 0.2 },
    active: {
      id: 'rage_strike',
      name: '狂暴一击',
      desc: '对单体敌人造成 320% 攻击力的爆发伤害',
      icon: 'i-mdi-sword-cross',
      cd: 3,
      type: 'burst',
      power: 3.2,
    },
  },
  {
    id: 'necromancer',
    name: '死灵法师',
    desc: '脆皮高伤，攻击附带 15% 吸血，擅长消耗战。',
    sprite: '死灵法师',
    base: { hp: 82, atk: 23, def: 4, spd: 9 },
    grow: { hp: 8, atk: 3.4, def: 0.7, spd: 0.45 },
    skill: { name: '生命汲取', desc: '攻击附带 15% 吸血', lifesteal: 0.15 },
    active: {
      id: 'death_storm',
      name: '亡灵风暴',
      desc: '对所有敌人造成 180% 攻击力的范围伤害',
      icon: 'i-mdi-skull-outline',
      cd: 5,
      type: 'aoe',
      power: 1.8,
    },
  },
  {
    id: 'vampire',
    name: '吸血鬼',
    desc: '速度与续航兼备，10% 吸血与极高的出手频率。',
    sprite: '吸血鬼',
    base: { hp: 92, atk: 17, def: 6, spd: 13 },
    grow: { hp: 10, atk: 2.6, def: 1.0, spd: 0.8 },
    skill: { name: '暗夜血族', desc: '10% 吸血，速度超群', lifesteal: 0.1, crit: 0.05 },
    active: {
      id: 'blood_feast',
      name: '血色盛宴',
      desc: '对单体造成 260% 伤害并吸取 50% 伤害生命',
      icon: 'i-mdi-water-blood',
      cd: 4,
      type: 'lifesteal',
      power: 2.6,
    },
  },
]

export function getHero(id: string): HeroDef {
  return HEROES.find(h => h.id === id) ?? HEROES[0]
}
