"use client";

import { useState } from "react";
import { Heart, Clock, TrendingUp, Star, Play, Search } from "lucide-react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import TrailerPlayer from "./TrailerPlayer";
import NewEpisodes from "./NewEpisodes";

// ダミーデータ - 実際はAPIから取得
const trendingAnime = [
  {
    id: 1,
    title: "Frieren: Beyond Journey's End",
    episodes: 28,
    image: "",
    rating: 9.2,
    platforms: ["Crunchyroll"],
    trailerYoutubeId: "AP5Z3bDPeHI", // Frieren trailer
  },
  {
    id: 2,
    title: "Jujutsu Kaisen",
    episodes: 47,
    image: "",
    rating: 8.8,
    platforms: ["Crunchyroll", "Netflix"],
  },
  {
    id: 3,
    title: "Chainsaw Man",
    episodes: 12,
    image: "",
    rating: 8.6,
    platforms: ["Crunchyroll", "Hulu"],
  },
  {
    id: 4,
    title: "Demon Slayer",
    episodes: 87,
    image: "",
    rating: 8.9,
    platforms: ["Netflix", "Crunchyroll"],
  },
  {
    id: 5,
    title: "One Piece",
    episodes: 1089,
    image: "",
    rating: 9.0,
    platforms: ["Crunchyroll", "Netflix"],
  },
  {
    id: 6,
    title: "Attack on Titan",
    episodes: 87,
    image: "",
    rating: 9.1,
    platforms: ["Crunchyroll", "Hulu"],
  },
];

const recentlyWatched = [
  {
    id: 1,
    title: "Demon Slayer",
    progress: 65,
    episode: 56,
    totalEpisodes: 87,
    image: "",
  },
  {
    id: 2,
    title: "Jujutsu Kaisen",
    progress: 80,
    episode: 38,
    totalEpisodes: 47,
    image: "",
  },
  {
    id: 3,
    title: "Chainsaw Man",
    progress: 100,
    episode: 12,
    totalEpisodes: 12,
    image: "",
  },
];

const watchlist = [
  {
    id: 1,
    title: "Frieren: Beyond Journey's End",
    episodes: 28,
    image: "",
    addedDate: "2025-09-25",
  },
  {
    id: 2,
    title: "Attack on Titan",
    episodes: 87,
    image: "",
    addedDate: "2025-09-20",
  },
  {
    id: 3,
    title: "One Piece",
    episodes: 1089,
    image: "",
    addedDate: "2025-09-15",
  },
];

const newEpisodes = [
  {
    id: 1,
    anime: {
      id: 4,
      title: "Demon Slayer",
      image: "",
    },
    episodeNumber: 56,
    releaseDate: "2025-09-29",
    platforms: ["Netflix", "Crunchyroll"],
    affiliateLinks: [
      { platform: "Netflix", url: "/api/track/click?platform=netflix&animeId=demon-slayer" },
      { platform: "Crunchyroll", url: "/api/track/click?platform=crunchyroll&animeId=demon-slayer" },
    ],
  },
  {
    id: 2,
    anime: {
      id: 2,
      title: "Jujutsu Kaisen",
      image: "",
    },
    episodeNumber: 38,
    releaseDate: "2025-09-27",
    platforms: ["Crunchyroll", "Netflix"],
    affiliateLinks: [
      { platform: "Crunchyroll", url: "/api/track/click?platform=crunchyroll&animeId=jujutsu-kaisen" },
      { platform: "Netflix", url: "/api/track/click?platform=netflix&animeId=jujutsu-kaisen" },
    ],
  },
];

interface DashboardContentProps {
  user: any;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="container mx-auto px-6 py-8">
      {/* Welcome Section with Search */}
      <div className="mb-12 animate-fadeIn relative z-50">
        <h1 className="text-3xl font-medium mb-2">
          こんにちは、{user.email?.split("@")[0]}さん
        </h1>
        <p className="text-gray-600 mb-6">
          お気に入りのアニメを見つけて、どこで視聴できるか確認しましょう
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Show search results or dashboard content */}
      {searchQuery ? (
        <section className="animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">検索結果: {searchQuery}</h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <SearchResults query={searchQuery} />
        </section>
      ) : (
        <>
          {/* New Episodes */}
          <NewEpisodes episodes={newEpisodes} />

          {/* Watchlist */}
          <section
            className="mb-12 animate-fadeIn"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium flex items-center gap-2">
                <Heart className="h-6 w-6" />
                ウォッチリスト
              </h2>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                すべて見る →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {watchlist.map((anime, index) => (
                <div
                  key={anime.id}
                  className="group cursor-pointer animate-fadeIn"
                  style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-3 border border-gray-200 group-hover:border-gray-300 transition-all">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200"></div>
                    <button className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                    {anime.title}
                  </h3>
                  <p className="text-xs text-gray-500">{anime.episodes}話</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trending/Popular Anime */}
          <section
            className="mb-12 animate-fadeIn"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                トレンド中のアニメ
              </h2>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                すべて見る →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingAnime.map((anime, index) => (
                <div
                  key={anime.id}
                  className="group cursor-pointer animate-fadeIn"
                  style={{ animationDelay: `${0.35 + index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-3 border border-gray-200 group-hover:border-gray-300 transition-all">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200"></div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 rounded-lg flex items-center gap-1">
                      <Star className="h-3 w-3 text-gray-900 fill-gray-900" />
                      <span className="text-xs font-medium text-gray-900">
                        {anime.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                    {anime.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {anime.platforms.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section
            className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium text-gray-900">12</p>
                  <p className="text-sm text-gray-500">視聴中のアニメ</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium text-gray-900">24</p>
                  <p className="text-sm text-gray-500">お気に入り</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium text-gray-900">156</p>
                  <p className="text-sm text-gray-500">視聴済みエピソード</p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Trailer */}
          <section
            className="mt-12 animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            <h2 className="text-2xl font-medium mb-6">注目の予告編</h2>
            <TrailerPlayer
              videoId={trendingAnime[0].trailerYoutubeId}
              title={trendingAnime[0].title}
            />
          </section>
        </>
      )}
    </main>
  );
}
