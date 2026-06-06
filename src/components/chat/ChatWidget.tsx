"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Send, Sparkles, Bot } from "lucide-react";
import type { ReactNode } from "react";
import { useChat, VEHICLE_DATA } from "@/hooks/useChat";
import type { ChatMessage, RecommendationData } from "@/hooks/useChat";

const PANEL_W = 390;
const PANEL_H = 600;
const STORAGE_KEY = "toyota-chat-position";

interface PanelPos {
  x: number;
  y: number;
}

function loadSavedPosition(): PanelPos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PanelPos;
    if (typeof p.x === "number" && typeof p.y === "number") return p;
  } catch {
    /* ignore */
  }
  return null;
}

function defaultPosition(): PanelPos {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  return {
    x: window.innerWidth - PANEL_W - 24,
    y: window.innerHeight - PANEL_H - 96,
  };
}

function clampPosition(x: number, y: number): PanelPos {
  if (typeof window === "undefined") return { x, y };
  const maxX = Math.max(8, window.innerWidth - PANEL_W - 8);
  const maxY = Math.max(8, window.innerHeight - PANEL_H - 8);
  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(8, y), maxY),
  };
}

function ri(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold text-white">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith("*") && p.endsWith("*"))
          return (
            <em key={i} className="italic text-white/80">
              {p.slice(1, -1)}
            </em>
          );
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="bg-white/10 text-toyota-red px-1 rounded text-[11px] font-mono">
              {p.slice(1, -1)}
            </code>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function renderMsg(text: string): ReactNode {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const num = /^(\d+)\.\s+(.+)$/.exec(line);
        if (num)
          return (
            <div key={i} className="flex gap-1.5 my-0.5">
              <span className="text-toyota-red font-bold shrink-0 text-[12px]">{num[1]}.</span>
              <span>{ri(num[2])}</span>
            </div>
          );
        if (/^[-•]\s+/.test(line))
          return (
            <div key={i} className="flex gap-1.5 my-0.5">
              <span className="text-toyota-red shrink-0 text-[12px]">•</span>
              <span>{ri(line.replace(/^[-•]\s+/, ""))}</span>
            </div>
          );
        return (
          <span key={i}>
            {ri(line)}
            {i < lines.length - 1 && line !== "" && <br />}
          </span>
        );
      })}
    </>
  );
}

