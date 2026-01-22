'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Book, Code, Zap, Shield } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="container mx-auto px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-display font-bold mb-4 flex items-center gap-3">
            <Book className="w-10 h-10 text-primary" />
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Learn about Captain Whiskers&apos; features and architecture
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Quantum Optimization',
                description: 'Learn how VQE algorithms optimize your portfolio',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'BFT Consensus',
                description: 'Understanding Byzantine fault tolerant verification',
              },
              {
                icon: <Code className="w-6 h-6" />,
                title: 'API Reference',
                description: 'Complete API documentation for developers',
              },
            ].map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-quantum p-6 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-primary mb-4">{doc.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 card-quantum p-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
            <p className="text-muted-foreground mb-4">
              Captain Whiskers is a trustless AI agent for quantum-optimized treasury management.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Connect your wallet to get started</li>
              <li>Configure your risk tolerance and spending limits</li>
              <li>Let Captain Whiskers optimize your portfolio using quantum algorithms</li>
              <li>All transactions are verified by 11-node BFT consensus</li>
            </ul>
          </div>

          <div className="mt-8 card-quantum p-8">
            <h2 className="text-2xl font-semibold mb-4">Post-Quantum Readiness</h2>
            <p className="text-muted-foreground mb-4">
              We align our security roadmap with Circle’s research on quantum threats to blockchain
              infrastructure and post-quantum transition planning.
            </p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-muted-foreground">
                Reference: <span className="text-white">Preparing Blockchains for Q-Day</span>
              </div>
              <a
                href="https://www.circle.com/blog/preparing-blockchains-for-q-day"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-2"
              >
                Read the blog post <ArrowLeft className="w-4 h-4 rotate-180" />
              </a>
            </div>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>We adopt post-quantum signing (Dilithium) for off-chain EIP-712 authorization.</li>
              <li>Our BFT verification layer is designed to upgrade validator signatures.</li>
              <li>We prepare for larger PQ signatures and address migration paths.</li>
              <li>We plan for PQ-safe ZK systems (STARK/SNARG) over elliptic-curve SNARKs.</li>
            </ul>
          </div>

          <div className="mt-8 card-quantum p-8">
            <h2 className="text-2xl font-semibold mb-4">Arc Infrastructure Resources</h2>
            <p className="text-muted-foreground mb-4">
              Arc is an EVM-compatible Layer-1 designed for programmable money with USDC gas,
              deterministic finality, and BFT consensus. We use these resources to improve
              reliability, indexing, and access to Arc data.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Node Providers</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Alchemy</li>
                  <li>Blockdaemon</li>
                  <li>dRPC</li>
                  <li>QuickNode</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Data Indexers</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Envio (HyperIndex)</li>
                  <li>Goldsky (Subgraphs + Mirror)</li>
                  <li>The Graph</li>
                  <li>Thirdweb Insight</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <a
                href="https://docs.arc.network/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Arc Docs &amp; Resources
              </a>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Circle Faucet (USDC testnet)
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
