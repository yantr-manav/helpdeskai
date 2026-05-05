import React, { useEffect, useState } from "react";
import { TopBar } from "../components/layout/TopBar";
import { TicketTable } from "../components/tickets/TicketTable";
import { getTickets } from "../api/client";

export function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const res = await getTickets(200);
    setTickets(res.data.tickets);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <TopBar title="Tickets" subtitle={`${tickets.length} total tickets`} />

      {/* Filter tabs */}
      <div style={s.tabs}>
        {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
          <button
            key={st}
            style={{ ...s.tab, ...(filter === st ? s.tabActive : {}) }}
            onClick={() => setFilter(st)}
          >
            {st.replace("_", " ")}
            {counts[st] ? <span style={s.count}>{counts[st]}</span> : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.empty}>Loading tickets…</div>
      ) : (
        <TicketTable tickets={filtered} onRefresh={load} />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  tabs: { display: "flex", gap: 4, marginBottom: 20 },
  tab: {
    padding: "7px 14px",
    border: "1px solid #eef1f6",
    borderRadius: 8,
    background: "#fff",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    color: "#5a6070",
    fontFamily: "inherit",
    textTransform: "capitalize" as const,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tabActive: { background: "#e8f0ff", borderColor: "#1a6cff", color: "#1a6cff" },
  count: { background: "#eef1f6", borderRadius: 10, padding: "1px 6px", fontSize: 10 },
  empty: { padding: 40, color: "#9aa0b0", fontSize: 13, textAlign: "center" as const },
};
