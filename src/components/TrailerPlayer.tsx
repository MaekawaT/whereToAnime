'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

interface TrailerPlayerProps {
  videoId?: string // YouTube video ID
  title: string
  thumbnailUrl?: string
}

export default function TrailerPlayer({ videoId, title, thumbnailUrl }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!videoId) {
    return null
  }

  // YouTube thumbnail URL (default to high quality)
  const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  return (
    <div className="relative">
      {!isPlaying ? (
        // Thumbnail with play button
        <div
          onClick={() => setIsPlaying(true)}
          className="relative cursor-pointer group rounded-2xl overflow-hidden"
        >
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={thumbnail}
              alt={`${title} trailer`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default quality if maxres fails
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }}
            />
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-transform">
              <Play className="h-12 w-12 text-gray-900 fill-gray-900" />
            </div>
          </div>
        </div>
      ) : (
        // YouTube iframe player
        <div className="relative rounded-2xl overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
