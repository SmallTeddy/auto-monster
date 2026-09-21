<template>
  <ModalPanel :title="t('quest.title')" icon="i-mdi-clipboard-list-outline" @close="$emit('close')">
    <section class="mb-5">
      <h3 class="mb-2 flex items-center gap-2 text-13px font-bold text-sky-300">
        <span class="i-mdi-calendar-sync" />{{ t('quest.daily') }}
        <span class="text-11px font-normal text-white/40">/ {{ t('quest.resetDaily') }}</span>
        <button
          class="ml-auto flex items-center gap-1 rounded-lg bg-yellow-500/20 px-2 py-1 text-11px text-yellow-300 hover:bg-yellow-500/30"
          :disabled="pf.gold < store.DAILY_REFRESH_COST"
          @click="store.refreshDaily()"
        >
          <span class="i-mdi-refresh" />{{ t('quest.refresh') }} ({{ store.DAILY_REFRESH_COST }}金)
        </button>
      </h3>
      <div class="space-y-2">
        <div
          v-for="q in DAILY_QUESTS"
          :key="q.id"
          class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <div class="min-w-0 flex-1">
            <div class="text-13px font-semibold text-white">{{ q.name }}</div>
            <div class="text-11px text-white/50">{{ q.desc }}</div>
            <div class="mt-1 flex items-center gap-2">
              <div class="h-1.5 w-40 overflow-hidden rounded-full bg-black/50">
                <div class="h-full bg-sky-400" :style="{ width: `${progress(q.id) * 100}%` }" />
              </div>
              <span class="text-10px text-white/45">{{ store.questProgress(q.id).current }}/{{ q.target }}</span>
            </div>
          </div>
          <div class="hidden text-right text-11px leading-5 text-yellow-200/80 sm:block">
            <div v-if="q.rewards.gold">{{ q.rewards.gold }} {{ t('common.gold') }}</div>
            <div v-if="q.rewards.stone">{{ q.rewards.stone }} {{ t('common.stone') }}</div>
            <div v-if="q.rewards.exp">{{ q.rewards.exp }} EXP</div>
          </div>
          <button
            class="w-18 shrink-0 rounded-lg px-2 py-2 text-12px font-semibold transition"
            :class="store.questProgress(q.id).claimed
              ? 'cursor-default bg-white/5 text-white/30'
              : store.questProgress(q.id).claimable
                ? 'bg-primary text-black hover:brightness-110'
                : 'cursor-not-allowed bg-white/10 text-white/40'"
            :disabled="!store.questProgress(q.id).claimable"
            @click="store.claimQuest(q.id)"
          >
            {{ store.questProgress(q.id).claimed ? t('quest.claimed') : t('quest.claim') }}
          </button>
        </div>
      </div>
    </section>

    <section>
      <h3 class="mb-2 flex items-center gap-2 text-13px font-bold text-purple-300">
        <span class="i-mdi-trophy-outline" />{{ t('quest.achievement') }}
      </h3>
      <div class="space-y-2">
        <div
          v-for="q in ACHIEVEMENTS"
          :key="q.id"
          class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <div class="min-w-0 flex-1">
            <div class="text-13px font-semibold text-white">{{ q.name }}</div>
            <div class="text-11px text-white/50">{{ q.desc }}</div>
            <div class="mt-1 flex items-center gap-2">
              <div class="h-1.5 w-40 overflow-hidden rounded-full bg-black/50">
                <div class="h-full bg-purple-400" :style="{ width: `${progress(q.id) * 100}%` }" />
              </div>
              <span class="text-10px text-white/45">{{ store.questProgress(q.id).current }}/{{ q.target }}</span>
            </div>
          </div>
          <div class="hidden text-right text-11px leading-5 text-yellow-200/80 sm:block">
            <div v-if="q.rewards.gold">{{ q.rewards.gold }} {{ t('common.gold') }}</div>
            <div v-if="q.rewards.soul">{{ q.rewards.soul }} {{ t('common.soul') }}</div>
            <div v-if="q.rewards.stone">{{ q.rewards.stone }} {{ t('common.stone') }}</div>
          </div>
          <button
            class="w-18 shrink-0 rounded-lg px-2 py-2 text-12px font-semibold transition"
            :class="store.questProgress(q.id).claimed
              ? 'cursor-default bg-white/5 text-white/30'
              : store.questProgress(q.id).claimable
                ? 'bg-primary text-black hover:brightness-110'
                : 'cursor-not-allowed bg-white/10 text-white/40'"
            :disabled="!store.questProgress(q.id).claimable"
            @click="store.claimQuest(q.id)"
          >
            {{ store.questProgress(q.id).claimed ? t('quest.claimed') : t('quest.claim') }}
          </button>
        </div>
      </div>
    </section>
  </ModalPanel>
</template>

<script setup lang="ts">
import { ACHIEVEMENTS, DAILY_QUESTS, QUESTS } from '@/game/data/quests'
import ModalPanel from './ModalPanel.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile

function progress(qid: string): number {
  const def = QUESTS.find(q => q.id === qid)!
  return Math.min(1, store.questProgress(qid).current / def.target)
}
</script>
