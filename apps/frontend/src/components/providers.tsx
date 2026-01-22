'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { mainnet } from 'wagmi/chains'
import { useState, type ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { WalletProvider } from '@/contexts/WalletContext'

// Define Arc testnet chain
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Arc',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.arc.dev'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.io' },
  },
  testnet: true,
} as const

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

// Wagmi config
const config = createConfig({
  chains: [arcTestnet, mainnet],
  connectors: [
    injected({ shimDisconnect: true }),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,
            metadata: {
              name: 'Captain Whiskers',
              description: 'Trustless AI treasury on Arc',
              url: 'https://frontend-ten-pi-54.vercel.app',
              icons: ['https://frontend-ten-pi-54.vercel.app/images/captain-whiskers-astronaut.svg'],
            },
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [arcTestnet.id]: http(),
    [mainnet.id]: http(),
  },
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
