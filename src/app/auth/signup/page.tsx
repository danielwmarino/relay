'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClient()

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#222222' }}>
      <div className="w-full max-w-[400px] px-6">
        <h1 className="text-3xl font-bold mb-8 text-white">Relay</h1>

        <button
          onClick={handleGoogleSignup}
          className="w-full border border-gray-300 rounded py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
