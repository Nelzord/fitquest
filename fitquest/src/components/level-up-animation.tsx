"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface LevelUpAnimationProps {
  level: number
  show: boolean
  onComplete: () => void
}

export function LevelUpAnimation({ level, show, onComplete }: LevelUpAnimationProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)

    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -100 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <motion.div
              className="relative flex items-center justify-center w-32 h-32 rounded-full bg-primary/20"
              animate={{
                boxShadow: [
                  "0 0 20px 10px rgba(var(--primary-rgb), 0.3)",
                  "0 0 40px 20px rgba(var(--primary-rgb), 0.5)",
                  "0 0 20px 10px rgba(var(--primary-rgb), 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Sparkles className="absolute h-full w-full text-primary animate-spin-slow" />
              <motion.div
                className="text-6xl font-bold text-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                {level}
              </motion.div>
            </motion.div>

            <motion.h2
              className="mt-6 text-3xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Level Up!
            </motion.h2>

            <motion.p
              className="mt-2 text-xl text-white/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              You've reached level {level}
            </motion.p>

            <motion.div
              className="mt-8 grid grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <span className="text-xs text-white/60">Strength</span>
                <span className="text-lg font-bold text-white">+5</span>
              </div>
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <span className="text-xs text-white/60">Stamina</span>
                <span className="text-lg font-bold text-white">+3</span>
              </div>
              <div className="flex flex-col items-center bg-white/10 rounded-lg p-3">
                <span className="text-xs text-white/60">Gold</span>
                <span className="text-lg font-bold text-white">+100</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

