import React from 'react';
import { ChatSession } from '../types';
import { Plus, Trash2, Settings, LayoutGrid } from 'lucide-react';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenStore: () => void;
  onOpenSettings: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  onOpenStore,
  onOpenSettings
}) => {
    
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-aegis-800 w-64 md:w-72 flex-shrink-0 relative z-20 transition-colors duration-300">
        {/* Header with Cool Logo */}
        <div className="p-4 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 relative">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-aegis-500 w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    <path d="M12 2L3 7V12C3 17.5228 6.75736 22.2573 12 23.5C17.2426 22.2573 21 17.5228 21 12V7L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
                Aegis<span className="text-blue-600 dark:text-aegis-500">AI</span>
            </span>
        </div>

        <div className="px-3">
             <button 
                onClick={onNewChat}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-100 dark:hover:bg-aegis-800 rounded-lg transition-colors text-slate-700 dark:text-white border border-slate-200 dark:border-aegis-800 hover:border-slate-300 dark:hover:border-aegis-700 bg-white dark:bg-aegis-900/50 group shadow-sm"
             >
                <div className="bg-slate-900 dark:bg-white text-white dark:text-black rounded p-0.5">
                    <Plus size={16} />
                </div>
                <span className="text-sm font-medium">New chat</span>
                <span className="ml-auto text-xs text-slate-400 dark:text-gray-500 opacity-0 group-hover:opacity-100">⌘N</span>
             </button>
        </div>

        {/* Links */}
        <div className="px-3 py-2">
             <button onClick={onOpenStore} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-aegis-800 rounded-lg transition-colors text-sm">
                <div className="w-6 h-6 flex items-center justify-center text-blue-500 dark:text-aegis-400">
                    <LayoutGrid size={18} />
                </div>
                <span>Agent Marketplace</span>
             </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <div className="text-xs font-semibold text-slate-400 dark:text-gray-500 px-3 py-1 mb-1 uppercase tracking-wider">Your Chats</div>
            {sessions.map(session => (
                <div 
                    key={session.id}
                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors text-sm ${session.id === currentSessionId ? 'bg-slate-100 dark:bg-aegis-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-aegis-800/50 hover:text-slate-900 dark:hover:text-gray-200'}`}
                    onClick={() => onSelectSession(session.id)}
                >
                    <span className="truncate flex-1 pr-6">{session.title || "New Conversation"}</span>
                    
                    {/* Hover Actions */}
                    {session.id === currentSessionId && (
                        <div className="absolute right-2 flex items-center gap-1">
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-aegis-700 rounded text-slate-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                                <Trash2 size={14} />
                             </button>
                        </div>
                    )}
                </div>
            ))}
            {sessions.length === 0 && (
                <div className="px-4 text-xs text-slate-400 dark:text-gray-600 italic">No previous chats.</div>
            )}
        </div>

        {/* Footer / Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-aegis-800 mt-auto bg-slate-50 dark:bg-[#020617]">
             <button 
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-200 dark:hover:bg-aegis-800 rounded-lg cursor-pointer transition-colors text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
            >
                <Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
                <span className="ml-auto text-[10px] text-blue-600 dark:text-aegis-500 font-mono bg-blue-100 dark:bg-aegis-900 px-1.5 py-0.5 rounded">GUEST</span>
             </button>
        </div>
    </div>
  );
};

export default ChatSidebar;