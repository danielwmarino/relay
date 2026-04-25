'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const THRESHOLD = 64

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const startYRef = useRef<number | null>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) startYRef.current = e.touches[0].clientY
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) setPull(Math.min(delta, THRESHOLD * 1.5))
  }

  const onTouchEnd = async () => {
    if (pull >= THRESHOLD) {
      setRefreshing(true)
      router.refresh()
      setTimeout(() => { setRefreshing(false) }, 1000)
    }
    startYRef.current = null
    setPull(0)
  }

  const progress = Math.min(pull / THRESHOLD, 1)

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pull > 0 || refreshing ? (refreshing ? 40 : pull * 0.5) : 0 }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent"
          style={{
            opacity: progress,
            animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
            transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
          }}
        />
      </div>
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
