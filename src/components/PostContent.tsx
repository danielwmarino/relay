import Link from 'next/link'

export default function PostContent({ text, alert = false }: { text: string; alert?: boolean }) {
  const parts = text.split(/(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g)

  return (
    <p className={`text-sm leading-relaxed ${alert ? 'text-red-500' : ''}`}>
      {parts.map((part, i) =>
        /^@[a-zA-Z0-9_]+$/.test(part) ? (
          <Link key={i} href={`/u/${part.slice(1)}`} className="text-blue-500 hover:underline">
            {part}
          </Link>
        ) : /^#[a-zA-Z0-9_]+$/.test(part) ? (
          <Link key={i} href={`/tag/${part.slice(1).toLowerCase()}`} className="text-blue-500 hover:underline">
            {part}
          </Link>
        ) : (
          part
        )
      )}
    </p>
  )
}
