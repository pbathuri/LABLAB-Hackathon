'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Settings,
  Wallet,
  History,
  Shield,
  Cpu,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { NotificationsModal } from '@/components/modals/NotificationsModal'
import { HelpModal } from '@/components/modals/HelpModal'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/quantum', icon: Cpu, label: 'Quantum' },
  { href: '/dashboard/verification', icon: Shield, label: 'Verification' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'AI Chat' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { wallet, disconnect: clearWallet, connect, isConnected, isConnecting } = useWallet()

  const handleDisconnect = () => {
    clearWallet()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        className="fixed left-0 top-0 h-full glass border-r border-white/10 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
              <img
                src="/images/captain-whiskers-astronaut.svg"
                alt="Captain Whiskers"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-lg font-bold gradient-text whitespace-nowrap"
              >
                Captain Whiskers
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
                      isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'hover:bg-white/5 text-muted-foreground hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-6 bg-primary rounded-l-full"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            {!collapsed && wallet && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-dark-100 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </div>
                  <div className="text-xs text-muted-foreground">Connected</div>
                </div>
              </div>
            )}

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                {!collapsed && <span>Disconnect</span>}
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-5 h-5" />
                {!collapsed && <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>}
              </button>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-dark-100 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 260 }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions, assets..."
                className="w-80 px-4 py-2 pl-10 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
              </button>

              {/* Help */}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>

      {/* Modals */}
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
