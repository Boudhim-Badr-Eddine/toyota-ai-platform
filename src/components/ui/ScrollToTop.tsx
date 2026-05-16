'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-[90px] right-6 z-[9990] w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 transition-colors shadow-lg"
          aria-label="Retour en haut"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  )
}
