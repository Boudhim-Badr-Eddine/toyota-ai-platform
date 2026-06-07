/** Read persisted chat messages for lead submission (set by useChat). */
export function getChatHistoryForLead(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem("toyota-chat-history-export");
    if (!raw) return [];
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}

export function setChatHistoryForExport(messages: unknown[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("toyota-chat-history-export", JSON.stringify(messages.slice(-30)));
}
