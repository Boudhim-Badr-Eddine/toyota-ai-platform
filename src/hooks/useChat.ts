'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useCompareStore } from '@/store/compareStore'
import { setChatHistoryForExport } from '@/lib/chatHistory'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: number
}

export interface RecommendationData {
  id: string
  configuratorUrl: string
  detailUrl: string
  acheterUrl?: string
}

export interface CompareData {
  ids: string[]
  scenario?: string
  summary?: string
}

// ─── Vehicle data ────────────────────────────────────────────────────────────

export const VEHICLE_DATA: Record<string, { name: string; subtitle: string; price: string; imageUrl: string }> = {
  supra:       { name: 'Toyota GR Supra',         subtitle: 'Sport',              price: '520 000 MAD', imageUrl: '/images/vehicles/supra.jpg' },
  rav4:        { name: 'Toyota RAV4 Hybride',      subtitle: 'SUV Familial',       price: '310 000 MAD', imageUrl: '/images/vehicles/rav4.jpg' },
  yaris:       { name: 'Toyota Yaris',             subtitle: 'Citadine',           price: '175 000 MAD', imageUrl: '/images/vehicles/yaris-gr-hero.png' },
  corolla:     { name: 'Toyota Corolla Hybride',   subtitle: 'Berline',            price: '235 000 MAD', imageUrl: '/images/vehicles/corolla.jpg' },
  camry:       { name: 'Toyota Camry Hybride',     subtitle: 'Berline Premium',    price: '280 000 MAD', imageUrl: '/images/vehicles/camry.jpg' },
  landcruiser: { name: 'Toyota Land Cruiser 300',  subtitle: 'Tout-Terrain',       price: '680 000 MAD', imageUrl: '/images/vehicles/landcruiser.jpg' },
  hilux:       { name: 'Toyota Hilux',             subtitle: 'Pick-up',            price: '295 000 MAD', imageUrl: '/images/vehicles/hilux.jpg' },
  prius:       { name: 'Toyota Prius PHEV',        subtitle: 'Hybride Plug-in',    price: '260 000 MAD', imageUrl: '/images/vehicles/prius.jpg' },
  chr:         { name: 'Toyota C-HR Hybride',      subtitle: 'SUV Design',         price: '245 000 MAD', imageUrl: '/images/vehicles/chr.jpg' },
  highlander:  { name: 'Toyota Highlander',        subtitle: 'SUV 7 Places',       price: '580 000 MAD', imageUrl: '/images/vehicles/highlander.jpg' },
}

// ─── Quick chips ──────────────────────────────────────────────────────────────

const CHIP_SETS: Record<string, string[]> = {
  budget:    ['< 200k MAD', '200-350k MAD', '350-550k MAD', '> 550k MAD'],
  usage:     ['Famille 👪', 'Ville 🏙️', 'Aventure 🏔', 'Sport 🏎️'],
  carburant: ['Hybride 🌿', 'Essence ⛽', 'Diesel 🔧', 'Peu importe'],
  weekend:   ['Montagne 🏔', 'Ville 🏙️', 'Mer 🏖'],
  profil:    ['Famille', 'Solo', 'Pro', 'Sport'],
  yesno:     ['Oui, avec plaisir !', 'Pas maintenant'],
}

export function detectChips(aiText: string): string[] | null {
  const t = aiText.toLowerCase()
  if (t.includes('budget') || t.includes('fourchette') || t.includes('combien')) return CHIP_SETS.budget
  if (t.includes('weekend') || t.includes('montagne') || t.includes('mer')) return CHIP_SETS.weekend
  if (t.includes('famille') || t.includes('solo') || t.includes('personnes') || t.includes('passagers')) return CHIP_SETS.usage
  if (t.includes('carburant') || t.includes('hybride') || t.includes('énergie') || t.includes('essence')) return CHIP_SETS.carburant
  if (t.includes('essai') || t.includes('rappel') || t.includes('contact') || t.includes('conseiller')) return CHIP_SETS.yesno
  return null
}

// ─── Recommendation parser ──────────────────────────────────────────────────

