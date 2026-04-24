import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

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
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, created_at, profiles(username, display_name, avatar_url)')
    .in('author_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50)

  const isEmpty = !posts || posts.length === 0

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Relay</h1>
      <PostComposer />
      {isEmpty ? (
        <p className="text-gray-400 text-sm text-center py-12">
          Nothing here yet — follow some people or write the first post!
        </p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post as any} />)
      )}
    </main>
  )
}
