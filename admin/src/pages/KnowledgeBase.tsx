import React, { useEffect, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { getKBStats, resetKB } from "../api/client";

const KB_DOCS = [
  { id: "KB001", title: "Getting Started Guide", topics: ["signup", "workspace", "invite"] },
  { id: "KB002", title: "Billing & Subscriptions", topics: ["pricing", "upgrade", "refunds"] },
  { id: "KB003", title: "Task & Board Management", topics: ["tasks", "kanban", "subtasks"] },
  { id: "KB004", title: "Integrations Guide", topics: ["slack", "github", "zapier"] },
  { id: "KB005", title: "Time Tracking", topics: ["logging", "reports", "export"] },
  { id: "KB006", title: "Permissions & Roles", topics: ["admin", "member", "guest"] },
  { id: "KB007", title: "Notifications & Alerts", topics: ["email", "push", "quiet hours"] },
  { id: "KB008", title: "Mobile App FAQ", topics: ["ios", "android", "offline"] },
  { id: "KB009", title: "Data & Security", topics: ["gdpr", "2fa", "export"] },
  { id: "KB010", title: "Common Errors & Fixes", topics: ["login", "sync", "troubleshooting"] },
];

export function KnowledgeBasePage() {
  const [stats, setStats] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    getKBStats().then((r) => setStats(r.data));
  }, []);

  const handleReset = async () => {
    if (!confirm("This will delete and recreate the Qdrant collection. You must re-run seed_kb.py after. Continue?")) return;
    setResetting(true);
    await resetKB();
    setResetMsg("✅ Collection reset. Run `python scripts/seed_kb.py` to re-index.");
    setResetting(false);
    getKBStats().then((r) => setStats(r.data));
  };

  return (
    <div>
      <TopBar
        title="Knowledge Base"
        subtitle="10 FlowTask support documents · Qdrant vector store"
        action={
          <button style={s.resetBtn} onClick={handleReset} disabled={resetting}>
            {resetting ? "Resetting…" : "🗑 Reset Index"}
          </button>
        }
      />

      {/* Stats bar */}
      {stats && (
        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={s.statNum}>{stats.points_count ?? 0}</span>
            <span style={s.statLabel}>Vector chunks</span>
          </div>
          <div style={s.stat}>
            <span style={s.statNum}>{KB_DOCS.length}</span>
            <span style={s.statLabel}>Documents</span>
          </div>
          <div style={s.stat}>
            <span style={s.statNum}>1536</span>
            <span style={s.statLabel}>Embedding dims</span>
          </div>
          <div style={s.stat}>
            <span style={s.statNum}>Cosine</span>
            <span style={s.statLabel}>Similarity metric</span>
          </div>
        </div>
      )}

      {resetMsg && <div style={s.resetMsg}>{resetMsg}</div>}

      {/* Document list */}
      <div style={s.docGrid}>
        {KB_DOCS.map((doc) => (
          <div key={doc.id} style={s.docCard}>
            <div style={s.docId}>{doc.id}</div>
            <div style={s.docTitle}>{doc.title}</div>
            <div style={s.tagRow}>
              {doc.topics.map((t) => (
                <span key={t} style={s.tag}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={s.note}>
        <strong>To add or update documents:</strong> Edit <code>backend/docs/kb/knowledge_base.py</code> and re-run <code>python scripts/seed_kb.py</code>.
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  statsRow: {
    display: "flex",
    gap: 1,
    background: "#f5f7fa",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    background: "#fff",
    margin: "1px",
    borderRadius: 11,
  },
  statNum: { fontSize: 22, fontWeight: 700, color: "#0f1117" },
  statLabel: { fontSize: 11, color: "#9aa0b0" },
  resetBtn: {
    padding: "8px 16px",
    background: "#fff",
    border: "1px solid #d93025",
    color: "#d93025",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  resetMsg: {
    padding: "10px 14px",
    background: "#edfaf3",
    border: "1px solid #b4e8ce",
    borderRadius: 9,
    fontSize: 13,
    color: "#0d6e4d",
    marginBottom: 20,
  },
  docGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14,
    marginBottom: 24,
  },
  docCard: {
    background: "#fff",
    border: "1px solid #eef1f6",
    borderRadius: 12,
    padding: 16,
    transition: "box-shadow 0.15s",
  },
  docId: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#1a6cff",
    background: "#e8f0ff",
    padding: "2px 7px",
    borderRadius: 5,
    display: "inline-block",
    marginBottom: 8,
  },
  docTitle: { fontSize: 14, fontWeight: 600, color: "#0f1117", marginBottom: 8 },
  tagRow: { display: "flex", flexWrap: "wrap" as const, gap: 4 },
  tag: {
    fontSize: 10,
    padding: "2px 7px",
    borderRadius: 10,
    background: "#f5f7fa",
    color: "#5a6070",
  },
  note: {
    padding: "12px 16px",
    background: "#f5f7fa",
    borderRadius: 10,
    fontSize: 12,
    color: "#5a6070",
    lineHeight: 1.6,
  },
};
