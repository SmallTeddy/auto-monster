import type { QuestDef } from '../types'

export const QUESTS: QuestDef[] = [
  // 日常
  {
    id: 'daily_battle', name: '好战分子', desc: '完成 5 场自动战斗', target: 5, event: 'battle', daily: true,
    rewards: { gold: 120, exp: 60, stone: 2 },
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
  {
    id: 'ach_floor50', name: '高塔攀登者', desc: '无尽魔塔到达第 50 层', target: 50, event: 'floor', daily: false,
    rewards: { gold: 5000, soul: 30, stone: 20 },
  },
  {
    id: 'ach_floor100', name: '百层征服者', desc: '无尽魔塔到达第 100 层', target: 100, event: 'floor', daily: false,
    rewards: { gold: 15000, soul: 80, stone: 50 },
  },
  {
    id: 'ach_floor200', name: '魔塔之主', desc: '无尽魔塔到达第 200 层', target: 200, event: 'floor', daily: false,
    rewards: { gold: 50000, soul: 200, stone: 120 },
  },
  {
    id: 'ach_floor500', name: '登峰造极', desc: '无尽魔塔到达第 500 层', target: 500, event: 'floor', daily: false,
    rewards: { gold: 200000, soul: 500, stone: 300 },
  },
  {
    id: 'ach_floor1000', name: '千层传说', desc: '无尽魔塔到达第 1000 层', target: 1000, event: 'floor', daily: false,
    rewards: { gold: 1000000, soul: 1500, stone: 800 },
  },
  {
    id: 'ach_level30', name: '初露锋芒', desc: '角色等级达到 30 级', target: 30, event: 'level', daily: false,
    rewards: { gold: 3000, stone: 15 },
  },
  {
    id: 'ach_level50', name: '身经百战', desc: '角色等级达到 50 级', target: 50, event: 'level', daily: false,
    rewards: { gold: 8000, soul: 30, stone: 30 },
  },
  {
    id: 'ach_level100', name: '百战之师', desc: '角色等级达到 100 级', target: 100, event: 'level', daily: false,
    rewards: { gold: 30000, soul: 100, stone: 80 },
  },
  {
    id: 'ach_dungeon5', name: '副本常客', desc: '累计通关副本 5 次', target: 5, event: 'dungeonClear', daily: false,
    rewards: { gold: 1500, stone: 10 },
  },
  {
    id: 'ach_dungeon20', name: '地下城专家', desc: '累计通关副本 20 次', target: 20, event: 'dungeonClear', daily: false,
    rewards: { gold: 8000, soul: 40 },
  },
  {
    id: 'ach_pets5', name: '宠物收藏家', desc: '同时拥有 5 只宠物', target: 5, event: 'petGain', daily: false,
    rewards: { gold: 1500, exp: 500 },
  },
  {
    id: 'ach_shop10', name: '购物达人', desc: '在商店购买 10 件商品', target: 10, event: 'shopBuy', daily: false,
    rewards: { gold: 1000, stone: 5 },
  },
]

export const DAILY_QUESTS = QUESTS.filter(q => q.daily)
export const ACHIEVEMENTS = QUESTS.filter(q => !q.daily)
