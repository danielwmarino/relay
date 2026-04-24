'use client'

import { followUser, unfollowUser } from '@/app/actions/follows'
import { useState } from 'react'

interface Props {
  profileId: string
  username: string
  initiallyFollowing: boolean
}

export default function FollowButton({ profileId, username, initiallyFollowing }: Props) {
  const [following, setFollowing] = useState(initiallyFollowing)
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    if (following) {
      await unfollowUser(profileId, username)
    } else {
      await followUser(profileId, username)
    }
    setFollowing(!following)
    setPending(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`text-sm px-4 py-1.5 rounded border disabled:opacity-40 ${
        following
          ? 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-500'
          : 'bg-black text-white border-black'
      }`}
    >
      {pending ? '…' : following ? 'Following' : 'Follow'}
    </button>
  )
}
