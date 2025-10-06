import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Price configuration for platforms (in JPY)
const PLATFORM_PRICES = {
  crunchyroll: {
    monthly: 1025,
    annual: 10800,
    freeTrial: true,
    freeTrialDays: 14
  },
  netflix: {
    monthly: 1490,
    annual: null,
    freeTrial: false,
    freeTrialDays: 0
  },
  'amazon-prime': {
    monthly: 600,
    annual: 5900,
    freeTrial: true,
    freeTrialDays: 30
  },
  'disney-plus': {
    monthly: 990,
    annual: 9900,
    freeTrial: false,
    freeTrialDays: 0
  },
  hulu: {
    monthly: 1026,
    annual: null,
    freeTrial: true,
    freeTrialDays: 14
  },
  'u-next': {
    monthly: 2189,
    annual: null,
    freeTrial: true,
    freeTrialDays: 31
  },
  'dazn': {
    monthly: 4200,
    annual: 32000,
    freeTrial: false,
    freeTrialDays: 0
  },
  'abema-premium': {
    monthly: 960,
    annual: null,
    freeTrial: true,
    freeTrialDays: 14
  }
}

interface PriceHistory {
  id?: string
  platformId: string
  oldMonthlyPrice: number | null
  newMonthlyPrice: number
  oldAnnualPrice: number | null
  newAnnualPrice: number | null
  changeDate: string
  changeType: 'increase' | 'decrease' | 'no_change'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get all platforms from database
    const { data: platforms, error: platformsError } = await supabase
      .from('Platform')
      .select('*')

    if (platformsError) {
      return NextResponse.json(
        { error: 'プラットフォーム情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    const priceChanges: PriceHistory[] = []
    const updates: any[] = []

    // Check each platform for price changes
    for (const platform of platforms) {
      const currentPrices = PLATFORM_PRICES[platform.name as keyof typeof PLATFORM_PRICES]

      if (!currentPrices) continue

      // Check if prices have changed
      const monthlyChanged = platform.monthlyPrice !== currentPrices.monthly
      const annualChanged = platform.annualPrice !== currentPrices.annual

      if (monthlyChanged || annualChanged) {
        // Determine change type
        let changeType: 'increase' | 'decrease' | 'no_change' = 'no_change'
        if (monthlyChanged) {
          changeType = currentPrices.monthly > platform.monthlyPrice ? 'increase' : 'decrease'
        }

        // Record price history
        priceChanges.push({
          platformId: platform.id,
          oldMonthlyPrice: platform.monthlyPrice,
          newMonthlyPrice: currentPrices.monthly,
          oldAnnualPrice: platform.annualPrice,
          newAnnualPrice: currentPrices.annual,
          changeDate: new Date().toISOString(),
          changeType
        })

        // Prepare update
        updates.push({
          id: platform.id,
          monthlyPrice: currentPrices.monthly,
          annualPrice: currentPrices.annual,
          freeTrial: currentPrices.freeTrial,
          freeTrialDays: currentPrices.freeTrialDays,
          lastPriceCheck: new Date().toISOString()
        })
      }
    }

    // Apply updates if there are any changes
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('Platform')
          .update({
            monthlyPrice: update.monthlyPrice,
            annualPrice: update.annualPrice,
            freeTrial: update.freeTrial,
            freeTrialDays: update.freeTrialDays,
            lastPriceCheck: update.lastPriceCheck
          })
          .eq('id', update.id)

        if (updateError) {
          console.error('価格更新エラー:', updateError)
        }
      }

      // Store price history in database
      const historyRecords = priceChanges.map(change => ({
        platformId: change.platformId,
        oldMonthlyPrice: change.oldMonthlyPrice,
        newMonthlyPrice: change.newMonthlyPrice,
        oldAnnualPrice: change.oldAnnualPrice,
        newAnnualPrice: change.newAnnualPrice,
        changeType: change.changeType,
        changeDate: change.changeDate,
        percentageChange: change.oldMonthlyPrice
          ? ((change.newMonthlyPrice - change.oldMonthlyPrice) / change.oldMonthlyPrice * 100).toFixed(2)
          : 0
      }))

      if (historyRecords.length > 0) {
        const { error: historyError } = await supabase
          .from('PriceHistory')
          .insert(historyRecords)

        if (historyError) {
          console.error('価格履歴保存エラー:', historyError)
          // Continue even if history fails - price update is more important
        } else {
          console.log(`価格変更履歴を保存しました: ${historyRecords.length}件`)
        }
      }
    }

    // Update last check timestamp for all platforms
    const { error: timestampError } = await supabase
      .from('Platform')
      .update({ lastPriceCheck: new Date().toISOString() })
      .in('id', platforms.map(p => p.id))

    if (timestampError) {
      console.error('タイムスタンプ更新エラー:', timestampError)
    }

    return NextResponse.json({
      success: true,
      checked: platforms.length,
      updated: updates.length,
      changes: priceChanges,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('価格チェックエラー:', error)
    return NextResponse.json(
      { error: '価格チェック中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// POST endpoint to trigger manual price check
export async function POST(request: NextRequest) {
  return GET(request)
}