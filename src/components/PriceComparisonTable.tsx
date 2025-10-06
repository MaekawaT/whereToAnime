'use client'

import { useState } from 'react'
import { Check, X, Star, TrendingDown, Calendar, Gift } from 'lucide-react'
import Image from 'next/image'

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
  hasSub?: boolean
  hasDub?: boolean
}

interface PriceComparisonTableProps {
  platforms: Platform[]
  animeTitle?: string
  totalEpisodes?: number
}

export default function PriceComparisonTable({
  platforms,
  animeTitle,
  totalEpisodes
}: PriceComparisonTableProps) {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  // 利用可能なプラットフォームのみフィルター
  const filteredPlatforms = showOnlyAvailable
    ? platforms.filter(p => p.availableEpisodes && p.availableEpisodes > 0)
    : platforms

  // 価格でソート（安い順）
  const sortedPlatforms = [...filteredPlatforms].sort((a, b) => {
    return a.monthlyPrice - b.monthlyPrice
  })

  // 最安値を取得
  const lowestPrice = sortedPlatforms[0]?.monthlyPrice

  return (
    <div className="bg-[#1a2332]/80 rounded-lg backdrop-blur-sm border border-[#2d3748]">
      <div className="p-4 md:p-6 border-b border-[#2d3748]">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-white">価格比較</h3>
            {animeTitle && (
              <p className="text-gray-400 mt-1 text-sm md:text-base">「{animeTitle}」の配信プラットフォーム</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-[#4b5563] bg-[#1f2937]"
              />
              <span className="text-gray-400">配信中のみ表示</span>
            </label>
          </div>
        </div>

        {sortedPlatforms.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            {showOnlyAvailable
              ? '現在このアニメを配信しているプラットフォームはありません'
              : 'プラットフォーム情報がありません'}
          </p>
        )}
      </div>

      <div className="divide-y divide-[#2d3748]">
        {sortedPlatforms.map((platform, index) => {
          const isLowest = platform.monthlyPrice === lowestPrice && index === 0

          return (
            <div key={platform.id} className="p-4 md:p-6 hover:bg-[#1f2937]/50 transition">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 md:gap-4">
                  <div className="relative flex-shrink-0">
                    {platform.logoUrl && (
                      <Image
                        src={platform.logoUrl}
                        alt={platform.displayName}
                        width={48}
                        height={48}
                        className="rounded-lg w-10 h-10 md:w-12 md:h-12"
                      />
                    )}
                    {isLowest && (
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                        <Star className="h-3 w-3 text-white" fill="white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white flex flex-wrap items-center gap-2">
                      {platform.displayName}
                      {isLowest && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          最安値
                        </span>
                      )}
                      {platform.freeTrial && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          {platform.freeTrialDays}日間無料
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-wrap gap-2 md:gap-4 mt-1 text-xs md:text-sm">
                      {platform.availableEpisodes !== undefined && totalEpisodes && (
                        <span className={`flex items-center gap-1 ${
                          platform.availableEpisodes >= totalEpisodes
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {platform.availableEpisodes}/{totalEpisodes}話
                        </span>
                      )}
                      {platform.hasSub && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-400" />
                          字幕
                        </span>
                      )}
                      {platform.hasDub && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-400" />
                          吹替
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between lg:justify-end gap-4 lg:gap-6">
                  <div className="text-left lg:text-right">
                    <div className="text-xl md:text-2xl font-bold text-white">
                      ¥{platform.monthlyPrice.toLocaleString()}
                      <span className="text-sm font-normal text-gray-400">/月</span>
                    </div>
                  </div>

                  <a
                    href={platform.websiteUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap"
                  >
                    詳細を見る
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedPlatforms.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-t border-[#2d3748]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">おすすめプラン</p>
              <p className="text-lg font-semibold text-white mt-1">
                {sortedPlatforms[0].displayName}なら月額¥{sortedPlatforms[0].monthlyPrice.toLocaleString()}で視聴可能
              </p>
            </div>
            {sortedPlatforms.length > 1 && (
              <div className="text-right">
                <p className="text-sm text-gray-400">他社との差額</p>
                <p className="text-lg font-semibold text-green-400">
                  最大¥{(sortedPlatforms[sortedPlatforms.length - 1].monthlyPrice - sortedPlatforms[0].monthlyPrice).toLocaleString()}お得
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}