# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhereToAnime is an anime streaming platform aggregator that helps users find where to watch their favorite anime across multiple streaming services. The project aims to solve the fragmentation problem in anime streaming by providing a unified search interface with price comparison and platform availability information.

## Core Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint checks

# Database (when configured)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio GUI
```

## Architecture & Key Technologies

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with dark theme as default
- **State Management**: Zustand (installed, not yet implemented)
- **Database**: Prisma ORM with PostgreSQL (via Supabase - not yet configured)
- **Authentication**: NextAuth.js with Prisma adapter (installed, not yet configured)
- **Payments**: Stripe (installed, not yet configured)
- **UI Icons**: Lucide React

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - Reusable React components
- `@/` - Path alias for `/src/` directory

### Current Implementation Status

**Completed:**
- Landing page with Claude-style light design
- Full authentication system with Supabase Auth
- SearchBar component with autocomplete functionality
- SearchResults component with price comparison
- PlatformGrid component showing supported streaming platforms
- FeaturedAnime component displaying trending anime
- Dashboard with JustWatch-style layout
- User menu and session management
- Responsive design across all pages
- **NewEpisodes component** - ウォッチリストの新エピソード通知機能
- **TrailerPlayer component** - YouTube動画埋め込みプレイヤー
- オートコンプリートのz-index問題修正（Stacking Context対応）
- **TMDB API Integration** - 配信情報取得（JustWatchデータ powered）
- **AniList API Integration** - TMDBで見つからないアニメのフォールバック、最新アニメ対応

**Pending (per requirements document):**
- Database configuration with anime data
- API routes for anime search (partially implemented with Jikan + TMDB + AniList)
- Stripe payment integration for premium features
- External API integrations (MyAnimeList - pending)
- Affiliate link tracking
- Caching layer for TMDB/JustWatch data
- Premium features implementation

**Design Documentation:**
- See `/docs/screen-design.md` for detailed UI specifications

## Detailed Requirements (from wheretoanime_requirements.md)

### Business Context
- **Problem**: Funimation closure left 60,000+ minutes of content missing, platform fragmentation makes it hard to find where anime is available
- **Target Users**: English-speaking anime fans aged 18-35 who use multiple streaming services
- **Solution**: Unified search across all platforms with price comparison and optimal platform recommendations

### MVP Core Features
1. **Anime Search**
   - English/Japanese title support
   - Autocomplete functionality
   - Search history (premium feature)

2. **Price Comparison**
   - Real-time pricing updates
   - Free trial information
   - Annual vs monthly plan comparison

3. **Availability Display**
   - Episode count per platform
   - Subtitle/dub availability
   - Expiration dates
   - Missing episode warnings

### Monetization Strategy
1. **Affiliate Revenue** (Primary)
   - Crunchyroll: $15-25 per signup
   - Netflix: $20-35 per signup
   - VPN services: $30-50 per signup
   - Amazon Prime: $10-15 per signup

2. **Premium Tier** ($4.99/month)
   - Price change alerts
   - Unlimited searches
   - Advanced filters
   - API access
   - Ad-free experience

### Revenue Projections
- **3 months**: 2,000 users → $2,399/month
- **6 months**: 8,000 users → $5,700/month
- **12 months**: 25,000 users → $16,000/month

### Performance Requirements
- Search results: <0.3 seconds
- Page load: <2 seconds
- Concurrent users: 1,000+
- Uptime: 99.5%
- Mobile-first responsive design

### Development Roadmap
**Phase 1 (Weeks 1-6)**: MVP with manual data entry
**Phase 2 (Weeks 7-10)**: Affiliate integration & premium features
**Phase 3 (Weeks 11-18)**: Automation & engagement features

### External API Integrations
- **Anime Data**: MyAnimeList API, AniList API, TMDB API (all free tier)
- **Streaming Availability**: JustWatch API ($50-100/month) or manual updates initially

### Marketing Strategy
- **SEO**: Target keywords like "where to watch [anime name]", "anime streaming platforms"
- **Communities**: Reddit (r/anime, r/Crunchyroll), Discord anime servers, Twitter/X (#AnimeStreaming)
- **Content**: Weekly blog posts, platform comparisons, new release information

## Supabase Auth Implementation (Next.js App Router)

### Setup Commands
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Key Implementation Files

1. **Create Supabase Client for Server Components** (`/lib/supabase/server.ts`):
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

2. **Create Supabase Client for Client Components** (`/lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

3. **Middleware for Session Management** (`/middleware.ts`):
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Authentication Patterns

**Server Components** (Preferred for initial auth state):
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return user ? <Dashboard user={user} /> : <LoginForm />
}
```

**Client Components** (For interactive auth):
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function LoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  return <button onClick={handleLogin}>Login</button>
}
```

