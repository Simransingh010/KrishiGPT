export interface ChatMessage {
  question: string;
  answer: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface NavigationTab {
  id: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

