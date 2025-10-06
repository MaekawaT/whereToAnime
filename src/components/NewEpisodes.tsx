'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { generateTrackedLink, normalizePlatformName } from '@/lib/affiliate'

interface NewEpisode {
  id: number
  anime: {
    id: number
    title: string
    image: string
  }
  episodeNumber: number
  releaseDate: string
  platforms: string[]
  affiliateLinks: {
    platform: string
    url: string
  }[]
}

interface NewEpisodesProps {
  episodes: NewEpisode[]
}

export default function NewEpisodes({ episodes }: NewEpisodesProps) {
  if (episodes.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
  }

  return (
    <section className="mb-12 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium flex items-center gap-2">
          <Bell className="h-6 w-6" />
          ウォッチリストの新エピソード
          {episodes.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {episodes.length}
            </span>
          )}
        </h2>
      </div>

      <div className="grid gap-4">
        {episodes.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-gray-300 transition-all animate-fadeIn"
            style={{ animationDelay: `${0.15 + index * 0.05}s` }}
          >
            <div className="flex gap-4">
              {/* Anime thumbnail */}
              <div className="flex-shrink-0">
                <div className="w-24 h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  {item.anime.image && (
                    <img
                      src={item.anime.image}
                      alt={item.anime.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg text-gray-900 mb-2">
                  {item.anime.title}
                </h3>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-lg">
                    🆕 第{item.episodeNumber}話
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(item.releaseDate)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">
                  視聴可能: {item.platforms.join(', ')}
                </p>

                {/* Platform links */}
                <div className="flex gap-2 flex-wrap">
                  {item.platforms.map((platform) => {
                    const normalizedPlatform = normalizePlatformName(platform)
                    const trackingLink = normalizedPlatform
                      ? generateTrackedLink(normalizedPlatform, item.anime.id.toString())
                      : '#'

                    return (
                      <a
                        key={platform}
                        href={trackingLink}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {platform}で視聴 →
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
