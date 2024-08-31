<script lang="ts" setup>
import { LogType } from "@/views/Type";
import { LogColor } from "@/views/Enum";

const props = withDefaults(
  defineProps<{
    logLabel: LogType;
    logInfo: string;
  }>(),
  {
    logLabel: "系统",
    logInfo: "",
  }
);

const logColor = LogColor[props.logLabel];
</script>

<template>
  <div flex :style="`color: ${logColor}`">
    <div>{{ logLabel }}</div>
    <span>：</span>
    <div>{{ logInfo }}</div>
  </div>
</template>

<style scoped lang="less"></style>
