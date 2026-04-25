import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

interface Props {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, created_at, profiles(username, display_name, avatar_url)')
    .ilike('content', `%#${tag}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <main className="max-w-[400px] mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/feed" className="text-sm text-gray-400 hover:text-white">← Home</Link>
      </div>
      <h2 className="text-lg font-bold mb-6">#{tag}</h2>
      {!posts || posts.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">No posts with #{tag} yet.</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post as any} />)
      )}
    </main>
  )
}
