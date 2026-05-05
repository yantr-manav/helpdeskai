import { useState, useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { TicketFormData, TicketResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type TicketState = "idle" | "open" | "submitting" | "success" | "error";

export function useTicket() {
  const [state, setState] = useState<TicketState>("idle");
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sessionId, setOpenTicket } = useChatStore();

  const openForm = useCallback(() => setState("open"), []);
  const closeForm = useCallback(() => setState("idle"), []);

  const submit = useCallback(
    async (data: TicketFormData) => {
      setState("submitting");
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/ticket/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            session_id: sessionId,
            channel: "web",
          }),
        });
        if (!res.ok) throw new Error("Failed to create ticket");
        const result: TicketResponse = await res.json();
        setTicket(result);
        setOpenTicket(result);
        setState("success");
      } catch (e) {
        setError("Failed to submit ticket. Please try again.");
        setState("error");
      }
    },
    [sessionId, setOpenTicket]
  );

  return { state, ticket, error, openForm, closeForm, submit };
}
