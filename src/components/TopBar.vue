<template>
  <header class="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#0e141b] px-3">
    <div class="flex items-center gap-2">
      <img src="/icons/game.svg" alt="logo" class="h-5 w-5">
      <span class="text-14px font-bold tracking-wide text-white">{{ t('app.title') }}</span>
      <span class="rounded bg-white/10 px-1.5 py-0.5 text-10px text-white/60">{{ t('app.subtitle') }}</span>
    </div>

    <div class="flex items-center gap-2 text-12px">
      <!-- 等级 -->
      <div class="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1" title="Lv">
        <span class="i-mdi-shield-account-outline text-primary" />
        <span class="font-semibold">{{ t('common.level') }}{{ pf.level }}</span>
        <div class="h-1.5 w-14 overflow-hidden rounded-full bg-black/50">
          <div class="h-full bg-primary" :style="{ width: `${expPct}%` }" />
        </div>
      </div>
      <!-- 层数 -->
      <div v-if="run.started" class="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
        <span class="i-mdi-tower-fire text-orange-400" />
        <span>{{ run.mode === 'dungeon' ? dungeonName : `${t('common.floor')}${run.floor}` }}</span>
      </div>
      <!-- 金币 -->
      <div class="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
        <span class="i-mdi-cash-multiple text-yellow-400" />
        <span class="font-semibold text-yellow-200">{{ pf.gold }}</span>
      </div>
      <!-- 结晶 -->
      <div class="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
        <span class="i-mdi-diamond-outline text-cyan-300" />
        <span class="font-semibold text-cyan-100">{{ pf.soul }}</span>
      </div>
      <!-- 强化石 -->
      <div class="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
        <span class="i-mdi-hexagon-multiple-outline text-violet-300" />
        <span class="font-semibold text-violet-100">{{ pf.stone }}</span>
      </div>
      <!-- 体力 -->
      <div class="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
        <span class="i-mdi-lightning-bolt text-green-400" />
        <span class="font-semibold">{{ Math.floor(pf.stamina) }}/{{ store.STAMINA_MAX }}</span>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <button
        class="icon-btn"
        :title="t('common.refresh')"
        @click="restart"
      >
        <span class="i-mdi-restart text-18px" />
      </button>
      <button class="icon-btn" title="GitHub" @click="openGithub">
        <span class="i-mdi-github text-18px" />
      </button>
      <button class="icon-btn px-2 text-11px font-semibold" @click="store.toggleLang()">
        {{ lang === 'zh-CN' ? 'EN' : '中' }}
      </button>
      <button class="icon-btn" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'" @click="toggle()">
        <span :class="isFullscreen ? 'i-mdi-fullscreen-exit text-18px' : 'i-mdi-fullscreen text-18px'" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIntervalFn, useFullscreen } from '@vueuse/core'
import { useGlobalState } from '@/store'
import { expNeed } from '@/game/engine/stats'

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile
const { run, lang } = store
const { isFullscreen, toggle } = useFullscreen()

useIntervalFn(() => store.syncStamina(), 5000)

const expPct = computed(() => Math.min(100, (pf.value!.exp / expNeed(pf.value!.level)) * 100))
const dungeonName = computed(() => store.dungeonDef(run.dungeonDefId).name)

function restart() {
  if (confirm(run.mode === 'dungeon' ? '放弃当前副本并回到魔塔第 1 层？' : '重新开始本次冒险？（装备物品保留）'))
    store.startRun()
}
function openGithub() {
  window.open('https://github.com', '_blank')
}
</script>

<style scoped>
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  min-width: 28px;
  border-radius: 8px;
  color: rgb(255 255 255 / 65%);
}
.icon-btn:hover {
  background: rgb(255 255 255 / 10%);
  color: white;
}
</style>
