'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, Clock, X } from 'lucide-react'

export default function VerificationPage() {
  const verifiers = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    signed: i < 9,
    latency: Math.floor(Math.random() * 100) + 50,
  }))

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            BFT Verification
          </h1>

          {/* Consensus Status */}
          <div className="card-quantum p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Consensus Status</h2>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                9/11 Signatures
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signatures Received</span>
                <span className="font-medium">9</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Required</span>
                <span className="font-medium">7</span>
              </div>
              <div className="h-2 bg-dark-100 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                  style={{ width: '82%' }}
                />
              </div>
            </div>
          </div>

          {/* Verifier Nodes */}
          <div className="card-quantum p-6">
            <h2 className="text-lg font-semibold mb-4">Verifier Nodes</h2>
            <div className="space-y-3">
              {verifiers.map((verifier) => (
                <div
                  key={verifier.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-100"
                >
                  <div className="flex items-center gap-3">
                    {verifier.signed ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-mono text-sm">{verifier.address}</div>
                      <div className="text-xs text-muted-foreground">
                        Node #{verifier.id} • {verifier.latency}ms
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      verifier.signed
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {verifier.signed ? 'Signed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
