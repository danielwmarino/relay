import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'
import Avatar from '@/components/Avatar'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, created_at, profiles(username, display_name)')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ])

  let isFollowing = false
  if (currentUser && currentUser.id !== profile.id) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!data
  }

  const isOwnProfile = currentUser?.id === profile.id
  const displayName = profile.display_name || profile.username

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/feed" className="text-sm text-gray-400 hover:text-black">← Home</Link>
      </div>
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar url={profile.avatar_url} name={displayName} size="lg" />
            <div>
              <h1 className="text-xl font-bold">{displayName}</h1>
              <p className="text-gray-500 text-sm">@{profile.username}</p>
            </div>
          </div>

          <div className="shrink-0">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="text-sm px-4 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
              >
                Edit profile
              </Link>
            ) : currentUser ? (
              <FollowButton
                profileId={profile.id}
                username={profile.username}
                initiallyFollowing={isFollowing}
              />
            ) : null}
          </div>
        </div>

        {profile.bio && <p className="mt-4 text-sm">{profile.bio}</p>}

        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          <span><strong className="text-black">{followerCount ?? 0}</strong> followers</span>
          <span><strong className="text-black">{followingCount ?? 0}</strong> following</span>
          <span><strong className="text-black">{posts?.length ?? 0}</strong> posts</span>
        </div>
      </div>

      <div className="border-t border-gray-100">
        {posts && posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post as any} />)
        ) : (
          <p className="text-gray-400 text-sm text-center py-12">No posts yet.</p>
        )}
      </div>
    </main>
  )
}
