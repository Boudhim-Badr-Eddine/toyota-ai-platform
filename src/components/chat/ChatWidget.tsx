'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Trash2, Send, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useChat, VEHICLE_DATA } from '@/hooks/useChat'
import type { ChatMessage, RecommendationData } from '@/hooks/useChat'

// ─── Markdown renderer ───────────────────────────────────────────────────────

function ri(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-white">{p.slice(2,-2)}</strong>
        if (p.startsWith('*') && p.endsWith('*')) return <em key={i} className="italic text-white/80">{p.slice(1,-1)}</em>
        if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-white/10 text-toyota-red px-1 rounded text-[11px] font-mono">{p.slice(1,-1)}</code>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

function renderMsg(text: string): ReactNode {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const num = /^(\d+)\.\s+(.+)$/.exec(line)
        if (num) return (
          <div key={i} className="flex gap-1.5 my-0.5">
            <span className="text-toyota-red font-bold shrink-0 text-[12px]">{num[1]}.</span>
            <span>{ri(num[2])}</span>
          </div>
        )
        if (/^[-•]\s+/.test(line)) return (
          <div key={i} className="flex gap-1.5 my-0.5">
            <span className="text-toyota-red shrink-0 text-[12px]">•</span>
            <span>{ri(line.replace(/^[-•]\s+/, ''))}</span>
          </div>
        )
        return (
          <span key={i}>
            {ri(line)}
            {i < lines.length - 1 && line !== '' && <br />}
          </span>
        )
      })}
    </>
  )
}

// ─── Time formatter ──────────────────────────────────────────────────────────

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })
}

// ─── Message grouping ──────────────────────────────────────────────────────

interface MsgGroup {
  role: 'user' | 'assistant'
  messages: ChatMessage[]
}

