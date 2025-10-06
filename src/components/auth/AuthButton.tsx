import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserMenu from './UserMenu'

export default async function AuthButton() {
  const supabase = createClient()

  // getUser()を使用して認証状態を確認（getSession()は偽装可能なため使わない）
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return <UserMenu user={user} />
  }

  return (
    <div className="flex gap-4">
      <Link
        href="/login"
        className="px-4 py-2 text-gray-300 hover:text-white transition"
      >
        ログイン
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        新規登録
      </Link>
    </div>
  )
}