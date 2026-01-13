export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isRedacted?: boolean; // Indicates if PII was scrubbed
  originalContent?: string; // For user reference only, never sent to server
}

export interface ModelMetadata {
  id: string;
  name: string;
  provider: string;
  trainingCutoff: string;
  biasScore: number; // 0-100, lower is better
  license: string;
  complianceLevel: 'High' | 'Medium' | 'Low';
}

export interface UserSettings {
  privacyShield: boolean; // PII Redaction
  dataRetention: boolean; // Local storage persistence
  voiceEnabled: boolean;
  theme: 'light' | 'dark' | 'system'; // UI Theme
  plugins: {
    webSearch: boolean;
  };
  customInstructions: string; // User-defined behavior
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  agentId?: string; // which "GPT" was used
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
  category: 'Productivity' | 'Coding' | 'Writing' | 'Business' | 'Security' | 'Creative';
  author: string;
  rating: number;
  users: string;
}