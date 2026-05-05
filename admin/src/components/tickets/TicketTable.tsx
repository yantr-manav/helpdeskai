import React, { useState } from "react";
import { updateTicket } from "../../api/client";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: "#fff3e0", text: "#e07b00" },
  in_progress: { bg: "#e8f0ff", text: "#1a6cff" },
  resolved:    { bg: "#edfaf3", text: "#0d9e6b" },
  closed:      { bg: "#f5f5f5", text: "#9aa0b0" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#0d9e6b",
  medium: "#e07b00",
  high: "#d93025",
};

interface Ticket {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  issue: string;
  priority: string;
  status: string;
  channel: string;
  created_at: string;
}

interface Props {
  tickets: Ticket[];
  onRefresh: () => void;
}

export function TicketTable({ tickets, onRefresh }: Props) {
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(true);
    await updateTicket(id, status);
    setUpdating(false);
    onRefresh();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", gap: 20, height: "100%" }}>
      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Ticket ID", "Name", "Priority", "Status", "Channel", "Created"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td colSpan={6} style={s.empty}>No tickets yet</td></tr>
            )}
            {tickets.map((t) => (
              <tr
                key={t.id}
                style={{ ...s.tr, ...(selected?.id === t.id ? s.trSelected : {}) }}
                onClick={() => setSelected(t)}
              >
                <td style={s.td}>
                  <span style={s.ticketNum}>{t.ticket_number}</span>
                </td>
                <td style={s.td}>
                  <div style={s.name}>{t.name}</div>
                  <div style={s.email}>{t.email}</div>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, color: PRIORITY_COLORS[t.priority] }}>
                    {t.priority}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.statusBadge, ...STATUS_COLORS[t.status] }}>
                    {t.status.replace("_", " ")}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={s.channel}>{t.channel === "whatsapp" ? "📱 WhatsApp" : "🌐 Web"}</span>
                </td>
                <td style={s.td}>{fmtDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selected && (
        <div style={s.drawer}>
          <div style={s.drawerHeader}>
            <span style={s.ticketNum}>{selected.ticket_number}</span>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>

          <div style={s.field}>
            <div style={s.fieldLabel}>Customer</div>
            <div style={s.fieldVal}>{selected.name}</div>
            <div style={s.fieldSub}>{selected.email}</div>
          </div>

          <div style={s.field}>
            <div style={s.fieldLabel}>Issue</div>
            <div style={{ ...s.fieldVal, fontSize: 13, lineHeight: 1.6 }}>{selected.issue}</div>
          </div>

          <div style={s.field}>
            <div style={s.fieldLabel}>Priority</div>
            <span style={{ color: PRIORITY_COLORS[selected.priority], fontWeight: 600, fontSize: 13 }}>
              {selected.priority.toUpperCase()}
            </span>
          </div>

          <div style={s.field}>
            <div style={s.fieldLabel}>Channel</div>
            <div style={s.fieldVal}>{selected.channel === "whatsapp" ? "📱 WhatsApp" : "🌐 Web"}</div>
          </div>

          <div style={s.field}>
            <div style={s.fieldLabel}>Update Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
              {["open", "in_progress", "resolved", "closed"].map((st) => (
                <button
                  key={st}
                  disabled={updating || selected.status === st}
                  onClick={() => handleStatus(selected.id, st)}
                  style={{
                    ...s.statusBtn,
                    ...(selected.status === st ? s.statusBtnActive : {}),
                  }}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  tableWrap: { flex: 1, overflowX: "auto", overflowY: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left" as const, padding: "10px 14px",
    fontSize: 11, fontWeight: 600, color: "#9aa0b0",
    textTransform: "uppercase" as const, letterSpacing: 0.5,
    borderBottom: "1px solid #eef1f6", background: "#fafbfc",
  },
  tr: { borderBottom: "1px solid #eef1f6", cursor: "pointer", transition: "background 0.1s" },
  trSelected: { background: "#f0f4ff" },
  td: { padding: "12px 14px", verticalAlign: "middle" as const },
  empty: { padding: 40, textAlign: "center" as const, color: "#9aa0b0" },
  ticketNum: { fontFamily: "monospace", fontSize: 12, background: "#f0f4ff", color: "#1a6cff", padding: "2px 7px", borderRadius: 5 },
  name: { fontWeight: 500, color: "#0f1117" },
  email: { fontSize: 11, color: "#9aa0b0", marginTop: 1 },
  badge: { fontSize: 12, fontWeight: 600, textTransform: "capitalize" as const },
  statusBadge: { fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500 },
  channel: { fontSize: 12, color: "#5a6070" },
  drawer: {
    width: 280, flexShrink: 0,
    background: "#fff", border: "1px solid #eef1f6",
    borderRadius: 14, padding: 18,
    display: "flex", flexDirection: "column", gap: 16,
    height: "fit-content", position: "sticky", top: 0,
  },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#9aa0b0", fontSize: 14 },
  field: {},
  fieldLabel: { fontSize: 10, fontWeight: 600, color: "#9aa0b0", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 },
  fieldVal: { fontSize: 14, color: "#0f1117", fontWeight: 500 },
  fieldSub: { fontSize: 11, color: "#9aa0b0" },
  statusBtn: {
    padding: "8px 12px", textAlign: "left" as const,
    background: "#f5f7fa", border: "1px solid #eef1f6",
    borderRadius: 8, cursor: "pointer", fontSize: 12,
    fontFamily: "inherit", textTransform: "capitalize" as const,
    transition: "all 0.1s",
  },
  statusBtnActive: { background: "#e8f0ff", borderColor: "#1a6cff", color: "#1a6cff", fontWeight: 600 },
};
