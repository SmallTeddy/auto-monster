import type { ConsumableDef, EquipDef, MaterialDef } from '../types'

// ---------------- 装备模板 ----------------
export const EQUIPS: EquipDef[] = [
  // 武器
  { id: 'w1', name: '木棒', slot: 'weapon', base: { atk: 6 }, floor: 1, price: 60 },
  { id: 'w2', name: '生锈短剑', slot: 'weapon', base: { atk: 10 }, floor: 2, price: 120 },
  { id: 'w3', name: '精铁长剑', slot: 'weapon', base: { atk: 16 }, floor: 5, price: 260 },
  { id: 'w4', name: '寒冰之刃', slot: 'weapon', base: { atk: 24, spd: 2 }, floor: 9, price: 500 },
  { id: 'w5', name: '地狱长矛', slot: 'weapon', base: { atk: 34 }, floor: 14, price: 900 },
  { id: 'w6', name: '暗影匕首', slot: 'weapon', base: { atk: 42, spd: 6 }, floor: 19, price: 1500 },
  { id: 'w7', name: '风暴龙刃', slot: 'weapon', base: { atk: 58, spd: 4 }, floor: 25, price: 2600 },
  { id: 'w8', name: '灰烬圣剑', slot: 'weapon', base: { atk: 80, spd: 6 }, floor: 32, price: 4800 },
  // 护甲
  { id: 'a1', name: '布衣', slot: 'armor', base: { hp: 30, def: 3 }, floor: 1, price: 60 },
  { id: 'a2', name: '皮甲', slot: 'armor', base: { hp: 55, def: 5 }, floor: 2, price: 120 },
  { id: 'a3', name: '锁子甲', slot: 'armor', base: { hp: 90, def: 9 }, floor: 5, price: 260 },
  { id: 'a4', name: '铁甲', slot: 'armor', base: { hp: 140, def: 13 }, floor: 9, price: 500 },
  { id: 'a5', name: '冰霜铠甲', slot: 'armor', base: { hp: 200, def: 18 }, floor: 14, price: 900 },
  { id: 'a6', name: '暗影斗篷', slot: 'armor', base: { hp: 260, def: 22, spd: 3 }, floor: 19, price: 1500 },
  { id: 'a7', name: '龙鳞甲', slot: 'armor', base: { hp: 360, def: 30 }, floor: 25, price: 2600 },
  { id: 'a8', name: '泰坦战甲', slot: 'armor', base: { hp: 520, def: 42 }, floor: 32, price: 4800 },
  // 饰品
  { id: 'c1', name: '铜戒指', slot: 'accessory', base: { hp: 20, atk: 2 }, floor: 1, price: 60 },
  { id: 'c2', name: '敏捷指环', slot: 'accessory', base: { spd: 4, atk: 3 }, floor: 3, price: 140 },
  { id: 'c3', name: '水晶吊坠', slot: 'accessory', base: { hp: 80, def: 4 }, floor: 6, price: 300 },
  { id: 'c4', name: '战士徽章', slot: 'accessory', base: { hp: 100, atk: 8 }, floor: 10, price: 600 },
  { id: 'c5', name: '银星吊坠', slot: 'accessory', base: { atk: 14, spd: 4 }, floor: 16, price: 1000 },
  { id: 'c6', name: '灵魂之眼', slot: 'accessory', base: { hp: 200, atk: 12, def: 8 }, floor: 22, price: 1800 },
  { id: 'c7', name: '金色皇冠', slot: 'accessory', base: { hp: 300, atk: 20, spd: 5 }, floor: 28, price: 3200 },
  { id: 'c8', name: '龙心秘宝', slot: 'accessory', base: { hp: 420, atk: 28, def: 14, spd: 6 }, floor: 35, price: 6000 },
]

export function getEquipDef(id: string): EquipDef {
  return EQUIPS.find(e => e.id === id) ?? EQUIPS[0]
}

// ---------------- 消耗品 ----------------
export const CONSUMABLES: ConsumableDef[] = [
  { id: 'potion_s', name: '小型治疗药水', icon: 'i-mdi-bottle-tonic-outline', desc: '恢复英雄 40% 生命', price: 40, heal: 0.4 },
  { id: 'potion_l', name: '大型治疗药水', icon: 'i-mdi-flask-round-bottom-outline', desc: '恢复英雄 80% 生命', price: 120, heal: 0.8 },
]

export function getConsumableDef(id: string): ConsumableDef {
  return CONSUMABLES.find(c => c.id === id) ?? CONSUMABLES[0]
}

// ---------------- 材料 ----------------
export const MATERIALS: MaterialDef[] = [
  { id: 'stone', name: '强化石', icon: 'i-mdi-hexagon-multiple-outline', desc: '强化装备的必需材料，回收装备可获得', price: 25 },
]

export function getMaterialDef(id: string): MaterialDef {
  return MATERIALS.find(m => m.id === id) ?? MATERIALS[0]
}

export function getItemDef(kind: string, id: string) {
  if (kind === 'equip')
    return getEquipDef(id)
  if (kind === 'consumable')
    return getConsumableDef(id)
  return getMaterialDef(id)
}
