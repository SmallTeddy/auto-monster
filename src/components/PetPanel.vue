<template>
  <ModalPanel :title="t('pet.title')" icon="i-mdi-paw" @close="$emit('close')">
    <template #extra>
      <span class="text-12px text-white/50">
        {{ t('pet.deployed') }} {{ deployedCount }}/7 · {{ t('pet.deployLimit', { n: 7 }) }}
      </span>
    </template>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div
        v-for="pet in pf.pets"
        :key="pet.uid"
        class="flex gap-3 rounded-xl border p-3"
        :class="pet.deployed ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5'"
      >
        <div
          class="flex h-70px w-70px shrink-0 items-center justify-center rounded-lg"
          :style="{ background: `${rarityColor(pet)}14`, boxShadow: `inset 0 0 0 1px ${rarityColor(pet)}55` }"
        >
          <Sprite :src="pet.sprite" :size="52" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="truncate text-14px font-bold" :style="{ color: rarityColor(pet) }">{{ pet.name }}</span>
            <span class="rounded bg-white/10 px-1 text-10px text-white/60">Lv{{ pet.level }}</span>
            <span v-if="pet.train" class="rounded bg-cyan-500/20 px-1 text-10px text-cyan-300">训+{{ pet.train }}</span>
            <span v-if="pet.deployed" class="ml-auto text-11px font-semibold text-primary">{{ t('pet.deployed') }}</span>
          </div>

          <!-- 经验 -->
          <div class="mt-1 flex items-center gap-1">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-black/50">
              <div class="h-full bg-sky-400" :style="{ width: `${petXpPct(pet)}%` }" />
            </div>
            <span class="text-10px text-white/40">{{ pet.xp }}/{{ petExpNeed(pet.level) }}</span>
          </div>

          <!-- 属性 -->
          <div class="mt-1.5 grid grid-cols-4 gap-1 text-center text-11px">
            <div class="rounded bg-black/30 py-0.5"><span class="text-white/40">HP</span> <b class="text-red-300">{{ petStats(pet).hp }}</b></div>
            <div class="rounded bg-black/30 py-0.5"><span class="text-white/40">ATK</span> <b class="text-orange-300">{{ petStats(pet).atk }}</b></div>
            <div class="rounded bg-black/30 py-0.5"><span class="text-white/40">DEF</span> <b class="text-sky-300">{{ petStats(pet).def }}</b></div>
            <div class="rounded bg-black/30 py-0.5"><span class="text-white/40">SPD</span> <b class="text-green-300">{{ petStats(pet).spd }}</b></div>
          </div>

          <!-- 操作 -->
          <div class="mt-2 grid grid-cols-2 gap-1.5">
            <button v-if="!pet.deployed" class="game-btn py-1 text-12px" @click="store.deployPet(pet.uid)">{{ t('common.deploy') }}</button>
            <button v-else class="game-btn-ghost py-1 text-12px" @click="store.withdrawPet(pet.uid)">{{ t('common.withdraw') }}</button>
            <button
              class="game-btn-purple py-1 text-12px"
              :disabled="pet.train >= 10"
              @click="store.trainPet(pet.uid)"
            >
              {{ pet.train >= 10 ? t('pet.trainMax') : t('common.train') }} {{ trainCost(pet) }}
            </button>
            <button class="game-btn-ghost py-1 text-12px" @click="store.sellPet(pet.uid)">
              <span class="i-mdi-cash-multiple" />
              <span>{{ t('common.sell') }}</span>
            </button>
            <button class="game-btn-ghost py-1 text-12px" @click="store.recyclePet(pet.uid)">
              <span class="i-mdi-diamond-outline" />
              <span>{{ t('common.recycle') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </ModalPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pet } from '@/game/types'
import { RARITY_META, boonsToBonus, petCombatStats, petExpNeed } from '@/game/engine/stats'
import ModalPanel from './ModalPanel.vue'
import Sprite from './Sprite.vue'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useGlobalState()
const pf = store.profile

const deployedCount = computed(() => pf.value!.pets.filter(p => p.deployed).length)

function rarityColor(pet: Pet) {
  return RARITY_META[pet.rarity].color
}
function petStats(pet: Pet) {
  return petCombatStats(pet, boonsToBonus(pf.value!.boons))
}
function petXpPct(pet: Pet) {
  return Math.min(100, (pet.xp / petExpNeed(pet.level)) * 100)
}
function trainCost(pet: Pet) {
  return 60 * pet.level * (pet.train + 1)
}
</script>
