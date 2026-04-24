import Link from 'next/link'

export default function PostContent({ text }: { text: string }) {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g)

  return (
    <p className="text-sm leading-relaxed">
      {parts.map((part, i) =>
        /^@[a-zA-Z0-9_]+$/.test(part) ? (
          <Link key={i} href={`/u/${part.slice(1)}`} className="text-blue-500 hover:underline">
            {part}
          </Link>
        ) : (
          part
        )
      )}
    </p>
  )
}
