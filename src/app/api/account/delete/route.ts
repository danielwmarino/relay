import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const admin = createAdminClient()

  // Delete in order: posts, follows, profile, then auth user
  await admin.from('posts').delete().eq('author_id', user.id)
  await admin.from('follows').delete().or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
  await admin.from('profiles').delete().eq('id', user.id)
  await admin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
