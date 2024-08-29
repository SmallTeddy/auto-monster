<script lang="ts" setup>
import EquipmentItem from "@/views/Game/Item/EquipmentItem.vue";
import { EquipmentType } from "@/views/Type";

/**
 * 武器
 */
const weapon: EquipmentType = {
  name: "冰剑",
  img: "property/weapon/urand_jihad.png",
  攻击: 50,
  吸血: 0,
  暴击: 10,
  暴伤: 20,
};

/**
 * 盾牌
 */
 const shields: EquipmentType = {
  name: "新手盾牌",
  img: "property/armor/shields/buckler_1.png",
  防御: 200,
  生命: 100
};

/**
 * 帽子
 */
 const hat: EquipmentType = {
  name: "魔术帽",
  img: "property/armor/headgear/hat_2.png",
  防御: 10,
  生命: 20,
};

/**
 * 护甲
 */
 const torso: EquipmentType = {
  name: "黑曜石战甲",
  img: "property/armor/torso/shadow_dragon_scale_mail.png",
  防御: 50,
  生命: 200,
};

/**
 * 手套
 */
 const hands: EquipmentType = {
  name: "帝国手套",
  img: "property/armor/hands/glove_3_new.png",
  攻速: 10,
  暴击: 5,
};

/**
 * 斗篷
 */
 const cloak: EquipmentType = {
  name: "吸血斗篷",
  img: "property/armor/back/cloak_4.png",
  吸血: 10,
  暴击: 20,
};

/**
 * 戒指
 */
 const ring: EquipmentType = {
  name: "蓝宝石戒指",
  img: "property/ring/urand_mage.png",
  暴击: 20,
  暴伤: 10,
};

/**
 * 鞋子
 */
 const shoes: EquipmentType = {
  name: "帝国战靴",
  img: "property/armor/feet/boots_iron_2.png",
  防御: 50,
  生命: 200,
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
