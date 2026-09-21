<template>
  <div
    class="battle-unit relative flex w-full min-w-0 flex-col items-center transition-opacity duration-300"
    :class="unit.boss ? 'battle-unit--boss' : ''"
  >
    <div
      class="relative flex flex-col items-center"
      :class="{ 'is-dead': !unit.alive }"
    >
      <!-- 飘字层 -->
      <div class="pointer-events-none absolute inset-x-0 -top-2 z-10 h-0">
        <template v-for="f in myFloats" :key="f.id">
          <span
            class="float-text absolute left-1/2 whitespace-nowrap font-bold"
            :class="f.crit ? 'text-20px text-yellow-300' : f.text.startsWith('+') ? 'text-16px text-green-400' : 'text-17px text-red-400'"
          >{{ f.text }}{{ f.crit ? '!' : '' }}</span>
        </template>
      </div>

      <div
        class="unit-frame relative p-2"
        :class="[
          unit.side === 'enemy' ? 'bg-red-500/10 ring-1 ring-red-400/30' : 'bg-primary/10 ring-1 ring-primary/30',
          shaking ? 'is-hit' : '',
        ]"
      >
        <span
          v-if="unit.boss"
          class="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-red-600 px-1.5 text-10px font-bold leading-4 text-white"
        >BOSS</span>
        <Sprite :src="unit.sprite" :size="spriteSize" />
      </div>

      <div class="battle-unit__meta mt-1.5 w-64px max-w-full text-center sm:w-86px">
        <div class="battle-unit__name truncate text-12px font-semibold" :class="unit.side === 'enemy' ? 'text-red-200' : 'text-green-200'">
          {{ unit.name }}
          <span class="text-white/40">Lv{{ unit.level }}</span>
        </div>
        <HpBar :hp="unit.hp" :max-hp="unit.maxHp" :show-text="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { BattleUnit, FloatText } from '@/game/types'
import Sprite from './Sprite.vue'
import HpBar from './HpBar.vue'

const props = defineProps<{
  unit: BattleUnit
  floats: FloatText[]
}>()

const myFloats = computed(() => props.floats.filter(f => f.uid === props.unit.id))
const shaking = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.unit.hp, (nv, ov) => {
  if (ov !== undefined && nv < ov) {
    shaking.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (shaking.value = false), 260)
  }
})

// 响应式尺寸：移动端缩小精灵
const baseSize = props.unit.boss ? 88 : 64
const spriteSize = ref(baseSize)
function updateSize() {
  spriteSize.value = window.innerWidth < 640 ? Math.round(baseSize * 0.72) : baseSize
}
onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})
</script>
