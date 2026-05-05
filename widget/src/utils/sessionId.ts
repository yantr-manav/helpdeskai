import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "helpdeskAI_session_id";

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function resetSessionId(): string {
  const id = uuidv4();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}
