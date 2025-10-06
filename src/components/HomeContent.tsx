'use client'

import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import FeaturedAnime from '@/components/FeaturedAnime'
import PlatformGrid from '@/components/PlatformGrid'
import SearchResults from '@/components/SearchResults'

export default function HomeContent() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <>
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Find Your Anime,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              Anywhere
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            どこで見れるか一瞬で分かる。最安値のプラットフォームを見つけよう。
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchQuery ? (
          <SearchResults query={searchQuery} />
        ) : (
          <>
            <FeaturedAnime />
            <PlatformGrid />
          </>
        )}
      </main>

      <footer className="mt-20 border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">&copy; 2024 WhereToAnime. All rights reserved.</p>
            <div className="flex gap-4">
              <button className="text-gray-400 hover:text-white transition">About</button>
              <button className="text-gray-400 hover:text-white transition">Privacy</button>
              <button className="text-gray-400 hover:text-white transition">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}