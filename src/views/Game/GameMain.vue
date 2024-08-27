<script lang="ts" setup>
import StatsPanel from "./Panel/StatsPanel.vue";
import EquipmentPanel from "./Panel/EquipmentPanel.vue";
import BattleLogPanel from "./Panel/BattleLogPanel.vue";
const { t } = useI18n();
</script>

<template>
  <div h-full w-screen color-white p2 flex gap-2>
    <div hw-full flex flex-col border-dashed-base gap-2 p2>
      <div w-full flex gap-2 flex-1>
        <StatsPanel />
        <EquipmentPanel />
      </div>
      <div w-full flex-1>
        <BattleLogPanel />
      </div>
    </div>
    <div hw-full flex-center border-dashed-base>
      {{ t("battleArea") }}
    </div>
  </div>
</template>
