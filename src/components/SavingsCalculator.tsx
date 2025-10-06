'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingDown, DollarSign, Calendar } from 'lucide-react'

interface Platform {
  id: string
  name: string
  displayName: string
  monthlyPrice: number
  annualPrice?: number
}

interface SavingsCalculatorProps {
  platforms: Platform[]
  selectedAnime?: string[]
}

export default function SavingsCalculator({
  platforms,
  selectedAnime = []
}: SavingsCalculatorProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [viewingMonths, setViewingMonths] = useState(12)
  const [billingType, setBillingType] = useState<'monthly' | 'annual'>('monthly')

  // 現在の合計コスト計算
  const calculateCurrentCost = () => {
    return selectedPlatforms.reduce((total, platformId) => {
      const platform = platforms.find(p => p.id === platformId)
      if (!platform) return total

      if (billingType === 'annual' && platform.annualPrice) {
        return total + (platform.annualPrice / 12) * viewingMonths
      }
      return total + platform.monthlyPrice * viewingMonths
    }, 0)
  }

  // 最適なプラン（最安値）を計算
  const calculateOptimalCost = () => {
    if (platforms.length === 0) return 0

    // 最も安いプラットフォームを見つける
    const cheapest = platforms.reduce((min, platform) => {
      const currentPrice = billingType === 'annual' && platform.annualPrice
        ? platform.annualPrice / 12
        : platform.monthlyPrice

      const minPrice = billingType === 'annual' && min.annualPrice
        ? min.annualPrice / 12
        : min.monthlyPrice

      return currentPrice < minPrice ? platform : min
    })

    if (billingType === 'annual' && cheapest.annualPrice) {
      return (cheapest.annualPrice / 12) * viewingMonths
    }
    return cheapest.monthlyPrice * viewingMonths
  }

  const currentCost = calculateCurrentCost()
  const optimalCost = calculateOptimalCost()
  const savings = currentCost - optimalCost

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">節約シミュレーター</h3>
      </div>

      <div className="space-y-6">
        {/* プラットフォーム選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            現在契約中のサービスを選択
          </label>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`p-3 rounded-lg border transition text-sm font-medium ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {platform.displayName}
                <div className="text-xs mt-1">
                  ¥{platform.monthlyPrice.toLocaleString()}/月
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 期間設定 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              視聴期間
            </label>
            <select
              value={viewingMonths}
              onChange={(e) => setViewingMonths(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="1">1ヶ月</option>
              <option value="3">3ヶ月</option>
              <option value="6">6ヶ月</option>
              <option value="12">12ヶ月</option>
              <option value="24">24ヶ月</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              支払い方法
            </label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as 'monthly' | 'annual')}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="monthly">月額払い</option>
              <option value="annual">年額払い</option>
            </select>
          </div>
        </div>

        {/* 計算結果 */}
        {selectedPlatforms.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">現在のコスト</span>
              <span className="text-xl font-bold text-white">
                ¥{currentCost.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">最適プラン</span>
              <span className="text-xl font-bold text-green-400">
                ¥{optimalCost.toLocaleString()}
              </span>
            </div>

            {savings > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">節約可能額</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      ¥{savings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {viewingMonths}ヶ月で
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-300">
                  {platforms.find(p =>
                    billingType === 'annual' && p.annualPrice
                      ? p.annualPrice / 12 === optimalCost / viewingMonths
                      : p.monthlyPrice === optimalCost / viewingMonths
                  )?.displayName}に切り替えることで、
                  年間¥{Math.round((savings / viewingMonths) * 12).toLocaleString()}の節約が可能です
                </div>
              </div>
            )}
          </div>
        )}

        {selectedPlatforms.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            現在契約中のサービスを選択してください
          </div>
        )}
      </div>
    </div>
  )
}