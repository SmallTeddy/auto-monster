<template>
  <div ref="root" class="game-select" :class="placementClass">
    <button
      type="button"
      class="game-select__trigger"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle"
      @keydown="onTriggerKeydown"
    >
      <span v-if="icon" :class="icon" class="game-select__icon" aria-hidden="true" />
      <span class="game-select__value">{{ selected?.label ?? '' }}</span>
      <span class="i-mdi-chevron-down game-select__chevron" :class="{ 'game-select__chevron--open': open }" aria-hidden="true" />
    </button>

    <div v-if="open" class="game-select__menu" role="listbox" :aria-label="ariaLabel">
      <button
        v-for="(option, index) in options"
        :key="`${typeof option.value}:${option.value}`"
        type="button"
        class="game-select__option"
        :class="{ 'game-select__option--active': option.value === modelValue, 'game-select__option--focused': index === focusedIndex }"
        :disabled="option.disabled"
        role="option"
        :aria-selected="option.value === modelValue"
        @click="select(option)"
        @mouseenter="focusedIndex = index"
      >
        <span>{{ option.label }}</span>
        <span v-if="option.value === modelValue" class="i-mdi-check game-select__check" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface GameSelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: GameSelectOption[]
  ariaLabel?: string
  icon?: string
  placement?: 'top' | 'bottom'
  disabled?: boolean
}>(), {
  ariaLabel: '选择选项',
  placement: 'bottom',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const root = ref<HTMLElement>()
const open = ref(false)
const focusedIndex = ref(0)
const selected = computed(() => props.options.find(option => option.value === props.modelValue))
const placementClass = computed(() => `game-select--${props.placement}`)

function currentIndex() {
  const selectedIndex = props.options.findIndex(option => option.value === props.modelValue && !option.disabled)
  return selectedIndex >= 0 ? selectedIndex : props.options.findIndex(option => !option.disabled)
}

function openMenu() {
  const index = currentIndex()
  if (props.disabled || index < 0)
    return
  focusedIndex.value = index
  open.value = true
}

function toggle() {
  if (open.value)
    open.value = false
  else
    openMenu()
}

function select(option: GameSelectOption) {
  if (option.disabled)
    return
  emit('update:modelValue', option.value)
  open.value = false
}

function moveFocus(step: number) {
  if (!props.options.length)
    return
  let index = focusedIndex.value
  for (let i = 0; i < props.options.length; i++) {
    index = (index + step + props.options.length) % props.options.length
    if (!props.options[index].disabled) {
      focusedIndex.value = index
      return
    }
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (open.value)
      select(props.options[focusedIndex.value])
    else
      openMenu()
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value)
      openMenu()
    moveFocus(event.key === 'ArrowDown' ? 1 : -1)
  }
}

function onDocumentPointerdown(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node))
    open.value = false
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerdown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerdown))
</script>

<style scoped>
.game-select {
  position: relative;
  min-width: 52px;
  color: var(--game-text);
}

.game-select__trigger {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  min-height: 28px;
  padding: 3px 6px;
  border: 1px solid var(--game-line);
  border-radius: var(--game-radius);
  background: #1a1917;
  color: var(--game-text);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}

.game-select__trigger:hover:not(:disabled),
.game-select__trigger[aria-expanded='true'] {
  border-color: var(--game-line-strong);
  background: #27221d;
  color: #fff5dc;
}

.game-select__trigger:disabled {
  cursor: not-allowed;
  opacity: .45;
}

.game-select__value {
  flex: 1;
  text-align: left;
}

.game-select__chevron {
  color: var(--game-brass);
  font-size: 13px;
  transition: transform 160ms ease;
}

.game-select__chevron--open { transform: rotate(180deg); }

.game-select__menu {
  position: absolute;
  z-index: 80;
  right: 0;
  display: grid;
  min-width: 100%;
  padding: 4px;
  border: 1px solid var(--game-line-strong);
  border-radius: var(--game-radius);
  background: #151515;
  box-shadow: 0 8px 0 rgb(0 0 0 / 25%), 0 14px 26px rgb(0 0 0 / 42%);
}

.game-select--bottom .game-select__menu { top: calc(100% + 6px); }
.game-select--top .game-select__menu { bottom: calc(100% + 6px); }

.game-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 28px;
  padding: 4px 7px;
  border: 0;
  border-radius: 2px;
  background: transparent;
  color: var(--game-muted);
  font: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.game-select__option:hover:not(:disabled),
.game-select__option--focused {
  background: rgb(214 157 83 / 14%);
  color: var(--game-text);
}

.game-select__option--active { color: var(--game-accent); }
.game-select__option:disabled { cursor: not-allowed; opacity: .35; }
.game-select__check { color: var(--game-brass); }
</style>
