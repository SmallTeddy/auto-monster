let uidSeed = Date.now() % 1000000

export function uid(prefix = 'u'): string {
  uidSeed += 1
  return `${prefix}_${uidSeed.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function chance(p: number): boolean {
  return Math.random() < p
}

/** 加权随机，返回 key */
export function weighted<T extends string>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [key, w] of entries) {
    r -= w
    if (r <= 0)
      return key
  }
  return entries[0][0]
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6D2B79F5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
