/**
 * 游戏难度
 */
type DifficultyType = '简单' | '中等' | '困难' | '地狱'

/**
 * 语言
 */
type LanguageType = 'cn' | 'en'

/**
 * 游戏状态
 */
type GameStateType = '初始化' | '开始' | '暂停'

/**
 * 游戏日志信息
 */
type LogType = '系统' | '装备' | '圣器' | '药品' | '仙丹' | '宠物' | '神宠' | '经验' | '金币' | '升级' | '死亡' | '任务完成' | '任务失败' | '任务奖励'

/**
 * 游戏信息
 */
type GameInfoType = {
    // 游戏难度
    difficulty: DifficultyType;
    // 语言设置
    language: LanguageType;
    // 游戏状态
    gameState: GameStateType;
    // 游戏日志
    gameLogItems: LogType[];
}

type EquipmentType = {
    name: string | null;
    img: string | null;
    攻击?: number;
    防御?: number;
    生命?: number;
    攻速?: number;
    吸血?: number;
    暴击?: number;
    暴伤?: number;
  };

export type {
    DifficultyType,
    LanguageType,
    GameStateType,
    LogType,
    GameInfoType,
    EquipmentType
}
