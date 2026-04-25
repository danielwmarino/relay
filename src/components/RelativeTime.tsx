'use client'

import { useEffect, useState } from 'react'

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RelativeTime({ dateStr }: { dateStr: string }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    setLabel(getRelativeTime(dateStr))
    const interval = setInterval(() => setLabel(getRelativeTime(dateStr)), 30000)
    return () => clearInterval(interval)
  }, [dateStr])

  return <span className="text-gray-300 text-xs ml-auto">{label}</span>
}
