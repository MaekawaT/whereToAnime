'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface TrendingAnime {
  id: number
  title: string
  imageUrl: string
  rating: number
  tags: string[]
  synopsis?: string
  url?: string
}

export default function FeaturedAnime() {
  const router = useRouter()
  const [trendingAnime, setTrendingAnime] = useState<TrendingAnime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrendingAnime() {
      try {
        const response = await fetch('/api/anime/trending')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setTrendingAnime(data)
      } catch (error) {
        console.error('Error fetching trending anime:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingAnime()
  }, [])

  const handleAnimeClick = (animeId: number, animeTitle: string) => {
    // Navigate to anime comparison page
    router.push(`/anime/${animeId}?title=${encodeURIComponent(animeTitle)}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {trendingAnime.map((anime, index) => (
        <div
          key={anime.id}
          className="group cursor-pointer animate-fadeIn"
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => handleAnimeClick(anime.id, anime.title)}
        >
          <div className="relative overflow-hidden rounded-lg mb-3 bg-[#1a2332] group-hover:bg-[#1f2937] transition-all duration-300">
            <div className="aspect-[3/4] relative bg-gradient-to-br from-[#1a2332] to-[#0f1419]">
              <Image
                src={anime.imageUrl}
                alt={anime.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-yellow-400">★</span>
                  <span className="text-sm font-semibold text-white">
                    {anime.rating ? anime.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-1">
                  {anime.tags.join(' • ')}
                </p>
              </div>
            </div>
          </div>
          <h4 className="font-medium text-sm text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2">
            {anime.title}
          </h4>
        </div>
      ))}
    </div>
  )
}
