'use client'

import { X, HelpCircle, Book, Code, Shield, Zap } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const helpSections = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Quantum Optimization',
    content: 'Our VQE algorithm optimizes your portfolio allocation using quantum computing principles for maximum returns with controlled risk.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'BFT Verification',
    content: 'Every transaction is verified by 11 independent nodes. At least 7 signatures are required for approval, ensuring security even if up to 3 nodes are compromised.',
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: 'Post-Quantum Security',
    content: 'All signatures use CRYSTALS-Dilithium, a post-quantum cryptographic algorithm that remains secure even against quantum computers.',
  },
  {
    icon: <Book className="w-5 h-5" />,
    title: 'Getting Started',
    content: 'Connect your wallet, set your risk tolerance, and let Captain Whiskers optimize your portfolio. All transactions are automatically verified and executed.',
  },
]

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0F1629] border border-[#00D9FF]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#00D9FF]/10">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#00D9FF]" />
            <h3 className="font-semibold">Help & Documentation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <div className="space-y-4">
            {helpSections.map((section, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#151C2C] border border-[#00D9FF]/10"
              >
                <div className="flex items-start gap-3">
                  <div className="text-[#00D9FF] mt-0.5">{section.icon}</div>
                  <div>
                    <h4 className="font-semibold mb-2">{section.title}</h4>
                    <p className="text-sm text-[#8892A7]">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#151C2C] border border-[#00D9FF]/10">
            <h4 className="font-semibold mb-2">Need More Help?</h4>
            <p className="text-sm text-[#8892A7] mb-3">
              Visit our documentation or contact support for assistance.
            </p>
            <div className="flex gap-3">
              <a
                href="/docs"
                className="px-4 py-2 rounded-lg bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-colors text-sm"
              >
                View Docs
              </a>
              <a
                href="https://github.com/pbathuri/LABLAB-Hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#151C2C] text-[#8892A7] hover:text-white transition-colors text-sm border border-[#00D9FF]/10"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
