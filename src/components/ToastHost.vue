<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed left-1/2 top-14 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      <div
        v-for="t in store.toasts.value"
        :key="t.id"
        class="toast-in rounded-xl border px-4 py-2 text-13px font-medium shadow-xl"
        :class="{
          'border-green-400/30 bg-green-900/90 text-green-100': t.type === 'success',
          'border-red-400/30 bg-red-900/90 text-red-100': t.type === 'error',
          'border-white/15 bg-[#1b2430]/95 text-white': t.type === 'info',
        }"
      >
        {{ t.text }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useGlobalState } from '@/store'

const store = useGlobalState()
</script>
