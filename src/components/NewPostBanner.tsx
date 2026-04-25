'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Props {
  currentUserId: string
  newestPostTime: string
}

export default function NewPostBanner({ currentUserId, newestPostTime }: Props) {
  const router = useRouter()
  const [hasNew, setHasNew] = useState(false)
  const newestRef = useRef(newestPostTime)

  useEffect(() => {
    newestRef.current = newestPostTime
    setHasNew(false)
  }, [newestPostTime])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const check = async () => {
      try {
        const res = await fetch(`/api/posts/feed/new?since=${encodeURIComponent(newestRef.current)}&userId=${currentUserId}`)
        if (!res.ok) return
        const { hasNew: newPosts } = await res.json()
        if (newPosts) setHasNew(true)
      } catch {}
    }

    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [currentUserId])

  if (!hasNew) return null

  return (
    <button
      onClick={() => { setHasNew(false); router.refresh() }}
      className="w-full mb-4 py-2 px-4 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
    >
      New posts — tap to refresh
    </button>
  )
}
