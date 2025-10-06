import { NextRequest, NextResponse } from 'next/server'
import { getStreamingAvailabilityByTitle } from '@/lib/tmdb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const title = searchParams.get('title')
    const country = searchParams.get('country') || 'JP'

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      )
    }

    const platforms = await getStreamingAvailabilityByTitle(title, country)

    return NextResponse.json(platforms)
  } catch (error) {
    console.error('TMDB Streaming API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streaming availability' },
      { status: 500 }
    )
  }
}
