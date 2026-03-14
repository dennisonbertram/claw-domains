import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Nav from '@/components/Nav'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: '.claw — Your cozy home on the internet',
    template: '%s | .claw',
  },
  description: 'Find, claim, and manage your .claw identity in seconds. No jargon, no hassle.',
  keywords: ['claw', 'domain', 'identity', 'Base', 'web3'],
  openGraph: {
    title: '.claw Domains',
    description: 'Your cozy home on the internet.',
    url: 'https://claw.domains',
    siteName: '.claw',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#FCFCFD] text-[#171717] antialiased">
        <Providers>
          <Nav />
          <main id="main-content">
            {children}
          </main>
          <footer className="mt-16 border-t border-[#E5E5E5] py-10 text-center text-sm text-[#A3A3A3]">
            <p>
              .claw domains are registered on{' '}
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B61FE] hover:underline"
              >
                Base
              </a>
              . Powered by decentralized infrastructure.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
