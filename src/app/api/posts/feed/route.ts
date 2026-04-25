import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let posts = null

  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = [user.id, ...(follows ?? []).map((f: any) => f.following_id)]

    const [{ data: publicPosts }, { data: privatePosts }] = await Promise.all([
      supabase
        .from('posts')
        .select('id, content, created_at, profiles!inner(username, display_name, avatar_url, is_private)')
        .eq('profiles.is_private', false)
        .lt('created_at', cursor ?? new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('posts')
        .select('id, content, created_at, profiles!inner(username, display_name, avatar_url, is_private)')
        .eq('profiles.is_private', true)
        .in('author_id', followingIds)
        .lt('created_at', cursor ?? new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const combined = [...(publicPosts ?? []), ...(privatePosts ?? [])]
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    posts = combined.slice(0, 20)
  } else {
    const { data } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles!inner(username, display_name, avatar_url, is_private)')
      .eq('profiles.is_private', false)
      .lt('created_at', cursor ?? new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20)
    posts = data
  }

  return NextResponse.json({ posts: posts ?? [] })
}
