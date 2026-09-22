<template>
  <ModalPanel :title="t('dungeon.title')" icon="i-mdi-treasure-chest-outline" @close="$emit('close')">
    <template #extra>
      <span class="game-chip"><span class="i-mdi-lightning-bolt text-green-400" />{{ Math.floor(pf.stamina) }}/{{ store.STAMINA_MAX }}</span>
    </template>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
      <div
        v-for="d in DUNGEONS"
        :key="d.id"
        class="overflow-hidden rounded-xl border border-white/10 bg-white/5"
      >
        <div class="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-black/40 to-transparent p-3">
          <div class="flex h-60px w-60px shrink-0 items-center justify-center rounded-lg bg-red-500/10 ring-1 ring-red-400/30">
            <Sprite :src="spriteByName(d.boss).url" :size="48" />
          </div>
          <div class="min-w-0">
            <div class="text-15px font-bold text-white">{{ d.name }}</div>
            <div class="text-11px text-white/45">{{ t('dungeon.recommended', { lv: d.needLevel }) }} <span class="text-white/30">/</span> {{ d.waves }} {{ t('dungeon.waves') }}</div>
            <div v-if="pf.dungeonCount[d.id]" class="text-10px text-primary">{{ t('dungeon.clearCount', { n: pf.dungeonCount[d.id] }) }}</div>
          </div>
        </div>

        <div class="p-3">
          <p class="mb-2 min-h-32px text-12px leading-5 text-white/60">{{ d.desc }}</p>
          <div class="mb-3 flex flex-wrap gap-1.5 text-11px">
            <span class="rounded bg-yellow-500/15 px-2 py-0.5 text-yellow-300"><span class="i-mdi-cash-multiple mr-0.5" />{{ d.rewards.gold }}</span>
            <span class="rounded bg-sky-500/15 px-2 py-0.5 text-sky-300"><span class="i-mdi-star-circle mr-0.5" />{{ d.rewards.exp }} EXP</span>
            <span
              v-for="r in d.rewards.items"
              :key="r.defId"
              class="rounded bg-violet-500/15 px-2 py-0.5 text-violet-200"
            >{{ rewardName(r.defId) }} x{{ r.count }}</span>
            <span v-if="d.rewards.egg" class="rounded bg-pink-500/15 px-2 py-0.5 text-pink-200"><span class="i-mdi-egg-outline mr-0.5" />{{ t('pet.egg') }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <button
              class="game-btn w-full"
              :disabled="pf.level < d.needLevel || pf.stamina < d.cost || inDungeon"
              @click="store.enterDungeon(d.id)"
            >
              <span class="i-mdi-sword-cross mr-1" />
              {{ pf.level < d.needLevel ? `${t('common.locked')} / ${t('dungeon.recommended', { lv: d.needLevel })}` : `${t('dungeon.enter')} (${t('dungeon.cost', { n: d.cost })})` }}
            </button>
            <button
              v-if="pf.dungeonCount[d.id]"
              class="game-btn-purple w-full text-12px"
              :disabled="pf.stamina < d.cost * 2 || inDungeon"
              :title="`消耗 ${d.cost * 2} 体力立即结算奖励`"
              @click="store.sweepDungeon(d.id)"
            >
              <span class="i-mdi-fast-forward mr-1" />扫荡 ({{ d.cost * 2 }}体力)
            </button>
          </div>
        </div>
      </div>
    </div>
  </ModalPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DUNGEONS } from '@/game/data/dungeons'
import { spriteByName } from '@/game/assets'
import { getConsumableDef } from '@/game/data/catalog'
import ModalPanel from './ModalPanel.vue'
import Sprite from './Sprite.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile

const inDungeon = computed(() => store.run.mode === 'dungeon')

function rewardName(defId: string): string {
  if (defId === 'stone')
    return t('common.stone')
  return getConsumableDef(defId).name
}
</script>
