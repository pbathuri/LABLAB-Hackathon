'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Copy } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface SendTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function SendTransactionModal({ isOpen, onClose, onSuccess }: SendTransactionModalProps) {
  const { wallet } = useWallet()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<'USDC' | 'ARC'>('USDC')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wallet?.address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!recipient || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      toast.error('Invalid recipient address')
      return
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount')
      return
    }

    setIsSubmitting(true)

    try {
      // Option 1: Direct settlement (if available)
      // Option 2: Use agent to make decision
      const result = await api.initiateTransaction({
        from: wallet.address,
        to: recipient,
        amount: amountNum.toString(),
        token,
        description: description || `Send ${amount} ${token} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      })

      if (result.txHash) {
        setTxHash(result.txHash)
        toast.success('Transaction initiated!')
        onSuccess?.()
        
        // Close modal after 3 seconds
        setTimeout(() => {
          handleClose()
        }, 3000)
      } else if (result.decisionId) {
        // Transaction requires agent decision and BFT verification
        toast.success('Transaction submitted for verification. Waiting for BFT consensus...')
        setTxHash(result.decisionId)
        
        // Poll for transaction status
        pollTransactionStatus(result.decisionId)
      }
    } catch (error: any) {
      console.error('Transaction failed:', error)
      toast.error(error.message || 'Failed to initiate transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pollTransactionStatus = async (decisionId: string) => {
    // Poll every 2 seconds for up to 30 seconds
    let attempts = 0
    const maxAttempts = 15

    const interval = setInterval(async () => {
      attempts++
      
      try {
        const status = await api.getTransactionStatus(decisionId)
        
        if (status.status === 'completed' && status.txHash) {
          setTxHash(status.txHash)
          toast.success('Transaction confirmed!')
          onSuccess?.()
          clearInterval(interval)
          
          setTimeout(() => {
            handleClose()
          }, 3000)
        } else if (status.status === 'failed') {
          toast.error('Transaction failed')
          clearInterval(interval)
        } else if (attempts >= maxAttempts) {
          toast.error('Transaction timeout')
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Status check failed:', error)
        if (attempts >= maxAttempts) {
          clearInterval(interval)
        }
      }
    }, 2000)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRecipient('')
      setAmount('')
      setDescription('')
      setTxHash(null)
      onClose()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const maxAmount = token === 'USDC' 
    ? parseFloat(wallet?.balance?.USDC || '0')
    : parseFloat(wallet?.balance?.ARC || '0')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="card-quantum w-full max-w-md p-6 relative"
        >
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-muted-foreground hover:text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
            <ArrowUpRight className="w-6 h-6 text-primary" />
            Send Transaction
          </h2>

          {txHash ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-green-500/20 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Transaction Initiated!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your transaction is being processed and verified by our BFT consensus layer.
                </p>
                <div className="flex items-center justify-center gap-2 p-3 bg-dark-100 rounded-lg">
                  <code className="text-xs font-mono">{txHash.slice(0, 10)}...{txHash.slice(-8)}</code>
                  <button
                    onClick={() => copyToClipboard(txHash)}
                    className="p-1 hover:bg-dark-200 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={`https://testnet.arcscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-4 inline-block"
                >
                  View on ArcScan →
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Token</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setToken('USDC')}
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                      token === 'USDC'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    USDC
                  </button>
                  <button
                    type="button"
                    onClick={() => setToken('ARC')}
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                      token === 'ARC'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    ARC
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: {maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {token}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setAmount(maxAmount.toString())}
                    className="text-xs text-primary hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="text-sm font-medium mb-2 block">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                  required
                />
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this payment for?"
                  className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !recipient || !amount}
                className="w-full btn-quantum flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Initiating...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5" />
                    <span>Send {amount || '0'} {token}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                This transaction will be verified by our BFT consensus layer (7/11 signatures required)
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
