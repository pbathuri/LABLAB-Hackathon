import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const orbitron = localFont({
  src: '../fonts/Orbitron-VariableFont_wght.ttf',
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Captain Whiskers | Trustless AI Treasury',
  description: 'Quantum-aware AI agent for autonomous commerce with Byzantine fault tolerance',
  keywords: ['AI agent', 'quantum computing', 'cryptocurrency', 'DeFi', 'USDC', 'Arc blockchain'],
  authors: [{ name: 'Captain Whiskers Team' }],
  openGraph: {
    title: 'Captain Whiskers | Trustless AI Treasury',
    description: 'The future of autonomous AI commerce',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased bg-dark text-white min-h-screen`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
