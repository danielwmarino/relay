import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'
import NewPostBanner from '@/components/NewPostBanner'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let finalPosts = null
  let followingIds: string[] = []

  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    profile = p

    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    followingIds = [user.id, ...(follows ?? []).map(f => f.following_id)]

    // Public posts + posts from private accounts the user follows
    const [{ data: publicPosts }, { data: privatePosts }] = await Promise.all([
      supabase
        .from('posts')
        .select('id, content, created_at, profiles!inner(username, display_name, avatar_url, is_private)')
        .eq('profiles.is_private', false)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('posts')
        .select('id, content, created_at, profiles!inner(username, display_name, avatar_url, is_private)')
        .eq('profiles.is_private', true)
        .in('author_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    const combined = [...(publicPosts ?? []), ...(privatePosts ?? [])]
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    finalPosts = combined.slice(0, 50)
  } else {
    // Logged out: public posts only
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles!inner(username, display_name, avatar_url, is_private)')
      .eq('profiles.is_private', false)
      .order('created_at', { ascending: false })
      .limit(50)
    finalPosts = posts
  }

  const isEmpty = !finalPosts || finalPosts.length === 0

  return (
    <main className="max-w-[400px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relay</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {profile && (
                <Link href={`/u/${profile.username}`} className="text-sm text-gray-500 hover:text-white">
                  @{profile.username}
                </Link>
              )}
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-sm text-gray-400 hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white">Sign in</Link>
              <Link href="/auth/signup" className="text-sm bg-blue-500 text-white px-3 py-1 rounded border border-blue-500 hover:bg-transparent hover:text-blue-500 transition-colors">Sign up</Link>
            </>
          )}
        </div>
      </div>

      {!user && (
        <p className="text-gray-400 text-sm mb-6">
          Simple status messaging app.<br /><span style={{ fontSize: '16px' }}>No photos, no videos, no links, and messages delete 24 hours after post.</span>
        </p>
      )}

      {user && (
        <NewPostBanner followingIds={followingIds} currentUserId={user.id} />
      )}
      {user && <PostComposer />}

      {isEmpty ? (
        <p className="text-gray-400 text-sm text-center py-12">
          Nothing here yet — be the first to post!
        </p>
      ) : (
        (finalPosts as any[]).map(post => <PostCard key={post.id} post={post} />)
      )}
    </main>
  )
}
