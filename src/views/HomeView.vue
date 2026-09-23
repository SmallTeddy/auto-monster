<template>
  <div class="home-shell relative h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,#17263b_0%,#090e14_64%)]">
    <!-- 背景装饰 -->
    <div class="pointer-events-none absolute inset-0 opacity-20">
      <img v-for="(d, i) in deco" :key="i" :src="d.url" class="pixel absolute" :style="d.style" alt="">
    </div>

    <div class="home-frame relative mx-auto flex min-h-full max-w-6xl flex-col px-4 pb-12 pt-[max(2rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
      <header class="home-heading mb-6 flex flex-col items-center">
        <div class="mb-1 flex items-center gap-3">
        <img src="/icons/game.svg" class="h-10 w-10" alt="logo">
        <h1 class="text-32px font-black tracking-wider text-white sm:text-40px">
          {{ t('app.title') }}
        </h1>
        </div>
        <p class="mb-1 text-14px text-primary">{{ t('app.subtitle') }} <span class="mx-1 text-white/35">/</span> Roguelike Auto Battler</p>
        <p class="max-w-[42rem] text-center text-13px leading-5 text-white/45">{{ t('home.heroTip') }}</p>
      </header>

      <!-- 已有存档 -->
      <div v-if="store.hasSave.value" class="continue-card mb-6 flex w-full max-w-3xl items-center gap-3 border border-primary/30 bg-primary/10 px-3 py-3 sm:gap-4 sm:px-4">
        <div class="continue-card__portrait">
          <Sprite :src="spriteByName(getHero(profile!.heroId).sprite).url" :size="48" :alt="getHero(profile!.heroId).name" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="continue-card__eyebrow">SAVE SLOT 01 <span>/</span> {{ t('home.continue') }}</div>
          <div class="truncate text-15px font-bold text-white">{{ getHero(profile!.heroId).name }}</div>
          <div class="continue-card__meta">
            {{ t('common.level') }}{{ profile!.level }} <span>/</span> {{ t('common.floor') }}{{ profile!.bestFloor }}
          </div>
        </div>
        <div class="continue-card__actions">
          <button class="game-btn continue-card__action" @click="continueGame">
            <span class="i-mdi-play mr-1" />{{ t('home.continue') }}
          </button>
          <button
            class="game-btn-ghost continue-card__delete"
            :title="t('home.reset')"
            :aria-label="t('home.reset')"
            @click="resetSave"
          >
            <span class="i-mdi-delete-outline" aria-hidden="true" />
            <span>{{ t('home.reset') }}</span>
          </button>
        </div>
      </div>

      <div class="home-layout w-full">
        <section class="hero-showcase">
          <div class="hero-showcase__eyebrow">CURRENT RUNNER <span>/</span> {{ t('home.selectHero') }}</div>
          <div class="hero-showcase__sprite">
            <Sprite :src="spriteByName(selectedHero.sprite).url" :size="144" :alt="selectedHero.name" />
          </div>
          <div class="hero-showcase__name">{{ selectedHero.name }}</div>
          <div class="hero-showcase__skill">{{ selectedHero.skill.name }}</div>
          <p class="hero-showcase__desc">{{ selectedHero.skill.desc }}</p>
          <div class="hero-showcase__active">
            <span :class="selectedHero.active.icon" class="text-18px text-amber-300" />
            <div class="min-w-0">
              <div class="flex items-center gap-2 text-12px font-bold text-amber-300">
                {{ selectedHero.active.name }}
                <span class="border border-amber-400/30 px-1 text-9px text-amber-400/80">CD {{ selectedHero.active.cd }}</span>
              </div>
              <div class="text-10px leading-4 text-amber-200/70">{{ selectedHero.active.desc }}</div>
            </div>
          </div>
          <div class="hero-stats grid grid-cols-4 gap-1 text-center">
            <div><div>HP</div><b class="text-red-300">{{ selectedHero.base.hp }}</b></div>
            <div><div>ATK</div><b class="text-orange-300">{{ selectedHero.base.atk }}</b></div>
            <div><div>DEF</div><b class="text-sky-300">{{ selectedHero.base.def }}</b></div>
            <div><div>SPD</div><b class="text-green-300">{{ selectedHero.base.spd }}</b></div>
          </div>
          <button
            class="game-btn hero-start"
            :disabled="!selected"
            @click="start"
          >
            <span class="i-mdi-sword-cross mr-1" />
            {{ isSameHero ? t('home.continue') : t('home.start') }}
          </button>
        </section>

        <section class="hero-roster">
          <div class="hero-roster__head">
            <h2 class="text-18px font-bold text-white/90">{{ t('home.selectHero') }}</h2>
            <span>{{ HEROES.length }} OPTIONS</span>
          </div>
          <div class="hero-roster__grid">
        <button
          v-for="hero in HEROES"
          :key="hero.id"
          class="hero-roster__card group relative flex min-h-0 flex-col items-center border p-3 transition-all sm:p-4"
          :class="selected === hero.id
            ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgb(0_220_130/0.25)]'
            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/8'"
          @click="selected = hero.id"
        >
          <div
            class="mb-3 flex h-20 w-20 items-center justify-center bg-black/40 ring-1 transition-transform group-hover:scale-105"
            :class="selected === hero.id ? 'ring-primary/60' : 'ring-white/15'"
          >
            <Sprite :src="spriteByName(hero.sprite).url" :size="72" />
          </div>
          <div class="mb-1 text-16px font-bold text-white">{{ hero.name }}</div>
          <div class="mb-2 border border-white/10 bg-white/10 px-2 py-0.5 text-11px text-primary">{{ hero.skill.name }}</div>
          <p class="mb-2 min-h-36px text-center text-11px leading-4 text-white/50">{{ hero.skill.desc }}</p>
          <!-- 主动技能 -->
          <div class="mb-3 flex items-center gap-1.5 border border-amber-400/30 bg-amber-500/10 px-2 py-1">
            <span :class="hero.active.icon" class="shrink-0 text-16px text-amber-300" />
            <div class="min-w-0">
              <div class="flex items-center gap-1 text-11px font-bold text-amber-300">
                {{ hero.active.name }}
                <span class="rounded bg-amber-400/20 px-1 text-9px text-amber-400/80">CD {{ hero.active.cd }}</span>
              </div>
              <div class="text-9px leading-3 text-amber-200/70">{{ hero.active.desc }}</div>
            </div>
          </div>
          <div class="grid w-full grid-cols-4 gap-1 text-center">
            <div class="bg-black/30 py-1"><div class="text-10px text-white/40">HP</div><b class="text-12px text-red-300">{{ hero.base.hp }}</b></div>
            <div class="bg-black/30 py-1"><div class="text-10px text-white/40">ATK</div><b class="text-12px text-orange-300">{{ hero.base.atk }}</b></div>
            <div class="bg-black/30 py-1"><div class="text-10px text-white/40">DEF</div><b class="text-12px text-sky-300">{{ hero.base.def }}</b></div>
            <div class="bg-black/30 py-1"><div class="text-10px text-white/40">SPD</div><b class="text-12px text-green-300">{{ hero.base.spd }}</b></div>
          </div>
          <div
            v-if="selected === hero.id"
            class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center bg-primary text-black shadow"
          >
            <span class="i-mdi-check-bold" />
          </div>
        </button>
      </div>
        </section>
      </div>
      <p v-if="store.hasSave.value" class="mt-2 text-11px text-white/35">已有存档时新英雄不可创建，可继续冒险或删除存档</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HEROES, getHero } from '@/game/data/heroes'
