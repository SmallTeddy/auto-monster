<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="dialog.open"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
      >
        <div class="panel-in w-full max-w-sm rounded-2xl border border-white/10 bg-[#161e29] p-5 shadow-2xl">
          <!-- 标题 -->
          <h3 class="mb-2 flex items-center gap-2 text-16px font-bold text-white">
            <span class="i-mdi-alert-circle-outline text-amber-400" />
            {{ dialog.title }}
          </h3>

          <!-- 消息 -->
          <p class="mb-4 text-14px leading-6 text-white/70">{{ dialog.message }}</p>

          <!-- 倒计时进度条 -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-11px text-white/50">
              <span>{{ t('confirm.autoConfirm') }}</span>
              <span class="font-bold text-amber-300">{{ dialog.countdown }}s</span>
            </div>
            <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/50">
              <div
                class="h-full rounded-full bg-amber-400 transition-all duration-1000 ease-linear"
                :style="{ width: `${(dialog.countdown / 5) * 100}%` }"
              />
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex gap-2">
            <button
              class="game-btn-ghost flex-1 py-2"
              @click="store.resolveConfirm(false)"
            >
              {{ t('confirm.cancel') }}
            </button>
            <button
              class="game-btn flex-1 py-2"
              @click="store.resolveConfirm(true)"
            >
              {{ t('confirm.ok') }}
              <span class="ml-1 text-10px opacity-70">({{ dialog.countdown }}s)</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useGlobalState } from '@/store'

const { t } = useI18n()
const store = useGlobalState()
const dialog = store.confirmDialog
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
