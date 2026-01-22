'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Volume2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface AgentChatProps {
  onMoodChange?: (mood: 'happy' | 'thinking' | 'alert') => void
  onSpeakingChange?: (speaking: boolean) => void
}

export function AgentChat({ onMoodChange, onSpeakingChange }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: "I'm Captain Whiskers, your quantum-powered treasury agent. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    onMoodChange?.('thinking')

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on my quantum analysis, your portfolio is optimally diversified. The VQE circuit shows a Sharpe ratio of 1.42.",
        "I've verified this transaction through our BFT consensus layer. 7 out of 11 verifiers have signed.",
        "Current market conditions suggest maintaining your USDC allocation. Risk level: Low.",
        "I'm using CRYSTALS-Dilithium signatures for all your transactions. Quantum-safe security enabled.",
        "Your daily spending policy is set at $500 USDC. You've used $50 so far today. Would you like me to adjust the limit?",
      ]

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)
      onMoodChange?.('happy')
      onSpeakingChange?.(true)
      
      // Stop speaking animation after a bit
      setTimeout(() => onSpeakingChange?.(false), 2000)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-80">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-dark-100 rounded-bl-md'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 px-4 py-2 bg-dark-100 rounded-2xl rounded-bl-md w-16"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Captain Whiskers..."
            className="w-full px-4 py-3 pr-12 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <button className="p-3 rounded-xl bg-dark-100 hover:bg-dark-200 transition-colors">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
