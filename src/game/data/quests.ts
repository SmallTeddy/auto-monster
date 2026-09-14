import type { QuestDef } from '../types'

export const QUESTS: QuestDef[] = [
  // 日常
  {
    id: 'daily_battle', name: '好战分子', desc: '完成 5 场自动战斗', target: 5, event: 'battle', daily: true,
    rewards: { gold: 120, exp: 60, item: { defId: 'potion_s', count: 1 } },
  },
  {
    id: 'daily_enhance', name: '铁匠学徒', desc: '强化装备 1 次', target: 1, event: 'enhance', daily: true,
    rewards: { gold: 80, stone: 1 },
  },
  {
    id: 'daily_buy', name: '慷慨顾客', desc: '在商店购买 2 件商品', target: 2, event: 'shopBuy', daily: true,
    rewards: { gold: 100, exp: 50 },
  },
  {
    id: 'daily_dungeon', name: '副本探险家', desc: '通关任意副本 1 次', target: 1, event: 'dungeonClear', daily: true,
    rewards: { gold: 200, stone: 2, exp: 120 },
  },
  // 成就
  {
    id: 'ach_floor10', name: '高塔初探', desc: '无尽魔塔到达第 10 层', target: 10, event: 'floor', daily: false,
    rewards: { gold: 500, soul: 5 },
  },
  {
    id: 'ach_floor20', name: '破塔先锋', desc: '无尽魔塔到达第 20 层', target: 20, event: 'floor', daily: false,
    rewards: { gold: 1500, soul: 15, stone: 10 },
  },
  {
    id: 'ach_pets3', name: '小小训练师', desc: '同时拥有 3 只宠物', target: 3, event: 'petGain', daily: false,
    rewards: { gold: 600, exp: 200 },
  },
  {
    id: 'ach_epic', name: '史诗武装', desc: '装备一件史诗或以上品质的装备', target: 1, event: 'equipEpic', daily: false,
    rewards: { gold: 800, soul: 8 },
  },
  {
    id: 'ach_level10', name: '身经百战', desc: '角色等级达到 10 级', target: 10, event: 'level', daily: false,
    rewards: { gold: 1000, stone: 8 },
  },
  {
    id: 'ach_recycle', name: '循环利用', desc: '累计回收 10 件物品', target: 10, event: 'recycle', daily: false,
    rewards: { gold: 300, soul: 20 },
  },
]

export const DAILY_QUESTS = QUESTS.filter(q => q.daily)
export const ACHIEVEMENTS = QUESTS.filter(q => !q.daily)
