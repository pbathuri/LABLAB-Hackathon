'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AgentChat } from '@/components/dashboard/AgentChat'
import { CaptainWhiskersMascot } from '@/components/mascot/CaptainWhiskersMascot'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
  const [agentMood, setAgentMood] = useState<'happy' | 'thinking' | 'alert'>('happy')
  const [isSpeaking, setIsSpeaking] = useState(false)

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            AI Assistant
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mascot */}
            <div className="lg:col-span-1">
              <div className="card-quantum p-6 flex flex-col items-center">
                <div className="mb-4">
                  <CaptainWhiskersMascot
                    size={200}
                    mood={agentMood}
                    speaking={isSpeaking}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Captain Whiskers</h3>
                  <p className="text-sm text-muted-foreground">
                    Your quantum-powered treasury assistant
                  </p>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-2">
              <div className="card-quantum p-6">
                <AgentChat
                  onMoodChange={setAgentMood}
                  onSpeakingChange={setIsSpeaking}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
