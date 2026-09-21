<template>
  <ModalPanel :title="t('shop.title')" icon="i-mdi-store-outline" @close="$emit('close')">
    <template #extra>
      <div class="flex items-center gap-2">
        <div class="flex rounded-lg bg-black/40 p-0.5 text-12px">
          <button class="rounded-md px-3 py-1" :class="tab === 'buy' ? 'bg-primary text-black font-semibold' : 'text-white/60'" @click="tab = 'buy'">{{ t('shop.buyTab') }}</button>
          <button class="rounded-md px-3 py-1" :class="tab === 'sell' ? 'bg-primary text-black font-semibold' : 'text-white/60'" @click="tab = 'sell'">{{ t('shop.sellTab') }}</button>
        </div>
        <button
          v-if="tab === 'buy'"
          class="game-btn-ghost"
          @click="store.refreshShop()"
        >
          <span class="i-mdi-refresh mr-1" />{{ refreshCost }}
        </button>
      </div>
    </template>

    <!-- 当前金币 -->
    <div class="mb-3 flex items-center justify-between rounded-xl border border-yellow-400/20 bg-yellow-500/10 px-3 py-2">
      <div class="flex items-center gap-2">
        <span class="i-mdi-gold text-20px text-yellow-300" />
        <span class="text-13px text-white/60">{{ t('shop.currentGold') }}</span>
      </div>
      <span class="text-18px font-black text-yellow-300">{{ pf.gold.toLocaleString() }}</span>
    </div>

    <!-- 购买 -->
    <div v-if="tab === 'buy'" class="grid grid-cols-2 gap-3">
      <div
        v-for="(slot, i) in pf.shop.stock"
        :key="i"
        class="relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-3"
        :style="slotBorder(slot)"
      >
        <div v-if="pf.shop.sold[i]" class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/70 text-14px font-bold text-white/50">
          {{ t('shop.soldOut') }}
        </div>
        <div class="mb-2 flex items-center gap-2">
          <span :class="slotIcon(slot)" class="text-28px" :style="{ color: slotColor(slot) }" />
          <div class="min-w-0">
            <div class="truncate text-13px font-bold" :style="{ color: slotColor(slot) }">{{ slotTitle(slot) }}</div>
            <div class="text-10px text-white/45">{{ slotSub(slot) }}</div>
          </div>
        </div>
        <div class="mb-1 min-h-30px flex-1 text-11px leading-4 text-green-300/80">
          {{ slotDesc(slot) }}
        </div>
        <button class="game-btn w-full" :disabled="pf.shop.sold[i]" @click="store.buyShop(i)">
          <span class="i-mdi-cash-multiple mr-1" />{{ shopSlotPrice(slot) }}
        </button>
      </div>
    </div>

    <!-- 出售 -->
    <div v-else>
      <div v-if="!pf.bag.length" class="flex h-40 items-center justify-center text-13px text-white/35">{{ t('bag.empty') }}</div>
      <div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div
          v-for="item in pf.bag"
          :key="item.uid"
          class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2"
        >
          <span :class="itemIcon(item)" class="text-22px" :style="{ color: RARITY_META[item.rarity ?? 'common'].color }" />
          <div class="min-w-0 flex-1">
            <div class="truncate text-12px font-semibold">{{ itemName(item) }}<span v-if="item.count > 1"> x{{ item.count }}</span></div>
            <div class="text-10px text-white/45">{{ priceOf(item) }} 金</div>
          </div>
          <button class="game-btn px-2 py-1 text-12px" @click="store.sellItem(item.uid)">{{ t('common.sell') }}</button>
        </div>
      </div>
    </div>
  </ModalPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ShopSlot } from '@/game/types'
import { RARITY_META } from '@/game/engine/stats'
import { shopSlotPrice } from '@/game/engine/loot'
import { getConsumableDef, getMaterialDef } from '@/game/data/catalog'
import { itemDesc, itemIcon, itemName } from '@/game/engine/items'
import { sellPrice } from '@/game/engine/stats'
import ModalPanel from './ModalPanel.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile
const tab = ref<'buy' | 'sell'>('buy')

const refreshCost = computed(() => Math.min(200, 25 * (pf.value!.shop.refreshCount + 1)))

function slotColor(slot: ShopSlot): string {
  return slot.rarity ? RARITY_META[slot.rarity].color : '#e5e7eb'
}
function slotBorder(slot: ShopSlot) {
  if (!slot.rarity)
    return {}
  const c = RARITY_META[slot.rarity].color
  return { borderColor: `${c}55` }
}
function slotIcon(slot: ShopSlot): string {
  if (slot.kind === 'pet')
    return 'i-mdi-egg-outline'
  if (slot.kind === 'equip')
    return itemIcon(slot.equip!)
  if (slot.kind === 'consumable')
    return getConsumableDef(slot.defId!).icon
  return getMaterialDef(slot.defId!).icon
}
function slotTitle(slot: ShopSlot): string {
  if (slot.kind === 'pet')
    return `${t('pet.egg')} / ${t(`rarity.${slot.rarity}`)}`
  if (slot.kind === 'equip')
    return itemName(slot.equip!)
  if (slot.kind === 'consumable')
    return getConsumableDef(slot.defId!).name
  return getMaterialDef(slot.defId!).name
}
function slotSub(slot: ShopSlot): string {
  if (slot.kind === 'pet')
    return `Lv${slot.level} / ${t('rarity.' + slot.rarity)}`
  if (slot.kind === 'equip')
    return `${t(`slot.${slotKind(slot)}`)} / Lv${slot.level}`
  return ''
}
function slotKind(slot: ShopSlot) {
  const id = slot.equip?.defId ?? ''
  return id.startsWith('w') ? 'weapon' : id.startsWith('a') ? 'armor' : 'accessory'
}
function slotDesc(slot: ShopSlot): string {
  if (slot.kind === 'pet')
    return '随机获得一只怪物宠物，出战后自动战斗'
  if (slot.kind === 'equip')
    return itemDesc(slot.equip!)
  if (slot.kind === 'consumable')
    return getConsumableDef(slot.defId!).desc
  return getMaterialDef(slot.defId!).desc
}
function priceOf(item: any): number {
  if (item.kind === 'equip')
    return sellPrice(item)
  const def = item.kind === 'consumable' ? getConsumableDef(item.defId) : getMaterialDef(item.defId)
  return def.price * item.count
}
</script>
