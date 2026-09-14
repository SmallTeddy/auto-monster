<template>
  <span
    class="pointer-events-none absolute left-4 top-3 z-10 rounded-full border px-3 py-1 text-11px tracking-widest backdrop-blur-sm"
    :class="color === 'red'
      ? 'border-red-400/25 bg-red-500/10 text-red-300/80'
      : 'border-primary/25 bg-primary/10 text-primary/80'"
  >
    {{ text }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  color?: 'red' | 'green'
}>()
</script>
