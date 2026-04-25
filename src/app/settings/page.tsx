import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from './EditProfileForm'

export const dynamic = 'force-dynamic'

const ADMIN_ID = '321bcceb-f1c5-497b-938c-83f321b2a60a'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url, is_company, monitor_code, monitor_url, check_interval_minutes, down_check_interval_minutes, post_delete_hours, is_private')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  return (
    <main className="max-w-[400px] mx-auto px-4 py-8">
      <Link href="/feed" className="text-sm text-gray-400 hover:text-white">← Home</Link>
      <h1 className="text-xl font-bold mt-4 mb-6">Edit profile</h1>
<EditProfileForm profile={profile} isAdmin={user.id === ADMIN_ID} />
    </main>
  )
}
