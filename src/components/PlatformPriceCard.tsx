'use client'

import { Check, X, TrendingUp, Gift, Star } from 'lucide-react'
import Image from 'next/image'

interface PlatformPriceCardProps {
  platform: {
    id: string
    name: string
    displayName: string
    logoUrl?: string
    websiteUrl: string
    monthlyPrice: number
    annualPrice?: number
    freeTrial: boolean
    freeTrialDays?: number
    features?: string[]
  }
  isRecommended?: boolean
  onSelect?: () => void
}

export default function PlatformPriceCard({
  platform,
  isRecommended = false,
  onSelect
}: PlatformPriceCardProps) {
  const annualSavings = platform.annualPrice
    ? platform.monthlyPrice * 12 - platform.annualPrice
    : 0

  const annualMonthlyPrice = platform.annualPrice
    ? Math.round(platform.annualPrice / 12)
    : platform.monthlyPrice

  const defaultFeatures = [
    'HD画質での視聴',
    '同時視聴可能',
    'オフライン視聴',
    'すべてのデバイス対応'
  ]

  const features = platform.features || defaultFeatures

  return (
    <div
      className={`relative bg-gray-800/50 rounded-xl backdrop-blur-sm border transition-all hover:scale-105 cursor-pointer ${
        isRecommended
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-gray-700'
      }`}
      onClick={onSelect}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="h-4 w-4" fill="white" />
            おすすめ
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {platform.logoUrl && (
              <Image
                src={platform.logoUrl}
                alt={platform.displayName}
                width={40}
                height={40}
                className="rounded-lg"
              />
            )}
            <div>
              <h3 className="font-bold text-white text-lg">{platform.displayName}</h3>
              {platform.freeTrial && (
                <div className="flex items-center gap-1 text-purple-400 text-sm mt-0.5">
                  <Gift className="h-3 w-3" />
                  {platform.freeTrialDays}日間無料トライアル
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              ¥{platform.monthlyPrice.toLocaleString()}
            </span>
            <span className="text-gray-400">/月</span>
          </div>

          {platform.annualPrice && (
            <div className="mt-2 space-y-1">
              <div className="text-sm text-gray-400">
                年間プラン: ¥{platform.annualPrice.toLocaleString()}/年
              </div>
              {annualSavings > 0 && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="h-3 w-3" />
                  年間¥{annualSavings.toLocaleString()}お得（月額¥{annualMonthlyPrice.toLocaleString()}相当）
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        <a
          href={platform.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full py-3 rounded-lg font-medium text-center transition ${
            isRecommended
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {platform.freeTrial ? '無料で始める' : '詳細を見る'}
        </a>
      </div>
    </div>
  )
}