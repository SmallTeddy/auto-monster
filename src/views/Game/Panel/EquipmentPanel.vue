<script lang="ts" setup>
import EquipmentItem from "@/views/Game/Item/EquipmentItem.vue";
import { EquipmentType } from "@/views/Type";

/**
 * 武器
 */
const weapon: EquipmentType = {
  name: "冰剑",
  img: "property/weapon/urand_jihad.png",
  level: 50,
  quality: 'Legendary',
  chance: 0.02,
  ATK: 50,
  CRIT: 10,
  CD: 20,
};

/**
 * 盾牌
 */
 const shields: EquipmentType = {
  name: "新手盾牌",
  img: "property/armor/shields/buckler_1.png",
  level: 1,
  quality: 'Common',
  chance: 0.95,
  DEF: 200,
  HP: 100
};

/**
 * 帽子
 */
 const hat: EquipmentType = {
  name: "魔术帽",
  img: "property/armor/headgear/hat_2.png",
  level: 5,
  quality: 'Uncommon',
  chance: 0.8,
  INT: 20,
  SPD: 10,
};

/**
 * 护甲
 */
 const torso: EquipmentType = {
  name: "黑曜石战甲",
  img: "property/armor/torso/shadow_dragon_scale_mail.png",
  level: 15,
  quality: 'Epic',
  chance: 0.1,
  DEF: 50,
  HP: 200,
};

/**
 * 手套
 */
 const hands: EquipmentType = {
  name: "帝国手套",
  img: "property/armor/hands/glove_3_new.png",
  level: 15,
  quality: 'Rare',
  chance: 0.3,
  SPD: 10,
  CRIT: 5,
};

/**
 * 斗篷
 */
 const cloak: EquipmentType = {
  name: "吸血斗篷",
  img: "property/armor/back/cloak_4.png",
  level: 15,
  quality: 'Rare',
  chance: 0.3,
  LS: 10,
  CRIT: 20,
};

/**
 * 戒指
 */
 const ring: EquipmentType = {
  name: "蓝宝石戒指",
  img: "property/ring/urand_mage.png",
  level: 20,
  quality: 'Artifact',
  chance: 0.01,
  CRIT: 50,
  CD: 50,
};

/**
 * 鞋子
 */
 const shoes: EquipmentType = {
  name: "帝国战靴",
  img: "property/armor/feet/boots_iron_2.png",
  level: 15,
  quality: 'Rare',
  chance: 0.3,
  DEF: 50,
  HP: 200,
};
</script>

<template>
  <div hw-full border-solid-base flex flex-col gap-2 p2>
    <EquipmentItem :equipment="weapon" />
    <EquipmentItem :equipment="shields" />
    <EquipmentItem :equipment="hat" />
    <EquipmentItem :equipment="torso" />
    <EquipmentItem :equipment="hands" />
    <EquipmentItem :equipment="cloak" />
    <EquipmentItem :equipment="ring" />
    <EquipmentItem :equipment="shoes" />
  </div>
</template>

<style scoped lang="less"></style>
