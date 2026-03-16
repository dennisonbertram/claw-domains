import type { Metadata } from 'next'
import DomainsClient from './DomainsClient'

export const metadata: Metadata = {
  title: 'All Domains',
  description: 'Browse all registered .claw domains on Arc Network.',
  openGraph: {
    title: 'All .claw Domains',
    description: 'Browse all registered .claw domains on Arc Network.',
  },
}

/**
 * /domains — Server shell for the "All Domains" directory page.
 */
export default function DomainsPage() {
  return <DomainsClient />
}
