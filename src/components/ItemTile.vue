<template>
  <button
    class="group relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border p-1 transition-all"
    :class="[
      selected ? 'border-primary bg-primary/15 ring-1 ring-primary/50' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10',
    ]"
    @click="$emit('select', item.uid)"
  >
    <span
      :class="icon"
      class="text-26px"
      :style="{ color: rarityColor }"
    />
    <span v-if="item.enhance" class="absolute right-1 top-1 text-10px font-bold text-cyan-300">
      +{{ item.enhance }}
    </span>
    <span v-if="item.count > 1" class="absolute bottom-1 right-1 text-10px font-semibold text-white/80">
      x{{ item.count }}
    </span>
    <span
      v-if="rarityBadge"
      class="absolute left-1 top-1 h-2 w-2 rounded-full"
      :style="{ background: rarityColor, boxShadow: `0 0 6px ${rarityColor}` }"
    />
    <span class="w-full truncate text-center text-10px text-white/75">{{ name }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BagItem } from '@/game/types'
import { RARITY_META } from '@/game/engine/stats'
import { itemIcon, itemName } from '@/game/engine/items'

const props = withDefaults(defineProps<{
  item: BagItem
  selected?: boolean
}>(), {
  selected: false,
})

defineEmits<{ select: [uid: string] }>()

const icon = computed(() => itemIcon(props.item))
const name = computed(() => itemName(props.item))
const rarityColor = computed(() => RARITY_META[props.item.rarity ?? 'common'].color)
const rarityBadge = computed(() => props.item.kind === 'equip')
</script>
