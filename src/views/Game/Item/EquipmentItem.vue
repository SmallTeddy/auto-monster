<script lang="ts" setup>
import { EquipmentEnum, EquipmentQualityEnum, EquipmentQualityColorEnum } from "@/views/Enum";
import { getAssetsFile } from "@/utils";
import { EquipmentType } from "@/views/Type";

const equipmentItems = ["ATK", "DEF", "INT", "SPD", "HP", "RES", "SPD", "HIT", "LS", "CRIT", "CD", "EXP"];

withDefaults(
  defineProps<{
    equipment: EquipmentType;
  }>(),
  {
    equipment: null,
  }
);
</script>

<template>
  <div flex flex-items-center flex-1>
    <div
      flex-none
      equipment-box
      border-solid-base
      bg-cover
      backface-hidden
      :style="{
        borderColor: EquipmentQualityColorEnum[equipment.quality],
        backgroundImage: `url(${getAssetsFile(equipment.img)})`
      }"
    ></div>
    <div w-160px pl-4 :style="{ color: EquipmentQualityColorEnum[equipment.quality] }">LV: {{ equipment.level }} {{ equipment.name }}</div>
    <div v-for="item in equipmentItems" :key="item">
      <div w-100px pl-4 v-show="equipment[item]">{{ EquipmentEnum[item] }}：{{ equipment[item] }}</div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
