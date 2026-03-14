import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return {
    title: `Register ${label}.claw`,
    description: `Check availability and register the ${label}.claw domain on Arc.`,
  }
}

/**
 * /register/[name] — Server component shell.
 * Passes the label to the client component that handles chain reads and writes.
 */
export default async function RegisterPage({ params }: Props) {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return <RegisterClient label={label} />
}
