'use client'

import { createPost } from '@/app/actions/posts'
import { useState, useTransition } from 'react'

const MAX = 500

export default function PostComposer() {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePost() {
    if (!content.trim() || content.length > MAX) return
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('content', content)
      const result = await createPost(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setContent('')
      }
    })
  }

  const remaining = MAX - content.length
  const tooLong = remaining < 0

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
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
          disabled={isPending || !content.trim() || tooLong}
          className="bg-black text-white text-sm px-4 py-1.5 rounded disabled:opacity-40"
        >
          {isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
