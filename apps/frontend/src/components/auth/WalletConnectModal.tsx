'use client';

import { useState } from 'react';
import { X, Wallet, CheckCircle, Loader2, ExternalLink, Copy, Shield, Sparkles } from 'lucide-react';

interface WalletInfo {
  name: string;
  address: string;
  balance: string;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: WalletInfo) => void;
}

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect to your MetaMask wallet',
    popular: true,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Connect to Coinbase Wallet',
    popular: true,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Scan with WalletConnect',
    popular: false,
  },
  {
    id: 'circle',
    name: 'Circle Wallet',
    icon: '⭕',
    description: 'Connect your Circle programmable wallet',
    popular: true,
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Connect to Trust Wallet',
    popular: false,
  },
];

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  if (!isOpen) return null;
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<WalletInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockWallet: WalletInfo = {
      name: wallets.find(w => w.id === walletId)?.name || 'Wallet',
      address: '0xa395DE9aFC8864ecbA1E03C5519De053EBe4573F',
      balance: '1,247.50 USDC',
    };
    
    setConnected(mockWallet);
    setConnecting(null);
  };

  const handleConfirm = () => {
    if (connected) {
      onConnect(connected);
      onClose();
    }
  };

  const copyAddress = () => {
    if (connected) {
      navigator.clipboard.writeText(connected.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0F1629] border border-[#00D9FF]/20 rounded-2xl shadow-2xl shadow-[#7B61FF]/20 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#00D9FF]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#00D9FF]/20 to-[#7B61FF]/20">
              <Wallet size={20} className="text-[#00D9FF]" />
            </div>
            <div>
              <h3 className="font-semibold">Connect Wallet</h3>
              <p className="text-xs text-[#8892A7]">Select a wallet to connect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!connected ? (
            <>
              {/* Popular wallets */}
              <div className="mb-6">
                <p className="text-xs text-[#8892A7] mb-3 flex items-center gap-2">
                  <Sparkles size={12} className="text-[#FFB800]" />
                  Popular
                </p>
                <div className="space-y-2">
                  {wallets.filter(w => w.popular).map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleConnect(wallet.id)}
                      disabled={connecting !== null}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        connecting === wallet.id
                          ? 'border-[#00D9FF] bg-[#00D9FF]/10'
                          : 'border-[#2D3748] hover:border-[#00D9FF]/50 hover:bg-[#151C2C]'
                      } disabled:opacity-50`}
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-[#8892A7]">{wallet.description}</p>
                      </div>
                      {connecting === wallet.id && (
                        <Loader2 size={20} className="text-[#00D9FF] animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other wallets */}
              <div>
                <p className="text-xs text-[#8892A7] mb-3">Other wallets</p>
                <div className="space-y-2">
                  {wallets.filter(w => !w.popular).map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleConnect(wallet.id)}
                      disabled={connecting !== null}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${
                        connecting === wallet.id
                          ? 'border-[#00D9FF] bg-[#00D9FF]/10'
                          : 'border-[#2D3748] hover:border-[#00D9FF]/50 hover:bg-[#151C2C]'
                      } disabled:opacity-50`}
                    >
                      <span className="text-xl">{wallet.icon}</span>
                      <span className="flex-1 text-left text-sm">{wallet.name}</span>
                      {connecting === wallet.id && (
                        <Loader2 size={16} className="text-[#00D9FF] animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Connected state */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00FF94]/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-[#00FF94]" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Wallet Connected!</h4>
              <p className="text-sm text-[#8892A7] mb-6">
                Your {connected.name} is now connected
              </p>

              {/* Wallet info card */}
              <div className="p-4 bg-[#151C2C] rounded-xl border border-[#00D9FF]/20 mb-6 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#8892A7]">Address</span>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1 text-xs text-[#00D9FF] hover:underline"
                  >
                    {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-sm mb-4">{shortenAddress(connected.address)}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-[#00D9FF]/10">
                  <span className="text-sm text-[#8892A7]">Balance</span>
                  <span className="font-semibold text-[#00FF94]">{connected.balance}</span>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#8892A7] mb-6">
                <Shield size={12} className="text-[#00FF94]" />
                <span>Secured with post-quantum encryption</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConnected(null)}
                  className="flex-1 py-3 border border-[#2D3748] rounded-xl text-[#8892A7] hover:text-white hover:border-[#00D9FF]/50 transition-all"
                >
                  Change Wallet
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] rounded-xl text-white font-medium hover:shadow-lg hover:shadow-[#00D9FF]/30 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#00D9FF]/10 bg-[#0A0E17]/50">
          <div className="flex items-center justify-between text-xs text-[#8892A7]">
            <span>New to crypto wallets?</span>
            <a href="#" className="flex items-center gap-1 text-[#00D9FF] hover:underline">
              Learn more <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
