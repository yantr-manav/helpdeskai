import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  api.post("/admin/login", { email, password });

// ── Tickets ──────────────────────────────────────────────────
export const getTickets = (limit = 100) =>
  api.get(`/admin/tickets?limit=${limit}`);

export const updateTicket = (id: string, status: string) =>
  api.patch(`/admin/tickets/${id}`, { status });

// ── Conversations ─────────────────────────────────────────────
export const getConversations = (limit = 50, offset = 0) =>
  api.get(`/admin/conversations?limit=${limit}&offset=${offset}`);

export const getConversation = (sessionId: string) =>
  api.get(`/admin/conversations/${sessionId}`);

// ── Analytics ─────────────────────────────────────────────────
export const getAnalytics = () => api.get("/admin/analytics");

// ── KB ────────────────────────────────────────────────────────
export const getKBStats = () => api.get("/admin/kb/stats");
export const resetKB = () => api.delete("/admin/kb/reset");

// ── Health ────────────────────────────────────────────────────
export const getHealth = () => api.get("/health");
