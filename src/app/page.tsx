import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Relay</h1>
        <p className="text-gray-500 mb-8">Text-only social. Short thoughts, fast.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="bg-black text-white px-5 py-2 rounded text-sm font-medium"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-300 px-5 py-2 rounded text-sm font-medium hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
