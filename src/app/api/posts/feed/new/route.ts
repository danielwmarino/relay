import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')
  const userId = searchParams.get('userId')

  if (!since) return NextResponse.json({ hasNew: false })

  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('id, profiles!inner(is_private)')
    .eq('profiles.is_private', false)
    .neq('author_id', userId ?? '')
    .gt('created_at', since)
    .limit(1)

  return NextResponse.json({ hasNew: (data?.length ?? 0) > 0 })
}