### Server Actions for Auth
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Protected Routes Pattern
```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Protected content here
}
```

### Supabase認証ベストプラクティス (重要)

#### セキュリティ要件
- **⚠️ 絶対に`supabase.auth.getSession()`を信用しない** - セッションは偽装可能
- **✅ 必ず`supabase.auth.getUser()`を使用する** - Supabaseでトークンを検証
- **Cookie名**: `sb-<project_ref>-auth-token` (フレームワーク非依存)
- **サーバー検証**: 保護されたコンテンツを表示する前に必ずサーバーでユーザーを検証

#### 実装ガイドライン

**1. セッション検証パターン**
```typescript
// ❌ 間違い - 絶対にこれをしない
const { data: { session } } = await supabase.auth.getSession()
if (session) { /* これを信用してはいけない */ }

// ✅ 正解 - 必ずこれを使う
const { data: { user }, error } = await supabase.auth.getUser()
if (user && !error) { /* 安全に処理を進める */ }
```

**2. クライアント作成ルール**
- **Server Components**: リクエストごとに新しいクライアントを作成（軽量）
- **Client Components**: ブラウザクライアントにシングルトンパターンを使用
- **Middleware**: ルート実行前にトークンリフレッシュを処理する必要がある

**3. キャッシュの考慮事項**
```typescript
// Next.jsのキャッシュを無効化するためSupabase呼び出し前にcookies()を呼ぶ
import { cookies } from 'next/headers'

export async function getAuthUser() {
  cookies() // キャッシュを無効化
  const supabase = createClient()
  return await supabase.auth.getUser()
}
```

**4. エラーハンドリングパターン**
```typescript
const { data: { user }, error } = await supabase.auth.getUser()

if (error) {
  console.error('認証エラー:', error.message)
  redirect('/login')
}

if (!user) {
  redirect('/login')
}
```

**5. Middleware必須要件**
- 期限切れトークンを自動的にリフレッシュ
- すべてのルートリクエストの前に実行
- サーバーとクライアント両方のCookieを更新
- 静的アセット以外のすべてのルートにマッチする必要がある

**6. パフォーマンス最適化**
- リクエストごとにクライアントを作成（軽量なため）
- ブラウザクライアントはシングルトン使用
- Middlewareで自動トークンリフレッシュを活用
- `cookies()`呼び出しなしで認証データをキャッシュしない

**7. 避けるべきよくある間違い**
- ❌ クライアントサイドのセッションデータを信用する
- ❌ 認可に`getSession()`を使用する
- ❌ 認証チェック前に`cookies()`を呼び忘れる
- ❌ 適切なエラー境界を実装しない
- ❌ 認証状態を考慮せずにユーザーデータをキャッシュする
- ❌ Middleware設定を忘れる

**8. 認証フローのテスト項目**
- 期限切れトークンでテスト
- 無効なトークンでテスト
- Cookie操作の試みをテスト
- すべての保護されたルートでMiddlewareが実行されることを確認
- 未認証ユーザーの適切なリダイレクトを確認

## TMDB API Integration (Streaming Availability Data)

### Overview
WhereToAnime uses TMDB (The Movie Database) API to fetch real-time streaming availability data powered by JustWatch. This provides accurate, up-to-date information about where anime can be watched across different platforms.

### Setup

**Environment Variables:**
```env
TMDB_API_KEY="your_api_key_here"
NEXT_PUBLIC_TMDB_API_KEY="your_api_key_here"  # For client-side usage
```

**Get API Key:**
1. Sign up at https://www.themoviedb.org/signup
2. Go to https://www.themoviedb.org/settings/api
3. Request API Key → Select "Developer"
4. Fill in application details (see details in code comments)
5. Copy the API Key (v3 auth)

### Implementation

**Utility Functions** (`/src/lib/tmdb.ts`):
- `searchAnimeOnTMDB(title: string)` - Search for anime by title, returns TMDB ID
- `getStreamingAvailability(tmdbId: number, countryCode: string)` - Get streaming platforms for a TV show
- `getStreamingAvailabilityByTitle(title: string, countryCode: string)` - Combined search and availability fetch

**API Endpoint** (`/src/app/api/tmdb/streaming/route.ts`):
- `GET /api/tmdb/streaming?title={anime_title}&country={country_code}`
- Returns array of platform objects with pricing and availability info

**Data Flow:**
1. User searches for anime or clicks "価格を比較"
2. `AnimeComparison` component checks database for availability data
3. If database has no platforms → Call TMDB API
4. TMDB API searches anime by Japanese title
5. Fetches watch providers (powered by JustWatch)
6. Maps provider IDs to platform details with pricing
7. Displays streaming availability on comparison page

