'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const displayName = (formData.get('display_name') as string).trim()
  const bio = (formData.get('bio') as string).trim()
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl: string | undefined

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop()
    const path = `${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // Cache-bust so the browser shows the new image immediately
    avatarUrl = `${publicUrl}?t=${Date.now()}`
  }

  const updates: Record<string, string> = { display_name: displayName, bio }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  // Get username to revalidate the right profile page
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile) revalidatePath(`/u/${profile.username}`)
  revalidatePath('/settings')

  return { success: true }
}
