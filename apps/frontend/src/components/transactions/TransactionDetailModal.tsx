'use client';

import { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Atom,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'optimize' | 'verify';
  status: 'completed' | 'pending' | 'failed';
  amount: string;
  token: string;
  from?: string;
  to?: string;
  timestamp: string;
  hash: string;
  fee?: string;
  blockNumber?: number;
  confirmations?: number;
  verificationDetails?: {
    signaturesReceived: number;
    signaturesRequired: number;
    verifiers: { address: string; signed: boolean; timestamp?: string }[];
  };
  quantumDetails?: {
    optimizationType: string;
    expectedReturn: string;
    riskLevel: string;
    portfolioChanges: { asset: string; from: string; to: string }[];
  };
}

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  const [showQuantumDetails, setShowQuantumDetails] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle2 size={24} className="text-[#00FF94]" />;
      case 'pending':
        return <Clock size={24} className="text-[#FFB800]" />;
      case 'failed':
        return <AlertCircle size={24} className="text-[#FF4757]" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed': return 'text-[#00FF94]';
      case 'pending': return 'text-[#FFB800]';
      case 'failed': return 'text-[#FF4757]';
    }
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'send':
        return <ArrowUpRight size={20} className="text-[#FF4757]" />;
      case 'receive':
        return <ArrowDownLeft size={20} className="text-[#00FF94]" />;
      case 'swap':
        return <div className="text-xl">🔄</div>;
      case 'optimize':
        return <Atom size={20} className="text-[#7B61FF]" />;
      case 'verify':
        return <ShieldCheck size={20} className="text-[#00D9FF]" />;
    }
  };

  const getTypeName = () => {
    switch (transaction.type) {
      case 'send': return 'Sent';
      case 'receive': return 'Received';
      case 'swap': return 'Swap';
      case 'optimize': return 'Quantum Optimization';
      case 'verify': return 'Verification';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden relative border border-[#00D9FF]/20">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1629] border-b border-[#00D9FF]/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#151C2C]">
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="font-semibold">{getTypeName()}</h3>
              <p className="text-xs text-[#8892A7]">{transaction.timestamp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#151C2C] text-[#8892A7] hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* Amount & Status */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium capitalize ${getStatusColor()}`}>
                {transaction.status}
              </span>
            </div>
            <p className={`text-3xl font-bold ${transaction.type === 'receive' ? 'text-[#00FF94]' : ''}`}>
              {transaction.type === 'receive' ? '+' : transaction.type === 'send' ? '-' : ''}
              {transaction.amount} {transaction.token}
            </p>
            {transaction.fee && (
              <p className="text-sm text-[#8892A7] mt-1">
                Network Fee: {transaction.fee}
              </p>
            )}
          </div>

          {/* Addresses */}
          <div className="space-y-3">
            {transaction.from && (
              <div className="bg-[#0F1629] rounded-xl p-4 border border-[#00D9FF]/10">
                <p className="text-xs text-[#8892A7] mb-1">From</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm mono">{formatAddress(transaction.from)}</span>
                  <button
                    onClick={() => copyToClipboard(transaction.from!, 'from')}
                    className="p-1.5 rounded-lg hover:bg-[#151C2C] text-[#8892A7] hover:text-[#00D9FF] transition-all"
                  >
                    {copiedField === 'from' ? <CheckCircle2 size={14} className="text-[#00FF94]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
            {transaction.to && (
              <div className="bg-[#0F1629] rounded-xl p-4 border border-[#00D9FF]/10">
                <p className="text-xs text-[#8892A7] mb-1">To</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm mono">{formatAddress(transaction.to)}</span>
                  <button
                    onClick={() => copyToClipboard(transaction.to!, 'to')}
                    className="p-1.5 rounded-lg hover:bg-[#151C2C] text-[#8892A7] hover:text-[#00D9FF] transition-all"
                  >
                    {copiedField === 'to' ? <CheckCircle2 size={14} className="text-[#00FF94]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[#8892A7]">Transaction Details</h4>
            
            <div className="bg-[#0F1629] rounded-xl divide-y divide-[#00D9FF]/10 border border-[#00D9FF]/10">
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-[#8892A7]">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm mono">{formatAddress(transaction.hash)}</span>
                  <button
                    onClick={() => copyToClipboard(transaction.hash, 'hash')}
                    className="p-1 text-[#8892A7] hover:text-[#00D9FF] transition-colors"
                  >
                    {copiedField === 'hash' ? <CheckCircle2 size={12} className="text-[#00FF94]" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              {transaction.blockNumber && (
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-[#8892A7]">Block Number</span>
                  <span className="text-sm mono">{transaction.blockNumber.toLocaleString()}</span>
                </div>
              )}
              {transaction.confirmations !== undefined && (
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-[#8892A7]">Confirmations</span>
                  <span className={`text-sm ${transaction.confirmations >= 12 ? 'text-[#00FF94]' : 'text-[#FFB800]'}`}>
                    {transaction.confirmations}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Details */}
          {transaction.verificationDetails && (
            <div className="space-y-3">
              <button
                onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                className="w-full flex items-center justify-between p-3 bg-[#0F1629] rounded-xl border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-[#00D9FF]" />
                  <span className="text-sm font-medium">BFT Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#00FF94]">
                    {transaction.verificationDetails.signaturesReceived}/{transaction.verificationDetails.signaturesRequired}
                  </span>
                  {showVerificationDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {showVerificationDetails && (
                <div className="bg-[#0F1629] rounded-xl p-4 border border-[#00D9FF]/10 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {transaction.verificationDetails.verifiers.map((verifier, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1.5 rounded-lg text-xs ${
                          verifier.signed
                            ? 'bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94]'
                            : 'bg-[#151C2C] border border-[#8892A7]/20 text-[#8892A7]'
                        }`}
                      >
                        {formatAddress(verifier.address)}
                        {verifier.signed && <CheckCircle2 size={10} className="inline ml-1" />}
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 bg-[#151C2C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00FF94] to-[#00D9FF] rounded-full transition-all"
                      style={{
                        width: `${(transaction.verificationDetails.signaturesReceived / transaction.verificationDetails.signaturesRequired) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantum Details */}
          {transaction.quantumDetails && (
            <div className="space-y-3">
              <button
                onClick={() => setShowQuantumDetails(!showQuantumDetails)}
                className="w-full flex items-center justify-between p-3 bg-[#0F1629] rounded-xl border border-[#7B61FF]/20 hover:border-[#7B61FF]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Atom size={18} className="text-[#7B61FF]" />
                  <span className="text-sm font-medium">Quantum Analysis</span>
                </div>
                {showQuantumDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showQuantumDetails && (
                <div className="bg-[#0F1629] rounded-xl p-4 border border-[#7B61FF]/20 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#151C2C] rounded-lg p-3">
                      <p className="text-xs text-[#8892A7] mb-1">Expected Return</p>
                      <p className="text-sm font-semibold text-[#00FF94]">
                        {transaction.quantumDetails.expectedReturn}
                      </p>
                    </div>
                    <div className="bg-[#151C2C] rounded-lg p-3">
                      <p className="text-xs text-[#8892A7] mb-1">Risk Level</p>
                      <p className="text-sm font-semibold text-[#FFB800]">
                        {transaction.quantumDetails.riskLevel}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#8892A7] mb-2">Portfolio Adjustments</p>
                    <div className="space-y-2">
                      {transaction.quantumDetails.portfolioChanges.map((change, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-[#8892A7]">{change.asset}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#FF4757]">{change.from}</span>
                            <span className="text-[#8892A7]">→</span>
                            <span className="text-[#00FF94]">{change.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#0F1629] border-t border-[#00D9FF]/10 px-6 py-4">
          <a
            href={`https://testnet.arcscan.io/tx/${transaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00D9FF]/10 to-[#7B61FF]/10 border border-[#00D9FF]/30 rounded-xl text-[#00D9FF] font-medium hover:bg-[#00D9FF]/20 transition-all"
          >
            <FileText size={18} />
            View on ArcScan
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

// Sample transaction for testing
export const sampleTransaction: Transaction = {
  id: 'tx-1',
  type: 'optimize',
  status: 'completed',
  amount: '1,250.00',
  token: 'USDC',
  from: '0xa395DE9aFC8864ecbA1E03C5519De053EBe4573F',
  to: '0x32368037b14819C9e5Dbe96b3d67C59b8c65c4BF',
  timestamp: 'Jan 22, 2026 10:45:32 AM',
  hash: '0x723204f050fad088850742c81423bd77b57a407ba09dde5747ddc34959efec22',
  fee: '0.0044 USDC',
  blockNumber: 22965004,
  confirmations: 127,
  verificationDetails: {
    signaturesReceived: 9,
    signaturesRequired: 7,
    verifiers: [
      { address: '0x1234567890abcdef1234567890abcdef12345678', signed: true },
      { address: '0x2345678901bcdef02345678901bcdef023456789', signed: true },
      { address: '0x3456789012cdef03456789012cdef0345678901a', signed: true },
      { address: '0x4567890123def04567890123def04567890123ab', signed: true },
      { address: '0x5678901234ef05678901234ef05678901234abcd', signed: true },
      { address: '0x6789012345f06789012345f067890123456bcdef', signed: true },
      { address: '0x789012345607890123456078901234567cdef012', signed: true },
      { address: '0x89012345670890123456708901234567def01234', signed: true },
      { address: '0x90123456780901234567809012345678ef012345', signed: true },
      { address: '0x01234567890123456780123456789012f0123456', signed: false },
      { address: '0x12345678901234567801234567890123f1234567', signed: false },
    ]
  },
  quantumDetails: {
    optimizationType: 'VQE Portfolio Optimization',
    expectedReturn: '+12.4%',
    riskLevel: 'Moderate',
    portfolioChanges: [
      { asset: 'USDC', from: '60%', to: '45%' },
      { asset: 'WETH', from: '25%', to: '35%' },
      { asset: 'WBTC', from: '15%', to: '20%' },
    ]
  }
};
