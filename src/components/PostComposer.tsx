'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MAX = 140

export default function PostComposer() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handlePost() {
    if (pending) return
    const text = content.trim()
    if (!text) { setError('Write something first'); return }
    if (text.length > MAX) { setError('Too long'); return }
    setError(null)
    setPending(true)

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    }).catch(() => null)

    setPending(false)
    if (!res) { setError('Network error'); return }
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed'); return }

    setContent('')
    router.refresh()
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() } }}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none text-sm focus:outline-none"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${content.length > MAX ? 'text-red-500' : 'text-gray-400'}`}>
          {MAX - content.length}
        </span>
        <button
          type="button"
          onClick={handlePost}
          className={`text-sm px-4 py-1.5 rounded ${pending ? 'bg-gray-400 text-white' : 'bg-black text-white'}`}
        >
          {pending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
