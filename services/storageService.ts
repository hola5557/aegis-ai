import { ChatSession, Message } from '../types';

const STORAGE_KEY = 'aegis_chats_v1';
const SETTINGS_KEY = 'aegis_settings_v1';

export const saveChat = (session: ChatSession) => {
  try {
    const existing = getChats();
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
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save chat', e);
  }
};

export const getChats = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getChat = (id: string): ChatSession | undefined => {
  return getChats().find(c => c.id === id);
};

export const deleteChat = (id: string) => {
    const existing = getChats();
    const filtered = existing.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllChats = () => {
    localStorage.removeItem(STORAGE_KEY);
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
