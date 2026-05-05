import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/client";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const [email, setEmail] = useState("admin@flowtask.demo");
  const [password, setPassword] = useState("changeme123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      setToken(res.data.access_token);
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <div>
            <div style={s.logoTitle}>HelpdeskAI</div>
            <div style={s.logoSub}>Admin Dashboard</div>
          </div>
        </div>
        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
              required
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              required
            />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
        <div style={s.hint}>
          Default: admin@flowtask.demo / changeme123
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0ff 0%, #f5f7fa 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 36,
    width: 380,
    boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#1a6cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  logoTitle: { fontSize: 18, fontWeight: 700, color: "#0f1117", letterSpacing: -0.3 },
  logoSub: { fontSize: 12, color: "#9aa0b0", marginTop: 1 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: "#5a6070" },
  input: {
    padding: "10px 12px",
    border: "1.5px solid #eef1f6",
    borderRadius: 9,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: "#0f1117",
  },
  error: {
    fontSize: 12,
    color: "#d93025",
    background: "#fff0ee",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #f8c5c0",
  },
  btn: {
    padding: "12px",
    background: "#1a6cff",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 4,
  },
  hint: {
    marginTop: 16,
    fontSize: 11,
    color: "#9aa0b0",
    textAlign: "center" as const,
    background: "#f5f7fa",
    borderRadius: 8,
    padding: "8px",
  },
};
