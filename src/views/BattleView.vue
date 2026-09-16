<template>
  <div v-if="pf" class="flex h-full flex-col bg-[#0b0f14]">
    <TopBar />

    <!-- ===== 电脑区域（敌人） ===== -->
    <section class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-[#1c1216] to-[#121216]">
      <ZoneTag :text="t('battle.enemyArea')" color="red" />
      <div class="pointer-events-none absolute inset-0 opacity-[0.07]" style="background-image: radial-gradient(circle at 20% 30%, #ef4444 0, transparent 40%), radial-gradient(circle at 80% 60%, #ef4444 0, transparent 35%)" />

      <div class="relative z-1 flex items-end justify-center gap-3 sm:gap-6">
        <UnitCard
          v-for="u in enemies"
          :key="u.id"
          :unit="u"
          :floats="run.floats"
        />
      </div>
    </section>

    <!-- ===== 中间状态条 ===== -->
    <div class="flex h-9 shrink-0 items-center justify-between gap-1 border-y border-white/10 bg-[#0e141b] px-2 text-12px">
      <div class="flex min-w-0 items-center gap-1.5 overflow-hidden">
        <span class="game-chip shrink-0">
          <span v-if="run.mode === 'dungeon'">{{ store.dungeonDef(run.dungeonDefId).name }} {{ run.dungeonWave + 1 }}/{{ store.dungeonDef(run.dungeonDefId).waves }}</span>
          <span v-else>B{{ run.floor }}{{ isBossFloor ? ' BOSS' : '' }}</span>
        </span>
        <span class="game-chip shrink-0"><span class="i-mdi-swap-horizontal-circle-outline" />{{ t('battle.round') }} {{ run.round }}</span>
      </div>

      <div class="flex shrink-0 items-center gap-1 sm:gap-2">
        <span v-if="run.status === 'fighting' && !paused" class="hidden items-center gap-1.5 text-red-300 sm:flex">
          <span class="h-2 w-2 animate-pulse rounded-full bg-red-500" />{{ t('battle.autoFighting') }}
        </span>
        <span v-else-if="run.status === 'fighting'" class="text-amber-300">{{ t('battle.paused') }}</span>

        <!-- 倍速 -->
        <button class="icon-mini" @click="cycleSpeed">
          <span class="i-mdi-play-speed" />{{ speed }}x
        </button>
        <button class="icon-mini" @click="paused = !paused">
          <span :class="paused ? 'i-mdi-play' : 'i-mdi-pause'" />
        </button>
        <button class="icon-mini" :title="t('battle.quickPotion')" @click="store.usePotion()">
          <span class="i-mdi-bottle-tonic-outline" />
          <span class="text-10px text-sky-300">{{ potionCount }}</span>
        </button>
      </div>

      <!-- 已获得祝福 -->
      <div class="hidden max-w-40% items-center gap-1 overflow-hidden md:flex">
        <span v-for="b in activeBoons" :key="b.id" class="flex items-center rounded bg-purple-500/15 px-1.5 py-0.5 text-10px text-purple-200" :title="b.desc">
          <span :class="b.icon" class="mr-0.5" />{{ b.name }}
        </span>
      </div>
    </div>

    <!-- ===== 玩家区域 ===== -->
    <section class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-t from-[#0e1a18] to-[#121216]">
      <ZoneTag :text="t('battle.playerArea')" color="green" />
      <div class="pointer-events-none absolute inset-0 opacity-[0.07]" style="background-image: radial-gradient(circle at 25% 70%, #00dc82 0, transparent 40%), radial-gradient(circle at 75% 30%, #00dc82 0, transparent 35%)" />

      <div class="relative z-1 flex items-end justify-center gap-3 sm:gap-6">
        <UnitCard
          v-for="u in allies"
          :key="u.id"
          :unit="u"
          :floats="run.floats"
        />
      </div>

      <!-- 战斗日志 -->
      <div class="log-scroll absolute bottom-2 right-2 z-2 h-24 w-36 overflow-y-auto rounded-lg border border-white/10 bg-black/55 p-1.5 text-10px leading-4 sm:right-3 sm:h-32 sm:w-60 sm:p-2">
        <div
          v-for="line in [...run.logs].reverse()"
          :key="line.id"
          class="mb-0.5"
          :class="{
            'text-red-300': line.type === 'hit',
            'text-yellow-300 font-bold': line.type === 'crit',
            'text-red-400 font-bold': line.type === 'kill',
            'text-primary': line.type === 'reward',
            'text-green-300': line.type === 'heal',
            'text-white/60': line.type === 'sys',
          }"
        >{{ line.text }}</div>
      </div>
    </section>

    <!-- ===== 底部功能导航 ===== -->
    <nav class="safe-bottom flex h-14 shrink-0 items-stretch justify-around border-t border-white/10 bg-[#0e141b]">
      <button
        v-for="n in navs"
        :key="n.key"
        class="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-white/60 transition active:bg-white/10 hover:bg-white/5 hover:text-white"
        @click="openPanel(n.key)"
      >
        <span :class="n.icon" class="text-20px sm:text-22px" />
        <span class="text-10px sm:text-11px">{{ t(n.label) }}</span>
        <span
          v-if="n.key === 'quest' && claimable"
          class="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0e141b]"
        />
      </button>
    </nav>

    <!-- ===== 功能面板 ===== -->
    <BagPanel v-if="store.activePanel.value === 'bag'" @close="store.activePanel.value = ''" />
    <ShopPanel v-else-if="store.activePanel.value === 'shop'" @close="store.activePanel.value = ''" />
    <PetPanel v-else-if="store.activePanel.value === 'pet'" @close="store.activePanel.value = ''" />
    <DungeonPanel v-else-if="store.activePanel.value === 'dungeon'" @close="store.activePanel.value = ''" />
    <QuestPanel v-else-if="store.activePanel.value === 'quest'" @close="store.activePanel.value = ''" />

    <!-- ===== Roguelike 祝福三选一 ===== -->
    <Teleport to="body">
      <div v-if="run.status === 'boon'" class="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 p-6">
        <h2 class="mb-1 text-24px font-black text-white">{{ t('battle.boonTitle') }}</h2>
        <p class="mb-6 text-13px text-white/50">{{ t('battle.boonSubtitle') }}</p>
        <div class="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            v-for="id in run.boonOffer"
            :key="id"
            class="group flex flex-col items-center rounded-2xl border border-purple-400/30 bg-purple-500/10 p-6 transition-all hover:scale-105 hover:border-purple-400 hover:bg-purple-500/20"
            @click="store.chooseBoon(id)"
          >
            <span :class="getBoon(id).icon" class="mb-3 text-44px text-purple-300 transition-transform group-hover:scale-110" />
            <span class="mb-1 text-18px font-bold text-white">{{ getBoon(id).name }}</span>
            <span class="text-13px text-purple-200/80">{{ getBoon(id).desc }}</span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ===== 副本波次间隔（手动继续） ===== -->
    <Teleport to="body">
      <div v-if="run.status === 'waveClear' && run.mode === 'dungeon'" class="fixed inset-0 z-[55] flex items-center justify-center bg-black/60">
        <div class="panel-in rounded-2xl border border-white/10 bg-[#161e29] p-6 text-center">
          <div class="mb-1 text-18px font-bold text-primary">{{ t('battle.victory') }}</div>
          <div class="mb-4 text-12px text-white/50">{{ t('battle.waves') }} {{ run.dungeonWave + 1 }}/{{ store.dungeonDef(run.dungeonDefId).waves }}</div>
          <button class="game-btn px-6 py-2" @click="store.nextDungeonWave()">
            {{ t('common.next') }} <span class="i-mdi-arrow-right" />
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ===== 副本通关 ===== -->
    <Teleport to="body">
      <div v-if="run.status === 'dungeonClear'" class="fixed inset-0 z-[55] flex items-center justify-center bg-black/75">
        <div class="panel-in w-80 rounded-2xl border border-yellow-400/30 bg-[#161e29] p-6 text-center">
          <span class="i-mdi-trophy-award mb-2 text-48px text-yellow-400" />
          <div class="mb-3 text-20px font-black text-yellow-300">{{ t('battle.dungeonClear') }}</div>
          <div v-if="run.lastReward" class="mb-4 space-y-1 text-13px text-white/70">
            <div>+{{ run.lastReward.gold }} {{ t('common.gold') }}</div>
            <div>+{{ run.lastReward.exp }} EXP</div>
            <div v-if="run.lastReward.stone">+{{ run.lastReward.stone }} {{ t('common.stone') }}</div>
            <div v-if="run.lastReward.egg" class="text-pink-300"><span class="i-mdi-egg-outline mr-1" />{{ t('pet.egg') }} x1</div>
          </div>
          <button class="game-btn w-full py-2" @click="store.exitToTower()">{{ t('common.back') }}</button>
        </div>
      </div>
    </Teleport>

    <!-- ===== 失败结算 ===== -->
    <Teleport to="body">
      <div v-if="run.status === 'runOver' || run.status === 'dungeonLost'" class="fixed inset-0 z-[55] flex items-center justify-center bg-black/80">
        <div class="panel-in w-80 rounded-2xl border border-red-400/30 bg-[#1b1416] p-6 text-center">
          <span class="i-mdi-emoticon-dead-outline mb-2 text-48px text-red-400" />
          <div class="mb-1 text-20px font-black text-red-300">
            {{ run.status === 'runOver' ? t('battle.runOver') : t('battle.defeat') }}
          </div>
          <div class="mb-4 text-13px text-white/55">
            <template v-if="run.status === 'runOver'">
              {{ t('battle.reachedFloor') }}：{{ run.floor }} · {{ t('common.gold') }} +{{ run.goldGained }}
            </template>
            <template v-else>{{ store.dungeonDef(run.dungeonDefId).name }}</template>
          </div>
          <div class="space-y-2">
            <button v-if="run.status === 'runOver'" class="game-btn w-full py-2" @click="store.startRun()">
              <span class="i-mdi-restart mr-1" />{{ t('battle.restartRun') }}
            </button>
            <button class="game-btn-ghost w-full py-2" @click="run.status === 'dungeonLost' ? store.exitToTower() : goHome">
              {{ run.status === 'dungeonLost' ? t('common.back') : t('common.back') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIntervalFn } from '@vueuse/core'
import { useGlobalState } from '@/store'
import { getBoon } from '@/game/data/boons'
import TopBar from '@/components/TopBar.vue'
import UnitCard from '@/components/UnitCard.vue'
import BagPanel from '@/components/BagPanel.vue'
import ShopPanel from '@/components/ShopPanel.vue'
import PetPanel from '@/components/PetPanel.vue'
import DungeonPanel from '@/components/DungeonPanel.vue'
import QuestPanel from '@/components/QuestPanel.vue'
import ZoneTag from '@/components/ZoneTag.vue'

const { t } = useI18n()
const router = useRouter()
const store = useGlobalState()
const { run } = store
const pf = store.profile

const paused = ref(false)
const speed = ref(1)

const SPEEDS = [1, 2, 3]
function cycleSpeed() {
  const idx = SPEEDS.indexOf(speed.value)
  speed.value = SPEEDS[(idx + 1) % SPEEDS.length]
}

onMounted(() => {
  if (!store.hasSave.value) {
    router.replace('/')
    return
  }
  if (!run.started || run.status === 'idle')
    store.startRun()
})

// 自动战斗心跳（倍速控制间隔）
const baseInterval = 900
useIntervalFn(() => {
  if (run.status === 'fighting' && !paused.value && !store.activePanel.value)
    store.battleTick()
}, () => Math.max(150, Math.round(baseInterval / speed.value)))

// 魔塔普通层胜利后自动进入下一层
watch(() => run.status, (s) => {
  if (s === 'waveClear' && run.mode === 'tower')
    setTimeout(() => store.nextTowerFloor(), 1100)
})

const enemies = computed(() => run.units.filter(u => u.side === 'enemy'))
const allies = computed(() => run.units.filter(u => u.side !== 'enemy'))
const isBossFloor = computed(() => run.floor % 5 === 0)
const activeBoons = computed(() => run.mode === 'tower' ? pf.value!.boons.map(id => getBoon(id)) : [])
const potionCount = computed(() => {
  const item = pf.value!.bag.find(b => b.kind === 'consumable')
  return item ? item.count : 0
})
const claimable = computed(() => store.claimableCount() > 0)

const navs = [
  { key: 'bag', icon: 'i-mdi-bag-personal-outline', label: 'nav.bag' },
  { key: 'shop', icon: 'i-mdi-store-outline', label: 'nav.shop' },
  { key: 'pet', icon: 'i-mdi-paw-outline', label: 'nav.pet' },
  { key: 'dungeon', icon: 'i-mdi-treasure-chest-outline', label: 'nav.dungeon' },
  { key: 'quest', icon: 'i-mdi-clipboard-list-outline', label: 'nav.quest' },
]

function goHome() {
  router.push('/')
}

function openPanel(key: string) {
  store.activePanel.value = key as typeof store.activePanel.value
}
</script>

<style scoped>
.icon-mini {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 6px;
  padding: 2px 6px;
  color: rgb(255 255 255 / 65%);
}
.icon-mini:hover {
  background: rgb(255 255 255 / 10%);
  color: white;
}
</style>
