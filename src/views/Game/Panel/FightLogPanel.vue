<script lang="ts" setup>
import LogInfoItem from '@/views/Game/Item/LogInfoItem.vue'
</script>

<template>
  <div hw-full flex flex-col border-dashed-base gap-2 p2>
    <LogInfoItem logLabel="系统" logInfo="欢迎来到怪兽自打" />
    <LogInfoItem logLabel="装备" logInfo="获得一把屠龙宝刀" />
    <LogInfoItem logLabel="药品" logInfo="获得一颗大还丹" />
    <LogInfoItem logLabel="宠物" logInfo="获得一个小猫咪" />
    <LogInfoItem logLabel="任务" logInfo="完成新手任务，获得100金币" />
    <LogInfoItem logLabel="系统" logInfo="恭喜你，升级到10级" />
    <LogInfoItem logLabel="系统" logInfo="恭喜你，获得称号：勇者" />
  </div>
</template>

<style scoped lang="less"></style>
