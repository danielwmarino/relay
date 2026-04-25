'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#222222' }}>
        <div className="w-full max-w-[400px] px-6 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">Relay</h1>
          <p className="text-gray-400">Check your email to confirm your account, then come back to sign in.</p>
          <Link href="/auth/login" className="mt-6 inline-block text-sm font-medium text-white underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#222222' }}>
      <div className="w-full max-w-[400px] px-6">
        <h1 className="text-3xl font-bold mb-8 text-white">Relay</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-600 rounded px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:border-white"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-600 rounded px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:border-white"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded py-2 text-sm font-medium border border-blue-500 hover:bg-transparent hover:text-blue-500 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full border border-gray-500 rounded py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