**Provider Mapping:**
```typescript
const PROVIDER_MAPPING = {
  9: 'Amazon Prime Video',
  8: 'Netflix',
  283: 'Crunchyroll',
  337: 'Disney Plus',
  // ... see /src/lib/tmdb.ts for full list
}
```

### Features

✅ **Free API** - No cost for personal/commercial use
✅ **JustWatch Data** - Powered by world's largest streaming database
✅ **Daily Updates** - Fresh data updated every 24 hours
✅ **600+ Services** - Coverage across 140+ countries
✅ **Proper Attribution** - "Powered by JustWatch" credit displayed

### Limitations & Considerations

- TMDB doesn't provide subtitle/dub information (defaults: hasSub=true, hasDub=false)
- Episode counts may not be accurate for all platforms
- Free trial information not always available from TMDB
- Rate limits apply (40 requests per 10 seconds for free tier)

### Important Notes

⚠️ **No Mock Data** - Previous mock platform data has been removed to ensure accuracy
⚠️ **Attribution Required** - Must display "Powered by JustWatch" or link to JustWatch
⚠️ **Caching Recommended** - Implement caching layer to reduce API calls and improve performance

### Future Improvements

- Implement Redis/database caching for TMDB results
- ~~Add fallback to other streaming APIs if TMDB fails~~ ✅ **COMPLETED** - AniList API added as fallback
- Enhance provider mapping with more platforms
- Add support for movie streaming availability
- Implement webhook for automatic data updates

## AniList API Integration (Fallback for Latest Anime)

### Overview
AniList APIは、TMDBで見つからない最新アニメや未放送アニメの配信情報を取得するためのフォールバックとして統合されています。完全無料でアニメ特化のデータベースを提供し、GraphQLで柔軟なクエリが可能です。

### Setup

**環境変数:**
不要 - AniList APIは認証なしで使用可能

**API Endpoint:**
- GraphQL: `https://graphql.anilist.co`
- 公式ドキュメント: https://anilist.gitbook.io/anilist-apiv2-docs

### Implementation

**Utility Functions** (`/src/lib/anilist.ts`):
- `searchAnimeOnAniList(title: string)` - アニメをタイトルで検索（日本語・英語・ローマ字対応）
- `extractStreamingPlatforms(anime: AniListAnime)` - 外部リンクからプラットフォーム情報を抽出
- `getStreamingAvailabilityFromAniList(title: string)` - 検索と抽出を一度に実行

**API Endpoint** (`/src/app/api/anilist/streaming/route.ts`):
- `GET /api/anilist/streaming?title={anime_title}`
- PriceComparisonTable互換の形式で配列を返す

**Data Flow (フォールバック戦略):**
```
1. Database → プラットフォーム情報を検索
   ↓ 見つからない場合
2. Jikan API → アニメ基本情報を取得
   ↓ プラットフォーム情報なし
3. TMDB API → 日本語タイトルで検索
   ↓ 見つからない場合
4. TMDB API → 英語タイトルで検索
   ↓ 見つからない場合
5. TMDB API → デフォルトタイトルで検索
   ↓ 見つからない場合
6. AniList API → 日本語タイトルで検索 ✨ NEW
   ↓ 見つからない場合
7. AniList API → 英語タイトルで検索 ✨ NEW
   ↓ 見つからない場合
8. AniList API → デフォルトタイトルで検索 ✨ NEW
   ↓ 見つからない場合
9. "プラットフォーム情報はありません"を表示
```

### GraphQL Query Example

```graphql
query ($search: String) {
  Media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
    id
    title {
      romaji
      english
      native
    }
    season
    seasonYear
    episodes
    status
    externalLinks {
      site
      url
    }
    streamingEpisodes {
      title
      url
      site
    }
  }
}
```

### Platform Mapping

```typescript
const platformMapping = {
  'Crunchyroll': { monthlyPrice: 1180, annualPrice: 11800 },
  'Netflix': { monthlyPrice: 990 },
  'Hulu': { monthlyPrice: 1026 },
  'Amazon Prime Video': { monthlyPrice: 600, annualPrice: 5900 },
  'Disney Plus': { monthlyPrice: 990, annualPrice: 9900 },
  'Adult Swim': { monthlyPrice: 0 }, // 無料
}
```

### Features

✅ **完全無料** - 認証不要、API keyも不要
✅ **アニメ特化** - アニメに特化したデータベース
✅ **GraphQL** - 柔軟なクエリで必要なデータのみ取得
✅ **最新アニメ対応** - 未放送アニメも登録されている（例: ワンパンマン シーズン3, 2025年秋放送予定）
✅ **外部リンク** - Netflix, Crunchyroll, Huluなど主要プラットフォームへの直リンク
✅ **多言語タイトル** - 日本語・英語・ローマ字すべてに対応

