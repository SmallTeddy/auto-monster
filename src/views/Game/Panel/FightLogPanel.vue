<script lang="ts" setup>
import LogInfoItem from "@/views/Game/Item/LogInfoItem.vue";
</script>

<template>
  <div hw-full flex flex-col gap-2 p2>
    <LogInfoItem logLabel="系统" logInfo="欢迎来到怪兽自打" />
    <LogInfoItem logLabel="装备" logInfo="获得一把小刀" />
    <LogInfoItem logLabel="圣器" logInfo="获得一把屠龙宝刀" />
    <LogInfoItem logLabel="药品" logInfo="获得一颗补血丸" />
    <LogInfoItem logLabel="仙丹" logInfo="获得一颗大还丹" />
    <LogInfoItem logLabel="宠物" logInfo="获得一只小猫咪" />
    <LogInfoItem logLabel="神宠" logInfo="获得一只凤凰" />
    <LogInfoItem logLabel="经验" logInfo="获得100经验" />
    <LogInfoItem logLabel="金币" logInfo="获得100金币" />
    <LogInfoItem logLabel="任务完成" logInfo="完成新手任务" />
    <LogInfoItem logLabel="任务失败" logInfo="攻击 BOSS 死亡" />
    <LogInfoItem logLabel="任务奖励" logInfo="恭喜你，获得称号：勇者" />
  </div>
</template>

<style scoped lang="less"></style>
