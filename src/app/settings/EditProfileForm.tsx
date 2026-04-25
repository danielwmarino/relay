'use client'

import Avatar from '@/components/Avatar'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

interface Profile {
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_company: boolean | null
  monitor_code: string | null
  monitor_url: string | null
  check_interval_minutes: number | null
  down_check_interval_minutes: number | null
}

export default function EditProfileForm({ profile, isAdmin }: { profile: Profile; isAdmin: boolean }) {
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(profile.avatar_url)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'saving') return
    setStatus('saving')

    const formData = new FormData(formRef.current!)

    const res = await fetch('/api/profile', {
      method: 'POST',
      body: formData,
    }).catch(() => null)

    if (!res) { setStatus('error'); setErrorMsg('Network error'); return }
    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setErrorMsg(data.error ?? 'Failed to save')
      return
    }

    setStatus('saved')
    router.refresh()
    setTimeout(() => setStatus('idle'), 2000)
  }

  const displayName = profile.display_name || profile.username

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar picker */}
      <div className="flex items-center gap-4">
        <Avatar url={preview} name={displayName} size="lg" />
        <div>
          <label className="cursor-pointer text-sm font-medium underline">
            Change photo
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, or WebP. Max 2 MB.</p>
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium mb-1">Display name</label>
        <input
          name="display_name"
          defaultValue={profile.display_name ?? ''}
          maxLength={50}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ''}
          maxLength={160}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-black"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          name="username"
          defaultValue={profile.username}
          maxLength={30}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <p className="text-xs text-gray-400 mt-1">Letters, numbers, and underscores only.</p>
      </div>

      {/* Monitor section — company accounts only */}
      {profile.is_company && (
        <div className="border-t border-gray-200 pt-5 space-y-4">
          <h2 className="text-sm font-semibold">Site Monitor</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Your monitor code</label>
            <div className="flex items-center gap-2">
              <input
                value={profile.monitor_code ?? ''}
                readOnly
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-400 bg-gray-50 font-mono"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(profile.monitor_code ?? '')}
                className="text-xs px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Add this to your site as a URL path: <span className="font-mono">https://yoursite.com/relay-status/{profile.monitor_code}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monitor URL</label>
            <input
              name="monitor_url"
              defaultValue={profile.monitor_url ?? ''}
              placeholder="https://yoursite.com/relay-status/your-code"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
            <p className="text-xs text-gray-400 mt-1">The full URL Relay will ping to check if your site is up.</p>
          </div>
        </div>
      )}

      {/* Admin interval settings */}
      {isAdmin && (
        <div className="border-t border-gray-200 pt-5 space-y-4">
          <h2 className="text-sm font-semibold">Monitor Intervals (Admin)</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Normal check interval (minutes)</label>
            <input
              type="number"
              name="check_interval_minutes"
              defaultValue={profile.check_interval_minutes ?? 30}
              min={1}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Down check interval (minutes)</label>
            <input
              type="number"
              name="down_check_interval_minutes"
              defaultValue={profile.down_check_interval_minutes ?? 5}
              min={1}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>
      )}

      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        className="bg-blue-500 text-white text-sm px-5 py-2 rounded border border-blue-500 hover:bg-transparent hover:text-blue-500 transition-colors"
      >
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved!' : 'Save changes'}
      </button>
    </form>
  )
}
