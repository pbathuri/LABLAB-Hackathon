'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CaptainWhiskersMascotProps {
  size?: number
  mood?: 'happy' | 'thinking' | 'alert' | 'sleeping'
  speaking?: boolean
  className?: string
}

export function CaptainWhiskersMascot({ 
  size = 300, 
  mood = 'happy',
  speaking = false,
  className = ''
}: CaptainWhiskersMascotProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  
  // Blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 4000)
    
    return () => clearInterval(blinkInterval)
  }, [])

  const eyeScale = isBlinking ? 0.1 : 1
  const mouthPath = getMouthPath(mood)
  
  return (
    <motion.div 
      className={`relative ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 400 400"
        className="drop-shadow-2xl"
      >
        {/* Glow Effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14F5DD" />
            <stop offset="100%" stopColor="#0DD9C4" />
          </linearGradient>
          <radialGradient id="eyeGradient">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </radialGradient>
        </defs>

        {/* Captain's Hat */}
        <motion.g
          animate={{ rotate: speaking ? [-2, 2, -2] : 0 }}
          transition={{ duration: 0.3, repeat: speaking ? Infinity : 0 }}
          style={{ transformOrigin: '200px 100px' }}
        >
          {/* Hat Base */}
          <ellipse cx="200" cy="115" rx="85" ry="20" fill="#1A1A2E" />
          <path 
            d="M115 115 Q115 50 200 50 Q285 50 285 115" 
            fill="#1A1A2E" 
          />
          {/* Hat Band */}
          <rect x="115" y="105" width="170" height="20" fill="url(#accentGradient)" rx="4" />
          {/* Hat Emblem - Quantum Symbol */}
          <circle cx="200" cy="80" r="15" fill="url(#accentGradient)" />
          <text x="200" y="86" textAnchor="middle" fill="#1A1A2E" fontSize="18" fontWeight="bold">⚛</text>
        </motion.g>

        {/* Ears */}
        <motion.path 
          d="M115 170 L80 100 L140 140 Z" 
          fill="url(#bodyGradient)"
          animate={{ rotate: mood === 'alert' ? [-5, 5, -5] : 0 }}
          transition={{ duration: 0.5, repeat: mood === 'alert' ? Infinity : 0 }}
          style={{ transformOrigin: '110px 135px' }}
        />
        <motion.path 
          d="M285 170 L320 100 L260 140 Z" 
          fill="url(#bodyGradient)"
          animate={{ rotate: mood === 'alert' ? [5, -5, 5] : 0 }}
          transition={{ duration: 0.5, repeat: mood === 'alert' ? Infinity : 0 }}
          style={{ transformOrigin: '290px 135px' }}
        />
        {/* Inner Ears */}
        <path d="M118 165 L95 115 L135 145 Z" fill="#DDD6FE" opacity="0.5" />
        <path d="M282 165 L305 115 L265 145 Z" fill="#DDD6FE" opacity="0.5" />

        {/* Head/Face */}
        <ellipse cx="200" cy="220" rx="100" ry="90" fill="url(#bodyGradient)" filter="url(#glow)" />
        
        {/* Face Marking */}
        <path 
          d="M160 180 Q200 140 240 180" 
          fill="none" 
          stroke="url(#accentGradient)" 
          strokeWidth="3"
          opacity="0.5"
        />

        {/* Eyes */}
        <g>
          {/* Left Eye */}
          <motion.g
            animate={{ scaleY: eyeScale }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '160px 200px' }}
          >
            <ellipse cx="160" cy="200" rx="25" ry="30" fill="white" />
            <motion.ellipse 
              cx="165" 
              cy="200" 
              rx="15" 
              ry="18" 
              fill="url(#eyeGradient)"
              animate={{ x: mood === 'thinking' ? [0, 5, 0] : 0 }}
              transition={{ duration: 2, repeat: mood === 'thinking' ? Infinity : 0 }}
            />
            <ellipse cx="170" cy="195" rx="5" ry="6" fill="white" />
          </motion.g>

          {/* Right Eye */}
          <motion.g
            animate={{ scaleY: eyeScale }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '240px 200px' }}
          >
            <ellipse cx="240" cy="200" rx="25" ry="30" fill="white" />
            <motion.ellipse 
              cx="245" 
              cy="200" 
              rx="15" 
              ry="18" 
              fill="url(#eyeGradient)"
              animate={{ x: mood === 'thinking' ? [0, 5, 0] : 0 }}
              transition={{ duration: 2, repeat: mood === 'thinking' ? Infinity : 0 }}
            />
            <ellipse cx="250" cy="195" rx="5" ry="6" fill="white" />
          </motion.g>
        </g>

        {/* Nose */}
        <ellipse cx="200" cy="240" rx="12" ry="8" fill="#14F5DD" />

        {/* Mouth */}
        <motion.path 
          d={mouthPath} 
          fill="none" 
          stroke="#DDD6FE" 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={speaking ? { d: [mouthPath, getSpeakingPath(mood), mouthPath] } : {}}
          transition={{ duration: 0.2, repeat: speaking ? Infinity : 0 }}
        />

        {/* Whiskers */}
        <g className="whisker-animate" style={{ transformOrigin: '200px 240px' }}>
          {/* Left Whiskers */}
          <line x1="170" y1="235" x2="100" y2="220" stroke="#DDD6FE" strokeWidth="2" opacity="0.7" />
          <line x1="170" y1="245" x2="95" y2="245" stroke="#DDD6FE" strokeWidth="2" opacity="0.7" />
          <line x1="170" y1="255" x2="100" y2="270" stroke="#DDD6FE" strokeWidth="2" opacity="0.7" />
          
          {/* Right Whiskers */}
          <line x1="230" y1="235" x2="300" y2="220" stroke="#DDD6FE" strokeWidth="2" opacity="0.7" />
          <line x1="230" y1="245" x2="305" y2="245" stroke="#DDD6FE" strokeWidth="2" opacity="0.7" />
          <line x1="230" y1="255" x2="300" y2="270" stroke="#DDD6FE" strokeWidth="2" opacity="0.7" />
        </g>

        {/* Body */}
        <ellipse cx="200" cy="350" rx="80" ry="50" fill="url(#bodyGradient)" />

        {/* Paws */}
        <ellipse cx="140" cy="370" rx="25" ry="15" fill="url(#bodyGradient)" />
        <ellipse cx="260" cy="370" rx="25" ry="15" fill="url(#bodyGradient)" />

        {/* Collar with Quantum Badge */}
        <rect x="150" y="300" width="100" height="20" fill="url(#accentGradient)" rx="10" />
        <circle cx="200" cy="310" r="12" fill="#1A1A2E" />
        <text x="200" y="315" textAnchor="middle" fill="#14F5DD" fontSize="12">$</text>

        {/* Tail */}
        <motion.path 
          d="M280 340 Q340 320 340 280 Q340 240 320 220"
          fill="none"
          stroke="url(#bodyGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          className="tail-animate"
        />
      </svg>

      {/* Status Indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <motion.div 
          className="flex items-center gap-2 px-3 py-1 rounded-full glass text-xs"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className={`w-2 h-2 rounded-full ${getMoodColor(mood)}`} />
          <span className="capitalize">{mood}</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

function getMouthPath(mood: string): string {
  switch (mood) {
    case 'happy':
      return 'M170 260 Q200 280 230 260'
    case 'thinking':
      return 'M180 265 Q200 265 220 260'
    case 'alert':
      return 'M175 260 Q200 255 225 260'
    case 'sleeping':
      return 'M180 265 Q200 275 220 265'
    default:
      return 'M170 260 Q200 280 230 260'
  }
}

function getSpeakingPath(mood: string): string {
  switch (mood) {
    case 'happy':
      return 'M175 258 Q200 290 225 258'
    default:
      return 'M180 260 Q200 285 220 260'
  }
}

function getMoodColor(mood: string): string {
  switch (mood) {
    case 'happy':
      return 'bg-green-400'
    case 'thinking':
      return 'bg-yellow-400'
    case 'alert':
      return 'bg-red-400'
    case 'sleeping':
      return 'bg-blue-400'
    default:
      return 'bg-green-400'
  }
}
