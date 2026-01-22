'use client'

import { motion } from 'framer-motion'

interface QuantumOrbProps {
  className?: string
  delay?: number
}

export function QuantumOrb({ className = '', delay = 0 }: QuantumOrbProps) {
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.6, scale: 1 }}
      transition={{ delay, duration: 1, type: 'spring' }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        {/* Core */}
        <div className="absolute inset-1/4 rounded-full bg-gradient-radial from-accent/40 to-transparent blur-lg" />
        
        {/* Orbiting rings */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-primary/30"
          style={{ transform: 'rotateX(60deg)' }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border border-accent/20"
          style={{ transform: 'rotateX(60deg) rotateZ(45deg)' }}
        />
        <motion.div 
          className="absolute inset-4 rounded-full border border-quantum-glow/20"
          style={{ transform: 'rotateX(60deg) rotateZ(90deg)' }}
        />

        {/* Particles */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-accent"
          style={{ top: '10%', left: '50%' }}
          animate={{
            x: [0, 20, 0, -20, 0],
            y: [0, 10, 20, 10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-primary"
          style={{ bottom: '20%', right: '30%' }}
          animate={{
            x: [0, -15, 0, 15, 0],
            y: [0, -10, -20, -10, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </motion.div>
    </motion.div>
  )
}
