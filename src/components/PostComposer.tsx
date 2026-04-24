'use client'

import { createPost } from '@/app/actions/posts'
import { useState } from 'react'

const MAX = 500

export default function PostComposer() {
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!content.trim() || content.length > MAX) return

    setPending(true)
    setError(null)

    const formData = new FormData()
    formData.set('content', content)

    const result = await createPost(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setContent('')
    }
    setPending(false)
  }

  const remaining = MAX - content.length
  const tooLong = remaining < 0

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 mb-6">
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
          type="submit"
          disabled={pending || !content.trim() || tooLong}
          className="bg-black text-white text-sm px-4 py-1.5 rounded disabled:opacity-40"
        >
          {pending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
