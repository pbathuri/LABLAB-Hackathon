'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Settings, Bell, Shield, Network, User } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Settings
          </h1>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">user@example.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wallet Address</span>
                  <span className="font-mono text-sm">0x1234...5678</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Transaction Alerts', enabled: true },
                  { label: 'Verification Updates', enabled: true },
                  { label: 'Portfolio Changes', enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        item.enabled ? 'bg-primary' : 'bg-dark-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          item.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">2FA</span>
                  <span className="text-sm text-muted-foreground">Not enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Post-Quantum Encryption</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Network */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Network</span>
                  <span className="font-medium">Arc Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">RPC URL</span>
                  <span className="font-mono text-xs">testnet-rpc.arc.dev</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
