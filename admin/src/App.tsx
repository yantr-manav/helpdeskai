import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Sidebar } from "./components/layout/Sidebar";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { ConversationsPage } from "./pages/Conversations";
import { TicketsPage } from "./pages/Tickets";
import { KnowledgeBasePage } from "./pages/KnowledgeBase";
import { AnalyticsPage } from "./pages/Analytics";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
        <Route path="/conversations" element={<ProtectedLayout><ConversationsPage /></ProtectedLayout>} />
        <Route path="/tickets" element={<ProtectedLayout><TicketsPage /></ProtectedLayout>} />
        <Route path="/knowledge-base" element={<ProtectedLayout><KnowledgeBasePage /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
