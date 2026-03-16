import type { Metadata } from 'next'
import DomainClient from './DomainClient'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return {
    title: `${label}.claw`,
    description: `View and manage the ${label}.claw domain on Arc Network.`,
    openGraph: {
      title: `${label}.claw`,
      description: `View and manage the ${label}.claw domain on Arc Network.`,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${label}.claw`,
      description: `View and manage the ${label}.claw domain on Arc Network.`,
    },
  }
}

/**
 * /domain/[name] — Server component shell.
 */
export default async function DomainPage({ params }: Props) {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return <DomainClient label={label} />
}
