import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// This route is designed to be called by a cron job service
// like Vercel Cron, GitHub Actions, or external services

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication for cron job
    const headersList = headers()
    const cronSecret = headersList.get('x-cron-secret')

    // In production, verify the secret
    if (process.env.NODE_ENV === 'production' && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call the price check API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/prices/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Price check failed: ${response.statusText}`)
    }

    const result = await response.json()

    // Log the result for monitoring
    console.log(`[CRON] Price check completed at ${new Date().toISOString()}`)
    console.log(`[CRON] Checked: ${result.checked}, Updated: ${result.updated}`)

    // Send notification if there are price changes
    if (result.updated > 0 && result.changes) {
      await notifyPriceChanges(result.changes)
    }

    return NextResponse.json({
      success: true,
      message: 'Price check cron job completed',
      timestamp: new Date().toISOString(),
      result
    })

  } catch (error) {
    console.error('[CRON] Price check error:', error)
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function notifyPriceChanges(changes: any[]) {
  // Here you can implement notification logic
  // For example: send email, push notification, or webhook

  for (const change of changes) {
    if (change.changeType === 'increase') {
      console.log(`[PRICE ALERT] Platform ${change.platformId} increased from ¥${change.oldMonthlyPrice} to ¥${change.newMonthlyPrice}`)
    } else if (change.changeType === 'decrease') {
      console.log(`[PRICE ALERT] Platform ${change.platformId} decreased from ¥${change.oldMonthlyPrice} to ¥${change.newMonthlyPrice}`)
    }
  }

  // In production, you might:
  // - Send email to subscribed users
  // - Post to Slack/Discord
  // - Update a notification database table
}

// Vercel Cron configuration (add to vercel.json):
/*
{
  "crons": [
    {
      "path": "/api/cron/price-check",
      "schedule": "0 2 * * *"  // Daily at 2 AM UTC
    }
  ]
}
*/

// For local development/testing
export async function POST(request: NextRequest) {
  return GET(request)
}