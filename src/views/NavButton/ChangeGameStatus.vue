<script lang="ts" setup>
const state = useGlobalState();

const pauseClick = (): void => {
  state.value.gameState = "暂停";
};
</script>

<template>
  <button rounded p-2 hover="bg-active" @click="pauseClick">
    <div
      :class="{
        'i-material-symbols:play-circle-rounded': state.gameState === '暂停',
        'i-material-symbols:pause-circle': state.gameState === '开始',
      }"
      text-2xl
    />
  </button>
</template>
