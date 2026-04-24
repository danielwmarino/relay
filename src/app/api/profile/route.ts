import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const formData = await request.formData()
  const displayName = (formData.get('display_name') as string ?? '').trim()
  const bio = (formData.get('bio') as string ?? '').trim()
  const newUsername = (formData.get('username') as string ?? '').trim().toLowerCase()
  const avatarFile = formData.get('avatar') as File | null

  if (!newUsername || !/^[a-z0-9_]+$/.test(newUsername)) {
    return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', newUsername)
    .neq('id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })

  let avatarUrl: string | undefined

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop()
    const path = `${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    avatarUrl = `${publicUrl}?t=${Date.now()}`
  }

  const updates: Record<string, string> = { display_name: displayName, bio, username: newUsername }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, username: newUsername })
}
