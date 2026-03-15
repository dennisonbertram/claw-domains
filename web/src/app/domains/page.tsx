import type { Metadata } from 'next'
import DomainsClient from './DomainsClient'

export const metadata: Metadata = {
  title: 'All Domains',
}

/**
 * /domains — Server shell for the "All Domains" directory page.
 */
export default function DomainsPage() {
  return <DomainsClient />
}
