import React, { useState } from "react";
import { TicketFormData } from "../types";

interface Props {
  state: "open" | "submitting" | "error";
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
  error: string | null;
}

export function TicketForm({ state, onSubmit, onCancel, error }: Props) {
  const [form, setForm] = useState<TicketFormData>({
    name: "",
    email: "",
    issue: "",
    priority: "medium",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.issue.trim()) {
      setValidationError("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    setValidationError(null);
    onSubmit(form);
  };

  const field = (
    label: string,
    key: keyof TicketFormData,
    type: "input" | "textarea" | "select" = "input"
  ) => (
    <div style={{ marginBottom: 8 }}>
      <label style={styles.label}>{label}</label>
      {type === "textarea" ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={styles.textarea}
          rows={2}
          disabled={state === "submitting"}
        />
      ) : type === "select" ? (
        <select
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value as any })}
          style={styles.input}
          disabled={state === "submitting"}
        >
          <option value="low">🟢 Low — general question</option>
          <option value="medium">🟡 Medium — affecting my work</option>
          <option value="high">🔴 High — blocking me completely</option>
        </select>
      ) : (
        <input
          type={key === "email" ? "email" : "text"}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={styles.input}
          placeholder={
            key === "name" ? "Jane Smith" : key === "email" ? "jane@company.com" : ""
          }
          disabled={state === "submitting"}
        />
      )}
    </div>
  );

  return (
    <div style={styles.card}>
      <div style={styles.heading}>🎫 New Support Ticket</div>
      {field("Your name", "name")}
      {field("Email address", "email")}
      {field("Describe your issue", "issue", "textarea")}
      {field("Priority", "priority", "select")}
      {(validationError || error) && (
        <div style={styles.errorMsg}>{validationError || error}</div>
      )}
      <div style={styles.actions}>
        <button
          onClick={onCancel}
          style={styles.cancelBtn}
          disabled={state === "submitting"}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={styles.submitBtn}
          disabled={state === "submitting"}
        >
          {state === "submitting" ? "Submitting…" : "Submit ticket →"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#f5f7fa",
    border: "1px solid rgba(0,0,0,0.09)",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    animation: "fadeUp 0.2s ease",
  },
  heading: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f1117",
    marginBottom: 10,
  },
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 500,
    color: "#5a6070",
    marginBottom: 3,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    padding: "7px 9px",
    fontSize: 12,
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 7,
    background: "#fff",
    color: "#0f1117",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "7px 9px",
    fontSize: 12,
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 7,
    background: "#fff",
    color: "#0f1117",
    outline: "none",
    resize: "none" as const,
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  errorMsg: {
    fontSize: 11,
    color: "#d93025",
    background: "#fff0ee",
    border: "1px solid #f8c5c0",
    borderRadius: 7,
    padding: "5px 9px",
    marginBottom: 8,
  },
  actions: {
    display: "flex",
    gap: 6,
    marginTop: 10,
  },
  cancelBtn: {
    padding: "7px 13px",
    fontSize: 12,
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 8,
    cursor: "pointer",
    color: "#5a6070",
    fontFamily: "inherit",
  },
  submitBtn: {
    flex: 1,
    padding: "7px",
    fontSize: 12,
    fontWeight: 600,
    background: "#1a6cff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
