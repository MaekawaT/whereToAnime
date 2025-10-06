import { NextResponse } from 'next/server';

// Jikan API endpoint for current season anime
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  score: number | null;
  genres: Array<{ name: string }>;
  synopsis: string;
  url: string;
  popularity: number;
}

// Enable route segment config for caching
export const revalidate: number = 3600; // Revalidate every hour
export const dynamic = 'force-cache'; // Force static caching

export async function GET() {
  try {
    // Fetch current season anime from Jikan API
    const response = await fetch(
      `${JIKAN_API_BASE}/seasons/now?limit=12`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending anime');
    }

    const data = await response.json();

    // Sort by popularity (lower number = more popular) and then by score
    const sortedAnime = data.data
      .sort((a: JikanAnime, b: JikanAnime) => {
        // First prioritize by popularity
        if (a.popularity && b.popularity) {
          return a.popularity - b.popularity;
        }
        // If popularity is same or null, sort by score
        return (b.score || 0) - (a.score || 0);
      });

    // Transform the data to match our component's expected format
    const trendingAnime = sortedAnime.map((anime: JikanAnime) => ({
      id: anime.mal_id,
      title: anime.title_english || anime.title,
      imageUrl: anime.images.jpg.large_image_url,
      rating: anime.score || 0,
      tags: anime.genres.slice(0, 3).map((g) => g.name),
      synopsis: anime.synopsis,
      url: anime.url,
    }));

    // Add cache headers to the response
    return NextResponse.json(trendingAnime, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending anime' },
      { status: 500 }
    );
  }
}
