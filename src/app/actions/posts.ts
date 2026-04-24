'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const content = (formData.get('content') as string).trim()

  if (!content || content.length > 500) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) return

  await supabase.from('posts').insert({ content, author_id: user.id })

  revalidatePath('/feed')
}
