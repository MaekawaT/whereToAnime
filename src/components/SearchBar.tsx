'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/anime/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        // API側で既に優先順位付けされているのでそのまま使用
        setSuggestions((data.anime || []).slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const debounce = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, fetchSuggestions])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.titleEnglish || suggestion.titleJapanese)
    onSearch(suggestion.titleEnglish || suggestion.titleJapanese)
    setShowSuggestions(false)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative z-50">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // 少し遅延させてクリックイベントを処理できるようにする
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder="アニメのタイトルを検索..."
          className="w-full px-6 py-4 pr-14 text-base rounded-xl bg-[#1f2937] border border-[#374151] focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-500 hover:border-[#4b5563] text-white"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 active:scale-95"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* オートコンプリート候補 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-[#1f2937] border border-[#374151] rounded-xl shadow-xl overflow-hidden animate-fadeIn max-h-[400px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#374151] transition-colors flex items-center gap-3 border-b border-[#374151] last:border-b-0"
            >
              {suggestion.imageUrl && (
                <div className="flex-shrink-0 w-10 h-14 bg-[#1a2332] rounded overflow-hidden">
                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.titleEnglish || suggestion.titleJapanese}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {suggestion.titleJapanese || suggestion.titleEnglish}
                </div>
                {suggestion.titleJapanese && suggestion.titleEnglish && suggestion.titleJapanese !== suggestion.titleEnglish && (
                  <div className="text-gray-400 text-sm truncate">
                    {suggestion.titleEnglish}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}