<script lang="ts" setup>
const tabs = ['装备', '药品', '宠物']
const activeTab = ref('装备')

// 装备
const equipmentItems = [
  { name: '111' },
  { name: '222' },
  { name: '333' },
  { name: '444' },
  { name: '555' },
  { name: '666' },
  { name: '777' },
  { name: '888' },
  { name: '999' },
  { name: '000' },
]

const medicineItems = [
  { name: '111' },
  { name: '222' },
  { name: '333' }
]

const petItems = [
  { name: '111' },
  { name: '222' },
]
</script>

<template>
  <div hw-full border-dashed-base>
    <div flex>
      <label v-for="label in tabs" h-52px w-70px flex-center cursor-pointer @click="activeTab = label">{{ label }}</label>
    </div>
    <div>
      <div v-show="activeTab === '装备'" hw-full flex gap-2 p2>
        <div v-for="equipment in equipmentItems" equipment-box border-dashed-base></div>
      </div>
      <div v-show="activeTab === '药品'" hw-full flex gap-2 p2>
        <div v-for="equipment in medicineItems" equipment-box border-dashed-base></div>
      </div>
      <div v-show="activeTab === '宠物'" hw-full flex gap-2 p2>
        <div v-for="equipment in petItems" equipment-box border-dashed-base></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
