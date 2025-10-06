import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const animeId = searchParams.get('animeId');
    const platformId = searchParams.get('platformId');

    let query = supabase
      .from('Availability')
      .select(`
        *,
        Anime (*),
        Platform (*)
      `);

    if (animeId) {
      query = query.eq('animeId', animeId);
    }

    if (platformId) {
      query = query.eq('platformId', platformId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ availability: data });
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if availability already exists
    const { data: existing } = await supabase
      .from('Availability')
      .select('id')
      .eq('animeId', body.animeId)
      .eq('platformId', body.platformId)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('Availability')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('Availability')
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error creating/updating availability:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('Availability')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting availability:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}