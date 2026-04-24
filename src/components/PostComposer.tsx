'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const MAX = 500

export default function PostComposer() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [charCount, setCharCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handlePost() {
    const content = textareaRef.current?.value ?? ''
    if (!content.trim() || content.length > MAX || pending) return

    setPending(true)
    setError(null)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        if (textareaRef.current) textareaRef.current.value = ''
        setCharCount(0)
        router.refresh()
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setPending(false)
    }
  }

  const remaining = MAX - charCount
  const tooLong = remaining < 0

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <textarea
        ref={textareaRef}
        onChange={e => setCharCount(e.target.value.length)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none text-sm focus:outline-none"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${tooLong ? 'text-red-500' : 'text-gray-400'}`}>
          {remaining}
        </span>
        <button
          type="button"
          onClick={handlePost}
          disabled={pending || charCount === 0 || tooLong}
          className="bg-black text-white text-sm px-4 py-1.5 rounded disabled:opacity-40"
        >
          {pending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
