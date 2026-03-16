import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import Nav from '@/components/Nav'
import NetworkGuard from '@/components/NetworkGuard'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dotclaw.ai'),
  title: {
    default: '.claw — A home for your agent on the internet',
    template: '%s | .claw',
  },
  description: 'Give your agent a name, a payment address, and a place to be found. Decentralized domains on Arc Network.',
  keywords: ['claw', 'domain', 'identity', 'Arc', 'web3', 'decentralized', 'name service', 'Arc Network', 'AI agent'],
  openGraph: {
    title: '.claw Domains',
    description: 'A home for your agent on the internet. Register your .claw domain on Arc Network.',
    siteName: '.claw',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '.claw Domains',
    description: 'A home for your agent on the internet. Register your .claw domain on Arc Network.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
        {/* Testnet banner */}
        <div className="sticky top-0 z-[60] bg-[#FEF3C7] text-[#92400E] text-xs text-center py-1.5 px-4">
          You&apos;re on Arc Testnet &mdash; Get test USDC:{' '}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#78350F]"
          >
            Circle Faucet
          </a>
          {' '}&middot;{' '}
          <a
            href="https://easyfaucetarc.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#78350F]"
          >
            EasyFaucet
          </a>
        </div>
        <Providers>
          <NetworkGuard />
          <Nav />
          <main id="main-content">
            {children}
          </main>
          <footer className="mt-16 border-t border-[#E5E5E5] py-10 text-center text-sm text-[#A3A3A3]">
            <p>
              .claw domains are registered on{' '}
              <a
                href="https://arc.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B61FE] hover:underline"
              >
                Arc Network
              </a>
              . Powered by decentralized infrastructure.
            </p>
            <p className="mt-2">
              <span className="inline-block rounded bg-[#FEF3C7] px-2 py-0.5 text-[#92400E] text-xs font-medium mr-2">
                Testnet
              </span>
              <a
                href="/agent-guide.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B61FE] hover:underline"
              >
                Agent &amp; Developer Guide
              </a>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
