'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/feed')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#222222' }}>
      <div className="w-full max-w-[400px] px-6">
        <h1 className="text-3xl font-bold mb-8 text-white">Relay</h1>

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-600 rounded px-3 py-2 text-sm bg-transparent text-white focus:outline-none focus:border-white"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded py-2 text-sm font-medium border border-blue-500 hover:bg-transparent hover:text-blue-500 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-500 rounded py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-center text-gray-400">
          No account?{' '}
          <Link href="/auth/signup" className="text-white font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
