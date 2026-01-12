import React from 'react';
import { ChatSession } from '../types';
import { MessageSquare, Plus, Trash2, Share2, MoreHorizontal } from 'lucide-react';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  userEmail: string | null;
  onOpenStore: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  userEmail,
  onOpenStore
}) => {
    
  // Group sessions by date could go here, simplified for now
  
  return (
    <div className="flex flex-col h-full bg-[#020617] border-r border-aegis-800 w-64 md:w-72 flex-shrink-0">
        {/* Header */}
        <div className="p-3">
             <button 
                onClick={onNewChat}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-aegis-800 rounded-lg transition-colors text-white border border-aegis-800 hover:border-aegis-700 bg-aegis-900/50 group"
             >
                <div className="bg-white text-black rounded p-0.5">
                    <Plus size={16} />
                </div>
                <span className="text-sm font-medium">New chat</span>
                <span className="ml-auto text-xs text-gray-500 opacity-0 group-hover:opacity-100">⌘N</span>
             </button>
        </div>

        {/* Links */}
        <div className="px-3 pb-2">
             <button onClick={onOpenStore} className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-aegis-800 rounded-lg transition-colors text-sm">
                <div className="w-6 h-6 flex items-center justify-center">
                    <span className="text-lg">◈</span>
                </div>
                <span>Explore Aegis Agents</span>
             </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <div className="text-xs font-semibold text-gray-500 px-3 py-1 mb-1">Today</div>
            {sessions.map(session => (
                <div 
                    key={session.id}
                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors text-sm ${session.id === currentSessionId ? 'bg-aegis-800 text-white' : 'text-gray-400 hover:bg-aegis-800/50 hover:text-gray-200'}`}
                    onClick={() => onSelectSession(session.id)}
                >
                    <span className="truncate flex-1 pr-6">{session.title || "New Conversation"}</span>
                    
                    {/* Hover Actions */}
                    {session.id === currentSessionId && (
                        <div className="absolute right-2 flex items-center gap-1">
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                className="p-1 hover:bg-aegis-700 rounded text-gray-400 hover:text-red-400"
                            >
                                <Trash2 size={14} />
                             </button>
                        </div>
                    )}
                </div>
            ))}
            {sessions.length === 0 && (
                <div className="px-4 text-xs text-gray-600 italic">No previous chats.</div>
            )}
        </div>

        {/* Footer / User Profile */}
        <div className="p-3 border-t border-aegis-800 mt-auto">
             <div className="flex items-center gap-3 px-2 py-2 hover:bg-aegis-800 rounded-lg cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded text-white flex items-center justify-center text-xs font-bold">
                    {userEmail?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-white truncate">{userEmail}</div>
                    <div className="text-[10px] text-gray-400">Pro Plan</div>
                </div>
                <MoreHorizontal size={16} className="text-gray-500" />
             </div>
        </div>
    </div>
  );
};

export default ChatSidebar;
