import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let finalPosts = null

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

    const followingIds = [user.id, ...(follows ?? []).map(f => f.following_id)]

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles(username, display_name, avatar_url)')
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(50)

    if (postsError?.code === '42703') {
      const { data: fallbackPosts } = await supabase
        .from('posts')
        .select('id, content, created_at, profiles(username, display_name)')
        .in('author_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50)
      finalPosts = fallbackPosts as any
    } else {
      finalPosts = posts
    }
  } else {
    // Logged out: show all recent posts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles(username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)
    finalPosts = posts
  }

  const isEmpty = !finalPosts || finalPosts.length === 0

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
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

      {user && <PostComposer />}

      {isEmpty ? (
        <p className="text-gray-400 text-sm text-center py-12">
          Nothing here yet — be the first to post!
        </p>
      ) : (
        finalPosts!.map(post => <PostCard key={post.id} post={post as any} />)
      )}
    </main>
  )
}
