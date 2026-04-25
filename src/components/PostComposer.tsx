'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const MAX = 140

const EMOJIS = [
  '😀','😂','😍','🥹','😎','🤔','😅','🙏','👍','👎',
  '❤️','🔥','✨','🎉','💯','😭','🤣','😊','😢','😡',
  '👀','💀','🙌','🤯','😱','🥳','😴','🤝','💪','🫡',
]

export default function PostComposer() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) { setContent(c => c + emoji); return }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    const newContent = content.slice(0, start) + emoji + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
    setShowEmojis(false)
  }

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
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() } }}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none text-sm focus:outline-none"
      />
      {showEmojis && (
        <div className="grid grid-cols-10 gap-1 mb-2 p-2 border border-gray-200 rounded">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${content.length > MAX ? 'text-red-500' : 'text-gray-400'}`}>
            {MAX - content.length}
          </span>
          <button
            type="button"
            onClick={() => setShowEmojis(s => !s)}
            className="text-lg leading-none"
          >
            🙂
          </button>
        </div>
        <button
          type="button"
          onClick={handlePost}
          className={`text-sm px-4 py-1.5 rounded border transition-colors ${pending ? 'bg-gray-400 text-white border-gray-400' : 'bg-blue-500 text-white border-blue-500 hover:bg-transparent hover:text-blue-500'}`}
        >
          {pending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
