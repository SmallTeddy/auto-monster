import type { BoonDef } from '../types'

// 数值（hp/atk/def/spd）为百分比加成
export const BOONS: BoonDef[] = [
  { id: 'atk', name: '战吼', desc: '攻击力 +18%', icon: 'i-mdi-sword-cross', apply: { hp: 0, atk: 18, def: 0, spd: 0 } },
  { id: 'hp', name: '坚壁', desc: '生命上限 +22%', icon: 'i-mdi-heart-outline', apply: { hp: 22, atk: 0, def: 0, spd: 0 } },
  { id: 'def', name: '铁壁', desc: '防御 +30%', icon: 'i-mdi-shield-crown-outline', apply: { hp: 0, atk: 0, def: 30, spd: 0 } },
  { id: 'spd', name: '疾风', desc: '速度 +20%', icon: 'i-mdi-weather-windy', apply: { hp: 0, atk: 0, def: 0, spd: 20 } },
  { id: 'crit', name: '致命', desc: '暴击率 +15%', icon: 'i-mdi-crosshairs-gps', apply: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0.15 } },
  { id: 'ls', name: '吸血', desc: '获得 12% 吸血', icon: 'i-mdi-water-plus-outline', apply: { hp: 0, atk: 0, def: 0, spd: 0, lifesteal: 0.12 } },
  { id: 'double', name: '连击', desc: '20% 概率攻击两次', icon: 'i-mdi-flash-outline', apply: { hp: 0, atk: 0, def: 0, spd: 0, doubleHit: 0.2 } },
  { id: 'regen', name: '自愈', desc: '每回合恢复 4% 生命', icon: 'i-mdi-heart-plus-outline', apply: { hp: 0, atk: 0, def: 0, spd: 0, regen: 0.04 } },
  { id: 'pet', name: '兽王', desc: '宠物全属性 +25%', icon: 'i-mdi-paw', apply: { hp: 0, atk: 0, def: 0, spd: 0, petBonus: 25 } },
  { id: 'gold', name: '贪婪', desc: '金币收益 +40%', icon: 'i-mdi-cash-multiple', apply: { hp: 0, atk: 0, def: 0, spd: 0, goldBonus: 40 } },
  { id: 'drop', name: '幸运', desc: '战利品掉落率 +15%', icon: 'i-mdi-clover', apply: { hp: 0, atk: 0, def: 0, spd: 0, dropBonus: 15 } },
]

export function getBoon(id: string): BoonDef {
  return BOONS.find(b => b.id === id) ?? BOONS[0]
}
