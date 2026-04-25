'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Props {
  followingIds: string[]
  currentUserId: string
}

export default function NewPostBanner({ followingIds, currentUserId }: Props) {
  const router = useRouter()
  const [newCount, setNewCount] = useState(0)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const supabase = createClient()

    channelRef.current = supabase
      .channel('new-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const authorId = payload.new.author_id
          if (authorId === currentUserId) return

          setNewCount(c => c + 1)

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Relay', { body: 'New post in your feed' })
          }
        }
      )
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [followingIds, currentUserId])

  if (newCount === 0) return null

  return (
    <button
      onClick={() => { setNewCount(0); router.refresh() }}
      className="w-full mb-4 py-2 px-4 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
    >
      {newCount} new {newCount === 1 ? 'post' : 'posts'} — tap to refresh
    </button>
  )
}
