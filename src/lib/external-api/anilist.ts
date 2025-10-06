// AniList API integration
// Documentation: https://anilist.gitbook.io/anilist-apiv2-docs

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co'

interface AniListAnime {
  id: number
  idMal: number | null
  title: {
    romaji: string
    english: string | null
    native: string
  }
  coverImage: {
    large: string
    medium: string
  }
  description: string | null
  episodes: number | null
  status: string
  season: string | null
  seasonYear: number | null
  averageScore: number | null
  popularity: number
  genres: string[]
  source: string | null
}

interface AniListSearchResponse {
  data: {
    Page: {
      media: AniListAnime[]
      pageInfo: {
        total: number
        currentPage: number
        lastPage: number
        hasNextPage: boolean
      }
    }
  }
}

/**
 * AniList APIでアニメを検索
 */
export async function searchAnimeFromAniList(
  query: string,
  limit: number = 20,
  page: number = 1
): Promise<AniListSearchResponse | null> {
  try {
    const graphqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              medium
            }
            description
            episodes
            status
            season
            seasonYear
            averageScore
            popularity
            genres
            source
          }
        }
      }
    `

    const variables = {
      search: query,
      page: page,
      perPage: limit
    }

    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables
      })
    })

    if (!response.ok) {
      console.error(`AniList API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch from AniList API:', error)
    return null
  }
}

/**
 * AniListのデータをDBフォーマットに変換
 */
export function transformAniListToDbFormat(anime: AniListAnime) {
  // descriptionからHTMLタグを除去
  const stripHtml = (html: string | null): string | null => {
    if (!html) return null
    return html.replace(/<[^>]*>/g, '').trim()
  }

  return {
    titleJapanese: anime.title.native || anime.title.romaji,
    titleEnglish: anime.title.english,
    titleRomaji: anime.title.romaji,
    synopsis: stripHtml(anime.description),
    imageUrl: anime.coverImage.large || anime.coverImage.medium,
    episodes: anime.episodes,
    status: anime.status,
    releaseYear: anime.seasonYear,
    genres: anime.genres || [],
    malId: anime.idMal,
    anilistId: anime.id,
    score: anime.averageScore ? anime.averageScore / 10 : null, // 0-100 to 0-10
    popularity: anime.popularity,
    members: null, // AniListにはmembers相当がない
    source: anime.source,
    season: anime.season,
    year: anime.seasonYear,
    dataSource: 'anilist'
  }
}

/**
 * IDでアニメの詳細を取得
 */
export async function getAnimeByIdFromAniList(
  anilistId: number
): Promise<AniListAnime | null> {
  try {
    const graphqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          description
          episodes
          status
          season
          seasonYear
          averageScore
          popularity
          genres
          source
        }
      }
    `

    const variables = { id: anilistId }

    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables
      })
    })

    if (!response.ok) {
      console.error(`AniList API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data.data.Media
  } catch (error) {
    console.error('Failed to fetch anime by ID from AniList:', error)
    return null
  }
}