const REC_RE = /\{"recommendation"\s*:\s*"([^"]+)"[^}]*\}/

export function parseRecommendation(text: string): RecommendationData | null {
  const m = REC_RE.exec(text)
  if (!m) return null
  const id = m[1]
  const conf = /"configuratorUrl"\s*:\s*"([^"]+)"/.exec(text)
  const detail = /"detailUrl"\s*:\s*"([^"]+)"/.exec(text)
  return {
    id,
    configuratorUrl: conf ? conf[1] : `/configurator/${id}`,
    detailUrl: detail ? detail[1] : `/vehicles/${id}`,
    acheterUrl: /"acheterUrl"\s*:\s*"([^"]+)"/.exec(text)?.[1] ?? `/acheter?vehicle=${id}`,
  }
}

const COMPARE_RE = /\{"compare"\s*:\s*\{[^}]+\}\}/

export function parseCompare(text: string): CompareData | null {
  const m = COMPARE_RE.exec(text)
  if (!m) return null
  try {
    const parsed = JSON.parse(m[0]) as { compare: CompareData }
    return parsed.compare
  } catch {
    return null
  }
}

// ─── Welcome message ─────────────────────────────────────────────────────────

/** Fixed timestamp so SSR and client hydration match. */
const WELCOME_TS = 1_700_000_000_000

export const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  ts: WELCOME_TS,
  content: 'Bonjour ! Je suis **Toyota AI Advisor** 🚗 — votre conseiller automobile personnel. En quelques questions, je trouve votre Toyota idéale. Commençons : c\'est quoi votre prénom ?',
}

// ─── useChat hook ───────────────────────────────────────────────────────────────

interface UseChatOptions {
  isOpen?: boolean
  onRecommendation?: (data: RecommendationData) => void
}

export function useChat({ isOpen = false, onRecommendation }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null)
  const [compareData, setCompareData] = useState<CompareData | null>(null)
  const [chips, setChips] = useState<string[] | null>(null)
  const [unread, setUnread] = useState(0)

  const isOpenRef = useRef(isOpen)
  const onRecRef = useRef(onRecommendation)
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])
  useEffect(() => { onRecRef.current = onRecommendation }, [onRecommendation])

  useEffect(() => {
    setChatHistoryForExport(
      messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.ts).toISOString(),
      }))
    )
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([{ ...WELCOME, ts: WELCOME_TS }])
    setRecommendation(null)
    setCompareData(null)
    setChips(null)
    setError(null)
    setInput('')
    setUnread(0)
  }, [])

  const markRead = useCallback(() => setUnread(0), [])

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    setChips(null)
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setError(null)

    const apiMessages = [...messages.filter(m => m.id !== 'welcome'), userMsg].map(m => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }))

    const assistantId = `ai-${Date.now()}`
    const assistantTs = Date.now() + 1

    try {
      const pageContext = {
        pathname: typeof window !== 'undefined' ? window.location.pathname : '',
        compareIds: useCompareStore.getState().selectedIds,
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, pageContext }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      if (!res.body) throw new Error('No stream')

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', ts: assistantTs }])

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value, { stream: true })
        const visible = full
          .replace(/\{[^}]*"recommendation"[^}]*\}/g, '')
          .replace(/\{[^}]*"compare"[^}]*\}/g, '')
          .trim()
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: visible } : m))
      }

      const rec = parseRecommendation(full)
      if (rec) {
        setRecommendation(rec)
        onRecRef.current?.(rec)
      }

      const cmp = parseCompare(full)
      if (cmp && cmp.ids && cmp.ids.length >= 2) {
        setCompareData(cmp)
        useCompareStore.setState({ selectedIds: cmp.ids.slice(0, 3), drawerOpen: true })
      }

      // Increment unread if widget is closed
      if (!isOpenRef.current) setUnread(n => n + 1)

      const c = detectChips(full)
      if (c) setChips(c)

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion')
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.' }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  return { messages, input, setInput, isLoading, error, setError, recommendation, compareData, chips, unread, markRead, sendMessage, clearChat }
}
