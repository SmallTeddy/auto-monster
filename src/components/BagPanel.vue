<template>
  <ModalPanel :title="t('bag.title')" icon="i-mdi-bag-personal-outline" @close="$emit('close')">
    <template #extra>
      <span class="text-12px text-white/50">
        {{ t('bag.capacity') }} {{ pf.bag.length }}/{{ BAG_CAP }}
      </span>
      <button
        class="ml-2 rounded-lg px-2.5 py-1 text-12px transition"
        :class="pf.autoRecycle ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-white/60 hover:bg-white/20'"
        :title="pf.autoRecycle ? '已开启：背包满时自动回收普通装备' : '点击开启：背包满时自动回收普通装备'"
        @click="store.toggleAutoRecycle()"
      >
        <span class="i-mdi-recycle mr-0.5" />{{ pf.autoRecycle ? '自动回收: 开' : '自动回收: 关' }}
      </button>
      <button class="ml-2 rounded-lg bg-primary/20 px-2.5 py-1 text-12px text-primary hover:bg-primary/30" @click="store.sortBag()">
        <span class="i-mdi-sort-alphabetical-variant mr-0.5" />{{ t('common.sort') }}
      </button>
    </template>

    <!-- 已装备 -->
    <div class="mb-4">
      <div class="mb-2 text-12px font-semibold text-white/50">{{ t('bag.equipped') }}</div>
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="s in slots"
          :key="s.key"
          class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all"
          :class="selectedSlot === s.key ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/30'"
          @click="selectedUid = ''; selectedSlot = s.key"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed text-24px"
            :style="equippedStyle(s.key)"
          >
            <span v-if="equipped(s.key)" :class="itemIcon(equipped(s.key)!)" />
            <span v-else :class="s.icon" class="text-white/25" />
          </div>
          <div class="min-w-0">
            <div class="text-11px text-white/40">{{ t(`slot.${s.key}`) }}</div>
            <div v-if="equipped(s.key)" class="truncate text-13px font-semibold" :style="{ color: rarityOf(equipped(s.key)!) }">
              {{ itemName(equipped(s.key)!) }}
              <span class="text-cyan-300">+{{ equipped(s.key)!.enhance ?? 0 }}</span>
            </div>
            <div v-else class="text-12px text-white/30">—</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row">
      <!-- 背包格子 -->
      <div class="min-w-0 flex-1">
        <div v-if="!pf.bag.length" class="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/15 text-13px text-white/35">
          {{ t('bag.empty') }}
        </div>
        <div v-else class="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          <ItemTile
            v-for="item in pf.bag"
            :key="item.uid"
            :item="item"
            :selected="selectedUid === item.uid"
            @select="onSelect"
          />
        </div>
      </div>

      <!-- 详情 / 操作 -->
      <div class="w-full shrink-0 rounded-xl border border-white/10 bg-black/30 p-4 sm:w-60">
        <template v-if="detailItem">
          <div class="mb-1 flex items-center gap-2">
            <span :class="detailIcon" class="text-22px" :style="{ color: detailColor }" />
            <span class="text-15px font-bold" :style="{ color: detailColor }">{{ detailName }}</span>
          </div>
          <div v-if="detailItem.kind === 'equip'" class="mb-1 text-11px text-white/45">
            {{ t(`slot.${detailSlot}`) }} · Lv{{ detailItem.itemLevel }} · {{ t(`rarity.${detailItem.rarity}`) }}
          </div>
          <div class="mb-3 text-12px leading-5 text-green-300/90">{{ itemDesc(detailItem) }}</div>

          <!-- 装备操作 -->
          <template v-if="detailItem.kind === 'equip'">
            <div v-if="!isEquipped" class="space-y-2">
              <button class="game-btn w-full" @click="doEquip">{{ t('common.equip') }}</button>
              <div class="grid grid-cols-2 gap-2">
                <button class="game-btn-ghost" @click="store.sellItem(detailItem.uid); clear()">{{ t('common.sell') }} +{{ sellPrice(detailItem) }}</button>
                <button class="game-btn-ghost" @click="store.recycleItem(detailItem.uid); clear()">{{ t('common.recycle') }}</button>
              </div>
              <div class="pt-1 text-center text-11px text-white/40">
                {{ t('common.recycle') }}: {{ recycleGain(detailItem).stone }} {{ t('common.stone') }} / {{ recycleGain(detailItem).soul }} {{ t('common.soul') }}
              </div>
            </div>
            <div v-else class="space-y-2">
              <!-- 强化 -->
              <button class="game-btn w-full" :disabled="enhanceInfo.maxed" @click="store.enhanceItem(selectedSlot as any)">
                {{ t('common.enhance') }} {{ enhanceInfo.maxed ? '(MAX)' : `+${detailItem.enhance ?? 0} → +${(detailItem.enhance ?? 0) + 1}` }}
              </button>
              <div v-if="!enhanceInfo.maxed" class="flex justify-between text-11px text-white/50">
                <span>{{ enhanceInfo.gold }}金 {{ enhanceInfo.stone }}石</span>
                <span :class="enhanceInfo.rate >= 0.7 ? 'text-green-400' : 'text-amber-400'">{{ Math.round(enhanceInfo.rate * 100) }}%</span>
              </div>
              <!-- 升阶 -->
              <button
                class="game-btn-purple w-full"
                :disabled="!upgradeInfo.can"
                @click="store.upgradeItem(selectedSlot as any)"
              >
                {{ t('common.upgrade') }}
                <span :style="{ color: nextColor }">{{ t(`rarity.${detailItem.rarity}`) }} → {{ nextRarity ? t(`rarity.${nextRarity}`) : 'MAX' }}</span>
              </button>
              <div v-if="upgradeInfo.can" class="text-center text-11px text-white/50">
                {{ upgradeInfo.gold }}金 {{ upgradeInfo.soul }}结晶 · 需强化+5
              </div>
              <button class="game-btn-ghost w-full" @click="store.unequipItem(selectedSlot as any)">{{ t('common.unequip') }}</button>
            </div>
          </template>

          <!-- 消耗品 -->
          <template v-else-if="detailItem.kind === 'consumable'">
            <div class="mb-2 text-12px text-white/50">x{{ detailItem.count }}</div>
            <button class="game-btn w-full" @click="store.usePotion(detailItem.uid)">{{ t('common.use') }}</button>
            <button class="game-btn-ghost mt-2 w-full" @click="store.sellItem(detailItem.uid); clear()">{{ t('common.sell') }}</button>
          </template>

          <!-- 材料 -->
          <template v-else>
            <div class="mb-2 text-12px text-white/50">x{{ detailItem.count }}</div>
            <button class="game-btn-ghost w-full" @click="store.sellItem(detailItem.uid); clear()">{{ t('common.sell') }} +{{ 25 * detailItem.count }}</button>
          </template>
        </template>
        <div v-else class="flex h-48 flex-col items-center justify-center text-center text-12px text-white/35">
          <span class="i-mdi-cursor-default-outline mb-2 text-30px" />
          选择一件物品查看详情
        </div>
      </div>
    </div>
  </ModalPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BagItem, EquipSlot, Rarity } from '@/game/types'
