import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get anime details with availability information
    const { data: anime, error: animeError } = await supabase
      .from('Anime')
      .select(`
        *,
        Availability (
          *,
          Platform (*)
        )
      `)
      .eq('id', id)
      .single();

    if (animeError || !anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedAnime = {
      id: anime.id,
      titleJapanese: anime.titleJapanese,
      titleEnglish: anime.titleEnglish,
      titleRomaji: anime.titleRomaji,
      synopsis: anime.synopsis,
      imageUrl: anime.imageUrl,
      episodes: anime.episodes,
      status: anime.status,
      releaseYear: anime.releaseYear,
      genres: anime.genres,
      malId: anime.malId,
      anilistId: anime.anilistId,
      platforms: anime.Availability?.map((avail: any) => ({
        id: avail.Platform.id,
        name: avail.Platform.name,
        displayName: avail.Platform.displayName,
        logoUrl: avail.Platform.logoUrl,
        websiteUrl: avail.Platform.websiteUrl,
        monthlyPrice: avail.Platform.monthlyPrice,
        annualPrice: avail.Platform.annualPrice,
        freeTrial: avail.Platform.freeTrial,
        freeTrialDays: avail.Platform.freeTrialDays,
        affiliateUrl: avail.Platform.affiliateUrl,
        availableEpisodes: avail.availableEpisodes,
        hasSub: avail.hasSub,
        hasDub: avail.hasDub,
        expirationDate: avail.expirationDate,
        directUrl: avail.directUrl,
        lastChecked: avail.lastChecked
      })) || []
    };

    return NextResponse.json(formattedAnime);
  } catch (error) {
    console.error('Anime Details API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('Anime')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating anime:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('Anime')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting anime:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}