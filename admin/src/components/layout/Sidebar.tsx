import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const NAV = [
  { to: "/", icon: "📊", label: "Dashboard" },
  { to: "/conversations", icon: "💬", label: "Conversations" },
  { to: "/tickets", icon: "🎫", label: "Tickets" },
  { to: "/knowledge-base", icon: "📚", label: "Knowledge Base" },
  { to: "/analytics", icon: "📈", label: "Analytics" },
];

export function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <span style={s.logoIcon}>⚡</span>
        <div>
          <div style={s.logoTitle}>HelpdeskAI</div>
          <div style={s.logoSub}>FlowTask Admin</div>
        </div>
      </div>

      <nav style={s.nav}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              ...s.navItem,
              ...(isActive ? s.navItemActive : {}),
            })}
          >
            <span style={s.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <button style={s.logoutBtn} onClick={handleLogout}>
        ↩ Logout
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    minWidth: 220,
    height: "100vh",
    background: "#0f1117",
    display: "flex",
    flexDirection: "column",
    padding: "0 0 16px",
    position: "sticky",
    top: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px 18px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    marginBottom: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#1a6cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: -0.3,
  },
  logoSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    marginTop: 1,
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "0 8px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    textDecoration: "none",
    transition: "all 0.15s",
  },
  navItemActive: {
    background: "rgba(26,108,255,0.18)",
    color: "#6fa8ff",
  },
  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: "center" as const,
  },
  logoutBtn: {
    margin: "0 16px",
    padding: "9px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
};
