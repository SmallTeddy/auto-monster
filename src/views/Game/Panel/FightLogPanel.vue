<script lang="ts" setup>
import LogInfoItem from "@/views/Game/Item/LogInfoItem.vue";
import { LogType } from "@/views/Type";
// import IndexedDB from '@/views/Utils/indexDB';

interface LogItem {
  id?: number;
  logLabel: LogType;
  logInfo: string;
}

const logs = ref<LogItem[]>([
  { logLabel: "系统", logInfo: "欢迎来到怪兽自打" },
  { logLabel: "装备", logInfo: "获得一把小刀" },
  { logLabel: "圣器", logInfo: "获得一把屠龙宝刀" },
  { logLabel: "药品", logInfo: "获得一颗补血丸" },
  { logLabel: "仙丹", logInfo: "获得一颗大还丹" },
  { logLabel: "宠物", logInfo: "获得一只小猫咪" },
  { logLabel: "神宠", logInfo: "获得一只凤凰" },
  { logLabel: "经验", logInfo: "获得100经验" },
  { logLabel: "金币", logInfo: "获得100金币" },
  { logLabel: "任务完成", logInfo: "完成新手任务" },
  { logLabel: "任务失败", logInfo: "攻击 BOSS 死亡" },
  { logLabel: "任务奖励", logInfo: "恭喜你，获得称号：勇者" }
]);

onMounted(async () => {
  // logs.value = [];
});
</script>

<template>
  <div hw-full flex flex-col gap-2 p2>
    <LogInfoItem v-for="(log, index) in logs" :key="index" :logLabel="log.logLabel" :logInfo="log.logInfo" />
  </div>
</template>

<style scoped lang="less"></style>
