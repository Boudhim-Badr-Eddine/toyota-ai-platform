import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string // ISO string (serializable)
  recommendation: string | null
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionId: string | null

  createNewSession: () => string
  saveCurrentSession: (messages: Message[], recommendation: string | null) => void
  loadSession: (id: string) => ChatSession | null
  deleteSession: (id: string) => void
  getCurrentSession: () => ChatSession | null
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createNewSession: () => {
        const id = crypto.randomUUID()
        const session: ChatSession = {
          id,
          title: 'Nouvelle conversation',
          messages: [],
          createdAt: new Date().toISOString(),
          recommendation: null,
        }
        set(state => ({
          sessions: [session, ...state.sessions],
          currentSessionId: id,
        }))
        return id
      },

      saveCurrentSession: (messages: Message[], recommendation: string | null) => {
        const { currentSessionId } = get()
        if (!currentSessionId) return
        const firstUserMsg = messages.find(m => m.role === 'user')
        const raw = firstUserMsg?.content ?? ''
        const title = raw.length > 0
          ? raw.slice(0, 40) + (raw.length > 40 ? '…' : '')
          : 'Nouvelle conversation'
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === currentSessionId ? { ...s, title, messages, recommendation } : s
          ),
        }))
      },

      loadSession: (id: string) => {
        const { sessions } = get()
        const session = sessions.find(s => s.id === id) ?? null
        if (session) set({ currentSessionId: id })
        return session
      },

      deleteSession: (id: string) => {
        set(state => {
          const remaining = state.sessions.filter(s => s.id !== id)
          const newCurrentId =
            state.currentSessionId === id
              ? (remaining[0]?.id ?? null)
              : state.currentSessionId
          return { sessions: remaining, currentSessionId: newCurrentId }
        })
      },

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get()
        return sessions.find(s => s.id === currentSessionId) ?? null
      },
    }),
    { name: 'toyota-chat-history' }
  )
)
