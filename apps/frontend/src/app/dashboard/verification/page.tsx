'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, Clock, RefreshCw, Loader2, ExternalLink, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '@/lib/api'
import { useWallet } from '@/contexts/WalletContext'

export default function VerificationPage() {
    const { isAuthenticated } = useWallet()

    // Fetch verifier status
    const { data: verifierStatus, isLoading, refetch } = useQuery({
        queryKey: ['verifier-status'],
        queryFn: () => api.getVerifierStatus(),
        refetchInterval: 30000, // Refresh every 30 seconds (reduced frequency)
        staleTime: 25000,
    })

    // Fetch recent verifications
    const { data: recentVerifications = [] } = useQuery({
        queryKey: ['recent-verifications'],
        queryFn: () => api.getRecentVerifications(5),
        enabled: isAuthenticated,
        refetchInterval: 30000, // Reduced frequency
        staleTime: 25000,
    })

    const totalNodes = verifierStatus?.totalNodes || 11
    const activeNodes = verifierStatus?.activeNodes || 11
    const requiredSignatures = verifierStatus?.requiredSignatures || 7
    const faultTolerance = verifierStatus?.faultTolerance || 3

    // Use stable signature count (memoized to prevent re-renders)
    const signedCount = useMemo(() => {
        // Use data from API if available, otherwise use stable fallback
        if (verifierStatus?.signedCount !== undefined) {
            return verifierStatus.signedCount
        }
        // Stable default: 9 signatures (consensus reached)
        return 9
    }, [verifierStatus?.signedCount])
    
    const consensusReached = signedCount >= requiredSignatures

    // Memoize verifiers to prevent re-generation on each render
    const verifiers = useMemo(() => {
        if (verifierStatus?.nodes) {
            return verifierStatus.nodes
        }
        // Generate stable mock data only once
        return Array.from({ length: 11 }, (_, i) => ({
            id: `verifier-${i + 1}`,
            address: `0x${(i + 1).toString(16).padStart(4, '0')}...${(0xABCD + i).toString(16)}`,
            reliability: 0.95 + (i % 5) * 0.01,
            avgLatencyMs: 35 + (i * 3),
        }))
    }, [verifierStatus?.nodes])

    return (
        <DashboardLayout>
            <div className="p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary" />
                            BFT Verification
                        </h1>
                        <button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="btn-quantum flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Refresh
                        </button>
                    </div>

                    {/* Network Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="card-quantum p-4">
                            <div className="text-xs text-muted-foreground mb-1">Total Nodes</div>
                            <div className="text-2xl font-bold">{totalNodes}</div>
                        </div>
                        <div className="card-quantum p-4">
                            <div className="text-xs text-muted-foreground mb-1">Active Nodes</div>
                            <div className="text-2xl font-bold text-accent">{activeNodes}</div>
                        </div>
                        <div className="card-quantum p-4">
                            <div className="text-xs text-muted-foreground mb-1">Required Signatures</div>
                            <div className="text-2xl font-bold">{requiredSignatures}</div>
                        </div>
                        <div className="card-quantum p-4">
                            <div className="text-xs text-muted-foreground mb-1">Fault Tolerance</div>
                            <div className="text-2xl font-bold text-primary">{faultTolerance} nodes</div>
                        </div>
                    </div>

                    {/* Consensus Status */}
                    <div className="card-quantum p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Latest Consensus Status</h2>
                            <span className={`px-3 py-1 rounded-full text-sm ${consensusReached
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {signedCount}/{totalNodes} Signatures
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Signatures Received</span>
                                <span className="font-medium">{signedCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Required (2f + 1)</span>
                                <span className="font-medium">{requiredSignatures}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Consensus</span>
                                <span className={`font-medium ${consensusReached ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {consensusReached ? 'Reached ✓' : 'Pending...'}
                                </span>
                            </div>
                            <div className="h-2 bg-dark-100 rounded-full overflow-hidden mt-4">
                                <motion.div
                                    className={`h-full rounded-full ${consensusReached
                                            ? 'bg-gradient-to-r from-accent to-primary'
                                            : 'bg-yellow-400'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(signedCount / totalNodes) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recent Verifications */}
                    {recentVerifications.length > 0 && (
                        <div className="card-quantum p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Recent Verifications</h2>
                            <div className="space-y-3">
                                {recentVerifications.map((verification: any) => (
                                    <div
                                        key={verification.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-dark-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            {verification.status === 'verified' ? (
                                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                            ) : verification.status === 'rejected' ? (
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-yellow-400" />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium">{verification.type || 'Transaction'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {verification.verificationResult?.totalSignatures || 0}/{verification.verificationResult?.requiredSignatures || 7} signatures
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {verification.transactionHash && (
                                                <a
                                                    href={`https://testnet.arcscan.io/tx/${verification.transactionHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                                >
                                                    ArcScan <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-xs ${verification.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                                                    verification.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {verification.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verifier Nodes */}
                    <div className="card-quantum p-6">
                        <h2 className="text-lg font-semibold mb-4">Verifier Nodes (11-node BFT Network)</h2>
                        <div className="space-y-3">
                            {verifiers.map((verifier: any, index: number) => {
                                const isSigned = index < signedCount
                                return (
                                    <motion.div
                                        key={verifier.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 rounded-xl bg-dark-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isSigned ? (
                                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                                            )}
                                            <div>
                                                <div className="font-mono text-sm">
                                                    {verifier.address?.slice(0, 10)}...{verifier.address?.slice(-6)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {verifier.id} • {Math.round(verifier.avgLatencyMs)}ms • {Math.round(verifier.reliability * 100)}% reliable
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs ${isSigned
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-muted-foreground/20 text-muted-foreground'
                                                }`}
                                        >
                                            {isSigned ? 'Signed' : 'Pending'}
                                        </span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
