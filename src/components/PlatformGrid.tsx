'use client'

import { useEffect, useState } from 'react'

interface Platform {
  name: string
  displayName: string
  monthlyPrice: number | null
  annualPrice: number | null
  logoUrl: string | null
  isActive: boolean
}

const platformColors: Record<string, string> = {
  crunchyroll: 'from-orange-400 to-orange-500',
  netflix: 'from-red-500 to-red-600',
  hulu: 'from-green-500 to-green-600',
  disney: 'from-blue-600 to-blue-700',
  primevideo: 'from-blue-500 to-blue-600',
  hidive: 'from-purple-500 to-purple-600',
}

export default function PlatformGrid() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/platforms')
      .then(res => res.json())
      .then(data => {
        setPlatforms(data.platforms || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch platforms:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl p-5 h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (platforms.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {platforms.map((platform, index) => (
        <div
          key={platform.name}
          className="group bg-[#1a2332] rounded-lg p-5 border border-[#2d3748] hover:border-blue-500/50 hover:bg-[#1f2937] transition-all duration-300 cursor-pointer animate-fadeIn"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="h-16 mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            {platform.logoUrl ? (
              <img src={platform.logoUrl} alt={platform.displayName} className="h-12 w-auto object-contain" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${platformColors[platform.name] || 'from-gray-600 to-gray-700'} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-semibold text-lg">{platform.displayName[0]}</span>
              </div>
            )}
          </div>
          <h4 className="font-semibold text-sm mb-1 text-white">{platform.displayName}</h4>
          <p className="text-gray-400 text-xs">
            ${platform.monthlyPrice?.toFixed(2) || 'N/A'}/month
          </p>
        </div>
      ))}
    </div>
  )
}
