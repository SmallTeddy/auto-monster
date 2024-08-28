<script lang="ts" setup>
import { EquipmentEnum } from "@/enums/equipment.enum";
</script>

<template>
  <div flex flex-items-center gap-4 flex-1>
    <div equipment-box border-dashed-base></div>
    <div>装备名称</div>
    <div>{{ EquipmentEnum["攻击"] }}</div>
    <div>{{ EquipmentEnum["吸血"] }}</div>
    <div>{{ EquipmentEnum["暴击"] }}</div>
    <div>{{ EquipmentEnum["暴伤"] }}</div>
  </div>
</template>

<style scoped lang="less"></style>
