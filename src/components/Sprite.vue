<template>
  <img
    class="pixel sprite-fit pointer-events-none"
    :src="src"
    :alt="alt"
    :style="{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }"
    draggable="false"
  >
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  src: string
  alt?: string
  size?: number | string
}>(), {
  alt: '',
  size: 48,
})
</script>
