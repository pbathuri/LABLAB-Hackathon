'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CaptainWhiskersMascot } from '@/components/mascot/CaptainWhiskersMascot'
import { QuantumOrb } from '@/components/effects/QuantumOrb'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      
      {/* Floating Quantum Orbs */}
      <QuantumOrb className="absolute top-20 right-20 w-32 h-32" delay={0} />
      <QuantumOrb className="absolute bottom-40 left-10 w-24 h-24" delay={1} />
      <QuantumOrb className="absolute top-1/2 right-1/4 w-16 h-16" delay={2} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-xl">🐱</span>
          </div>
          <span className="font-display text-xl font-bold gradient-text">
            Captain Whiskers
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/docs" className="text-muted-foreground hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/dashboard" className="btn-quantum">
            Launch App
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent">Powered by Quantum Computing</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight mb-6">
              <span className="gradient-text">Trustless AI</span>
              <br />
              Treasury Management
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              Meet Captain Whiskers — your autonomous AI agent for quantum-optimized 
              portfolio management with Byzantine fault-tolerant verification.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/dashboard" className="btn-quantum flex items-center gap-2">
                <span>Start Trading</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="/docs" 
                className="px-6 py-3 rounded-xl font-semibold border border-primary/50 hover:bg-primary/10 transition-all"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-display font-bold text-accent">11</div>
                <div className="text-sm text-muted-foreground">BFT Verifiers</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-primary">VQE</div>
                <div className="text-sm text-muted-foreground">Quantum Optimizer</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-quantum-glow">PQ</div>
                <div className="text-sm text-muted-foreground">Post-Quantum Crypto</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <CaptainWhiskersMascot size={400} mood="happy" />
              
              {/* Floating Elements around mascot */}
              <motion.div 
                className="absolute -top-4 -right-4 px-4 py-2 rounded-xl glass"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-accent">🔐</span>
                  <span className="text-sm font-mono">Dilithium Signed</span>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl glass"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary">⚛️</span>
                  <span className="text-sm font-mono">Quantum Ready</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-32"
        >
          <h2 className="text-3xl font-display font-bold text-center mb-16">
            Next-Generation <span className="gradient-text">AI Commerce</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon="⚛️"
              title="Quantum Optimization"
              description="VQE-powered portfolio allocation using real quantum circuits"
            />
            <FeatureCard 
              icon="🛡️"
              title="BFT Consensus"
              description="11-node Byzantine fault tolerant verification layer"
            />
            <FeatureCard 
              icon="🔐"
              title="Post-Quantum Crypto"
              description="CRYSTALS-Dilithium signatures resist quantum attacks"
            />
            <FeatureCard 
              icon="💳"
              title="x402 Micropayments"
              description="Pay-per-call API access with on-chain escrow"
            />
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-8 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            © 2026 Captain Whiskers. Built for Arc × Circle Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" className="text-muted-foreground hover:text-white">
              GitHub
            </a>
            <a href="https://arcscan.io" className="text-muted-foreground hover:text-white">
              ArcScan
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div 
      className="card-quantum p-6"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}
