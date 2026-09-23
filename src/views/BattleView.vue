<template>
  <div v-if="pf" class="battle-shell flex h-full min-h-0 flex-col bg-[#090e14]">
    <TopBar />

    <div class="battle-layout min-h-0 flex-1">
    <!-- ===== 敌方状态栏 ===== -->
    <aside class="battle-side battle-side--enemy">
      <ZoneTag :text="t('battle.enemyArea')" color="red" />
      <div class="pointer-events-none absolute inset-0 opacity-[0.07]" style="background-image: radial-gradient(circle at 20% 30%, #ef4444 0, transparent 40%), radial-gradient(circle at 80% 60%, #ef4444 0, transparent 35%)" />

      <div class="battle-side__summary relative z-1">
        <div class="battle-side__count">{{ enemies.length }}</div>
        <div class="battle-side__label">ENEMIES</div>
        <div v-for="u in enemies" :key="`enemy-status-${u.id}`" class="battle-side__unit-name">
          {{ u.name }} <span>Lv{{ u.level }}</span>
        </div>
      </div>
    </aside>

    <main class="battle-arena">
      <div class="battle-arena__caption">AUTO COMBAT <span>/</span> {{ run.mode === 'dungeon' ? store.dungeonDef(run.dungeonDefId).name : `B${run.floor}` }}</div>
      <div class="battle-arena__enemy relative z-1 flex max-w-full items-end justify-center gap-2 px-2 sm:gap-4">
        <UnitCard v-for="u in enemies" :key="`arena-${u.id}`" :unit="u" :floats="run.floats" />
      </div>
      <div class="battle-arena__divider"><span>VS</span></div>
      <div class="battle-arena__allies relative z-1 flex w-full max-w-full flex-wrap items-end justify-around gap-1 px-2 sm:gap-3">
        <UnitCard v-for="u in allies" :key="`arena-${u.id}`" :unit="u" :floats="run.floats" />
      </div>
    </main>

    <aside class="battle-side battle-side--log">
      <div class="battle-side__title">COMBAT LOG</div>
      <div class="log-scroll h-full w-full overflow-y-auto p-2 text-10px leading-4">
        <div
          v-for="line in [...run.logs].reverse()"
          :key="`side-${line.id}`"
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
    </aside>
    </div>

    <!-- ===== 中间状态条 ===== -->
    <div class="battle-toolbar flex min-h-10 shrink-0 items-center justify-between gap-1 border-y border-white/10 bg-[#0e141b] px-2 text-12px shadow-[0_0_18px_rgb(0_0_0/0.2)]">
      <!-- 左侧：层数 / 回合 -->
      <div class="flex min-w-0 items-center gap-1.5 overflow-hidden">
        <span class="game-chip shrink-0">
          <span v-if="run.mode === 'dungeon'">{{ store.dungeonDef(run.dungeonDefId).name }} {{ run.dungeonWave + 1 }}/{{ store.dungeonDef(run.dungeonDefId).waves }}</span>
          <span v-else>B{{ run.floor }}{{ isBossFloor ? ' BOSS' : '' }}</span>
        </span>
        <span class="game-chip shrink-0"><span class="i-mdi-swap-horizontal-circle-outline" />{{ t('battle.round') }} {{ run.round }}</span>
      </div>

      <!-- 右侧：自动战斗状态 + 技能 + 倍速 + 暂停 + 药水（固定靠右，避免抖动） -->
      <div class="flex shrink-0 items-center gap-0.5 sm:gap-2">
        <!-- 自动战斗状态 -->
        <span v-if="run.status === 'fighting' && !paused" class="hidden items-center gap-1.5 text-red-300 sm:flex">
          <span class="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />{{ t('battle.autoFighting') }}
        </span>
        <span v-else-if="run.status === 'fighting'" class="text-amber-300">{{ t('battle.paused') }}</span>

        <!-- 主动技能 -->
        <button
          class="skill-btn"
          :class="{ 'skill-ready': skillReady, 'skill-cooldown': skillCd > 0 }"
          :disabled="!skillReady"
          :title="`${activeSkill.name}：${activeSkill.desc}`"
          @click="store.castSkill()"
        >
          <span :class="activeSkill.icon" class="text-16px" />
          <span class="hidden text-11px font-semibold sm:inline">{{ activeSkill.name }}</span>
          <span class="inline-block w-3 text-center text-11px font-bold text-red-300">{{ skillCd > 0 ? skillCd : '' }}</span>
        </button>

        <!-- 倍速（下拉选择） -->
        <div class="speed-select-wrap">
          <span class="i-mdi-play-speed text-14px" />
          <GameSelect
            v-model="speed"
            :options="speedOptions"
            aria-label="战斗速度"
            placement="top"
          />
        </div>

        <button class="icon-mini" @click="paused = !paused">
          <span :class="paused ? 'i-mdi-play' : 'i-mdi-pause'" />
        </button>
        <button class="icon-mini" :title="t('battle.quickPotion')" @click="store.usePotion()">
          <span class="i-mdi-bottle-tonic-outline" />
          <span class="text-10px text-sky-300">{{ potionCount }}</span>
        </button>
      </div>
    </div>

    <!-- ===== 底部功能导航 ===== -->
    <nav class="safe-bottom flex min-h-14 shrink-0 items-stretch justify-around border-t border-white/10 bg-[#0e141b] shadow-[0_-8px_22px_rgb(0_0_0/0.2)]">
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
        <p class="mb-4 text-13px text-white/50">{{ t('battle.boonSubtitle') }}</p>
        <div class="mb-6 flex items-center gap-2 text-13px text-amber-300">
          <span class="i-mdi-timer-sand" />
          <span>{{ boonCountdown }} 秒后自动随机选择</span>
        </div>
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
              {{ t('battle.reachedFloor') }}：{{ run.floor }} <span class="text-white/35">/</span> {{ t('common.gold') }} +{{ run.goldGained }}
            </template>
            <template v-else>{{ store.dungeonDef(run.dungeonDefId).name }}</template>
          </div>
          <div class="space-y-2">
            <button v-if="run.status === 'runOver'" class="game-btn w-full py-2" @click="store.startRun()">
              <span class="i-mdi-restart mr-1" />{{ t('battle.restartRun') }}
            </button>
            <button class="game-btn-ghost w-full py-2" @click="run.status === 'dungeonLost' ? store.exitToTower() : goHome()">
              {{ run.status === 'dungeonLost' ? t('common.back') : t('common.back') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIntervalFn } from '@vueuse/core'
import { useGlobalState } from '@/store'
import { getBoon } from '@/game/data/boons'
import { getHero } from '@/game/data/heroes'
import TopBar from '@/components/TopBar.vue'
import UnitCard from '@/components/UnitCard.vue'
import BagPanel from '@/components/BagPanel.vue'
import ShopPanel from '@/components/ShopPanel.vue'
import PetPanel from '@/components/PetPanel.vue'
import DungeonPanel from '@/components/DungeonPanel.vue'
import QuestPanel from '@/components/QuestPanel.vue'
import ZoneTag from '@/components/ZoneTag.vue'
import GameSelect from '@/components/GameSelect.vue'

const { t } = useI18n()
const router = useRouter()
const store = useGlobalState()
const { run } = store
const pf = store.profile

const paused = ref(false)
const speed = ref(1)

const SPEEDS = [1, 3, 5, 8, 10, 15]
const speedOptions = SPEEDS.map(value => ({ label: `${value}x`, value }))

onMounted(() => {
  if (!store.hasSave.value) {
    router.replace('/')
    return
  }
  if (!run.started || run.status === 'idle') {
    // 刷新页面：若存档中保存了层数（>1），则恢复；否则从第 1 层开始
    const savedFloor = pf.value!.runFloor ?? 1
    if (savedFloor > 1)
      store.continueRun()
    else
      store.startRun()
  }
})

// 自动战斗心跳（倍速控制间隔）
const baseInterval = 900
useIntervalFn(() => {
  if (run.status !== 'fighting' || paused.value || store.activePanel.value)
    return
  // 技能就绪时自动释放
  const hero = run.units.find(u => u.side === 'hero')
  if (hero && (!hero.skillCd || hero.skillCd <= 0))
    store.castSkill()
  store.battleTick()
}, () => Math.max(60, Math.round(baseInterval / speed.value)))

// 魔塔普通层胜利后自动进入下一层
watch(() => run.status, (s) => {
  if (s === 'waveClear' && run.mode === 'tower')
    setTimeout(() => store.nextTowerFloor(), 1100)
})

// 祝福选择 5 秒倒计时，到 0 自动随机选一个
const boonCountdown = ref(5)
let boonTimer: ReturnType<typeof setInterval> | null = null
function clearBoonTimer() {
  if (boonTimer) {
    clearInterval(boonTimer)
    boonTimer = null
  }
}
watch(() => run.status, (s) => {
  clearBoonTimer()
  if (s === 'boon') {
    boonCountdown.value = 5
    boonTimer = setInterval(() => {
      boonCountdown.value -= 1
      if (boonCountdown.value <= 0) {
        clearBoonTimer()
        const offer = run.boonOffer
        if (offer.length) {
          const pick = offer[Math.floor(Math.random() * offer.length)]
          store.chooseBoon(pick)
        }
      }
    }, 1000)
  }
})
onUnmounted(clearBoonTimer)

const enemies = computed(() => run.units.filter(u => u.side === 'enemy'))
const allies = computed(() => run.units.filter(u => u.side !== 'enemy'))
const isBossFloor = computed(() => run.floor % 5 === 0)
const potionCount = computed(() => {
  const item = pf.value!.bag.find(b => b.kind === 'consumable')
  return item ? item.count : 0
})
const claimable = computed(() => store.claimableCount() > 0)

// 主动技能
const activeSkill = computed(() => getHero(pf.value!.heroId).active)
const skillCd = computed(() => {
  const hero = run.units.find(u => u.side === 'hero')
  return hero?.skillCd ?? 0
})
const skillReady = computed(() => run.status === 'fighting' && skillCd.value <= 0)

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
  transition: transform 160ms ease, background-color 160ms ease, color 160ms ease;
}
.icon-mini:hover {
  background: rgb(255 255 255 / 10%);
  color: white;
}
.icon-mini:active { transform: translateY(1px) scale(.96); }

/* 倍速选择器 */
.speed-select-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 6px;
  padding: 1px 4px 1px 6px;
  background: rgb(255 255 255 / 6%);
  color: rgb(255 255 255 / 70%);
}

/* 主动技能按钮 */
.skill-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  border-radius: 6px;
  padding: 2px 7px;
  border: 1px solid transparent;
  transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
  will-change: transform;
}
.skill-btn.skill-ready {
  border-color: #fbbf24;
  background: rgb(251 191 36 / 15%);
  color: #fde68a;
  box-shadow: 0 0 6px rgb(251 191 36 / 35%);
}
.skill-btn.skill-ready:hover {
  background: rgb(251 191 36 / 28%);
  transform: scale(1.04);
}
.skill-btn.skill-cooldown {
  background: rgb(255 255 255 / 6%);
  color: rgb(255 255 255 / 40%);
  cursor: not-allowed;
}
.skill-btn:disabled {
  opacity: 0.55;
}

@media (max-width: 420px) {
  .battle-toolbar { font-size: 11px; }
  .speed-select-wrap { padding-inline: 3px; }
  .skill-btn { padding-inline: 5px; }
  .skill-btn .text-11px { display: none; }
}
</style>
