import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { content } = await request.json()

  if (!content?.trim() || content.length > 140) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  const { error } = await supabase
    .from('posts')
    .insert({ content: content.trim(), author_id: user.id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
