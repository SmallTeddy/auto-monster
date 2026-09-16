<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="panel-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121821] shadow-2xl sm:max-h-[88vh]"
        :class="widthClass"
      >
        <header class="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <h2 class="flex items-center gap-2 text-16px font-bold text-white">
            <span v-if="icon" :class="icon" class="text-primary text-18px" />
            {{ title }}
            <slot name="extra" />
          </h2>
          <button
            class="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
            @click="$emit('close')"
          >
            <span class="i-mdi-close text-18px" />
          </button>
        </header>
        <div class="panel-scroll flex-1 overflow-y-auto p-4 sm:p-5">
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
