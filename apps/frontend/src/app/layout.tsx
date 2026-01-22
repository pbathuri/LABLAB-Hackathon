import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Use Inter as fallback for display font
const orbitronVariable = '--font-orbitron'

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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-dark text-white min-h-screen`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
