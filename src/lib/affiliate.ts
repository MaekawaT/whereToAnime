/**
 * アフィリエイトリンク生成システム
 *
 * 各プラットフォームのアフィリエイトリンクを生成します。
 * 環境変数にアフィリエイトIDを設定してください。
 */

export type Platform =
  | 'crunchyroll'
  | 'netflix'
  | 'hulu'
  | 'amazon-prime'
  | 'disney-plus'
  | 'funimation'

export interface AffiliateConfig {
  name: string
  baseUrl: string
  getLink: (animeId: string, affiliateId?: string) => string
  hasAffiliateProgram: boolean
}

/**
 * プラットフォームごとのアフィリエイト設定
 */
export const affiliateConfig: Record<Platform, AffiliateConfig> = {
  crunchyroll: {
    name: 'Crunchyroll',
    baseUrl: 'https://www.crunchyroll.com',
    getLink: (animeId: string, affiliateId?: string) => {
      const id = affiliateId || process.env.NEXT_PUBLIC_CRUNCHYROLL_AFFILIATE_ID || 'demo'
      return `https://www.crunchyroll.com/series/${animeId}?ref=${id}`
    },
    hasAffiliateProgram: true
  },

  netflix: {
    name: 'Netflix',
    baseUrl: 'https://www.netflix.com',
    getLink: (animeId: string) => {
      // Netflixは直接アフィリエイトなし
      return `https://www.netflix.com/title/${animeId}`
    },
    hasAffiliateProgram: false
  },

  hulu: {
    name: 'Hulu',
    baseUrl: 'https://www.hulu.com',
    getLink: (animeId: string) => {
      // Huluは企業向けプログラムのみ
      return `https://www.hulu.com/series/${animeId}`
    },
    hasAffiliateProgram: false
  },

  'amazon-prime': {
    name: 'Amazon Prime Video',
    baseUrl: 'https://www.amazon.com',
    getLink: (animeId: string, affiliateId?: string) => {
      const id = affiliateId || process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'demo-20'
      return `https://www.amazon.com/dp/${animeId}?tag=${id}`
    },
    hasAffiliateProgram: true
  },

  'disney-plus': {
    name: 'Disney+',
    baseUrl: 'https://www.disneyplus.com',
    getLink: (animeId: string) => {
      return `https://www.disneyplus.com/series/${animeId}`
    },
    hasAffiliateProgram: false
  },

  funimation: {
    name: 'Funimation',
    baseUrl: 'https://www.funimation.com',
    getLink: (animeId: string) => {
      // Funimation閉鎖済み（参考用）
      return `https://www.funimation.com/shows/${animeId}`
    },
    hasAffiliateProgram: false
  }
}

/**
 * トラッキング付きアフィリエイトリンクを生成
 *
 * @param platform - 配信プラットフォーム
 * @param animeId - アニメID
 * @param userId - ユーザーID（オプション）
 * @returns トラッキングAPI経由のURL
 */
export function generateTrackedLink(
  platform: Platform,
  animeId: string,
  userId?: string
): string {
  const params = new URLSearchParams({
    platform,
    animeId,
    ...(userId && { userId })
  })

  return `/api/track/click?${params.toString()}`
}

/**
 * 直接アフィリエイトリンクを生成（トラッキングなし）
 *
 * @param platform - 配信プラットフォーム
 * @param animeId - アニメID
 * @returns アフィリエイトリンク
 */
export function generateAffiliateLink(
  platform: Platform,
  animeId: string
): string {
  const config = affiliateConfig[platform]
  return config.getLink(animeId)
}

/**
 * プラットフォーム名を正規化
 */
export function normalizePlatformName(name: string): Platform | null {
  const normalized = name.toLowerCase().replace(/\s+/g, '-')

  const mapping: Record<string, Platform> = {
    'crunchyroll': 'crunchyroll',
    'netflix': 'netflix',
    'hulu': 'hulu',
    'amazon': 'amazon-prime',
    'amazon-prime': 'amazon-prime',
    'prime-video': 'amazon-prime',
    'disney': 'disney-plus',
    'disney+': 'disney-plus',
    'disney-plus': 'disney-plus',
    'funimation': 'funimation'
  }

  return mapping[normalized] || null
}
