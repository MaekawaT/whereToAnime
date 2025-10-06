'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Play, Clock, Globe, DollarSign, TrendingDown } from 'lucide-react'

interface Platform {
  id: string
  availableEpisodes: number | null
  hasSub: boolean
  hasDub: boolean
  directUrl: string | null
  Platform?: {
    name: string
    displayName: string
    logoUrl: string | null
    websiteUrl: string | null
    monthlyPrice: number | null
    annualPrice?: number | null
    freeTrial?: boolean
    freeTrialDays?: number
  }
}

interface Anime {
  id: string
  titleJapanese: string
  titleEnglish: string | null
  titleRomaji: string | null
  synopsis: string | null
  imageUrl: string | null
  episodes: number | null
  status: string | null
  releaseYear: number | null
  genres: string[] | null
  platforms: Platform[]
}

interface SearchResultsProps {
  query: string
}

export default function SearchResults({ query }: SearchResultsProps) {
  const router = useRouter()
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (query) {
      searchAnime()
    }
  }, [query, page])

  const searchAnime = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`)

      if (!response.ok) {
        throw new Error('検索に失敗しました')
      }

      const data = await response.json()
      setResults(data.anime || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Search error:', error)
      setError('アニメの検索中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleShowPriceComparison = (anime: Anime) => {
    // Navigate to anime comparison page
    router.push(`/anime/${anime.id}?title=${encodeURIComponent(anime.titleJapanese)}`)
  }

  // 最安値プラットフォームを取得
  const getLowestPricePlatform = (platforms: Platform[]) => {
    const availablePlatforms = platforms.filter(p => p.Platform?.monthlyPrice)
    if (availablePlatforms.length === 0) return null

    return availablePlatforms.reduce((lowest, current) => {
      const currentPrice = current.Platform?.monthlyPrice || Infinity
      const lowestPrice = lowest.Platform?.monthlyPrice || Infinity
      return currentPrice < lowestPrice ? current : lowest
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">「{query}」の検索結果が見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {results.map((anime) => {
          const lowestPricePlatform = getLowestPricePlatform(anime.platforms)

          return (
            <div
              key={anime.id}
              className="bg-[#1a2332] rounded-lg overflow-hidden border border-[#2d3748] hover:border-blue-500/50 hover:bg-[#1f2937] transition-all animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                {/* アニメ画像 */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  {anime.imageUrl ? (
                    <Image
                      src={anime.imageUrl}
                      alt={anime.titleJapanese}
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

                {/* アニメ情報 */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 sm:gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                        {anime.titleJapanese}
                      </h3>
                      {anime.titleEnglish && (
                        <p className="text-gray-400 text-xs sm:text-sm">{anime.titleEnglish}</p>
                      )}
                    </div>
                    {lowestPricePlatform && (
                      <div className="flex items-center gap-1 sm:gap-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-green-200">
                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-green-700 font-medium whitespace-nowrap">
                          最安 ¥{lowestPricePlatform.Platform!.monthlyPrice}/月
                        </span>
                      </div>
                    )}
                  </div>

                  {anime.synopsis && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {anime.synopsis}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
                    {anime.releaseYear && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {anime.releaseYear}年
                      </span>
                    )}
                    {anime.episodes && (
                      <span className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        {anime.episodes}話
                      </span>
                    )}
                    {anime.status && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {anime.status}
                      </span>
                    )}
                  </div>

                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {anime.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-[#2d3748] text-gray-300 text-xs rounded-full border border-[#374151]"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* プラットフォーム情報と価格比較ボタン */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {anime.platforms.slice(0, 3).map((platform) => (
                        <div
                          key={platform.id}
                          className="flex items-center gap-1 sm:gap-2 bg-[#2d3748] px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-[#374151]"
                        >
                          <span className="text-xs sm:text-sm font-medium text-white">
                            {platform.Platform?.displayName}
                          </span>
                          <div className="flex gap-1">
                            {platform.hasSub && (
                              <span className="text-xs text-green-400">字幕</span>
                            )}
                            {platform.hasDub && (
                              <span className="text-xs text-blue-400">吹替</span>
                            )}
                          </div>
                          {platform.Platform?.monthlyPrice && (
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              ¥{platform.Platform.monthlyPrice}/月
                            </span>
                          )}
                        </div>
                      ))}
                      {anime.platforms.length > 3 && (
                        <span className="text-gray-400 text-xs sm:text-sm flex items-center">
                          他{anime.platforms.length - 3}件
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleShowPriceComparison(anime)}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto active:scale-[0.98]"
                    >
                      <DollarSign className="h-4 w-4" />
                      価格を比較
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a2332] text-gray-300 border border-[#2d3748] hover:bg-[#1f2937]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}