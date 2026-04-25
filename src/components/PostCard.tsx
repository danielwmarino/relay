import Link from 'next/link'
import Avatar from './Avatar'
import PostContent from './PostContent'
import RelativeTime from './RelativeTime'

interface Post {
  id: string
  content: string
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url?: string | null
  }
}

export default function PostCard({ post }: { post: Post }) {
  const displayName = post.profiles.display_name || post.profiles.username

  return (
    <div className="border-b py-4 flex gap-3" style={{ borderColor: '#444444' }}>
      <Link href={`/u/${post.profiles.username}`} className="shrink-0">
        <Avatar url={post.profiles.avatar_url ?? null} name={displayName} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <Link href={`/u/${post.profiles.username}`} className="font-medium text-sm hover:underline">
            {displayName}
          </Link>
          <span className="text-gray-400 text-xs">@{post.profiles.username}</span>
          <RelativeTime dateStr={post.created_at} />
        </div>
        <PostContent text={post.content} alert={post.content.startsWith('💀')} success={post.content.startsWith('✅')} />
      </div>
    </div>
  )
}
