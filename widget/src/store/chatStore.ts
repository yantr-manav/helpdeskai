import { create } from "zustand";
import { Message, TicketResponse } from "../types";
import { getSessionId, resetSessionId } from "../utils/sessionId";
import { v4 as uuidv4 } from "uuid";

interface ChatStore {
  isOpen: boolean;
  messages: Message[];
  sessionId: string;
  isTyping: boolean;
  openTicket: TicketResponse | null;

  // Actions
  toggleOpen: () => void;
  setOpen: (val: boolean) => void;
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setIsTyping: (val: boolean) => void;
  setOpenTicket: (t: TicketResponse | null) => void;
  clearChat: () => void;
  rateMessage: (id: string, rating: "up" | "down") => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isOpen: false,
  messages: [],
  sessionId: getSessionId(),
  isTyping: false,
  openTicket: null,

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (val) => set({ isOpen: val }),

  addMessage: (msg) => {
    const id = uuidv4();
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id, timestamp: new Date() },
      ],
    }));
    return id;
  },

  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  setIsTyping: (val) => set({ isTyping: val }),
  setOpenTicket: (t) => set({ openTicket: t }),

  clearChat: () => {
    const newSession = resetSessionId();
    set({ messages: [], sessionId: newSession, openTicket: null });
  },

  rateMessage: (id, rating) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, rating } : m)),
    })),
}));
