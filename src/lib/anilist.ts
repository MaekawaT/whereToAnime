/**
 * AniList API Integration
 *
 * AniList GraphQL APIを使用してアニメのストリーミング情報を取得します。
 * 主にTMDB APIで見つからないアニメのフォールバックとして使用します。
 *
 * API Documentation: https://anilist.gitbook.io/anilist-apiv2-docs
 */

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

export interface AniListStreamingLink {
  site: string;
  url: string;
}

export interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  status: string;
  externalLinks: AniListStreamingLink[];
  streamingEpisodes: {
    title: string;
    url: string;
    site: string;
  }[];
}

/**
 * AniList APIでアニメを検索
 * @param title - アニメタイトル（日本語、英語、ローマ字可）
 * @returns AniListアニメ情報 or null
 */
export async function searchAnimeOnAniList(title: string): Promise<AniListAnime | null> {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        season
        seasonYear
        episodes
        status
        externalLinks {
          site
          url
        }
        streamingEpisodes {
          title
          url
          site
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: title },
      }),
    });

    if (!response.ok) {
      console.error(`AniList API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('AniList GraphQL errors:', data.errors);
      return null;
    }

    return data.data?.Media || null;
  } catch (error) {
    console.error('Failed to fetch from AniList:', error);
    return null;
  }
}

/**
 * AniListの外部リンクから日本のストリーミングプラットフォーム情報を抽出
 * PriceComparisonTable互換の形式で返す
 * @param anime - AniListアニメ情報
 * @returns プラットフォーム配列
 */
export function extractStreamingPlatforms(anime: AniListAnime) {
  const platforms: Array<{
    id: string;
    name: string;
    displayName: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    monthlyPrice: number;
    freeTrial?: boolean;
    freeTrialDays?: number;
    availableEpisodes?: number;
    hasSub: boolean;
    hasDub: boolean;
  }> = [];

  // プラットフォーム名のマッピング（AniList → 表示名 + 価格）
  const platformMapping: Record<string, { name: string; displayName: string; monthlyPrice: number }> = {
    'Crunchyroll': { name: 'crunchyroll', displayName: 'Crunchyroll', monthlyPrice: 1180 },
    'Netflix': { name: 'netflix', displayName: 'Netflix', monthlyPrice: 990 },
    'Hulu': { name: 'hulu', displayName: 'Hulu', monthlyPrice: 1026 },
    'Amazon Prime Video': { name: 'amazon_prime', displayName: 'Amazon Prime', monthlyPrice: 600 },
    'Disney Plus': { name: 'disney_plus', displayName: 'Disney+', monthlyPrice: 990 },
    'Adult Swim': { name: 'adult_swim', displayName: 'Adult Swim', monthlyPrice: 0 },
    'Funimation': { name: 'funimation', displayName: 'Funimation', monthlyPrice: 0 }, // サービス終了
  };

  // 重複を避けるためのSet
  const addedPlatforms = new Set<string>();

  // externalLinksから抽出
  anime.externalLinks.forEach((link) => {
    const mapping = platformMapping[link.site];
    if (mapping && !addedPlatforms.has(mapping.name)) {
      platforms.push({
        id: mapping.name,
        name: mapping.name,
        displayName: mapping.displayName,
        logoUrl: null,
        websiteUrl: link.url,
        monthlyPrice: mapping.monthlyPrice,
        freeTrial: false,
        freeTrialDays: 0,
        availableEpisodes: anime.episodes || undefined,
        hasSub: true,
        hasDub: false,
      });
      addedPlatforms.add(mapping.name);
    }
  });

  // streamingEpisodesからも抽出（Crunchyroll等の直リンク）
  anime.streamingEpisodes.forEach((episode) => {
    const mapping = platformMapping[episode.site];
    if (mapping && !addedPlatforms.has(mapping.name)) {
      platforms.push({
        id: mapping.name,
        name: mapping.name,
        displayName: mapping.displayName,
        logoUrl: null,
        websiteUrl: episode.url,
        monthlyPrice: mapping.monthlyPrice,
        freeTrial: false,
        freeTrialDays: 0,
        availableEpisodes: anime.episodes || undefined,
        hasSub: true,
        hasDub: false,
      });
      addedPlatforms.add(mapping.name);
    }
  });

  return platforms;
}

/**
 * タイトルでストリーミング情報を取得（検索 + 抽出を一度に実行）
 * @param title - アニメタイトル
 * @returns プラットフォーム配列
 */
export async function getStreamingAvailabilityFromAniList(title: string) {
  const anime = await searchAnimeOnAniList(title);

  if (!anime) {
    return [];
  }

  return extractStreamingPlatforms(anime);
}
