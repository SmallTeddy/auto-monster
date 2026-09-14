<template>
  <div class="w-full">
    <div v-if="showText" class="mb-0.5 flex justify-between text-10px leading-none text-white/85">
      <span>{{ label }}</span>
      <span>{{ Math.max(0, Math.round(hp)) }}/{{ maxHp }}</span>
    </div>
    <div class="h-8px w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-white/10">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="colorClass"
        :style="{ width: `${pct}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  hp: number
  maxHp: number
  label?: string
  showText?: boolean
  color?: string
}>(), {
  label: '',
  showText: true,
  color: '',
})

const pct = computed(() => Math.max(0, Math.min(100, (props.hp / props.maxHp) * 100)))
const colorClass = computed(() => {
  if (props.color)
    return ''
  if (pct.value > 50)
    return 'bg-gradient-to-r from-green-500 to-emerald-400'
  if (pct.value > 25)
    return 'bg-gradient-to-r from-amber-500 to-yellow-400'
  return 'bg-gradient-to-r from-red-600 to-red-400'
})
</script>
