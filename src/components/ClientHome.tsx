'use client'

import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import SearchResults from '@/components/SearchResults'
import FeaturedAnime from '@/components/FeaturedAnime'
import PlatformGrid from '@/components/PlatformGrid'

export default function ClientHome() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <main className="container mx-auto px-6">
      {/* Hero Section */}
      <section className="text-center py-24 max-w-4xl mx-auto relative z-50">
        <div className="animate-fadeIn">
          <h2 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight tracking-tight text-white">
            アニメを見る場所を
            <br />
            <span className="text-blue-400">即座に発見</span>
          </h2>
          <p className="text-lg text-gray-400 mb-12 font-light">
            複数のプラットフォームから最適な配信サービスと価格を比較
          </p>
          <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Search Results or Default Content */}
      {searchQuery ? (
        <SearchResults query={searchQuery} />
      ) : (
        <>
          {/* Platforms Section */}
          <section className="py-16">
            <h3 className="text-2xl font-semibold mb-10 text-center text-white">対応プラットフォーム</h3>
            <PlatformGrid />
          </section>

          {/* Featured Anime Section */}
          <section className="py-16 pb-24">
            <h3 className="text-2xl font-semibold mb-10 text-center text-white">話題のアニメ</h3>
            <FeaturedAnime />
          </section>
        </>
      )}
    </main>
  )
}