### Verified Examples

**成功例（2025年未放送アニメ）:**
- ワンパンマン シーズン3（One Punch Man 3）
  - Status: NOT_YET_RELEASED
  - Season: 2025年秋
  - Platforms: Netflix, Hulu, Crunchyroll

### Limitations

- 価格情報なし（手動マッピングで対応）
- 字幕/吹替情報なし（デフォルト: hasSub=true, hasDub=false）
- 未放送アニメはstreamingEpisodesが空
- 日本特化のプラットフォームは少ない（主に海外サービス）

### Integration Points

**AnimeComparison.tsx:**
- データベース検索後、プラットフォームが0件の場合にTMDB → AniListの順でフォールバック
- Jikan API経由の場合も同様のフォールバック戦略を適用
- 複数タイトル形式（日本語・英語・デフォルト）で順次検索

### Future Improvements

- MyAnimeList APIとの統合検討
- プラットフォーム価格の自動更新機能
- 日本向けプラットフォーム（dアニメストア、ABEMAなど）の追加
- キャッシュ機能の実装でAPI呼び出し削減

## Database Schema (To Be Implemented)

The project will use these main tables:
- `anime` - Anime titles and metadata
- `platforms` - Streaming service information
- `availability` - Which anime is available on which platform
- `users` - User accounts for premium features
- `click_tracking` - Affiliate link analytics
- `price_alerts` - Premium feature for price notifications

## Development Notes

1. The project uses Next.js App Router - all pages should be in `/src/app/` with `page.tsx` files
2. Components should be client-side ('use client') only when necessary for interactivity
3. The landing page currently uses placeholder data - real data integration pending
4. Default port is 3000, but will use 3001 if occupied
5. Metadata in layout.tsx needs updating to reflect WhereToAnime branding

## Next.js Best Practices (MUST FOLLOW)

### Component Architecture
- **Server Components by default** - Only use 'use client' when you need:
  - Browser APIs (onClick, onChange, useEffect, useState)
  - Third-party libraries that require client-side rendering
- **Data Fetching** - Fetch data in Server Components using async/await
- **Client Components** - Keep them as small as possible, push client boundaries down the tree

### File Structure & Routing
- Use **colocation** - Keep components, styles, and tests close to where they're used
- **Route Groups** with `(folder)` for organization without affecting URL structure
- **Loading States** - Always provide `loading.tsx` for async operations
- **Error Boundaries** - Include `error.tsx` for error handling per route
- **Metadata** - Export metadata from `layout.tsx` or `page.tsx` for SEO

### Performance Optimization
- **Image Optimization** - Always use `next/image` with proper width/height
- **Font Optimization** - Use `next/font` for automatic font optimization
- **Dynamic Imports** - Use `dynamic()` for code splitting when appropriate
- **Parallel Routes** - Use `@folder` notation for simultaneous route rendering
- **Streaming** - Utilize React Suspense with loading.tsx for progressive rendering

### Data Fetching Patterns
- **Fetch at the lowest level** - Fetch data where it's used, not at the root
- **Request Memoization** - Next.js automatically dedupes identical fetch requests
- **Revalidation** - Use `revalidate` option or `revalidatePath`/`revalidateTag` for cache updates
- **Server Actions** - Use for form submissions and mutations (mark with 'use server')

### Caching Strategy
- **Static by default** - Pages are statically generated unless they use dynamic functions
- **Dynamic Functions** - `cookies()`, `headers()`, `searchParams` make routes dynamic
- **Cache Control** - Use `export const revalidate = number` for time-based revalidation
- **On-demand Revalidation** - Use `revalidatePath()` or `revalidateTag()` in Server Actions

### Security & Environment
- **Environment Variables** - Server-only by default, prefix with `NEXT_PUBLIC_` for client exposure
- **API Routes** - Use Route Handlers in `app/api/[route]/route.ts`
- **Middleware** - Use `middleware.ts` for authentication, redirects, and rewrites
- **CSP Headers** - Configure Content Security Policy in `next.config.mjs`

### TypeScript Integration
- **Type Safety** - Use proper types for params, searchParams, and metadata
- **Generated Types** - Utilize Next.js generated types from `next/navigation`
- **Async Server Components** - Type as `async function Component(): Promise<JSX.Element>`

### Common Patterns to Avoid
- ❌ Don't use 'use client' unnecessarily - it increases bundle size
- ❌ Don't fetch data in layouts - they don't re-render on navigation
- ❌ Avoid nested layouts fetching same data - use React context or props
- ❌ Don't use router.push() in Server Components - use Link or redirect()
- ❌ Avoid client-side data fetching when server-side is possible