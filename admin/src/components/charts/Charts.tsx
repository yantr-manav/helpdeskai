import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface ConversationsChartProps {
  data: Record<string, number>;
}

export function ConversationsChart({ data }: ConversationsChartProps) {
  const chartData = Object.entries(data).map(([date, count]) => ({
    date: date.slice(5),   // "MM-DD"
    conversations: count,
  }));

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Daily Conversations (last 14 days)</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a6cff" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1a6cff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eef1f6" }}
          />
          <Area
            type="monotone"
            dataKey="conversations"
            stroke="#1a6cff"
            strokeWidth={2}
            fill="url(#blueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface EscalationDonutProps {
  escalated: number;
  total: number;
}

const COLORS = ["#1a6cff", "#eef1f6"];

export function EscalationDonut({ escalated, total }: EscalationDonutProps) {
  const resolved = total - escalated;
  const data = [
    { name: "Escalated", value: escalated },
    { name: "Resolved by AI", value: resolved },
  ];
  const pct = total > 0 ? Math.round((escalated / total) * 100) : 0;

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>Escalation Rate</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} strokeWidth={0} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#0f1117" }}>{pct}%</div>
          <div style={{ fontSize: 12, color: "#5a6070" }}>of chats escalated</div>
          <div style={{ fontSize: 11, color: "#9aa0b0", marginTop: 4 }}>{escalated} of {total} conversations</div>
        </div>
      </div>
    </div>
  );
}

interface ChannelBarProps {
  data: Record<string, number>;
}

export function ChannelBar({ data }: ChannelBarProps) {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const colors: Record<string, string> = { web: "#1a6cff", whatsapp: "#25d366" };

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>By Channel</div>
      {entries.map(([ch, count]) => (
        <div key={ch} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span>{ch === "whatsapp" ? "📱 WhatsApp" : "🌐 Web"}</span>
            <span style={{ fontWeight: 600 }}>{count}</span>
          </div>
          <div style={{ background: "#eef1f6", borderRadius: 4, height: 6 }}>
            <div style={{
              width: `${total > 0 ? (count / total) * 100 : 0}%`,
              height: "100%",
              background: colors[ch] || "#1a6cff",
              borderRadius: 4,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    border: "1px solid #eef1f6",
    borderRadius: 14,
    padding: 20,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f1117",
    marginBottom: 16,
  },
};
