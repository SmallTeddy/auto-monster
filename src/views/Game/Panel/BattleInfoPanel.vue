<script lang="ts" setup>
import Fighter from '@/views/Game/Role/Fighter.vue';
import Samurai from '@/views/Game/Role/Samurai.vue';
import Shinobi from '@/views/Game/Role/Shinobi.vue';

const fighterRoleRef = ref(null)
const samuraiRoleRef = ref(null)
const shinobiRoleRef = ref(null)

onMounted(() => {
  fighterRoleRef.value.FighterState = 'attack1'
  samuraiRoleRef.value.SamuraiState = 'attack2'
  shinobiRoleRef.value.ShinobiState = 'attack3'
})
</script>

<template>
  <div flex>
    <Fighter ref="fighterRoleRef" />
    <Samurai ref="samuraiRoleRef" />
    <Shinobi ref="shinobiRoleRef" />
  </div>
</template>

<style scoped lang="scss"></style>
