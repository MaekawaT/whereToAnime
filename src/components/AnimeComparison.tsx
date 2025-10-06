'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Clock, Globe, TrendingDown } from 'lucide-react'
import PriceComparisonTable from './PriceComparisonTable'

interface AnimeDetails {
  id: string | number
  title: string
  titleJapanese: string
  titleEnglish: string | null
  imageUrl: string
  rating: number
  synopsis: string
  genres: string[]
  episodes: number | null
  status: string
  year: number | null
}

interface Platform {
  id: string
  name: string
  displayName: string
  logoUrl: string | null
  websiteUrl: string | null
  monthlyPrice: number
  freeTrial?: boolean
  freeTrialDays?: number
  availableEpisodes?: number
  hasSub: boolean
  hasDub: boolean
}

interface AnimeComparisonProps {
  animeId: string
  animeTitle?: string
}

export default function AnimeComparison({ animeId, animeTitle }: AnimeComparisonProps) {
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnimeDetails() {
      try {
        // First try to fetch from our database
        const dbResponse = await fetch(`/api/anime/${animeId}`)

        if (dbResponse.ok) {
          const dbData = await dbResponse.json()

          setAnimeDetails({
            id: dbData.id || animeId,
            title: dbData.titleEnglish || dbData.titleJapanese,
            titleJapanese: dbData.titleJapanese,
            titleEnglish: dbData.titleEnglish,
            imageUrl: dbData.imageUrl || '',
            rating: 0, // DB doesn't have rating yet
            synopsis: dbData.synopsis || '',
            genres: dbData.genres || [],
            episodes: dbData.episodes,
            status: dbData.status || '',
            year: dbData.releaseYear,
          })

          // Use platforms from database if available
          const dbPlatforms = dbData.platforms?.map((p: any) => ({
            id: p.id || p.name,
            name: p.name,
            displayName: p.displayName,
            logoUrl: p.logoUrl,
            websiteUrl: p.websiteUrl,
            monthlyPrice: p.monthlyPrice || 0,
            freeTrial: p.freeTrial,
            freeTrialDays: p.freeTrialDays,
            availableEpisodes: p.availableEpisodes,
            hasSub: p.hasSub,
            hasDub: p.hasDub,
          })) || []

          setPlatforms(dbPlatforms)

          // If no platforms in database, try TMDB API then AniList API
          if (dbPlatforms.length === 0) {
            let externalPlatforms: any[] = []

            // Try TMDB first
            if (dbData.titleJapanese) {
              try {
                const tmdbResponse = await fetch(
                  `/api/tmdb/streaming?title=${encodeURIComponent(dbData.titleJapanese)}`
                )
                if (tmdbResponse.ok) {
                  externalPlatforms = await tmdbResponse.json()
                }
              } catch (tmdbError) {
                console.error('Error fetching TMDB platforms:', tmdbError)
              }
            }

            // If TMDB has no results, try AniList
            if (externalPlatforms.length === 0) {
              try {
                // Try Japanese title first
                if (dbData.titleJapanese) {
                  const anilistResponse = await fetch(
                    `/api/anilist/streaming?title=${encodeURIComponent(dbData.titleJapanese)}`
                  )
                  if (anilistResponse.ok) {
                    externalPlatforms = await anilistResponse.json()
                  }
                }

                // If still no results, try English title
                if (externalPlatforms.length === 0 && dbData.titleEnglish) {
                  const anilistResponse = await fetch(
                    `/api/anilist/streaming?title=${encodeURIComponent(dbData.titleEnglish)}`
                  )
                  if (anilistResponse.ok) {
                    externalPlatforms = await anilistResponse.json()
                  }
                }
              } catch (anilistError) {
                console.error('Error fetching AniList platforms:', anilistError)
              }
            }

            setPlatforms(externalPlatforms)
          }

          setLoading(false)
          return
        }

        // Fallback to Jikan API
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
        if (!response.ok) throw new Error('Failed to fetch anime details')

        const { data } = await response.json()

        const animeData = {
          id: data.mal_id,
          title: data.title_english || data.title,
          titleJapanese: data.title_japanese,
          titleEnglish: data.title_english,
          imageUrl: data.images.jpg.large_image_url,
          rating: data.score || 0,
          synopsis: data.synopsis,
          genres: data.genres.map((g: any) => g.name),
          episodes: data.episodes,
          status: data.status,
          year: data.year,
        }

        setAnimeDetails(animeData)

        // Try to get platform data from TMDB using Japanese title first, then English
        let tmdbPlatforms: any[] = []

        // Try Japanese title first
        if (data.title_japanese) {
          try {
            const tmdbResponse = await fetch(
              `/api/tmdb/streaming?title=${encodeURIComponent(data.title_japanese)}`
            )
            if (tmdbResponse.ok) {
              tmdbPlatforms = await tmdbResponse.json()
            }
          } catch (tmdbError) {
            console.error('Error fetching TMDB platforms with Japanese title:', tmdbError)
          }
        }

        // If no results with Japanese title, try English title
        if (tmdbPlatforms.length === 0 && data.title_english) {
          try {
            const tmdbResponse = await fetch(
              `/api/tmdb/streaming?title=${encodeURIComponent(data.title_english)}`
            )
            if (tmdbResponse.ok) {
              tmdbPlatforms = await tmdbResponse.json()
            }
          } catch (tmdbError) {
            console.error('Error fetching TMDB platforms with English title:', tmdbError)
          }
        }

        // If still no results, try the default title
        if (tmdbPlatforms.length === 0 && data.title) {
          try {
            const tmdbResponse = await fetch(
              `/api/tmdb/streaming?title=${encodeURIComponent(data.title)}`
            )
            if (tmdbResponse.ok) {
              tmdbPlatforms = await tmdbResponse.json()
            }
          } catch (tmdbError) {
            console.error('Error fetching TMDB platforms with default title:', tmdbError)
          }
        }

        // If TMDB still has no results, fallback to AniList API
        if (tmdbPlatforms.length === 0) {
          try {
            // Try Japanese title first with AniList
            if (data.title_japanese) {
              const anilistResponse = await fetch(
                `/api/anilist/streaming?title=${encodeURIComponent(data.title_japanese)}`
              )
              if (anilistResponse.ok) {
                const anilistPlatforms = await anilistResponse.json()
                if (anilistPlatforms.length > 0) {
                  tmdbPlatforms = anilistPlatforms
                }
              }
            }

            // If still no results, try English title with AniList
            if (tmdbPlatforms.length === 0 && data.title_english) {
              const anilistResponse = await fetch(
                `/api/anilist/streaming?title=${encodeURIComponent(data.title_english)}`
              )
              if (anilistResponse.ok) {
                const anilistPlatforms = await anilistResponse.json()
                if (anilistPlatforms.length > 0) {
                  tmdbPlatforms = anilistPlatforms
                }
              }
            }

            // Last resort: try default title with AniList
            if (tmdbPlatforms.length === 0 && data.title) {
              const anilistResponse = await fetch(
                `/api/anilist/streaming?title=${encodeURIComponent(data.title)}`
              )
              if (anilistResponse.ok) {
                const anilistPlatforms = await anilistResponse.json()
                if (anilistPlatforms.length > 0) {
                  tmdbPlatforms = anilistPlatforms
                }
              }
            }
          } catch (anilistError) {
            console.error('Error fetching AniList platforms:', anilistError)
          }
        }

        setPlatforms(tmdbPlatforms)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching anime details:', error)
        setLoading(false)
      }
    }

    fetchAnimeDetails()
  }, [animeId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!animeDetails) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">アニメ情報が見つかりませんでした</p>
      </div>
    )
  }

  // Find lowest price platform
  const lowestPricePlatform = platforms.length > 0
    ? platforms.reduce((lowest, current) => {
        return current.monthlyPrice < lowest.monthlyPrice ? current : lowest
      })
    : null

  return (
    <div className="space-y-8">
      {/* Anime Card - Same style as SearchResults */}
      <div className="bg-[#1a2332] rounded-lg overflow-hidden border border-[#2d3748] hover:border-blue-500/50 hover:bg-[#1f2937] transition-all animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Anime Image */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {animeDetails.imageUrl ? (
              <Image
                src={animeDetails.imageUrl}
                alt={animeDetails.titleJapanese}
                width={150}
                height={200}
                className="rounded-lg object-cover w-[100px] h-[140px] sm:w-[150px] sm:h-[200px]"
                unoptimized
              />
            ) : (
              <div className="w-[100px] h-[140px] sm:w-[150px] sm:h-[200px] bg-[#0f1419] rounded-lg flex items-center justify-center border border-[#2d3748]">
                <Play className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600" />
              </div>
            )}
          </div>

          {/* Anime Info */}
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 sm:gap-4 mb-3">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                  {animeDetails.titleJapanese}
                </h3>
                {animeDetails.titleEnglish && (
                  <p className="text-gray-400 text-xs sm:text-sm">{animeDetails.titleEnglish}</p>
                )}
              </div>
              {lowestPricePlatform && (
                <div className="flex items-center gap-1 sm:gap-2 bg-green-500/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-green-500/30">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span className="text-green-400 font-medium whitespace-nowrap">
                    最安 ¥{lowestPricePlatform.monthlyPrice}/月
                  </span>
                </div>
              )}
            </div>

            {animeDetails.synopsis && (
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                {animeDetails.synopsis}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
              {animeDetails.year && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {animeDetails.year}年
                </span>
              )}
              {animeDetails.episodes && (
                <span className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  {animeDetails.episodes}話
                </span>
              )}
              {animeDetails.status && (
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {animeDetails.status}
                </span>
              )}
            </div>

            {animeDetails.genres && animeDetails.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {animeDetails.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-[#2d3748] text-gray-300 text-xs rounded-full border border-[#374151]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Comparison Table */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-6">価格比較</h2>
        <PriceComparisonTable
          platforms={platforms}
          animeTitle={animeDetails.titleJapanese}
          totalEpisodes={animeDetails.episodes || undefined}
        />
      </div>
    </div>
  )
}
