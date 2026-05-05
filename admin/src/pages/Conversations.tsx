import React, { useEffect, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { getConversations, getConversation } from "../api/client";

interface ConvoSummary {
  session_id: string;
  channel: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  escalated: boolean;
  preview: string;
}

interface ConvoDetail {
  session_id: string;
  channel: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    timestamp: string;
    confidence?: number;
    sources?: string[];
  }>;
}

export function ConversationsPage() {
  const [convos, setConvos] = useState<ConvoSummary[]>([]);
  const [selected, setSelected] = useState<ConvoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations(50).then((r) => {
      setConvos(r.data.conversations);
      setLoading(false);
    });
  }, []);

  const openConvo = async (sessionId: string) => {
    const res = await getConversation(sessionId);
    setSelected(res.data);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", gap: 0, height: "calc(100vh - 80px)" }}>
      {/* List panel */}
      <div style={s.listPanel}>
        <TopBar title="Conversations" subtitle={`${convos.length} total`} />
        {loading && <div style={s.empty}>Loading…</div>}
        {!loading && convos.length === 0 && (
          <div style={s.empty}>No conversations yet. Start chatting with the widget!</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {convos.map((c) => (
            <div
              key={c.session_id}
              onClick={() => openConvo(c.session_id)}
              style={{
                ...s.convoRow,
                ...(selected?.session_id === c.session_id ? s.convoRowActive : {}),
              }}
            >
              <div style={s.convoTop}>
                <span style={s.channel}>{c.channel === "whatsapp" ? "📱" : "🌐"}</span>
                <span style={s.sessionId}>{c.session_id.slice(0, 8)}…</span>
                {c.escalated && <span style={s.escalatedBadge}>escalated</span>}
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#9aa0b0" }}>
                  {fmtDate(c.created_at)}
                </span>
              </div>
              <div style={s.preview}>{c.preview || "No messages"}</div>
              <div style={s.msgCount}>{c.message_count} messages</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div style={s.detailPanel}>
        {!selected ? (
          <div style={s.emptyDetail}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, color: "#9aa0b0" }}>Select a conversation to view</div>
          </div>
        ) : (
          <>
            <div style={s.detailHeader}>
              <span style={s.sessionId}>{selected.session_id}</span>
              <span style={s.channel}>{selected.channel === "whatsapp" ? "📱 WhatsApp" : "🌐 Web"}</span>
            </div>
            <div style={s.messageList}>
              {selected.messages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                  <div style={{
                    maxWidth: "72%",
                    padding: "10px 13px",
                    borderRadius: 14,
                    fontSize: 13,
                    lineHeight: 1.55,
                    background: msg.role === "user" ? "#1a6cff" : "#f0f4ff",
                    color: msg.role === "user" ? "#fff" : "#0f1117",
                    borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.role === "user" ? 14 : 4,
                  }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: 5, fontSize: 10, opacity: 0.7 }}>
                        📚 {msg.sources.join(", ")}
                      </div>
                    )}
                    {msg.confidence !== undefined && (
                      <div style={{ marginTop: 3, fontSize: 10, opacity: 0.6 }}>
                        confidence: {(msg.confidence * 100).toFixed(0)}%
                      </div>
                    )}
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.5 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  listPanel: { width: 340, flexShrink: 0, overflowY: "auto", borderRight: "1px solid #eef1f6", paddingRight: 20 },
  detailPanel: { flex: 1, display: "flex", flexDirection: "column", paddingLeft: 24, overflowY: "auto" },
  empty: { padding: 40, color: "#9aa0b0", fontSize: 13, textAlign: "center" as const },
  emptyDetail: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  convoRow: {
    padding: "12px 14px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.1s",
    marginBottom: 2,
  },
  convoRowActive: { background: "#f0f4ff" },
  convoTop: { display: "flex", alignItems: "center", gap: 6, marginBottom: 5 },
  channel: { fontSize: 13 },
  sessionId: { fontSize: 11, fontFamily: "monospace", color: "#5a6070" },
  escalatedBadge: { fontSize: 10, background: "#fff3e0", color: "#e07b00", padding: "1px 6px", borderRadius: 10, fontWeight: 500 },
  preview: { fontSize: 12, color: "#5a6070", lineHeight: 1.4, marginBottom: 4, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  msgCount: { fontSize: 10, color: "#9aa0b0" },
  detailHeader: { display: "flex", alignItems: "center", gap: 10, padding: "0 0 16px", borderBottom: "1px solid #eef1f6", marginBottom: 16 },
  messageList: { flex: 1, display: "flex", flexDirection: "column" },
};
