'use client'

import { useState } from 'react'
import { X, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Transaction Confirmed',
    message: 'Your portfolio optimization has been completed successfully.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'BFT Verification Complete',
    message: '9 out of 11 verifiers have signed your transaction.',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Balance Alert',
    message: 'Your USDC balance is below the recommended threshold.',
    timestamp: '1 day ago',
    read: true,
  },
]

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications] = useState<Notification[]>(mockNotifications)

  if (!isOpen) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0F1629] border border-[#00D9FF]/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#00D9FF]/10">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#00D9FF]" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-[#8892A7]">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.read
                    ? 'bg-[#151C2C] border-[#00D9FF]/10'
                    : 'bg-[#0F1629] border-[#00D9FF]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-[#00D9FF]" />
                      )}
                    </div>
                    <p className="text-xs text-[#8892A7] mb-2">{notification.message}</p>
                    <span className="text-xs text-[#8892A7]">{notification.timestamp}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
