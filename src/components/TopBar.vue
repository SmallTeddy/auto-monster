<template>
  <header class="safe-top flex h-11 shrink-0 items-center justify-between gap-1 border-b border-white/10 bg-[#0e141b] px-2 sm:px-3">
    <div class="flex shrink-0 items-center gap-2">
      <button
        class="flex items-center gap-2 rounded-lg px-1 py-0.5 transition hover:bg-white/10"
        :title="t('hero.infoTitle')"
        @click="showHeroInfo = true"
      >
        <img src="/icons/game.svg" alt="logo" class="h-5 w-5">
        <span class="hidden text-14px font-bold tracking-wide text-white sm:inline">{{ t('app.title') }}</span>
      </button>
    </div>

    <div class="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar sm:gap-2">
      <!-- 等级 -->
      <div class="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-1.5 py-1 sm:px-2" title="Lv">
        <span class="i-mdi-shield-account-outline text-primary" />
        <span class="text-11px font-semibold sm:text-12px">{{ t('common.level') }}{{ pf.level }}</span>
        <div class="hidden h-1.5 w-14 overflow-hidden rounded-full bg-black/50 sm:block">
          <div class="h-full bg-primary" :style="{ width: `${expPct}%` }" />
        </div>
      </div>
      <!-- 层数 -->
      <div v-if="run.started" class="flex shrink-0 items-center gap-1 rounded-lg bg-white/5 px-1.5 py-1 sm:px-2">
        <span class="i-mdi-tower-fire text-orange-400" />
        <span class="text-11px sm:text-12px">{{ run.mode === 'dungeon' ? dungeonName : `${t('common.floor')}${run.floor}` }}</span>
      </div>
      <!-- 金币 -->
      <div class="flex shrink-0 items-center gap-1 rounded-lg bg-white/5 px-1.5 py-1 sm:px-2">
        <span class="i-mdi-cash-multiple text-yellow-400" />
        <span class="text-11px font-semibold text-yellow-200 sm:text-12px">{{ pf.gold }}</span>
      </div>
      <!-- 结晶 -->
      <div class="hidden shrink-0 items-center gap-1 rounded-lg bg-white/5 px-2 py-1 md:flex">
        <span class="i-mdi-diamond-outline text-cyan-300" />
        <span class="text-12px font-semibold text-cyan-100">{{ pf.soul }}</span>
      </div>
      <!-- 强化石 -->
      <div class="hidden shrink-0 items-center gap-1 rounded-lg bg-white/5 px-2 py-1 md:flex">
        <span class="i-mdi-hexagon-multiple-outline text-violet-300" />
        <span class="text-12px font-semibold text-violet-100">{{ pf.stone }}</span>
      </div>
      <!-- 体力 -->
      <div class="flex shrink-0 items-center gap-1 rounded-lg bg-white/5 px-1.5 py-1 sm:px-2">
        <span class="i-mdi-lightning-bolt text-green-400" />
        <span class="text-11px font-semibold sm:text-12px">{{ Math.floor(pf.stamina) }}/{{ store.STAMINA_MAX }}</span>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <button
        class="icon-btn"
        :title="t('common.refresh')"
        @click="restart"
      >
        <span class="i-mdi-restart text-18px" />
      </button>
    </div>

    <!-- 角色信息弹框 -->
    <HeroInfoPanel v-if="showHeroInfo" @close="showHeroInfo = false" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useGlobalState } from '@/store'
import { expNeed } from '@/game/engine/stats'
import HeroInfoPanel from './HeroInfoPanel.vue'

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile
const { run } = store

const showHeroInfo = ref(false)

useIntervalFn(() => store.syncStamina(), 5000)

const expPct = computed(() => Math.min(100, (pf.value!.exp / expNeed(pf.value!.level)) * 100))
const dungeonName = computed(() => store.dungeonDef(run.dungeonDefId).name)

function restart() {
  if (confirm(run.mode === 'dungeon' ? '放弃当前副本并回到魔塔第 1 层？' : '重新开始本次冒险？（装备物品保留）'))
    store.startRun()
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
