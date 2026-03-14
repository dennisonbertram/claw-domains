import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Domains',
}

/**
 * /profile — Server shell for the "My Domains" page.
 */
export default function ProfilePage() {
  return <ProfileClient />
}
