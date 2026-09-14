<template>
  <div class="relative h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,#16233a_0%,#0b0f14_60%)]">
    <!-- 背景装饰 -->
    <div class="pointer-events-none absolute inset-0 opacity-20">
      <img v-for="(d, i) in deco" :key="i" :src="d.url" class="pixel absolute" :style="d.style" alt="">
    </div>

    <div class="relative mx-auto flex min-h-full max-w-5xl flex-col items-center px-6 py-10">
      <div class="mb-1 flex items-center gap-3">
        <img src="/icons/game.svg" class="h-10 w-10" alt="logo">
        <h1 class="text-40px font-black tracking-wider text-white">
          {{ t('app.title') }}
        </h1>
      </div>
      <p class="mb-2 text-14px text-primary">{{ t('app.subtitle') }} · Roguelike Auto Battler</p>
      <p class="mb-8 text-13px text-white/45">{{ t('home.heroTip') }}</p>

      <!-- 已有存档 -->
      <div v-if="store.hasSave.value" class="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-5 py-3">
        <div class="text-13px text-white/70">
          {{ t('home.continue') }} · {{ getHero(profile!.heroId).name }}
          · {{ t('common.level') }}{{ profile!.level }}
          · {{ t('common.floor') }}{{ profile!.bestFloor }}
        </div>
        <button class="game-btn" @click="continueGame">
          <span class="i-mdi-play mr-1" />{{ t('home.continue') }}
        </button>
        <button class="game-btn-ghost px-2 py-1.5 text-12px" @click="resetSave">
          <span class="i-mdi-delete-outline" />
        </button>
      </div>

      <h2 class="mb-5 text-18px font-bold text-white/90">{{ t('home.selectHero') }}</h2>

      <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="hero in HEROES"
          :key="hero.id"
          class="group relative flex flex-col items-center rounded-2xl border p-5 transition-all"
          :class="selected === hero.id
            ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgb(0_220_130/0.25)]'
            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/8'"
          @click="selected = hero.id"
        >
          <div
            class="mb-3 flex h-24 w-24 items-center justify-center rounded-xl bg-black/40 ring-1 transition-transform group-hover:scale-105"
            :class="selected === hero.id ? 'ring-primary/60' : 'ring-white/15'"
          >
            <Sprite :src="spriteByName(hero.sprite).url" :size="72" />
          </div>
          <div class="mb-1 text-16px font-bold text-white">{{ hero.name }}</div>
          <div class="mb-3 rounded bg-white/10 px-2 py-0.5 text-11px text-primary">{{ hero.skill.name }}</div>
          <p class="mb-3 min-h-50px text-11px leading-4 text-white/50">{{ hero.skill.desc }}</p>
          <div class="grid w-full grid-cols-4 gap-1 text-center">
            <div class="rounded bg-black/30 py-1"><div class="text-10px text-white/40">HP</div><b class="text-12px text-red-300">{{ hero.base.hp }}</b></div>
            <div class="rounded bg-black/30 py-1"><div class="text-10px text-white/40">ATK</div><b class="text-12px text-orange-300">{{ hero.base.atk }}</b></div>
            <div class="rounded bg-black/30 py-1"><div class="text-10px text-white/40">DEF</div><b class="text-12px text-sky-300">{{ hero.base.def }}</b></div>
            <div class="rounded bg-black/30 py-1"><div class="text-10px text-white/40">SPD</div><b class="text-12px text-green-300">{{ hero.base.spd }}</b></div>
          </div>
          <div
            v-if="selected === hero.id"
            class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-black shadow"
          >
            <span class="i-mdi-check-bold" />
          </div>
        </button>
      </div>

      <button
        class="mt-8 rounded-xl bg-primary px-10 py-3 text-17px font-black text-black shadow-[0_4px_20px_rgb(0_220_130/0.4)] transition enabled:hover:scale-105 disabled:opacity-40"
        :disabled="!selected || (store.hasSave.value && !!profile)"
        @click="start"
      >
        <span class="i-mdi-sword-cross mr-1" />{{ t('home.start') }}
      </button>
      <p v-if="store.hasSave.value" class="mt-2 text-11px text-white/35">已有存档时新英雄不可创建，可继续冒险或删除存档</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { HEROES, getHero } from '@/game/data/heroes'
import { spriteByName } from '@/game/assets'
import Sprite from '@/components/Sprite.vue'

const { t } = useI18n()
const router = useRouter()
const store = useGlobalState()
const profile = store.profile

const selected = ref(store.hasSave.value ? profile.value!.heroId : HEROES[0].id)

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

function start() {
  if (!selected.value)
    return
  store.createSave(selected.value)
  router.push('/battle')
}
function continueGame() {
  store.startRun()
  router.push('/battle')
}
function resetSave() {
  if (confirm(t('home.resetConfirm'))) {
    store.deleteSave()
    selected.value = HEROES[0].id
  }
}
</script>
