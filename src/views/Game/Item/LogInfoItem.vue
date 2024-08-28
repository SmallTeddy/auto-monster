<script lang="ts" setup>
import LogType from "@/views/Type";

const props = withDefaults(
  defineProps<{
    logLabel: LogType;
    logInfo: String;
  }>(),
  {
    logLabel: "系统",
    logInfo: ''
  }
);
</script>

<template>
  <div flex>
    <div>{{ logLabel }}</div>
    <span>：</span>
    <div>{{ logInfo }}</div>
  </div>
</template>

<style scoped lang="less"></style>
