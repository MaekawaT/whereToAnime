/**
 * TMDB API Utility Functions
 * Fetches streaming availability data powered by JustWatch
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

interface TMDBWatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

interface TMDBWatchProviders {
  link?: string
  flatrate?: TMDBWatchProvider[]
  buy?: TMDBWatchProvider[]
  rent?: TMDBWatchProvider[]
  ads?: TMDBWatchProvider[]
}

interface TMDBStreamingData {
  id: number
  results: {
    [countryCode: string]: TMDBWatchProviders
  }
}

// Map TMDB provider IDs to our platform data
const PROVIDER_MAPPING: Record<number, {
  name: string
  displayName: string
  monthlyPrice: number
  annualPrice?: number
  freeTrial?: boolean
  freeTrialDays?: number
}> = {
  // Japan providers
  9: {
    name: 'Amazon Prime Video',
    displayName: 'Amazon Prime',
    monthlyPrice: 600,
    annualPrice: 5900,
  },
  8: {
    name: 'Netflix',
    displayName: 'Netflix',
    monthlyPrice: 990,
    annualPrice: 11880,
  },
  283: {
    name: 'Crunchyroll',
    displayName: 'Crunchyroll',
    monthlyPrice: 960,
    annualPrice: 9600,
    freeTrial: true,
    freeTrialDays: 14,
  },
  337: {
    name: 'Disney Plus',
    displayName: 'Disney+',
    monthlyPrice: 990,
    annualPrice: 9900,
  },
  384: {
    name: 'HBO Max',
    displayName: 'HBO Max',
    monthlyPrice: 1000,
  },
  2: {
    name: 'Apple TV Plus',
    displayName: 'Apple TV+',
    monthlyPrice: 900,
  },
  371: {
    name: 'Hulu',
    displayName: 'Hulu',
    monthlyPrice: 1026,
  },
  531: {
    name: 'Paramount Plus',
    displayName: 'Paramount+',
    monthlyPrice: 770,
  },
  582: {
    name: 'Funimation',
    displayName: 'Funimation',
    monthlyPrice: 700,
  },
  // Add more providers as needed
}

/**
 * Search for anime on TMDB by title
 */
export async function searchAnimeOnTMDB(title: string): Promise<number | null> {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not configured')
    return null
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=ja-JP`
    )

    if (!response.ok) {
      console.error('TMDB search failed:', response.statusText)
      return null
    }

    const data = await response.json()

    // Return the first result's ID
    if (data.results && data.results.length > 0) {
      return data.results[0].id
    }

    return null
  } catch (error) {
    console.error('Error searching TMDB:', error)
    return null
  }
}

/**
 * Get streaming availability for a TV show from TMDB
 * Data is powered by JustWatch
 */
export async function getStreamingAvailability(
  tmdbId: number,
  countryCode: string = 'JP'
) {
  if (!TMDB_API_KEY) {
    console.error('TMDB API key not configured')
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`
    )

    if (!response.ok) {
      console.error('TMDB watch providers failed:', response.statusText)
      return []
    }

    const data: TMDBStreamingData = await response.json()

    // Get providers for the specified country
    const countryProviders = data.results[countryCode]

    if (!countryProviders) {
      return []
    }

    // Extract all available providers (flatrate = subscription streaming)
    const providers = countryProviders.flatrate || []

    // Map to our platform format
    const platforms = providers
      .filter(provider => PROVIDER_MAPPING[provider.provider_id])
      .map(provider => {
        const mapped = PROVIDER_MAPPING[provider.provider_id]
        return {
          id: provider.provider_id.toString(),
          name: mapped.name,
          displayName: mapped.displayName,
          logoUrl: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          websiteUrl: countryProviders.link || null,
          monthlyPrice: mapped.monthlyPrice,
          annualPrice: mapped.annualPrice,
          freeTrial: mapped.freeTrial,
          freeTrialDays: mapped.freeTrialDays,
          hasSub: true, // TMDB doesn't provide this info, assume true
          hasDub: false, // TMDB doesn't provide this info, assume false
        }
      })

    return platforms
  } catch (error) {
    console.error('Error fetching streaming availability:', error)
    return []
  }
}

/**
 * Get streaming availability by searching for anime title first
 */
export async function getStreamingAvailabilityByTitle(
  title: string,
  countryCode: string = 'JP'
) {
  const tmdbId = await searchAnimeOnTMDB(title)

  if (!tmdbId) {
    return []
  }

  return getStreamingAvailability(tmdbId, countryCode)
}
