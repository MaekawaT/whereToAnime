import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchAnimeFromAniList, transformAniListToDbFormat } from '@/lib/external-api/anilist';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');

    if (!query) {
      return NextResponse.json({
        anime: [],
        message: '検索キーワードを入力してください'
      });
    }

    // 表記揺れ対応: カタカナ→ひらがな、大文字→小文字の変換
    const normalizedQuery = query.toLowerCase();
    const hiraganaQuery = query.replace(/[\u30a1-\u30f6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    // 1. まずデータベースから検索（優先順位付き）
    // 優先度1: 完全一致
    const { data: exactMatches } = await supabase
      .from('Anime')
      .select('*')
      .or([
        `titleJapanese.eq.${query}`,
        `titleEnglish.eq.${query}`,
        `titleRomaji.eq.${query}`,
        `titleJapanese.eq.${normalizedQuery}`,
        `titleEnglish.eq.${normalizedQuery}`,
        `titleRomaji.eq.${normalizedQuery}`,
        ...(hiraganaQuery !== query ? [
          `titleJapanese.eq.${hiraganaQuery}`,
          `titleRomaji.eq.${hiraganaQuery}`
        ] : [])
      ].join(','))
      .order('popularity', { ascending: false, nullsFirst: false })
      .limit(20);

    // 優先度2: 前方一致
    const { data: prefixMatches } = await supabase
      .from('Anime')
      .select('*')
      .or([
        `titleJapanese.ilike.${query}%`,
        `titleEnglish.ilike.${query}%`,
        `titleRomaji.ilike.${query}%`,
        `titleJapanese.ilike.${normalizedQuery}%`,
        `titleEnglish.ilike.${normalizedQuery}%`,
        `titleRomaji.ilike.${normalizedQuery}%`,
        ...(hiraganaQuery !== query ? [
          `titleJapanese.ilike.${hiraganaQuery}%`,
          `titleRomaji.ilike.${hiraganaQuery}%`
        ] : [])
      ].join(','))
      .order('popularity', { ascending: false, nullsFirst: false })
      .limit(20);

    // 優先度3: 部分一致
    const { data: partialMatches } = await supabase
      .from('Anime')
      .select('*')
      .or([
        `titleJapanese.ilike.%${query}%`,
        `titleEnglish.ilike.%${query}%`,
        `titleRomaji.ilike.%${query}%`,
        `titleJapanese.ilike.%${normalizedQuery}%`,
        `titleEnglish.ilike.%${normalizedQuery}%`,
        `titleRomaji.ilike.%${normalizedQuery}%`,
        ...(hiraganaQuery !== query ? [
          `titleJapanese.ilike.%${hiraganaQuery}%`,
          `titleRomaji.ilike.%${hiraganaQuery}%`
        ] : [])
      ].join(','))
      .order('popularity', { ascending: false, nullsFirst: false })
      .limit(20);

    // 重複を除去しながら優先順位順に結合
    const seenIds = new Set<string>();
    let animeResults: any[] = [];

    for (const anime of [...(exactMatches || []), ...(prefixMatches || []), ...(partialMatches || [])]) {
      if (!seenIds.has(anime.id)) {
        seenIds.add(anime.id);
        animeResults.push(anime);
        if (animeResults.length >= 20) break;
      }
    }

    let dataSource = 'database';

    // 2. DBに結果がない場合、外部APIから検索
    if (animeResults.length === 0) {
      console.log(`🌐 DBに「${query}」が見つかりません。AniList APIから取得中...`);

      const anilistResponse = await searchAnimeFromAniList(query, 20, page);

      if (anilistResponse && anilistResponse.data.Page.media.length > 0) {
        dataSource = 'anilist_api';
        console.log(`✅ AniList APIから${anilistResponse.data.Page.media.length}件取得`);

        // 3. 取得したデータをDBに保存
        const animeToSave = anilistResponse.data.Page.media.map(transformAniListToDbFormat);

        for (const anime of animeToSave) {
          try {
            // anilistId が既に存在するかチェック
            const { data: existing } = await supabase
              .from('Anime')
              .select('id, titleJapanese')
              .eq('anilistId', anime.anilistId)
              .single();

            if (!existing) {
              // 新規作成
              const { error: saveError } = await supabase
                .from('Anime')
                .insert(anime)
                .select()
                .single();

              if (saveError) {
                console.error(`保存エラー (${anime.titleJapanese}):`, saveError);
              } else {
                console.log(`✅ 新規保存: ${anime.titleJapanese}`);
              }
            } else {
              // 既存データを更新（titleJapaneseは既存のものを保持）
              const { error: updateError } = await supabase
                .from('Anime')
                .update({
                  ...anime,
                  titleJapanese: existing.titleJapanese || anime.titleJapanese,
                  lastSyncedAt: new Date().toISOString()
                })
                .eq('anilistId', anime.anilistId);

              if (!updateError) {
                console.log(`🔄 更新: ${anime.titleJapanese}`);
              }
            }
          } catch (error) {
            console.error('保存処理エラー:', error);
          }
        }

        // 4. 保存後、DBから再取得（IDを取得するため）
        const { data: newDbAnime } = await supabase
          .from('Anime')
          .select('*')
          .in('anilistId', anilistResponse.data.Page.media.map(a => a.id))
          .order('popularity', { ascending: false, nullsFirst: false });

        animeResults = newDbAnime || animeToSave;
      } else {
        console.log('❌ 外部APIからも結果が見つかりませんでした');
      }
    } else {
      console.log(`✅ DBから${animeResults.length}件取得`);
    }

    // 各アニメの配信プラットフォーム情報を取得
    const animeWithPlatforms = await Promise.all((animeResults || []).map(async (item) => {
      const { data: availability } = await supabase
        .from('Availability')
        .select(`
          *,
          Platform (
            name,
            displayName,
            logoUrl,
            websiteUrl,
            monthlyPrice,
            annualPrice,
            freeTrial,
            freeTrialDays
          )
        `)
        .eq('animeId', item.id);

      return {
        ...item,
        platforms: availability || []
      };
    }));

    return NextResponse.json({
      anime: animeWithPlatforms,
      count: animeWithPlatforms.length,
      dataSource,
      cached: dataSource === 'database',
      totalPages: Math.ceil(animeWithPlatforms.length / 20)
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}