import type { BagItem } from '../types'
import { getConsumableDef, getEquipDef, getMaterialDef } from '../data/catalog'
import { equipStats } from './stats'

export function itemName(item: BagItem): string {
  if (item.kind === 'equip')
    return getEquipDef(item.defId).name
  if (item.kind === 'consumable')
    return getConsumableDef(item.defId)?.name ?? '消耗品'
  return getMaterialDef(item.defId).name
}

export function itemIcon(item: BagItem): string {
  if (item.kind === 'equip') {
    const slot = getEquipDef(item.defId).slot
    return slot === 'weapon' ? 'i-mdi-sword' : slot === 'armor' ? 'i-mdi-shield' : 'i-mdi-diamond-outline'
  }
  if (item.kind === 'consumable')
    return getConsumableDef(item.defId)?.icon ?? 'i-mdi-bottle-outline'
  return getMaterialDef(item.defId).icon
}

export function itemDesc(item: BagItem): string {
  if (item.kind === 'equip') {
    const s = equipStats(item)
    const parts: string[] = []
    if (s.hp)
      parts.push(`生命+${s.hp}`)
    if (s.atk)
      parts.push(`攻击+${s.atk}`)
    if (s.def)
      parts.push(`防御+${s.def}`)
    if (s.spd)
      parts.push(`速度+${s.spd}`)
    return parts.join('  ')
  }
  if (item.kind === 'consumable')
    return getConsumableDef(item.defId)?.desc ?? ''
  return getMaterialDef(item.defId).desc
}

export function itemSlot(item: BagItem): string {
  if (item.kind !== 'equip')
    return ''
  return getEquipDef(item.defId).slot
}
