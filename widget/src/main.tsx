import React from "react";
import ReactDOM from "react-dom/client";
import { ChatWidget } from "./components/ChatWidget";

// When built as IIFE, expose HelpdeskAI.init() for embed
function init(config?: { apiUrl?: string }) {
  if (config?.apiUrl) {
    (window as any).__HELPDESKAI_API_URL__ = config.apiUrl;
  }

  const container = document.createElement("div");
  container.id = "helpdeskAI-root";
  document.body.appendChild(container);

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
}

// Dev mode: auto-init
if (import.meta.env.DEV) {
  init();
}

// Export for embed usage
(window as any).HelpdeskAI = { init };
