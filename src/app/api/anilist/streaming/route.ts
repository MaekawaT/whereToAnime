import { NextRequest, NextResponse } from 'next/server'
import { getStreamingAvailabilityFromAniList } from '@/lib/anilist'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title')

  if (!title) {
    return NextResponse.json({ error: 'Title parameter is required' }, { status: 400 })
  }

  try {
    const platforms = await getStreamingAvailabilityFromAniList(title)

    console.log(`[AniList API] Found ${platforms.length} platforms for "${title}"`)

    return NextResponse.json(platforms)
  } catch (error) {
    console.error('Error fetching streaming availability from AniList:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streaming availability' },
      { status: 500 }
    )
  }
}
