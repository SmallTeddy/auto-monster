<script lang="ts" setup>
import { EquipmentEnum } from "@/views/Enum";
import { getAssetsFile } from '@/utils';

const equipment = {
  name: "冰剑",
  img: "property/weapon/urand_jihad.png",
  攻击: 50,
  吸血: 0,
  暴击: 10,
  暴伤: 20,
};
</script>

<template>
  <div flex flex-items-center gap-4 flex-1>
    <div equipment-box border-dashed-base bg-cover backface-hidden :style="{ backgroundImage: `url(${getAssetsFile(equipment.img)})` }"></div>
    <div>{{ equipment.name }}</div>
    <div>{{ EquipmentEnum["攻击"] }}：{{ equipment["攻击"] }}</div>
    <div>{{ EquipmentEnum["吸血"] }}：{{ equipment["吸血"] }}</div>
    <div>{{ EquipmentEnum["暴击"] }}：{{ equipment["暴击"] }}</div>
    <div>{{ EquipmentEnum["暴伤"] }}：{{ equipment["暴伤"] }}</div>
  </div>
</template>

<style scoped lang="less"></style>
