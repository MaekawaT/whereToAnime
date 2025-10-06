import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // SQL migration for adding external API fields
    const migrationSQL = `
      -- Add external API related columns to Anime table
      ALTER TABLE "Anime"
      ADD COLUMN IF NOT EXISTS "malId" INTEGER UNIQUE,
      ADD COLUMN IF NOT EXISTS "anilistId" INTEGER,
      ADD COLUMN IF NOT EXISTS "kitsuId" INTEGER,
      ADD COLUMN IF NOT EXISTS "score" DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS "popularity" INTEGER,
      ADD COLUMN IF NOT EXISTS "members" INTEGER,
      ADD COLUMN IF NOT EXISTS "source" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "season" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "year" INTEGER,
      ADD COLUMN IF NOT EXISTS "lastSyncedAt" TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS "dataSource" VARCHAR(20) DEFAULT 'manual';

      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_anime_mal_id ON "Anime"("malId");
      CREATE INDEX IF NOT EXISTS idx_anime_popularity ON "Anime"("popularity" DESC);
      CREATE INDEX IF NOT EXISTS idx_anime_year_season ON "Anime"("year", "season");

      -- Update RLS policies if needed
      DROP POLICY IF EXISTS "Allow public read access" ON "Anime";
      CREATE POLICY "Allow public read access"
      ON "Anime" FOR SELECT
      TO public
      USING (true);

      DROP POLICY IF EXISTS "Allow system write access" ON "Anime";
      CREATE POLICY "Allow system write access"
      ON "Anime" FOR INSERT
      TO public
      WITH CHECK (true);

      CREATE POLICY "Allow system update access"
      ON "Anime" FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
    `

    // Note: Direct SQL execution needs to be done in Supabase Dashboard
    // Return the SQL for manual execution
    return NextResponse.json({
      success: true,
      message: 'Please run the following SQL in your Supabase Dashboard SQL editor:',
      sql: migrationSQL,
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Create a new query',
        '4. Paste the SQL above',
        '5. Click "Run"'
      ]
    })

  } catch (error) {
    console.error('Migration preparation error:', error)
    return NextResponse.json(
      { error: 'Migration preparation failed', details: error },
      { status: 500 }
    )
  }
}