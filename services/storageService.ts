import { ChatSession, Message } from '../types';

const SESSION_KEY = 'aegis_active_session_v1';

// Helper to get user-specific storage key
const getStorageKey = (userId: string) => `aegis_chats_${userId}_v1`;

// --- Session Management ---

export const saveUserSession = (email: string) => {
  localStorage.setItem(SESSION_KEY, email);
};

export const getUserSession = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const clearUserSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- Chat Management ---

export const saveChat = (session: ChatSession, userId: string) => {
  try {
    const key = getStorageKey(userId);
    const existing = getChats(userId);
    const index = existing.findIndex(c => c.id === session.id);
    
    // Update timestamp
    const updatedSession = { ...session, updatedAt: Date.now() };

    if (index >= 0) {
      existing[index] = updatedSession;
    } else {
      existing.unshift(updatedSession);
    }
    
    // Sort by newest first
    existing.sort((a, b) => b.updatedAt - a.updatedAt);
    
    // Limit to 50 chats to save local storage space
    const trimmed = existing.slice(0, 50);
    
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save chat', e);
  }
};

export const getChats = (userId: string): ChatSession[] => {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getChat = (id: string, userId: string): ChatSession | undefined => {
  return getChats(userId).find(c => c.id === id);
};

export const deleteChat = (id: string, userId: string) => {
    const key = getStorageKey(userId);
    const existing = getChats(userId);
    const filtered = existing.filter(c => c.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
};

export const clearAllChats = (userId: string) => {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
};

export const createNewSession = (initialMsg?: Message, agentId = 'default'): ChatSession => {
    return {
        id: crypto.randomUUID(),
        title: 'New Chat',
        messages: initialMsg ? [initialMsg] : [],
        updatedAt: Date.now(),
        agentId
    };
};
