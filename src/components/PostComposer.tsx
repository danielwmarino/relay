'use client'

import { createPost } from '@/app/actions/posts'
import { useRef, useState } from 'react'

const MAX = 500

export default function PostComposer() {
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createPost(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setContent('')
      formRef.current?.reset()
    }
    setPending(false)
  }

  const remaining = MAX - content.length
  const tooLong = remaining < 0

  return (
    <form ref={formRef} action={handleSubmit} className="border border-gray-200 rounded-lg p-4 mb-6">
      <textarea
        name="content"
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
