import { Suspense } from 'react'
import AnimeComparison from '@/components/AnimeComparison'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ title?: string }>
}

export default async function AnimePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { title } = await searchParams

  return (
    <div className="min-h-screen bg-[#0b1622]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b1622]/95 backdrop-blur-xl border-b border-[#1f2937]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl font-semibold text-white hover:opacity-80 transition-opacity">
              WhereToAnime
            </a>
            <a
              href="/"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              ← 戻る
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-gray-400">読み込み中...</div>
            </div>
          }
        >
          <AnimeComparison animeId={id} animeTitle={title} />
        </Suspense>
      </main>
    </div>
  )
}
