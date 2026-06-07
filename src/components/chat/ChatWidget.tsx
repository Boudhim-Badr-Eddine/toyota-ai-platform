"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Send, Sparkles, Bot } from "lucide-react";
import type { ReactNode } from "react";
import { useChat, VEHICLE_DATA } from "@/hooks/useChat";
import type { ChatMessage, RecommendationData } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { MOTION_GPU_CLASS } from "@/lib/motion";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const PANEL_W = 390;
const PANEL_H = 600;
const STORAGE_KEY = "toyota-chat-position";

interface PanelPos {
  x: number;
  y: number;
}

interface PanelDims {
  w: number;
  h: number;
}

function getPanelDims(): PanelDims {
  if (typeof window === "undefined") return { w: PANEL_W, h: PANEL_H };
  const narrow = window.innerWidth < 640;
  return {
    w: narrow ? Math.min(PANEL_W, window.innerWidth - 16) : PANEL_W,
    h: narrow ? Math.min(480, window.innerHeight - 100) : PANEL_H,
  };
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

function defaultPosition(dims: PanelDims): PanelPos {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  return {
    x: window.innerWidth - dims.w - 16,
    y: window.innerHeight - dims.h - 88,
  };
}

function clampPosition(x: number, y: number, dims: PanelDims): PanelPos {
  if (typeof window === "undefined") return { x, y };
  const maxX = Math.max(8, window.innerWidth - dims.w - 8);
  const maxY = Math.max(8, window.innerHeight - dims.h - 8);
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
      <div className="w-8 h-8 shrink-0 rounded-full bg-[#0a0a0a] ring-1 ring-[#EB0A1E]/25 flex items-center justify-center">
        <span className="text-toyota-red font-black text-[11px]">T</span>
      </div>
      <div className="chat-bubble-ai px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-[#EB0A1E]/70"
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
      className="rounded-2xl overflow-hidden border border-toyota-red/30 mt-1 shadow-xl bg-gradient-to-br from-[#141414] to-[#0a0a0a]"
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-white/[0.08]">
        <Sparkles size={12} className="text-toyota-gold" />
        <span className="text-[10px] text-toyota-gold font-bold uppercase tracking-[0.12em]">
          Votre match parfait
        </span>
      </div>
      <div className="flex gap-3 px-3 py-3">
        <div className="relative w-[88px] h-[60px] rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
          <Image
            src={vd.imageUrl}
            alt={vd.name}
            fill
            className="object-cover"
            sizes="88px"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-white font-bold text-[13px] leading-tight">{vd.name}</p>
          <p className="text-white/50 text-[11px] mt-0.5">{vd.subtitle}</p>
          <p className="text-toyota-red font-bold text-[13px] mt-1.5">{vd.price}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <div className="flex gap-2">
          <BorderDrawButton
            accent="red"
            onClick={() => onNavigate(data.configuratorUrl)}
            className="flex-1 !px-2 !py-2.5 !text-[11px] justify-center"
          >
            Configurer
          </BorderDrawButton>
          <BorderDrawButton
            onClick={() => onNavigate(data.detailUrl)}
            className="flex-1 !px-2 !py-2.5 !text-[11px] justify-center"
          >
            Détails
          </BorderDrawButton>
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
        <div className="w-8 h-8 shrink-0 rounded-full bg-[#0a0a0a] ring-1 ring-[#EB0A1E]/25 flex items-center justify-center">
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
            {msg.content ? renderMsg(msg.content) : <span className="text-white/40 italic">...</span>}
          </div>
        ))}
        <span className="text-[10px] text-white/35 px-1 tracking-wide" suppressHydrationWarning>
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
  const [panelDims, setPanelDims] = useState<PanelDims>({ w: PANEL_W, h: PANEL_H });
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
    const dims = getPanelDims();
    setPanelDims(dims);
    const saved = loadSavedPosition() ?? defaultPosition(dims);
    setPos(clampPosition(saved.x, saved.y, dims));
  }, []);

  useEffect(() => {
    const onResize = () => {
      const dims = getPanelDims();
      setPanelDims(dims);
      setPos((p) => (p ? clampPosition(p.x, p.y, dims) : defaultPosition(dims)));
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
    setPos((p) =>
      p
        ? clampPosition(dragState.current!.origX + dx, dragState.current!.origY + dy, panelDims)
        : p
    );
  }, [panelDims]);

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
  const isNarrow = panelDims.w < PANEL_W;

  return (
    <>
      <style>{`
        .w-chat-scroll::-webkit-scrollbar { width: 3px; }
        .w-chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
        .w-chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        .chat-bubble-ai {
          background: linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.03) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-left: 2px solid rgba(235,10,30,0.45);
          color: rgba(255,255,255,0.88);
          border-radius: 16px 16px 16px 4px;
        }
        .chat-bubble-user {
          background: #fff;
          color: #0a0a0a;
          border-radius: 16px 16px 4px 16px;
          font-weight: 450;
        }
        .chat-bubble-user strong { color: #0a0a0a; }
        .chat-panel {
          background: linear-gradient(180deg, #141414 0%, #0e0e0e 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px -12px rgba(0,0,0,0.75);
        }
        .chat-panel-dragging {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 28px 72px -10px rgba(0,0,0,0.8);
        }
        .chat-header-drag:hover .chat-drag-pill { background: rgba(255,255,255,0.35); width: 40px; }
      `}</style>

      {/* FAB — follows panel when positioned */}
      <div
        className={cn(MOTION_GPU_CLASS, "gpu-fixed fixed z-[9999] bottom-6 right-6 max-sm:bottom-6 max-sm:right-6")}
        style={
          isOpen && pos && !isNarrow
            ? {
                left: Math.min(
                  pos.x + panelDims.w - 56,
                  typeof window !== "undefined" ? window.innerWidth - 70 : pos.x
                ),
                top: pos.y + panelDims.h + 8,
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
              className="absolute bottom-full right-0 mb-2 bg-[#141414]/95 backdrop-blur border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl"
            >
              Conseiller Toyota IA
            </motion.div>
          )}
        </AnimatePresence>

        {unread > 0 && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 z-10 min-w-[18px] h-[18px] px-1 bg-toyota-red rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-[#141414]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}

        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[52px] h-[52px] rounded-full bg-[#141414] flex items-center justify-center shadow-xl border border-white/10 hover:border-toyota-red/35 transition-colors group"
          aria-label="Ouvrir Toyota AI"
        >
          {isOpen ? (
            <X size={20} className="text-white/70 group-hover:text-white" strokeWidth={1.75} />
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
            style={{
              left: pos.x,
              top: pos.y,
              width: panelDims.w,
              height: panelDims.h,
            }}
            className={cn(
              cn(MOTION_GPU_CLASS, "gpu-fixed fixed z-[9998] flex flex-col overflow-hidden chat-panel rounded-none"),
              isDragging && "chat-panel-dragging"
            )}
          >
            {/* Header — dark glass, draggable */}
            <div
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              className={cn(
                "chat-header-drag shrink-0 cursor-grab touch-none select-none border-b border-white/[0.06] bg-[#111]/90 backdrop-blur-sm",
                isDragging && "cursor-grabbing bg-[#161616]"
              )}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="chat-drag-pill h-1 w-9 rounded-full bg-white/20 transition-all duration-200" />
              </div>

              <div className="flex items-center gap-3 px-5 pb-4 pt-1">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#0a0a0a] ring-1 ring-[#EB0A1E]/25 flex items-center justify-center">
                    <span className="text-toyota-red font-black text-sm">T</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#111]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-[15px] leading-tight">
                      Toyota AI
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-toyota-red/80 bg-toyota-red/10 px-1.5 py-0.5 rounded">
                      Advisor
                    </span>
                  </div>
                  <p className="text-white/45 text-[11px] mt-0.5">
                    {isDragging ? "Déplacement…" : "En ligne · Glissez pour déplacer"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={clearChat}
                    className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-white/45 hover:text-white transition-colors"
                    title="Nouvelle conversation"
                  >
                    <RotateCcw size={15} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-white/45 hover:text-white transition-colors"
                  >
                    <X size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-hidden">
              <div className="relative h-full overflow-y-auto w-chat-scroll px-4 py-5 space-y-5">
              {groups.map((group, i) => (
                <MessageGroupView key={i} group={group} />
              ))}
              {isLoading && <TypingIndicator />}
              {recommendation && !isLoading && (
                <RecommendationCard data={recommendation} onNavigate={handleNavigate} />
              )}
              {error && (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
              </div>
            </div>

            <AnimatePresence>
              {chips && !isLoading && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="shrink-0 overflow-hidden border-t border-white/[0.06]"
                >
                  <div className="px-4 py-2.5 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => void sendMessage(chip)}
                        className="text-[11px] px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-toyota-red/30 hover:bg-toyota-red/[0.06] transition-all"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="shrink-0 px-4 py-3.5 border-t border-white/[0.06] bg-[#111]">
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-1.5 focus-within:ring-toyota-red/25 transition-all">
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
                  className="flex-1 bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-white/40 outline-none"
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 flex items-center justify-center shrink-0 border border-[#EB0A1E]/30 bg-[#EB0A1E]/[0.08] text-[#EB0A1E] hover:bg-[#EB0A1E]/[0.14] disabled:border-white/10 disabled:bg-white/5 disabled:text-white/30 disabled:opacity-40 transition-colors"
                >
                  <Send size={15} strokeWidth={2} />
                </button>
              </div>
              <p className="text-center text-[9px] text-white/35 mt-2">
                Groq · Ctrl+/ · Échap pour fermer
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
