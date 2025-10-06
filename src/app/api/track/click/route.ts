import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAffiliateLink, normalizePlatformName, type Platform } from '@/lib/affiliate'

/**
 * アフィリエイトクリックトラッキングAPI
 *
 * クリックを記録してからアフィリエイトリンクにリダイレクト
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform')
    const animeId = searchParams.get('animeId')
    const userId = searchParams.get('userId')

    // パラメータ検証
    if (!platform || !animeId) {
      return NextResponse.json(
        { error: 'Missing required parameters: platform, animeId' },
        { status: 400 }
      )
    }

    // プラットフォーム名を正規化
    const normalizedPlatform = normalizePlatformName(platform)
    if (!normalizedPlatform) {
      return NextResponse.json(
        { error: `Unknown platform: ${platform}` },
        { status: 400 }
      )
    }

    // Supabaseクライアント作成
    const supabase = createClient()

    // ユーザー情報取得（認証済みの場合）
    const { data: { user } } = await supabase.auth.getUser()
    const trackingUserId = userId || user?.id || null

    // クリックをデータベースに記録
    const { error: insertError } = await supabase
      .from('affiliate_clicks')
      .insert({
        platform: normalizedPlatform,
        anime_id: animeId,
        user_id: trackingUserId,
        clicked_at: new Date().toISOString(),
        ip_address: request.ip || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    if (insertError) {
      console.error('Failed to track click:', insertError)
      // エラーでもリダイレクトは続行
    }

    // アフィリエイトリンク生成
    const affiliateLink = generateAffiliateLink(normalizedPlatform as Platform, animeId)

    // アフィリエイトリンクにリダイレクト
    return NextResponse.redirect(affiliateLink, { status: 302 })

  } catch (error) {
    console.error('Error in click tracking:', error)

    // エラー時はプラットフォームのホームページにリダイレクト
    const platform = request.nextUrl.searchParams.get('platform')
    const fallbackUrls: Record<string, string> = {
      crunchyroll: 'https://www.crunchyroll.com',
      netflix: 'https://www.netflix.com',
      hulu: 'https://www.hulu.com',
      'amazon-prime': 'https://www.amazon.com/primevideo'
    }

    const fallbackUrl = fallbackUrls[platform || ''] || 'https://www.crunchyroll.com'
    return NextResponse.redirect(fallbackUrl, { status: 302 })
  }
}
