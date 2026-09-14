// 怪物素材统一加载：使用 Vite glob 将 src/assets/monster 下所有 png 作为 URL 收集
const modules = import.meta.glob('../assets/monster/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export interface MonsterSprite {
  name: string
  url: string
  /** 1-5 阶层（目录名 1-100 -> 1 ... 401-500 -> 5；根目录按名称哈希分配） */
  tier: number
  boss: boolean
}

const BOSS_RE = /龙|王|巨人|巨魔|泰坦|死神|领主|君主|女王|噬|巨妖|德雷克|九头蛇|斯芬克斯|巫妖|比休|弥诺|阿凡达/

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++)
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function buildSprites(): MonsterSprite[] {
  const list: MonsterSprite[] = []
  for (const [path, url] of Object.entries(modules)) {
    const file = path.split('/').pop()!.replace(/\.png$/, '')
    const m = path.match(/monster\/(\d+)-\d+\//)
    let tier: number
    if (m)
      tier = Math.floor(Number(m[1]) / 100) + 1
    else
      tier = (hashString(file) % 5) + 1
    list.push({
      name: file,
      url,
      tier,
      boss: BOSS_RE.test(file),
    })
  }
  return list
}

export const SPRITES = buildSprites()

export function spriteByName(name: string): MonsterSprite {
  return SPRITES.find(s => s.name === name) ?? SPRITES[0]
}

export function spriteByUrl(url: string): MonsterSprite | undefined {
  return SPRITES.find(s => s.url === url)
}

/** 普通小怪池：指定阶层附近 */
export function mobPool(minTier: number, maxTier: number): MonsterSprite[] {
  return SPRITES.filter(s => !s.boss && s.tier >= minTier && s.tier <= maxTier)
}

export function bossPool(minTier: number, maxTier: number): MonsterSprite[] {
  const bosses = SPRITES.filter(s => s.boss && s.tier >= minTier && s.tier <= maxTier)
  return bosses.length ? bosses : SPRITES.filter(s => s.tier >= minTier && s.tier <= maxTier)
}

/** 关键词主题池（冰/光谱/恶魔等） */
export function themePool(keyword: RegExp, boss = false): MonsterSprite[] {
  return SPRITES.filter(s => keyword.test(s.name) && (boss ? s.boss || keyword.test(s.name) : !s.boss))
}

export function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
