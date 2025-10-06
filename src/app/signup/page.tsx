import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage() {
  const supabase = createClient()

  // すでにログイン済みの場合はダッシュボードへリダイレクト
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <h1 className="text-3xl font-medium text-gray-900 mb-2 transition-opacity hover:opacity-70">
              WhereToAnime
            </h1>
          </Link>
          <h2 className="text-2xl font-medium mt-8">新規登録</h2>
          <p className="mt-2 text-gray-600 font-light">
            アカウントを作成して始めましょう
          </p>
        </div>

        <SignupForm />

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-gray-900 hover:text-gray-700 font-medium underline underline-offset-2">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}