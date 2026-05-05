export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onMeta: (meta: { confidence: number; sources: string[]; should_escalate: boolean }) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export async function streamChat(
  apiUrl: string,
  sessionId: string,
  message: string,
  callbacks: StreamCallbacks
) {
  const { onChunk, onMeta, onDone, onError } = callbacks;

  try {
    const res = await fetch(`${apiUrl}/api/v1/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message, channel: "web" }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data.includes("[META]")) {
          try {
            const metaStr = data.split("[META]")[1];
            const meta = JSON.parse(metaStr);
            onMeta(meta);
          } catch {}
        } else {
          onChunk(data);
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
