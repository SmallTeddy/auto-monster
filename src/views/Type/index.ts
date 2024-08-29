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

/**
 * 装备类型
 */
type EquipmentType = {
    name: string | null; // 名字
    img: string | null; // 图片
    level: number; // 等级
    quality: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Artifact' // 品质
    chance: number; // 几率 
    ATK?: number; // 攻击
    DEF?: number; // 防御
    INT?: number; // 智力
    HP?: number; // 生命
    RES?: number; // 复活
    SPD?: number; // 速度
    HIT?: number; // 命中
    LS?: number; // 吸血
    CRIT?: number; // 暴击
    CD?: number; // 暴伤
    EXP?: number; // 经验加成
  };

export type {
    DifficultyType,
    LanguageType,
    GameStateType,
    LogType,
    GameInfoType,
    EquipmentType
}
