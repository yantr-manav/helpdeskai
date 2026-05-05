export type MessageRole = "user" | "bot";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
  shouldEscalate?: boolean;
  rating?: "up" | "down" | null;
}

export interface TicketFormData {
  name: string;
  email: string;
  issue: string;
  priority: "low" | "medium" | "high";
}

export interface TicketResponse {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  sessionId: string;
  isTyping: boolean;
  ticketMode: boolean;
  openTicket: TicketResponse | null;
}

export interface WidgetConfig {
  apiUrl: string;
  primaryColor?: string;
  companyName?: string;
  greeting?: string;
}
