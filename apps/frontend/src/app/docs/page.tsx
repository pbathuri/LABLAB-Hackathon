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
            Learn about Captain Whiskers' features and architecture
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
        </motion.div>
      </div>
    </div>
  )
}
