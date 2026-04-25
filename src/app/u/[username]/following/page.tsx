import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

interface Props {
  params: Promise<{ username: string }>
}

export default async function FollowingFeedPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profile.id)

  const followingIds = (follows ?? []).map(f => f.following_id)

  let posts = null
  if (followingIds.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select('id, content, created_at, profiles(username, display_name, avatar_url)')
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(50)
    posts = data
  }

  return (
    <main className="max-w-[400px] mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/u/${username}`} className="text-sm text-gray-400 hover:text-white">← @{username}</Link>
      </div>
      <h2 className="text-lg font-bold mb-6">Following</h2>
      {!posts || posts.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">No posts yet.</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post as any} />)
      )}
    </main>
  )
}
