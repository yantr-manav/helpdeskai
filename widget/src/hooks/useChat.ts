import { useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "../utils/streaming";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useChat() {
  const {
    messages,
    sessionId,
    isTyping,
    addMessage,
    updateMessage,
    setIsTyping,
  } = useChatStore();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      // Add user message
      addMessage({ role: "user", content: text });

      // Check for escalation triggers
      const escalatePattern = /ticket|raise issue|speak to human|talk to agent|escalate/i;
      if (escalatePattern.test(text)) {
        addMessage({
          role: "bot",
          content:
            "I'll open a support ticket for you right now. Please fill in the details below.",
          shouldEscalate: true,
        });
        return;
      }

      setIsTyping(true);

      // Add placeholder bot message for streaming
      const botMsgId = addMessage({ role: "bot", content: "" });

      let fullContent = "";

      await streamChat(API_URL, sessionId, text, {
        onChunk: (chunk) => {
          fullContent += chunk;
          updateMessage(botMsgId, { content: fullContent });
        },
        onMeta: (meta) => {
          updateMessage(botMsgId, {
            confidence: meta.confidence,
            sources: meta.sources,
            shouldEscalate: meta.should_escalate,
          });
        },
        onDone: () => {
          setIsTyping(false);
        },
        onError: () => {
          updateMessage(botMsgId, {
            content:
              "I'm having trouble connecting right now. Please try again or create a support ticket.",
          });
          setIsTyping(false);
        },
      });
    },
    [sessionId, isTyping, addMessage, updateMessage, setIsTyping]
  );

  return { messages, isTyping, sendMessage };
}
