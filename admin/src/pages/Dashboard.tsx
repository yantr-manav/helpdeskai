import React, { useEffect, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { ConversationsChart, EscalationDonut, ChannelBar } from "../components/charts/Charts";
import { getAnalytics, getHealth } from "../api/client";

interface Analytics {
  total_conversations: number;
  total_messages: number;
  escalated_count: number;
  escalation_rate_pct: number;
  by_channel: Record<string, number>;
  daily_conversations: Record<string, number>;
  tickets: { total: number; open: number; in_progress: number; resolved: number };
}

function StatCard({ label, value, sub, color = "#1a6cff" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={s.statCard}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getHealth()]).then(([a, h]) => {
      setAnalytics(a.data);
      setHealth(h.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.loading}>Loading dashboard…</div>;

  return (
    <div>
      <TopBar title="Dashboard" subtitle="FlowTask HelpdeskAI · Overview" />

      {/* System health */}
      <div style={s.healthRow}>
        <span style={{ fontSize: 12, color: "#5a6070" }}>System status:</span>
        {["qdrant", "redis"].map((svc) => (
          <span key={svc} style={s.healthBadge}>
            <span style={{ ...s.dot, background: health ? "#4dffa0" : "#ff6b6b" }} />
            {svc}
          </span>
        ))}
      </div>

      {/* Stat cards */}
      <div style={s.statsGrid}>
        <StatCard label="Total Conversations" value={analytics?.total_conversations ?? 0} />
        <StatCard label="Total Messages" value={analytics?.total_messages ?? 0} />
        <StatCard label="Escalation Rate" value={`${analytics?.escalation_rate_pct ?? 0}%`} color="#e07b00" />
        <StatCard label="Open Tickets" value={analytics?.tickets?.open ?? 0} color="#d93025" />
        <StatCard label="Resolved Tickets" value={analytics?.tickets?.resolved ?? 0} color="#0d9e6b" />
        <StatCard label="Total Tickets" value={analytics?.tickets?.total ?? 0} />
      </div>

      {/* Charts */}
      <div style={s.chartsGrid}>
        <div style={{ gridColumn: "span 2" }}>
          <ConversationsChart data={analytics?.daily_conversations ?? {}} />
        </div>
        <EscalationDonut
          escalated={analytics?.escalated_count ?? 0}
          total={analytics?.total_conversations ?? 0}
        />
        <ChannelBar data={analytics?.by_channel ?? {}} />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loading: { padding: 40, color: "#9aa0b0", fontSize: 14 },
  healthRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    padding: "10px 16px",
    background: "#f5f7fa",
    borderRadius: 10,
    fontSize: 12,
  },
  healthBadge: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    background: "#fff",
    border: "1px solid #eef1f6",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
  },
  dot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #eef1f6",
    borderRadius: 14,
    padding: "18px 20px",
  },
  statLabel: { fontSize: 12, color: "#5a6070", marginTop: 4 },
  statSub: { fontSize: 11, color: "#9aa0b0", marginTop: 2 },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 16,
  },
};
