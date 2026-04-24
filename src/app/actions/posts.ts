'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, refresh } from 'next/cache'

export async function createPost(formData: FormData) {
  const content = (formData.get('content') as string)?.trim()

  if (!content || content.length > 500) return { error: 'Content missing or too long' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not logged in' }

  // Auto-create profile if the trigger missed it (e.g. Google OAuth edge case)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const username = (user.email ?? user.id).split('@')[0].replace(/[^a-z0-9_]/gi, '_')
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      username,
      display_name: user.user_metadata?.full_name ?? username,
    })
    if (profileError) return { error: `Profile error: ${profileError.message}` }
  }

  const { error } = await supabase.from('posts').insert({ content, author_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/feed')
  refresh()
  return { success: true }
}
