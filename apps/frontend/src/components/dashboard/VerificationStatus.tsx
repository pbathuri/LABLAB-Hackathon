'use client'

import { motion } from 'framer-motion'
import { Shield, Check, X, Clock, ExternalLink } from 'lucide-react'

interface VerifierNode {
  id: number
  address: string
  status: 'signed' | 'pending' | 'failed'
  latency?: number
}

const mockVerifiers: VerifierNode[] = [
  { id: 1, address: '0x1234...abcd', status: 'signed', latency: 45 },
  { id: 2, address: '0x2345...bcde', status: 'signed', latency: 52 },
  { id: 3, address: '0x3456...cdef', status: 'signed', latency: 38 },
  { id: 4, address: '0x4567...def0', status: 'signed', latency: 61 },
  { id: 5, address: '0x5678...ef01', status: 'signed', latency: 44 },
  { id: 6, address: '0x6789...f012', status: 'signed', latency: 55 },
  { id: 7, address: '0x789a...0123', status: 'signed', latency: 49 },
  { id: 8, address: '0x89ab...1234', status: 'pending', latency: undefined },
  { id: 9, address: '0x9abc...2345', status: 'pending', latency: undefined },
  { id: 10, address: '0xabcd...3456', status: 'failed', latency: undefined },
  { id: 11, address: '0xbcde...4567', status: 'pending', latency: undefined },
]

export function VerificationStatus() {
  const signedCount = mockVerifiers.filter(v => v.status === 'signed').length
  const requiredSignatures = 7
  const consensusReached = signedCount >= requiredSignatures

  return (
    <div className="card-quantum p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">BFT Verification</h3>
            <p className="text-sm text-muted-foreground">Byzantine fault tolerant consensus</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
          consensusReached ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {consensusReached ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {consensusReached ? 'Consensus Reached' : 'Awaiting Signatures'}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Signatures collected</span>
          <span className="font-mono">{signedCount} / {requiredSignatures} required</span>
        </div>
        <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(signedCount / 11) * 100}%` }}
            className={`h-full ${consensusReached ? 'bg-green-500' : 'bg-yellow-500'}`}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>Threshold: {requiredSignatures}/11 (2f+1)</span>
          <span>Fault tolerance: 3 nodes</span>
        </div>
      </div>

      {/* Verifier Nodes Grid */}
      <div className="grid grid-cols-11 gap-2 mb-6">
        {mockVerifiers.map((verifier, index) => (
          <motion.div
            key={verifier.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-110 ${
              verifier.status === 'signed' 
                ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                : verifier.status === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            title={`Node ${verifier.id}: ${verifier.address}`}
          >
            {verifier.status === 'signed' ? '✓' : verifier.status === 'pending' ? '...' : '✗'}
          </motion.div>
        ))}
      </div>

      {/* Latest Verification */}
      <div className="p-4 rounded-xl bg-dark-100/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Latest Verification</span>
          <a 
            href="https://testnet.arcscan.io/tx/0x..." 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            View on ArcScan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs mb-1">Request Hash</div>
            <div className="font-mono truncate">0x8f4e2a...</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-1">Avg Latency</div>
            <div className="font-mono">49ms</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-1">Timestamp</div>
            <div className="font-mono">2 min ago</div>
          </div>
        </div>
      </div>
    </div>
  )
}
