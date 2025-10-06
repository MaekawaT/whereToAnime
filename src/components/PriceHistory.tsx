'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Clock, Bell } from 'lucide-react'

interface PriceChange {
  platformName: string
  oldPrice: number
  newPrice: number
  changeType: 'increase' | 'decrease' | 'no_change'
  changeDate: string
  percentageChange: number
}

interface PriceHistoryProps {
  platformId?: string
  limit?: number
}

export default function PriceHistory({ platformId, limit = 5 }: PriceHistoryProps) {
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([])
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    // In production, this would fetch from the API
    const mockData: PriceChange[] = [
      {
        platformName: 'Netflix',
        oldPrice: 1490,
        newPrice: 1980,
        changeType: 'increase',
        changeDate: '2024-01-15T10:00:00Z',
        percentageChange: 32.9
      },
      {
        platformName: 'Crunchyroll',
        oldPrice: 1025,
        newPrice: 1025,
        changeType: 'no_change',
        changeDate: '2024-01-15T10:00:00Z',
        percentageChange: 0
      },
      {
        platformName: 'Amazon Prime',
        oldPrice: 600,
        newPrice: 600,
        changeType: 'no_change',
        changeDate: '2024-01-15T10:00:00Z',
        percentageChange: 0
      },
      {
        platformName: 'Disney+',
        oldPrice: 1320,
        newPrice: 990,
        changeType: 'decrease',
        changeDate: '2024-01-10T10:00:00Z',
        percentageChange: -25
      }
    ]

    setPriceChanges(mockData.slice(0, limit))
    setLastChecked(new Date().toISOString())
  }, [platformId, limit])

  const checkPrices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/prices/check', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Price check result:', data)
        setLastChecked(new Date().toISOString())

        // Refresh the price changes data
        // In production, this would fetch the updated history
      }
    } catch (error) {
      console.error('Price check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-red-400" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-green-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-red-400 bg-red-400/10'
      case 'decrease':
        return 'text-green-400 bg-green-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-bold text-white">価格変動履歴</h3>
        </div>
        <button
          onClick={checkPrices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Bell className="h-4 w-4" />
          {loading ? '確認中...' : '今すぐ確認'}
        </button>
      </div>

      {lastChecked && (
        <p className="text-sm text-gray-400 mb-4">
          最終チェック: {formatDate(lastChecked)}
        </p>
      )}

      <div className="space-y-3">
        {priceChanges.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            価格変動履歴がありません
          </p>
        ) : (
          priceChanges.map((change, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gray-600">
                  {getChangeIcon(change.changeType)}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {change.platformName}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(change.changeDate)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {change.changeType === 'no_change' ? (
                  <div className="text-gray-400">
                    ¥{change.oldPrice.toLocaleString()}/月
                    <div className="text-xs">変更なし</div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">
                        ¥{change.oldPrice.toLocaleString()}
                      </span>
                      <span className="text-white font-bold">
                        ¥{change.newPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${getChangeColor(change.changeType)}`}>
                      {change.percentageChange > 0 ? '+' : ''}{change.percentageChange.toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {priceChanges.length > 0 && (
        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Bell className="h-4 w-4" />
            <span>価格変動は毎日深夜2時に自動チェックされます</span>
          </div>
        </div>
      )}
    </div>
  )
}