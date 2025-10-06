// Jikan API (MyAnimeList) integration
// Documentation: https://docs.api.jikan.moe/

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'
const RATE_LIMIT_DELAY = 350 // 350ms between requests (max 3 req/sec)

interface JikanAnime {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  title: string
  title_english: string | null
  title_japanese: string | null
  title_synonyms: string[]
  type: string
  source: string
  episodes: number | null
  status: string
  airing: boolean
  aired: {
    from: string
    to: string | null
  }
  duration: string
  rating: string
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number
  members: number
  favorites: number
  synopsis: string | null
  season: string | null
  year: number | null
  genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
}

interface JikanSearchResponse {
  data: JikanAnime[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

// Rate limiting helper
let lastRequestTime = 0

async function rateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    )
  }

  lastRequestTime = Date.now()
}

// Search anime by query
export async function searchAnimeFromJikan(
  query: string,
  limit: number = 20,
  page: number = 1
): Promise<JikanSearchResponse | null> {
  try {
    await rateLimit()

    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      page: page.toString(),
      order_by: 'members',
      sort: 'desc'
    })

    const response = await fetch(`${JIKAN_BASE_URL}/anime?${params}`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded. Waiting before retry...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return searchAnimeFromJikan(query, limit, page) // Retry once
      }
      throw new Error(`Jikan API error: ${response.statusText}`)
    }

    const data: JikanSearchResponse = await response.json()
    return data

  } catch (error) {
    console.error('Jikan API search error:', error)
    return null
  }
}

// Get anime by MAL ID
export async function getAnimeByMalId(malId: number): Promise<JikanAnime | null> {
  try {
    await rateLimit()

    const response = await fetch(`${JIKAN_BASE_URL}/anime/${malId}/full`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data

  } catch (error) {
    console.error('Jikan API get anime error:', error)
    return null
  }
}

// Get current season anime
export async function getCurrentSeasonAnime(): Promise<JikanAnime[]> {
  try {
    await rateLimit()

    const response = await fetch(`${JIKAN_BASE_URL}/seasons/now`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []

  } catch (error) {
    console.error('Jikan API season anime error:', error)
    return []
  }
}

// Get upcoming anime
export async function getUpcomingAnime(): Promise<JikanAnime[]> {
  try {
    await rateLimit()

    const response = await fetch(`${JIKAN_BASE_URL}/seasons/upcoming`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []

  } catch (error) {
    console.error('Jikan API upcoming anime error:', error)
    return []
  }
}

// Transform Jikan data to our database format
export function transformJikanToDbFormat(anime: JikanAnime) {
  return {
    malId: anime.mal_id,
    titleJapanese: anime.title_japanese || anime.title,
    titleEnglish: anime.title_english,
    titleRomaji: anime.title,
    synopsis: anime.synopsis,
    imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    episodes: anime.episodes,
    status: anime.status,
    releaseYear: anime.year,
    genres: anime.genres?.map(g => g.name) || [],
    score: anime.score,
    popularity: anime.popularity,
    members: anime.members,
    source: anime.source,
    season: anime.season,
    year: anime.year,
    dataSource: 'jikan',
    lastSyncedAt: new Date().toISOString()
  }
}