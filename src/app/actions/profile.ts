'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const displayName = (formData.get('display_name') as string).trim()
  const bio = (formData.get('bio') as string).trim()
  const newUsername = (formData.get('username') as string).trim().toLowerCase()
  const avatarFile = formData.get('avatar') as File | null

  if (!newUsername || !/^[a-z0-9_]+$/.test(newUsername)) {
    return { error: 'Username can only contain letters, numbers, and underscores' }
  }

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

  // Check username is not taken by someone else
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', newUsername)
    .neq('id', user.id)
    .single()

  if (existing) return { error: 'Username is already taken' }

  // Get old username to revalidate old profile path
  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const updates: Record<string, string> = { display_name: displayName, bio, username: newUsername }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  if (oldProfile) revalidatePath(`/u/${oldProfile.username}`)
  revalidatePath(`/u/${newUsername}`)
  revalidatePath('/settings')

  return { success: true }
}
