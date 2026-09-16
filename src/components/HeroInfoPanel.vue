<template>
  <ModalPanel :title="t('hero.infoTitle')" icon="i-mdi-account-circle-outline" width="md" @close="$emit('close')">
    <!-- 英雄概览 -->
    <div class="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-black/40 ring-1 ring-white/15">
        <Sprite :src="heroSpriteUrl" :size="48" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="text-18px font-bold text-white">{{ hero.name }}</span>
          <span class="rounded bg-primary/20 px-1.5 py-0.5 text-11px font-semibold text-primary">{{ t('common.level') }}{{ pf.level }}</span>
        </div>
        <p class="mt-0.5 text-11px leading-4 text-white/50">{{ hero.desc }}</p>
      </div>
    </div>

    <!-- 基础属性 -->
    <div class="mb-4">
      <div class="mb-2 flex items-center gap-1.5 text-13px font-bold text-white/80">
        <span class="i-mdi-chart-bar text-primary" />{{ t('hero.baseStats') }}
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div class="rounded-lg bg-black/30 px-3 py-2 text-center">
          <div class="text-10px text-white/40">HP</div>
          <b class="text-14px text-red-300">{{ combat.hp }}</b>
        </div>
        <div class="rounded-lg bg-black/30 px-3 py-2 text-center">
          <div class="text-10px text-white/40">ATK</div>
          <b class="text-14px text-orange-300">{{ combat.atk }}</b>
        </div>
        <div class="rounded-lg bg-black/30 px-3 py-2 text-center">
          <div class="text-10px text-white/40">DEF</div>
          <b class="text-14px text-sky-300">{{ combat.def }}</b>
        </div>
        <div class="rounded-lg bg-black/30 px-3 py-2 text-center">
          <div class="text-10px text-white/40">SPD</div>
          <b class="text-14px text-green-300">{{ combat.spd }}</b>
        </div>
      </div>
    </div>

    <!-- 附加属性（战斗属性 + 祝福加成） -->
    <div class="mb-4">
      <div class="mb-2 flex items-center gap-1.5 text-13px font-bold text-white/80">
        <span class="i-mdi-star-four-points text-amber-300" />{{ t('hero.extraStats') }}
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span class="text-11px text-white/55">{{ t('hero.crit') }}</span>
          <b class="text-13px text-yellow-300">{{ (combat.crit * 100).toFixed(1) }}%</b>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span class="text-11px text-white/55">{{ t('hero.lifesteal') }}</span>
          <b class="text-13px text-rose-300">{{ (combat.lifesteal * 100).toFixed(0) }}%</b>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span class="text-11px text-white/55">{{ t('hero.doubleHit') }}</span>
          <b class="text-13px text-orange-300">{{ (combat.doubleHit * 100).toFixed(0) }}%</b>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span class="text-11px text-white/55">{{ t('hero.regen') }}</span>
          <b class="text-13px text-emerald-300">{{ (combat.regen * 100).toFixed(0) }}%</b>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span class="text-11px text-white/55">{{ t('hero.goldBonus') }}</span>
          <b class="text-13px text-yellow-200">+{{ bonus.goldBonus }}%</b>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span class="text-11px text-white/55">{{ t('hero.dropBonus') }}</span>
          <b class="text-13px text-cyan-200">+{{ bonus.dropBonus }}%</b>
        </div>
      </div>
    </div>

    <!-- 被动技能 -->
    <div class="mb-4">
      <div class="mb-2 flex items-center gap-1.5 text-13px font-bold text-white/80">
        <span class="i-mdi-auto-fix text-primary" />{{ t('hero.passiveSkill') }}
      </div>
      <div class="rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div class="flex items-center gap-2">
          <span class="i-mdi-circle-small text-primary" />
          <span class="text-14px font-bold text-primary">{{ hero.skill.name }}</span>
        </div>
        <p class="mt-1 text-12px leading-4 text-white/60">{{ hero.skill.desc }}</p>
      </div>
    </div>

    <!-- 主动技能 -->
    <div class="mb-4">
      <div class="mb-2 flex items-center gap-1.5 text-13px font-bold text-white/80">
        <span class="i-mdi-flash text-amber-300" />{{ t('hero.activeSkill') }}
      </div>
      <div class="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
        <div class="flex items-center gap-2">
          <span :class="hero.active.icon" class="text-20px text-amber-300" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-14px font-bold text-amber-300">{{ hero.active.name }}</span>
              <span class="rounded bg-amber-400/20 px-1.5 py-0.5 text-10px text-amber-400">{{ t('hero.cd') }} {{ hero.active.cd }}</span>
            </div>
            <p class="mt-0.5 text-12px leading-4 text-amber-200/70">{{ hero.active.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 已获祝福 -->
    <div>
      <div class="mb-2 flex items-center gap-1.5 text-13px font-bold text-white/80">
        <span class="i-mdi-gift text-purple-300" />{{ t('hero.boons') }}
        <span class="ml-1 text-11px text-white/40">({{ activeBoons.length }})</span>
      </div>
      <div v-if="!activeBoons.length" class="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-12px text-white/35">
        {{ t('hero.noBoons') }}
      </div>
      <div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div
          v-for="b in activeBoons"
          :key="b.id"
          class="flex items-center gap-2 rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-2"
        >
          <span :class="b.icon" class="shrink-0 text-18px text-purple-300" />
          <div class="min-w-0">
            <div class="text-12px font-bold text-purple-200">{{ b.name }}</div>
            <div class="text-10px text-purple-200/60">{{ b.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </ModalPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalState } from '@/store'
import { spriteByName } from '@/game/assets'
import { getHero } from '@/game/data/heroes'
import { getBoon } from '@/game/data/boons'
import { boonsToBonus, heroCombatStats } from '@/game/engine/stats'
import ModalPanel from './ModalPanel.vue'
import Sprite from './Sprite.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile

const hero = computed(() => getHero(pf.value!.heroId))
const heroSpriteUrl = computed(() => spriteByName(hero.value.sprite).url)
const bonus = computed(() => boonsToBonus(pf.value!.boons))
const combat = computed(() => heroCombatStats(pf.value!.heroId, pf.value!.level, pf.value!.equipped, bonus.value))
const activeBoons = computed(() => pf.value!.boons.map(id => getBoon(id)))
</script>
