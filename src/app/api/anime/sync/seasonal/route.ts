import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentSeasonAnime, getUpcomingAnime, transformJikanToDbFormat } from '@/lib/external-api/jikan'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'current' // 'current' or 'upcoming'

    console.log(`📅 ${type === 'current' ? '今期' : '来期'}のアニメを同期中...`)

    // 1. 外部APIから今期のアニメを取得
    const animeList = type === 'current'
      ? await getCurrentSeasonAnime()
      : await getUpcomingAnime()

    if (!animeList || animeList.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'アニメデータが取得できませんでした'
      })
    }

    console.log(`📥 ${animeList.length}件のアニメを取得`)

    // 2. データベースに保存
    let savedCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const anime of animeList) {
      try {
        const animeData = transformJikanToDbFormat(anime)

        // malId が既に存在するかチェック
        const { data: existing } = await supabase
          .from('Anime')
          .select('id, titleJapanese')
          .eq('malId', animeData.malId)
          .single()

        if (!existing) {
          // 新規作成
          const { data: savedAnime, error: saveError } = await supabase
            .from('Anime')
            .insert(animeData)
            .select()
            .single()

          if (saveError) {
            console.error(`保存エラー (${animeData.titleJapanese}):`, saveError)
            errorCount++
          } else {
            console.log(`✅ 新規保存: ${animeData.titleJapanese}`)
            savedCount++
          }
        } else {
          // 既存データを更新
          const { error: updateError } = await supabase
            .from('Anime')
            .update({
              ...animeData,
              lastSyncedAt: new Date().toISOString()
            })
            .eq('malId', animeData.malId)

          if (!updateError) {
            console.log(`🔄 更新: ${animeData.titleJapanese}`)
            updatedCount++
          } else {
            console.error(`更新エラー (${animeData.titleJapanese}):`, updateError)
            errorCount++
          }
        }

        // レート制限対策（少し待機）
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error('処理エラー:', error)
        errorCount++
      }
    }

    const summary = {
      success: true,
      totalFetched: animeList.length,
      newlySaved: savedCount,
      updated: updatedCount,
      errors: errorCount,
      type,
      timestamp: new Date().toISOString()
    }

    console.log('📊 同期完了:', summary)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Seasonal sync error:', error)
    return NextResponse.json(
      { error: '同期処理中にエラーが発生しました', details: error },
      { status: 500 }
    )
  }
}

// GET endpoint for checking sync status
export async function GET(request: NextRequest) {
  try {
    // 最近同期されたアニメを取得
    const { data: recentlySynced, error } = await supabase
      .from('Anime')
      .select('titleJapanese, season, year, lastSyncedAt, dataSource')
      .eq('dataSource', 'jikan')
      .order('lastSyncedAt', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({
      recentlySynced: recentlySynced || [],
      lastSync: recentlySynced?.[0]?.lastSyncedAt || null
    })

  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: '同期状態の取得に失敗しました' },
      { status: 500 }
    )
  }
}