<template>
  <Teleport to="body">
    <div
      class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 backdrop-blur-[2px] sm:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="panel-in modal-panel flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-[var(--game-radius)] border border-white/10 bg-[#111a24] shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
        :class="widthClass"
      >
        <header class="safe-top flex h-16 items-center gap-3 border-b border-white/10 px-4 sm:px-5">
          <h2 class="flex min-w-0 flex-1 items-center gap-2 truncate text-16px font-bold leading-6 text-white">
            <span v-if="icon" :class="icon" class="shrink-0 text-primary text-18px" />
            <span class="truncate">{{ title }}</span>
          </h2>
          <div v-if="$slots.extra" class="flex shrink-0 items-center overflow-visible">
            <slot name="extra" />
          </div>
          <button
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
            @click="$emit('close')"
          >
            <span class="i-mdi-close text-18px" />
          </button>
        </header>
        <div class="panel-scroll flex-1 overflow-y-auto p-3 sm:p-5">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="border-t border-white/10 px-4 py-3 sm:px-5">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  icon?: string
  width?: 'sm' | 'md' | 'lg'
}>(), {
  icon: '',
  width: 'lg',
})

defineEmits<{ close: [] }>()

const widthClass = computed(() => ({
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}[props.width]))
</script>
