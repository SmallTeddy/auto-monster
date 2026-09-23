import type { ConsumableDef, EquipDef, MaterialDef } from '../types'

// ---------------- 装备模板 ----------------
export const EQUIPS: EquipDef[] = [
  // 武器
  { id: 'w1', name: '木棒', slot: 'weapon', base: { atk: 8 }, floor: 1, price: 60 },
  { id: 'w2', name: '生锈短剑', slot: 'weapon', base: { atk: 14 }, floor: 2, price: 120 },
  { id: 'w3', name: '精铁长剑', slot: 'weapon', base: { atk: 22 }, floor: 5, price: 260 },
  { id: 'w4', name: '寒冰之刃', slot: 'weapon', base: { atk: 34, spd: 3 }, floor: 9, price: 500 },
  { id: 'w5', name: '地狱长矛', slot: 'weapon', base: { atk: 50 }, floor: 14, price: 900 },
  { id: 'w6', name: '暗影匕首', slot: 'weapon', base: { atk: 62, spd: 8 }, floor: 19, price: 1500 },
  { id: 'w7', name: '风暴龙刃', slot: 'weapon', base: { atk: 86, spd: 6 }, floor: 25, price: 2600 },
  { id: 'w8', name: '灰烬圣剑', slot: 'weapon', base: { atk: 120, spd: 8 }, floor: 32, price: 4800 },
  { id: 'w9', name: '神魔湮灭刃', slot: 'weapon', base: { atk: 180, spd: 10 }, floor: 40, price: 9000 },
  // 护甲
  { id: 'a1', name: '布衣', slot: 'armor', base: { hp: 45, def: 4 }, floor: 1, price: 60 },
  { id: 'a2', name: '皮甲', slot: 'armor', base: { hp: 80, def: 7 }, floor: 2, price: 120 },
  { id: 'a3', name: '锁子甲', slot: 'armor', base: { hp: 130, def: 12 }, floor: 5, price: 260 },
  { id: 'a4', name: '铁甲', slot: 'armor', base: { hp: 200, def: 18 }, floor: 9, price: 500 },
  { id: 'a5', name: '冰霜铠甲', slot: 'armor', base: { hp: 300, def: 26 }, floor: 14, price: 900 },
  { id: 'a6', name: '暗影斗篷', slot: 'armor', base: { hp: 400, def: 32, spd: 4 }, floor: 19, price: 1500 },
  { id: 'a7', name: '龙鳞甲', slot: 'armor', base: { hp: 560, def: 44 }, floor: 25, price: 2600 },
  { id: 'a8', name: '泰坦战甲', slot: 'armor', base: { hp: 800, def: 62 }, floor: 32, price: 4800 },
  { id: 'a9', name: '不灭魔铠', slot: 'armor', base: { hp: 1200, def: 90 }, floor: 40, price: 9000 },
  // 饰品
  { id: 'c1', name: '铜戒指', slot: 'accessory', base: { hp: 30, atk: 3 }, floor: 1, price: 60 },
  { id: 'c2', name: '敏捷指环', slot: 'accessory', base: { spd: 5, atk: 5 }, floor: 3, price: 140 },
  { id: 'c3', name: '水晶吊坠', slot: 'accessory', base: { hp: 120, def: 6 }, floor: 6, price: 300 },
  { id: 'c4', name: '战士徽章', slot: 'accessory', base: { hp: 150, atk: 12 }, floor: 10, price: 600 },
  { id: 'c5', name: '银星吊坠', slot: 'accessory', base: { atk: 22, spd: 6 }, floor: 16, price: 1000 },
  { id: 'c6', name: '灵魂之眼', slot: 'accessory', base: { hp: 300, atk: 18, def: 12 }, floor: 22, price: 1800 },
  { id: 'c7', name: '金色皇冠', slot: 'accessory', base: { hp: 460, atk: 30, spd: 8 }, floor: 28, price: 3200 },
  { id: 'c8', name: '龙心秘宝', slot: 'accessory', base: { hp: 640, atk: 42, def: 20, spd: 8 }, floor: 35, price: 6000 },
  { id: 'c9', name: '毁灭之眼', slot: 'accessory', base: { hp: 900, atk: 60, def: 30, spd: 10 }, floor: 42, price: 10000 },
]

export function getEquipDef(id: string): EquipDef {
  return EQUIPS.find(e => e.id === id) ?? EQUIPS[0]
}

// ---------------- 消耗品 ----------------
// 药水已移除，保留空数组以兼容类型
export const CONSUMABLES: ConsumableDef[] = []

export function getConsumableDef(id: string): ConsumableDef | undefined {
  return CONSUMABLES.find(c => c.id === id)
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