function groupMessages(msgs: ChatMessage[]): MsgGroup[] {
  const groups: MsgGroup[] = []
  for (const m of msgs) {
    const last = groups[groups.length - 1]
    if (last && last.role === m.role && m.ts - last.messages[last.messages.length - 1].ts < 90000) {
      last.messages.push(m)
    } else {
      groups.push({ role: m.role, messages: [m] })
    }
  }
  return groups
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end pl-0.5">
      <div className="w-6 h-6 shrink-0 rounded-full bg-toyota-red flex items-center justify-center text-white text-[10px] font-black shadow-sm shadow-toyota-red/40">
        T
      </div>
      <div className="bg-[#1c1c1e] rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1 items-center border border-white/5">
        {[0,1,2].map(i => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-white/35"
            style={{ animation: `bounce 1.1s ease-in-out ${i*0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── RecommendationCard ─────────────────────────────────────────────────────

function RecommendationCard({ data, onNavigate }: { data: RecommendationData; onNavigate: (url: string) => void }) {
  const vd = VEHICLE_DATA[data.id]
  if (!vd) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="rounded-2xl overflow-hidden border border-toyota-red/25 mt-1 shadow-xl shadow-toyota-red/5"
      style={{ background: 'linear-gradient(145deg, #161616 0%, rgba(235,10,30,0.06) 100%)' }}
    >
      {/* Label */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 border-b border-white/5">
        <Sparkles size={12} className="text-toyota-red" />
        <span className="text-[10px] text-toyota-red font-bold uppercase tracking-[0.12em]">Votre Match Parfait</span>
      </div>
      {/* Vehicle info */}
      <div className="flex gap-3 px-3 py-3">
        <div className="relative w-[88px] h-[60px] rounded-xl overflow-hidden shrink-0 bg-white/4">
          <Image src={vd.imageUrl} alt={vd.name} fill className="object-cover" sizes="88px" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-white font-bold text-[13px] leading-tight">{vd.name}</p>
          <p className="text-white/45 text-[11px] mt-0.5">{vd.subtitle}</p>
          <p className="text-toyota-red font-bold text-[13px] mt-1.5 leading-none">{vd.price}</p>
        </div>
      </div>
      {/* CTAs */}
      <div className="flex gap-2 px-3 pb-3">
        <button
          onClick={() => onNavigate(data.configuratorUrl)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-toyota-red hover:bg-[#c50016] active:scale-95 text-white text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-toyota-red/20"
        >
          ⚙️ Configurer en 3D →
        </button>
        <button
          onClick={() => onNavigate(data.detailUrl)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/6 hover:bg-white/10 active:scale-95 border border-white/10 text-white/75 hover:text-white text-[11px] font-semibold py-2.5 rounded-xl transition-all"
        >
          📋 Voir les détails
        </button>
      </div>
    </motion.div>
  )
}

// ─── MessageGroup component ────────────────────────────────────────────────

function MessageGroupView({ group, isLast }: { group: MsgGroup; isLast: boolean }) {
  const isUser = group.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* Avatar — only shown for AI, only once per group */}
      {!isUser ? (
        <div className="w-6 h-6 shrink-0 rounded-full bg-toyota-red flex items-center justify-center text-white text-[10px] font-black shadow-sm shadow-toyota-red/30 self-end mb-0.5">
          T
        </div>
      ) : (
        <div className="w-6 shrink-0" />
      )}
      {/* Bubbles */}
      <div className={`flex flex-col gap-0.5 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {group.messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                isUser
                  ? 'bg-toyota-red text-white shadow-sm shadow-toyota-red/25'
                  : 'bg-[#1c1c1e] border border-white/6 text-white/90'
              } ${
                isUser
                  ? idx === 0 ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tr-sm'
                  : idx === 0 ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl rounded-tl-sm'
              }`}
            >
              {msg.content
                ? renderMsg(msg.content)
                : <span className="text-white/20 text-[11px] italic">...</span>
              }
            </div>
          </motion.div>
        ))}
        {/* Timestamp on last message of group */}
        <span className="text-[10px] text-white/20 px-1 mt-0.5">
          {fmt(group.messages[group.messages.length - 1].ts)}
        </span>
      </div>
    </div>
  )
}

// ─── ChatWidget main ───────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const { messages, input, setInput, isLoading, error, setError, recommendation, chips, unread, markRead, sendMessage, clearChat } = useChat({ isOpen })

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    }
  }, [messages, isLoading, isOpen])

  // Focus input on open + mark read
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 180)
      markRead()
    }
  }, [isOpen, markRead])

  // Listen for external open trigger (from Header/CTA buttons)
  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('openChatWidget', handler)
    return () => window.removeEventListener('openChatWidget', handler)
  }, [])

  // Keyboard shortcut: Ctrl+/ or Cmd+/
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen(v => !v)
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  function handleNavigate(url: string) {
    setIsOpen(false)
    router.push(url)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const groups = groupMessages(messages)

  return (
    <>
      {/* Global styles */}
      <style>{`
        .w-chat-scroll::-webkit-scrollbar { width: 3px; }
        .w-chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .w-chat-scroll::-webkit-scrollbar-thumb { background: rgba(235,10,30,0.35); border-radius: 99px; }
        .w-chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(235,10,30,0.35) transparent; }
      `}</style>

      {/* ── FAB ──────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2.5">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.92 }}
              transition={{ duration: 0.12 }}
              className="bg-[#111] border border-white/10 text-white text-[12px] font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-2xl pointer-events-none"
            >
              Trouver ma Toyota 🚗
              <span className="ml-2 text-white/30 text-[10px]">Ctrl+/</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <div className="relative">
          {/* Pulse ring — only when closed */}
          {!isOpen && (
            <span className="absolute inset-[-3px] rounded-full bg-toyota-red/25 animate-ping" />
          )}

          {/* Unread badge */}
          {unread > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-white rounded-full flex items-center justify-center text-toyota-red text-[10px] font-black shadow-md">
              {unread > 9 ? '9+' : unread}
            </span>
          )}

          <motion.button
            onClick={() => setIsOpen(v => !v)}
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            className="relative w-[58px] h-[58px] rounded-full bg-toyota-red flex flex-col items-center justify-center shadow-2xl shadow-toyota-red/35 border border-white/10"
            aria-label="Ouvrir Toyota AI"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="x" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X size={22} className="text-white" />
                </motion.div>
              ) : (
                <motion.div key="chat" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.18 }} className="flex flex-col items-center gap-0">
                  <MessageCircle size={21} className="text-white" />
                  <span className="text-white/90 text-[8px] font-black tracking-wider mt-0.5">IA</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── Chat panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{
              transformOrigin: 'bottom right',
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
            className="fixed z-[9998] flex flex-col bg-[#0d0d0d] rounded-[22px] overflow-hidden
              bottom-[78px] right-6 w-[390px] h-[600px]
              max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-[75dvh] max-sm:rounded-b-none max-sm:rounded-t-[22px]"
          >

            {/* ── HEADER */}
            <div
              className="shrink-0 flex items-center gap-3 px-4 py-3.5"
              style={{ background: 'linear-gradient(135deg, #c50016 0%, #eb0a1e 60%, #ff2236 100%)' }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-base shadow-inner">
                  T
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-toyota-red" />
              </div>
              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[14px] leading-tight">Toyota AI Advisor</p>
                <p className="text-white/65 text-[11px] mt-0.5">Répond en quelques secondes</p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={clearChat}
                  title="Nouvelle conversation"
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors group"
                >
                  <Trash2 size={14} className="text-white/70 group-hover:text-white transition-colors" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* ── MESSAGES */}
            <div
              className="flex-1 overflow-y-auto w-chat-scroll px-3.5 py-4 space-y-4"
              style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)' }}
            >
              {groups.map((group, i) => (
                <MessageGroupView key={i} group={group} isLast={i === groups.length - 1} />
              ))}

              {isLoading && <TypingIndicator />}

              {recommendation && !isLoading && (
                <RecommendationCard data={recommendation} onNavigate={handleNavigate} />
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/30 rounded-xl px-3 py-2">
                  <span className="text-xs text-red-300/90 flex-1">{error}</span>
                  <button onClick={() => setError(null)} className="text-white/30 hover:text-white transition-colors text-xs shrink-0">✕</button>
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>

            {/* ── QUICK CHIPS */}
            <AnimatePresence>
              {chips && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="px-3.5 py-2.5 flex flex-wrap gap-1.5 bg-[#111] border-t border-white/5">
                    {chips.map(chip => (
                      <motion.button
                        key={chip}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => void sendMessage(chip)}
                        className="bg-white/6 hover:bg-toyota-red border border-white/8 hover:border-toyota-red text-white/65 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-full transition-all"
                      >
                        {chip}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── INPUT */}
            <div className="shrink-0 flex items-center gap-2.5 px-3.5 py-3 bg-[#141414] border-t border-white/5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre message…"
                disabled={isLoading}
                className="flex-1 bg-[#1e1e1e] border border-white/8 focus:border-toyota-red/50 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/22 outline-none transition-colors disabled:opacity-40"
              />
              <motion.button
                onClick={() => void sendMessage()}
                disabled={isLoading || !input.trim()}
                whileHover={!isLoading && !!input.trim() ? { scale: 1.06 } : {}}
                whileTap={{ scale: 0.93 }}
                className="w-10 h-10 rounded-xl bg-toyota-red disabled:bg-white/8 disabled:opacity-35 flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-toyota-red/20"
                aria-label="Envoyer"
              >
                <Send size={15} className="text-white" />
              </motion.button>
            </div>

            {/* ── FOOTER BRAND */}
            <div className="shrink-0 flex items-center justify-center gap-1.5 py-1.5 bg-[#0d0d0d] border-t border-white/4">
              <span className="text-[10px] text-white/18 select-none">⚡ Propulsé par Toyota AI</span>
              <span className="text-[10px] text-white/10 select-none">· Ctrl+/ pour ouvrir</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
