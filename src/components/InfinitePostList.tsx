'use client'

import { useEffect, useRef, useState } from 'react'
import PostCard from './PostCard'

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

export default function InfinitePostList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length === 20)
  }, [initialPosts])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || loading || !hasMore) return
        setLoading(true)

        const lastPost = posts[posts.length - 1]
        if (!lastPost) { setLoading(false); return }

        const res = await fetch(`/api/posts/feed?cursor=${encodeURIComponent(lastPost.created_at)}`).catch(() => null)
        if (!res) { setLoading(false); return }

        const { posts: newPosts } = await res.json()
        if (newPosts.length === 0) {
          setHasMore(false)
        } else {
          setPosts(prev => [...prev, ...newPosts])
          if (newPosts.length < 20) setHasMore(false)
        }
        setLoading(false)
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [posts, loading, hasMore])

  if (posts.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-12">Nothing here yet — be the first to post!</p>
  }

  return (
    <>
      {posts.map(post => <PostCard key={post.id} post={post as any} />)}
      <div ref={sentinelRef} className="py-4 text-center">
        {loading && <p className="text-gray-400 text-xs">Loading more…</p>}
        {!hasMore && posts.length > 0 && <p className="text-gray-600 text-xs">You're all caught up</p>}
      </div>
    </>
  )
}
