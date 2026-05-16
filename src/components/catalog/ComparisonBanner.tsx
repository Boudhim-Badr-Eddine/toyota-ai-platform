'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const STORAGE_KEY = 'toyota-comparison-hint-dismissed'

export function ComparisonBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 px-4 py-3 bg-[#161616] border border-white/8 rounded-xl text-sm"
        >
          <span className="text-lg leading-none select-none" aria-hidden>💡</span>
          <span className="flex-1 text-white/65">
            Conseil&nbsp;: Demandez à notre IA de comparer deux modèles pour vous&nbsp;!
          </span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
            className="shrink-0 text-toyota-red hover:text-white text-xs font-bold transition-colors"
          >
            Demander à l&apos;IA →
          </button>
          <button
            onClick={dismiss}
            className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
