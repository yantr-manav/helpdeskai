import React, { useRef, useEffect, useState, KeyboardEvent } from "react";
import { useChatStore } from "../store/chatStore";
import { useChat } from "../hooks/useChat";
import { useTicket } from "../hooks/useTicket";
import { Message } from "../types";
import { TicketForm } from "./TicketForm";

const SUGGESTIONS = [
  "How do I invite a team member?",
  "How do I upgrade my plan?",
  "How does time tracking work?",
  "What's the difference between roles?",
];

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 2 }}>
      <div style={styles.botAvatar}>⚡</div>
      <div style={styles.typingBubble}>
        <span style={{ ...styles.dot, animationDelay: "0s" }} />
        <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
        <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

function MessageBubble({ msg, onRate, onCreateTicket }: {
  msg: Message;
  onRate: (id: string, r: "up" | "down") => void;
  onCreateTicket: () => void;
}) {
  const isBot = msg.role === "bot";
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isBot ? "row" : "row-reverse", marginBottom: 4 }}>
      {isBot ? (
        <div style={styles.botAvatar}>⚡</div>
      ) : (
        <div style={styles.userAvatar}>U</div>
      )}
      <div style={{ maxWidth: "78%" }}>
        <div style={isBot ? styles.botBubble : styles.userBubble}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
            {msg.content}
          </div>
          {isBot && msg.sources && msg.sources.length > 0 && (
            <div style={styles.sources}>
              📚 Sources: {msg.sources.join(", ")}
            </div>
          )}
          {isBot && msg.shouldEscalate && !msg.content.includes("support ticket") && (
            <button style={styles.escalateBtn} onClick={onCreateTicket}>
              🎫 Create support ticket
            </button>
          )}
          {isBot && (
            <div style={styles.ratingRow}>
              <span style={styles.rateLabel}>Helpful?</span>
              <button
                style={{ ...styles.rateBtn, ...(msg.rating === "up" ? styles.rateUp : {}) }}
                onClick={() => onRate(msg.id, "up")}
                title="Yes, helpful"
              >👍</button>
              <button
                style={{ ...styles.rateBtn, ...(msg.rating === "down" ? styles.rateDown : {}) }}
                onClick={() => onRate(msg.id, "down")}
                title="Not helpful"
              >👎</button>
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#9aa0b0", marginTop: 3, textAlign: isBot ? "left" : "right", paddingLeft: isBot ? 4 : 0, paddingRight: isBot ? 0 : 4 }}>
          {formatTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const { isOpen, toggleOpen, clearChat, rateMessage } = useChatStore();
  const { messages, isTyping, sendMessage } = useChat();
  const { state: ticketState, ticket, openForm, closeForm, submit } = useTicket();
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, ticketState]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    if (messages.length === 0 && isOpen) {
      useChatStore.getState().addMessage({
        role: "bot",
        content:
          "Hi there! 👋 I'm HelpdeskAI, your FlowTask support assistant.\n\nI can help you with billing, task management, integrations, permissions, and more. What can I help you today?",
      });
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setShowSuggestions(false);
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleSuggestion = async (s: string) => {
    setShowSuggestions(false);
    await sendMessage(s);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChat();
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleOpen}
        style={styles.launcher}
        aria-label="Toggle support chat"
      >
        {isOpen ? "✕" : "⚡"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerAvatar}>⚡</div>
            <div>
              <div style={styles.headerTitle}>HelpdeskAI · FlowTask</div>
              <div style={styles.headerSub}>
                <span style={styles.onlineDot} /> Online · Usually replies instantly
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button style={styles.iconBtn} onClick={handleClear} title="Clear chat">↺</button>
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {showSuggestions && messages.length <= 1 && (
              <div style={styles.chips}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} style={styles.chip} onClick={() => handleSuggestion(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onRate={rateMessage}
                onCreateTicket={openForm}
              />
            ))}
            {isTyping && <TypingIndicator />}
            {ticketState === "open" || ticketState === "submitting" || ticketState === "error" ? (
              <TicketForm
                state={ticketState}
                onSubmit={submit}
                onCancel={closeForm}
                error={null}
              />
            ) : ticketState === "success" && ticket ? (
              <div style={styles.ticketSuccess}>
                <div style={{ fontWeight: 600, color: "#0d6e4d", fontSize: 13 }}>
                  ✅ Ticket submitted successfully
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#0d9e6b" }}>
                  Ticket ID:{" "}
                  <span style={styles.ticketId}>{ticket.ticket_number}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#5a6070" }}>
                  We'll email you with updates. Expected response: <strong>2–4 hours</strong>.
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <div style={styles.inputRow}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about FlowTask..."
                rows={1}
                style={styles.input}
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                style={{ ...styles.sendBtn, opacity: isTyping || !input.trim() ? 0.45 : 1 }}
              >
                ➤
              </button>
            </div>
            <div style={styles.poweredBy}>Powered by Claude · Qdrant RAG · FlowTask Support</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.2;transform:scale(.85)} 30%{opacity:1;transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  launcher: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#1a6cff",
    color: "#fff",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(26,108,255,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    transition: "transform 0.15s",
  },
  window: {
    position: "fixed",
    bottom: 92,
    right: 24,
    width: 380,
    height: 580,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9998,
    animation: "slideIn 0.22s ease",
  },
  header: {
    background: "#1a6cff",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.72)",
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  onlineDot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#4dffa0",
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: "rgba(255,255,255,0.14)",
    border: "none",
    cursor: "pointer",
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    padding: "5px 10px",
    borderRadius: 20,
    background: "#e8f0ff",
    color: "#0d47cc",
    border: "none",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: "#e8f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    flexShrink: 0,
    color: "#1a6cff",
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: "#1a6cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    color: "#fff",
  },
  botBubble: {
    background: "#f0f4ff",
    color: "#0f1117",
    padding: "10px 13px",
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    fontSize: 13,
    animation: "fadeUp 0.2s ease",
  },
  userBubble: {
    background: "#1a6cff",
    color: "#fff",
    padding: "10px 13px",
    borderRadius: 14,
    borderBottomRightRadius: 4,
    fontSize: 13,
    animation: "fadeUp 0.2s ease",
  },
  sources: {
    marginTop: 6,
    fontSize: 10,
    color: "#5a6070",
    borderTop: "1px solid rgba(0,0,0,0.07)",
    paddingTop: 5,
  },
  escalateBtn: {
    marginTop: 8,
    padding: "5px 11px",
    fontSize: 11,
    fontWeight: 500,
    background: "#fff",
    border: "1px solid #1a6cff",
    color: "#1a6cff",
    borderRadius: 8,
    cursor: "pointer",
    display: "block",
  },
  ratingRow: {
    display: "flex",
    gap: 4,
    marginTop: 7,
    alignItems: "center",
  },
  rateLabel: {
    fontSize: 10,
    color: "#9aa0b0",
  },
  rateBtn: {
    width: 22,
    height: 22,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rateUp: {
    background: "#edfaf3",
    borderColor: "#0d9e6b",
  },
  rateDown: {
    background: "#fff0ee",
    borderColor: "#d93025",
  },
  typingBubble: {
    background: "#f0f4ff",
    padding: "10px 13px",
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#1a6cff",
    animation: "pulse 1.3s infinite",
  },
  ticketSuccess: {
    background: "#edfaf3",
    border: "1px solid #b4e8ce",
    borderRadius: 12,
    padding: "12px 14px",
    marginTop: 4,
    animation: "fadeUp 0.2s ease",
  },
  ticketId: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: 500,
    color: "#0d9e6b",
    background: "#d0f5e4",
    padding: "2px 7px",
    borderRadius: 6,
  },
  inputArea: {
    padding: "10px 12px 12px",
    background: "#fff",
    borderTop: "1px solid rgba(0,0,0,0.07)",
    flexShrink: 0,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: "9px 13px",
    fontSize: 13,
    color: "#0f1117",
    background: "#f5f7fa",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "#1a6cff",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontSize: 16,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  poweredBy: {
    fontSize: 9,
    color: "#9aa0b0",
    textAlign: "center" as const,
    paddingTop: 5,
    letterSpacing: 0.3,
  },
};
