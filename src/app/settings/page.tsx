import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from './EditProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  return (
    <main className="max-w-[400px] mx-auto px-4 py-8">
      <Link href="/feed" className="text-sm text-gray-400 hover:text-white">← Home</Link>
      <h1 className="text-xl font-bold mt-4 mb-6">Edit profile</h1>
      <EditProfileForm profile={profile} />
    </main>
  )
}
