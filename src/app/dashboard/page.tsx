import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserMenu from '@/components/auth/UserMenu'
import DashboardContent from '@/components/DashboardContent'

export default async function DashboardPage() {
  const supabase = createClient()

  // 認証チェック（getUser()を使用 - セッションは偽装可能なため使わない）
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-medium text-gray-900 transition-opacity hover:opacity-70 cursor-pointer">
              WhereToAnime
            </h1>
          </Link>
          <UserMenu user={user} />
        </nav>
      </header>

      <DashboardContent user={user} />
    </div>
  )
}