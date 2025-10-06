import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
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
          <h2 className="text-2xl font-medium mt-8">ログイン</h2>
          <p className="mt-2 text-gray-600 font-light">
            アカウントにログインしてください
          </p>
        </div>

        <LoginForm />

        <div className="text-center space-y-2">
          <p className="text-gray-600 text-sm">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-gray-900 hover:text-gray-700 font-medium underline underline-offset-2">
              新規登録
            </Link>
          </p>
          <p className="text-gray-600">
            <Link href="/forgot-password" className="text-gray-900 hover:text-gray-700 text-sm underline underline-offset-2">
              パスワードをお忘れの方
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}