function fmt(ts: number) {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface MsgGroup {
  role: "user" | "assistant";
  messages: ChatMessage[];
}

function groupMessages(msgs: ChatMessage[]): MsgGroup[] {
  const groups: MsgGroup[] = [];
  for (const m of msgs) {
    const last = groups[groups.length - 1];
    if (last && last.role === m.role && m.ts - last.messages[last.messages.length - 1].ts < 90000) {
      last.messages.push(m);
    } else {
      groups.push({ role: m.role, messages: [m] });
    }
  }
  return groups;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 shrink-0 rounded-full bg-[#1a1a1a] ring-1 ring-white/10 flex items-center justify-center">
        <span className="text-toyota-red font-black text-[11px]">T</span>
      </div>
      <div className="chat-bubble-ai px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-white/40"
            style={{ animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({
  data,
  onNavigate,
}: {
  data: RecommendationData;
  onNavigate: (url: string) => void;
}) {
  const vd = VEHICLE_DATA[data.id];
  if (!vd) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-2xl overflow-hidden border border-toyota-red/30 mt-1 shadow-xl shadow-toyota-red/10 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]"
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-white/5">
        <Sparkles size={12} className="text-toyota-gold" />
        <span className="text-[10px] text-toyota-gold font-bold uppercase tracking-[0.12em]">
          Votre match parfait
        </span>
      </div>
      <div className="flex gap-3 px-3 py-3">
        <div className="relative w-[88px] h-[60px] rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
          <Image src={vd.imageUrl} alt={vd.name} fill className="object-cover" sizes="88px" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-white font-bold text-[13px] leading-tight">{vd.name}</p>
          <p className="text-white/45 text-[11px] mt-0.5">{vd.subtitle}</p>
          <p className="text-toyota-red font-bold text-[13px] mt-1.5">{vd.price}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate(data.configuratorUrl)}
            className="flex-1 py-2.5 rounded-xl bg-toyota-red hover:bg-[#c50016] text-white text-[11px] font-bold transition-all"
          >
            Configurer
          </button>
          <button
            onClick={() => onNavigate(data.detailUrl)}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/80 text-[11px] font-semibold hover:bg-white/5"
          >
            Détails
          </button>
        </div>
        <button
          onClick={() => onNavigate(data.acheterUrl ?? `/acheter?vehicle=${data.id}`)}
          className="w-full py-2 rounded-xl border border-toyota-gold/30 text-toyota-gold text-[11px] font-bold hover:bg-toyota-gold/10"
        >
          Trouver une concession →
        </button>
      </div>
    </motion.div>
  );
}

function MessageGroupView({ group }: { group: MsgGroup }) {
  const isUser = group.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}>
      {!isUser ? (
        <div className="w-8 h-8 shrink-0 rounded-full bg-[#161616] ring-1 ring-white/[0.08] flex items-center justify-center">
          <span className="text-toyota-red font-black text-[11px]">T</span>
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}
      <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {group.messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-4 py-2.5 text-[13px] leading-[1.55] ${
              isUser ? "chat-bubble-user" : "chat-bubble-ai"
            }`}
          >
            {msg.content ? renderMsg(msg.content) : <span className="text-white/25 italic">...</span>}
          </div>
        ))}
        <span className="text-[10px] text-white/20 px-1 tracking-wide" suppressHydrationWarning>
          {fmt(group.messages[group.messages.length - 1].ts)}
        </span>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );

  const { messages, input, setInput, isLoading, error, recommendation, chips, unread, markRead, sendMessage, clearChat } =
    useChat({ isOpen });

  useEffect(() => {
    setPos(loadSavedPosition() ?? defaultPosition());
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPos((p) => (p ? clampPosition(p.x, p.y) : defaultPosition()));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 180);
      markRead();
    }
  }, [isOpen, markRead]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openChatWidget", handler);
    window.addEventListener("open-chat", handler);
    return () => {
      window.removeEventListener("openChatWidget", handler);
      window.removeEventListener("open-chat", handler);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (!pos) return;
      e.preventDefault();
      setIsDragging(true);
      dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos]
  );

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos(clampPosition(dragState.current.origX + dx, dragState.current.origY + dy));
  }, []);

  const onDragEnd = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    dragState.current = null;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setPos((p) => {
      if (p) localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      return p;
    });
  }, []);

  function handleNavigate(url: string) {
    setIsOpen(false);
    router.push(url);
  }

  const groups = groupMessages(messages);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <style>{`
        .w-chat-scroll::-webkit-scrollbar { width: 3px; }
        .w-chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
        .w-chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        .chat-bubble-ai {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.88);
          border-radius: 18px 18px 18px 4px;
        }
        .chat-bubble-user {
          background: #fff;
          color: #0a0a0a;
          border-radius: 18px 18px 4px 18px;
          font-weight: 450;
        }
        .chat-bubble-user strong { color: #0a0a0a; }
        .chat-panel {
          background: linear-gradient(180deg, #121212 0%, #0a0a0a 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06),
            0 24px 80px -12px rgba(0,0,0,0.75),
            0 0 48px -16px rgba(235,10,30,0.12);
        }
        .chat-panel-dragging {
          box-shadow:
            0 0 0 1px rgba(235,10,30,0.2),
            0 32px 96px -12px rgba(0,0,0,0.85),
            0 0 64px -8px rgba(235,10,30,0.25);
        }
        .chat-header-drag:hover .chat-drag-pill { background: rgba(255,255,255,0.35); width: 40px; }
        .chat-input:focus { box-shadow: 0 0 0 2px rgba(235,10,30,0.25); }
      `}</style>

      {/* FAB — follows panel when positioned */}
      <div
        className="fixed z-[9999] bottom-6 right-6 max-sm:bottom-6 max-sm:right-6"
        style={
          isOpen && pos && !isMobile
            ? {
                left: Math.min(pos.x + PANEL_W - 56, typeof window !== "undefined" ? window.innerWidth - 70 : pos.x),
                top: pos.y + PANEL_H + 8,
                bottom: "auto",
                right: "auto",
              }
            : undefined
        }
      >
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-full right-0 mb-2 bg-[#111]/95 backdrop-blur border border-white/10 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl"
            >
              Conseiller Toyota IA
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute inset-[-4px] rounded-full border border-toyota-red/30 animate-pulse" />
        )}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 z-10 min-w-[18px] h-[18px] px-1 bg-toyota-red rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-[#0a0a0a]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}

        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[52px] h-[52px] rounded-full bg-[#141414] flex items-center justify-center shadow-xl border border-white/10 hover:border-toyota-red/40 transition-colors group"
          aria-label="Ouvrir Toyota AI"
        >
          {isOpen ? (
            <X size={20} className="text-white/80 group-hover:text-white" strokeWidth={1.75} />
          ) : (
            <Bot size={22} className="text-toyota-red" strokeWidth={1.75} />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && pos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            style={
              isMobile
                ? undefined
                : {
                    left: pos.x,
                    top: pos.y,
                    width: PANEL_W,
                    height: PANEL_H,
                  }
            }
            className={`fixed z-[9998] flex flex-col overflow-hidden chat-panel ${
              isMobile
                ? "inset-x-0 bottom-0 w-full h-[75dvh] rounded-t-[28px] rounded-b-none"
                : `rounded-[28px] ${isDragging ? "chat-panel-dragging scale-[1.01]" : ""}`
            } transition-shadow duration-200`}
          >
            {/* Header — dark glass, draggable */}
            <div
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              className={`chat-header-drag shrink-0 cursor-grab touch-none select-none border-b border-white/[0.06] bg-[#161616]/95 backdrop-blur-xl ${
                isDragging ? "cursor-grabbing bg-[#1a1a1a]" : ""
              }`}
            >
              {/* iOS-style drag pill */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="chat-drag-pill h-1 w-9 rounded-full bg-white/20 transition-all duration-200" />
              </div>

              <div className="flex items-center gap-3.5 px-5 pb-4 pt-1">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#0a0a0a] ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
                    <div className="w-6 h-6 bg-toyota-red rounded-md flex items-center justify-center">
                      <span className="text-white font-black text-[9px] tracking-tighter">T</span>
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#161616]" />
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-[15px] tracking-[-0.01em]">
                      Toyota AI
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-toyota-red/90 bg-toyota-red/10 px-1.5 py-0.5 rounded">
                      Advisor
                    </span>
                  </div>
                  <p className="text-white/35 text-[11px] mt-0.5 font-medium">
                    {isDragging ? "Déplacement…" : "Maintenez et glissez · En ligne"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={clearChat}
                    className="w-8 h-8 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors"
                    title="Nouvelle conversation"
                  >
                    <RotateCcw size={15} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors"
                  >
                    <X size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto w-chat-scroll px-4 py-5 space-y-5">
              {groups.map((group, i) => (
                <MessageGroupView key={i} group={group} />
              ))}
              {isLoading && <TypingIndicator />}
              {recommendation && !isLoading && (
                <RecommendationCard data={recommendation} onNavigate={handleNavigate} />
              )}
              {error && (
                <div className="text-xs text-red-300 bg-red-950/40 border border-red-800/30 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <AnimatePresence>
              {chips && !isLoading && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="shrink-0 overflow-hidden border-t border-white/[0.05]"
                >
                  <div className="px-4 py-2.5 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => void sendMessage(chip)}
                        className="text-[11px] px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/55 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="shrink-0 px-4 py-3.5 border-t border-white/[0.06] bg-[#111111]/90 backdrop-blur-xl">
              <div className="flex items-center gap-2 rounded-2xl bg-[#0a0a0a] ring-1 ring-white/[0.08] p-1.5 focus-within:ring-toyota-red/30 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Posez votre question…"
                  disabled={isLoading}
                  className="chat-input flex-1 bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-white/25 outline-none"
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-toyota-red disabled:bg-white/[0.06] disabled:opacity-40 flex items-center justify-center transition-all hover:bg-[#d0091a] shrink-0"
                >
                  <Send size={15} className="text-white" strokeWidth={2} />
                </button>
              </div>
              <p className="text-center text-[9px] text-white/15 mt-2 tracking-wide">
                Groq · Ctrl+/ · Échap pour fermer
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
