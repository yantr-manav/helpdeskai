import React, { useEffect, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { ConversationsChart, EscalationDonut, ChannelBar } from "../components/charts/Charts";
import { getAnalytics } from "../api/client";

export function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAnalytics().then((r) => setData(r.data));
  }, []);

  if (!data) return <div style={{ padding: 40, color: "#9aa0b0" }}>Loading analytics…</div>;

  return (
    <div>
      <TopBar title="Analytics" subtitle="Real-time conversation and ticket metrics" />

      <div style={s.grid}>
        <div style={{ gridColumn: "span 3" }}>
          <ConversationsChart data={data.daily_conversations ?? {}} />
        </div>
        <EscalationDonut escalated={data.escalated_count} total={data.total_conversations} />
        <ChannelBar data={data.by_channel ?? {}} />

        {/* Ticket breakdown */}
        <div style={s.card}>
          <div style={s.cardTitle}>Ticket Status</div>
          {["open", "in_progress", "resolved", "closed"].map((st) => {
            const count = data.tickets?.[st] ?? 0;
            const total = data.tickets?.total ?? 1;
            return (
              <div key={st} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ textTransform: "capitalize" }}>{st.replace("_", " ")}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ background: "#eef1f6", borderRadius: 4, height: 6 }}>
                  <div style={{
                    width: `${(count / total) * 100}%`,
                    height: "100%",
                    background: st === "open" ? "#e07b00" : st === "in_progress" ? "#1a6cff" : st === "resolved" ? "#0d9e6b" : "#9aa0b0",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary numbers */}
        <div style={s.card}>
          <div style={s.cardTitle}>Summary</div>
          {[
            ["Total Conversations", data.total_conversations],
            ["Total Messages", data.total_messages],
            ["Escalated Conversations", data.escalated_count],
            ["Escalation Rate", `${data.escalation_rate_pct}%`],
          ].map(([label, value]) => (
            <div key={label as string} style={s.summaryRow}>
              <span style={s.summaryLabel}>{label}</span>
              <span style={s.summaryVal}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #eef1f6",
    borderRadius: 14,
    padding: 20,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#0f1117", marginBottom: 16 },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f5f7fa",
    fontSize: 13,
  },
  summaryLabel: { color: "#5a6070" },
  summaryVal: { fontWeight: 600, color: "#0f1117" },
};
