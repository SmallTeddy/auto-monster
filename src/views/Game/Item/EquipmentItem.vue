<script lang="ts" setup>
import { EquipmentEnum } from "@/views/Enum";
import { getAssetsFile } from "@/utils";
import { EquipmentType } from "@/views/Type";

const equipmentItems = ["攻击", "防御", "生命", "攻速", "吸血", "暴击", "暴伤"];

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
      equipment-box
      border-solid-base
      bg-cover
      backface-hidden
      :style="{ backgroundImage: `url(${getAssetsFile(equipment.img)})` }"
    ></div>
    <div w-120px pl-4>{{ equipment.name }}</div>
    <div v-for="item in equipmentItems" :key="item">
      <div w-100px pl-4 v-show="equipment[item]">{{ EquipmentEnum[item] }}：{{ equipment[item] }}</div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
