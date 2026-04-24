import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Get IDs of everyone the current user follows, plus themselves
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = [
    user.id,
    ...(follows ?? []).map(f => f.following_id),
  ]

  // Fetch posts only from those people
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, content, created_at, profiles(username, display_name, avatar_url)')
    .in('author_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50)

  // If avatar_url column doesn't exist yet, retry without it
  let finalPosts = posts
  if (postsError?.code === '42703') {
    const { data: fallbackPosts } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles(username, display_name)')
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(50)
    finalPosts = fallbackPosts as any
  }

  const isEmpty = !finalPosts || finalPosts.length === 0

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relay</h1>
        <div className="flex items-center gap-4">
          {profile && (
            <Link href={`/u/${profile.username}`} className="text-sm text-gray-500 hover:text-black">
              @{profile.username}
            </Link>
          )}
          <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-sm text-gray-400 hover:text-black">
                Sign out
              </button>
            </form>
        </div>
      </div>
      <PostComposer />
      {isEmpty ? (
        <p className="text-gray-400 text-sm text-center py-12">
          Nothing here yet — follow some people or write the first post!
        </p>
      ) : (
        finalPosts!.map(post => <PostCard key={post.id} post={post as any} />)
      )}
    </main>
  )
}
