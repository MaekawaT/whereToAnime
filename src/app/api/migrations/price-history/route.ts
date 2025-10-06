import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Create PriceHistory table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS "PriceHistory" (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          "platformId" UUID NOT NULL REFERENCES "Platform"(id) ON DELETE CASCADE,
          "oldMonthlyPrice" INTEGER,
          "newMonthlyPrice" INTEGER NOT NULL,
          "oldAnnualPrice" INTEGER,
          "newAnnualPrice" INTEGER,
          "changeType" VARCHAR(20) NOT NULL CHECK ("changeType" IN ('increase', 'decrease', 'no_change')),
          "changeDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "percentageChange" DECIMAL(5,2),
          "createdAt" TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add index for faster queries
        CREATE INDEX IF NOT EXISTS idx_price_history_platform
        ON "PriceHistory"("platformId", "changeDate" DESC);

        -- Add lastPriceCheck column to Platform table if not exists
        ALTER TABLE "Platform"
        ADD COLUMN IF NOT EXISTS "lastPriceCheck" TIMESTAMPTZ DEFAULT NOW();
      `
    })

    if (createTableError) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('Creating PriceHistory table with direct query...')

      // Note: Supabase doesn't allow direct DDL through the client
      // This would need to be run in Supabase Dashboard SQL editor
      return NextResponse.json({
        warning: 'Please run the following SQL in Supabase Dashboard:',
        sql: `
CREATE TABLE IF NOT EXISTS "PriceHistory" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "platformId" UUID NOT NULL REFERENCES "Platform"(id) ON DELETE CASCADE,
  "oldMonthlyPrice" INTEGER,
  "newMonthlyPrice" INTEGER NOT NULL,
  "oldAnnualPrice" INTEGER,
  "newAnnualPrice" INTEGER,
  "changeType" VARCHAR(20) NOT NULL CHECK ("changeType" IN ('increase', 'decrease', 'no_change')),
  "changeDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "percentageChange" DECIMAL(5,2),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_platform
ON "PriceHistory"("platformId", "changeDate" DESC);

ALTER TABLE "Platform"
ADD COLUMN IF NOT EXISTS "lastPriceCheck" TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS
ALTER TABLE "PriceHistory" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for read access
CREATE POLICY "Allow public read access to price history"
ON "PriceHistory" FOR SELECT
TO public
USING (true);

-- Create RLS policy for insert (system only)
CREATE POLICY "Allow system insert to price history"
ON "PriceHistory" FOR INSERT
TO public
WITH CHECK (true);
        `
      })
    }

    // If table creation succeeded, let's insert some sample data
    const { data: platforms } = await supabase
      .from('Platform')
      .select('id, name, monthlyPrice')
      .limit(3)

    if (platforms && platforms.length > 0) {
      const sampleHistory = platforms.map(platform => ({
        platformId: platform.id,
        oldMonthlyPrice: platform.monthlyPrice,
        newMonthlyPrice: platform.monthlyPrice,
        changeType: 'no_change',
        changeDate: new Date().toISOString(),
        percentageChange: 0
      }))

      const { error: insertError } = await supabase
        .from('PriceHistory')
        .insert(sampleHistory)

      if (insertError) {
        console.log('Sample data insertion skipped:', insertError.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'PriceHistory table migration completed'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    )
  }
}