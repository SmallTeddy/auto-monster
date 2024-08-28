import { GameInfoType } from '@/views/Type'

export const useGlobalState: () => Ref<GameInfoType> = createGlobalState(
    () => useStorage('global-state', {
        // 游戏难度
        difficulty: '中等',
        // 语言设置
        language: 'cn',
        // 游戏状态
        gameState: '初始化',
        // 游戏日志
        gameLogItems: []
    })
)