import { spriteByName } from '@/game/assets'
import Sprite from '@/components/Sprite.vue'

const { t } = useI18n()
const router = useRouter()
const store = useGlobalState()
const profile = store.profile

const selected = ref(store.hasSave.value ? profile.value!.heroId : HEROES[0].id)
const selectedHero = computed(() => getHero(selected.value || HEROES[0].id))
// 当前选中的角色是否与存档角色相同
const isSameHero = computed(() => store.hasSave.value && profile.value!.heroId === selected.value)

const decoNames = ['冰霜巨龙.png', '光谱龙.png', '狼.png', '巨型蟾蜍.png']
const deco = decoNames.map((name, i) => ({
  url: spriteByName(name.replace('.png', '')).url,
  style: {
    width: '64px',
    left: `${8 + i * 24}%`,
    top: `${15 + (i % 2) * 55}%`,
    transform: 'rotate(-10deg)',
  },
}))

async function start() {
  if (!selected.value)
    return
  // 已有存档且选择了不同角色：确认后以新角色重新开始（覆盖存档）
  if (store.hasSave.value && !isSameHero.value) {
    const ok = await store.confirm(`切换为【${selectedHero.value.name}】将覆盖当前存档并重新开始，是否继续？`)
    if (!ok)
      return
    store.deleteSave()
  }
  if (isSameHero.value) {
    // 同角色继续游戏
    store.continueRun()
  }
  else {
    store.createSave(selected.value)
  }
  router.push('/battle')
}
function continueGame() {
  store.continueRun()
  router.push('/battle')
}
async function resetSave() {
  const ok = await store.confirm(t('home.resetConfirm'))
  if (ok) {
    store.deleteSave()
    selected.value = HEROES[0].id
  }
}
</script>
