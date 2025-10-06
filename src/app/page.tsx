import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserMenu from '@/components/auth/UserMenu'
import ClientHome from '@/components/ClientHome'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#0b1622] text-gray-100">
      <header className="border-b border-[#1f2937] bg-[#0b1622]/95 backdrop-blur-xl sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="group">
            <h1 className="text-2xl font-semibold text-white transition-opacity hover:opacity-80">
              WhereToAnime
            </h1>
          </Link>
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-[#1f2937]">
                  Dashboard
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-[#1f2937]">
                  ログイン
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  新規登録
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <ClientHome />
    </div>
  )
}