import { BAG_CAP } from '@/game/engine/loot'
import { RARITY_META, RARITY_ORDER, UPGRADE_GOLD_COST, UPGRADE_SOUL_COST, enhanceCost, recycleGain, sellPrice } from '@/game/engine/stats'
import { itemDesc, itemIcon, itemName, itemSlot } from '@/game/engine/items'
import ModalPanel from './ModalPanel.vue'
import ItemTile from './ItemTile.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile

const slots = [
  { key: 'weapon' as const, icon: 'i-mdi-sword' },
  { key: 'armor' as const, icon: 'i-mdi-shield' },
  { key: 'accessory' as const, icon: 'i-mdi-diamond-outline' },
]

const selectedUid = ref('')
const selectedSlot = ref<EquipSlot | ''>('')

function onSelect(uid: string) {
  selectedUid.value = uid
  selectedSlot.value = ''
}
function clear() {
  selectedUid.value = ''
}

const equipped = (slot: EquipSlot): BagItem | undefined => pf.value!.equipped[slot]
function equippedStyle(slot: EquipSlot) {
  const it = pf.value!.equipped[slot]
  if (!it)
    return {}
  const c = RARITY_META[it.rarity ?? 'common'].color
  return { borderColor: `${c}66`, background: `${c}14`, color: c }
}
function rarityOf(item: BagItem) {
  return RARITY_META[item.rarity ?? 'common'].color
}

const detailItem = computed<BagItem | undefined>(() => {
  if (selectedUid.value)
    return pf.value!.bag.find(b => b.uid === selectedUid.value)
  if (selectedSlot.value)
    return pf.value!.equipped[selectedSlot.value as EquipSlot]
  return undefined
})
const detailIcon = computed(() => detailItem.value ? itemIcon(detailItem.value) : '')
const detailName = computed(() => detailItem.value ? itemName(detailItem.value) : '')
const detailColor = computed(() => detailItem.value ? RARITY_META[detailItem.value.rarity ?? 'common'].color : '#fff')
const detailSlot = computed(() => (detailItem.value ? itemSlot(detailItem.value) : '') as EquipSlot)
const isEquipped = computed(() => !!selectedSlot.value && !!detailItem.value)

const enhanceInfo = computed(() => {
  const item = detailItem.value
  if (!item)
    return { gold: 0, stone: 0, rate: 0, maxed: false }
  const e = item.enhance ?? 0
  if (e >= 15)
    return { gold: 0, stone: 0, rate: 0, maxed: true }
  return { ...enhanceCost(RARITY_ORDER.indexOf(item.rarity ?? 'common'), e), maxed: false }
})

const nextRarity = computed<Rarity | undefined>(() => detailItem.value ? RARITY_META[detailItem.value.rarity ?? 'common'].next : undefined)
const nextColor = computed(() => nextRarity.value ? RARITY_META[nextRarity.value].color : '#fff')
const upgradeInfo = computed(() => {
  const item = detailItem.value
  if (!item || !nextRarity.value)
    return { can: false, gold: 0, soul: 0 }
  const idx = RARITY_ORDER.indexOf(item.rarity ?? 'common')
  return {
    can: (item.enhance ?? 0) >= 5,
    gold: UPGRADE_GOLD_COST[idx],
    soul: UPGRADE_SOUL_COST[idx],
  }
})

function doEquip() {
  if (!detailItem.value)
    return
  const slot = itemSlot(detailItem.value) as EquipSlot
  store.equipItem(detailItem.value.uid)
  selectedUid.value = ''
  selectedSlot.value = slot
}
</script>
