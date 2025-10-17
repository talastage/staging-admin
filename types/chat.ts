// types/chat.ts
export interface ChatThread {
  id: number;
  subject: string;
  status: "open" | "closed" | "pending";
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  thread_id: number;
  content: string;
  is_support: boolean;
  attachments?: string[];
  created_at: string;
  status: "sent" | "delivered" | "read";
}
