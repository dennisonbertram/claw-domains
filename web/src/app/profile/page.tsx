import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Domains',
  description: 'Manage your .claw domains — view, edit records, and renew.',
  openGraph: {
    title: 'My .claw Domains',
    description: 'Manage your .claw domains — view, edit records, and renew.',
  },
}

/**
 * /profile — Server shell for the "My Domains" page.
 */
export default function ProfilePage() {
  return <ProfileClient />
}
