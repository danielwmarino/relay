import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Edit profile</h1>
      <EditProfileForm profile={profile} />
    </main>
  )
}
