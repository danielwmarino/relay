'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteAccountSection() {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm'>('idle')
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (input !== 'DELETE') { setError('Type DELETE exactly to confirm'); return }
    setDeleting(true)
    setError(null)

    const res = await fetch('/api/account/delete', { method: 'POST' }).catch(() => null)

    if (!res || !res.ok) {
      setDeleting(false)
      setError('Something went wrong. Try again.')
      return
    }

    router.push('/feed')
  }

  return (
    <div className="border-t border-gray-200 pt-5">
      <h2 className="text-sm font-semibold text-red-500 mb-1">Danger zone</h2>

      {step === 'idle' && (
        <button
          type="button"
          onClick={() => setStep('confirm')}
          className="text-sm text-red-500 border border-red-400 px-4 py-2 rounded hover:bg-red-50 transition-colors"
        >
          Delete account
        </button>
      )}

      {step === 'confirm' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            This will permanently delete your account, posts, and follows. This cannot be undone.
          </p>
          <p className="text-sm font-medium">Type <span className="font-mono">DELETE</span> to confirm:</p>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="DELETE"
            className="w-full border border-red-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('idle'); setInput(''); setError(null) }}
              className="text-sm text-gray-400 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
