import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, UserSettings, ModelMetadata, ChatSession } from './types';
import { AVAILABLE_MODELS, AGENTS } from './constants';
import { sendMessageToGemini } from './services/geminiService';
import { redactPII } from './services/privacyService';
import { 
    saveChat, 
    getChats, 
    deleteChat, 
    createNewSession, 
} from './services/storageService';
import PrivacyShield from './components/PrivacyShield';
import LegalModal from './components/LegalModal';
import ChatSidebar from './components/ChatSidebar';
import AgentStore from './components/AgentStore';
import SettingsModal from './components/SettingsModal';
import { Mic, MicOff, Send, Paperclip, Globe, Volume2, Copy, LogOut, X, Settings } from 'lucide-react';

const USER_ID = 'guest_operative_v1';

const App: React.FC = () => {
  // --- App State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<{data: string, mimeType: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelMetadata>(AVAILABLE_MODELS[0]);
  
  const [settings, setSettings] = useState<UserSettings>({
    privacyShield: true,
    dataRetention: true,
    voiceEnabled: false,
    theme: 'dark', // Default to dark for that cyberpunk feel
    plugins: {
        webSearch: false
    },
    customInstructions: ''
  });
  
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // SpeechRecognition
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  
  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
  }, [settings.theme]);
  
  // Load sessions immediately (No Auth)
  useEffect(() => {
      const loadedSessions = getChats(USER_ID);
      setSessions(loadedSessions);
      if (loadedSessions.length > 0) {
          setCurrentSessionId(loadedSessions[0].id);
      } else {
          handleNewChat();
      }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionId, sessions, messagesEndRef]);

  // --- Helpers ---
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];
  const currentAgent = AGENTS.find(a => a.id === currentSession?.agentId) || AGENTS[0];

  // --- Handlers ---

  const handleNewChat = () => {
      const newSession = createNewSession();
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      saveChat(newSession, USER_ID);
  };

  const handleDeleteSession = (id: string) => {
      deleteChat(id, USER_ID);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
          // If we deleted the active chat, pick the next one or create new
          const remaining = sessions.filter(s => s.id !== id);
          if (remaining.length > 0) {
              setCurrentSessionId(remaining[0].id);
          } else {
              setCurrentSessionId(null); // Will trigger empty state
              // Force create a new one to avoid empty screen state issues
              handleNewChat();
          }
      }
  };

  const handleAgentSelect = (agentId: string) => {
      // Create new chat with this agent
      const newSession = createNewSession(undefined, agentId);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      saveChat(newSession, USER_ID);
      setIsStoreOpen(false);
  };

  // --- File Handling ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              // Remove data URL prefix (e.g. "data:image/png;base64,")
              const base64Data = base64String.split(',')[1];
              setAttachment({
                  data: base64Data,
                  mimeType: file.type
              });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading || !currentSessionId) return;

    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    let contentToSend = currentInput;
    let isRedacted = false;

    // 1. Privacy Shield
    if (settings.privacyShield && currentInput) {
        const redactionResult = redactPII(currentInput);
        if (redactionResult.wasRedacted) {
            contentToSend = redactionResult.cleanedText;
            isRedacted = true;
        }
    }

    // 2. Optimistic Update
    // If there is an image, mention it in the user bubble logic or just assume text is enough for history
    const displayContent = currentAttachment ? (currentInput || "[Sent an image]") : contentToSend;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      originalContent: isRedacted ? currentInput : undefined,
      isRedacted,
      timestamp: Date.now()
    };

    const updatedSession = { 
        ...currentSession!, 
        messages: [...currentSession!.messages, userMsg],
        title: currentSession!.messages.length === 0 ? (currentInput.slice(0, 30) + "...") : currentSession!.title
    };
    
    // Update local state and storage
    setSessions(prev => prev.map(s => s.id === currentSessionId ? updatedSession : s));
    if (settings.dataRetention) {
        saveChat(updatedSession, USER_ID);
    }

    try {
      // 3. API Call
      const apiHistory = updatedSession.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }] 
        }));
      
      const combinedInstruction = `
      ${currentAgent.systemInstruction}

      [USER CUSTOM CONFIGURATION]
      ${settings.customInstructions}
      `;

      const result = await sendMessageToGemini({
        modelId: activeModel.id,
        history: apiHistory,
        newMessage: contentToSend,
        systemInstruction: combinedInstruction,
        tools: { googleSearch: settings.plugins.webSearch },
        attachment: currentAttachment ? currentAttachment : undefined
      });

      // 4. Handle Response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.text,
        timestamp: Date.now()
      };

      const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, aiMsg]
      };

      setSessions(prev => prev.map(s => s.id === currentSessionId ? finalSession : s));
      if (settings.dataRetention) {
          saveChat(finalSession, USER_ID);
      }

    } catch (error) {
       const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Error: " + (error instanceof Error ? error.message : "Unknown Error"),
        timestamp: Date.now()
      };
      const errorSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, errorMsg]
      };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? errorSession : s));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Voice Logic ---
  const toggleRecording = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const speakMessage = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // --- Render ---

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <div className="hidden md:flex relative z-20 shadow-2xl">
        <ChatSidebar 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onNewChat={() => handleNewChat()}
            onDeleteSession={handleDeleteSession}
            onOpenStore={() => setIsStoreOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#020617]">
        {/* Cool Background Grid - Adapts to Light/Dark */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Dark Mode Ambient */}
             <div className="hidden dark:block absolute inset-0 bg-[#0f172a] opacity-90"></div>
             <div className="hidden dark:block absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(17,24,39,0.5)_2px,transparent_2px)] bg-[size:30px_30px] opacity-20"></div>
             <div className="hidden dark:block absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-aegis-950 to-transparent"></div>
             
             {/* Light Mode Ambient */}
             <div className="dark:hidden absolute inset-0 bg-slate-50"></div>
             <div className="dark:hidden absolute inset-0 bg-[linear-gradient(rgba(203,213,225,0.4)_2px,transparent_2px),linear-gradient(90deg,rgba(203,213,225,0.4)_2px,transparent_2px)] bg-[size:30px_30px] opacity-40"></div>
        </div>
        
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-200 dark:border-aegis-800/50 flex items-center justify-between px-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md relative z-10 transition-colors">
            <div className="flex items-center gap-3">
                <span className="md:hidden text-aegis-500 text-xl font-bold">◈</span>
                <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-aegis-800/50 cursor-pointer transition-colors border border-transparent dark:hover:border-aegis-700"
                    onClick={() => setIsStoreOpen(true)}
                >
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{currentAgent.name}</span>
                    <span className="text-aegis-600 dark:text-aegis-500 text-xs font-mono px-2 py-0.5 bg-blue-50 dark:bg-aegis-900/50 rounded-full border border-blue-100 dark:border-aegis-800">
                        {(activeModel.id.includes('pro') ? '3.0 Pro' : '3.0 Flash')}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                 {/* Plugin Toggles */}
                 <button 
                    onClick={() => setSettings(p => ({...p, plugins: {...p.plugins, webSearch: !p.plugins.webSearch}}))}
                    className={`p-2 rounded-lg transition-colors ${settings.plugins.webSearch ? 'bg-blue-100 text-blue-600 dark:bg-aegis-500/20 dark:text-aegis-400' : 'text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-aegis-800'}`}
                    title="Enable Web Search"
                >
                    <Globe size={18} />
                 </button>
                 <button 
                    onClick={() => setIsLegalModalOpen(true)}
                    className="text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white text-xs px-2"
                 >
                    Legal
                 </button>
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="md:hidden text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white px-2"
                 >
                    <Settings size={18} />
                 </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth relative z-10">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-80">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-800 dark:to-black rounded-3xl flex items-center justify-center mb-6 shadow-xl dark:shadow-aegis-500/10 border border-slate-300 dark:border-aegis-800">
                        <span className="text-4xl">{currentAgent.icon}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-slate-800 dark:text-white tracking-tight">How can I help you today?</h2>
                    <p className="text-base text-slate-500 dark:text-gray-400 max-w-md">
                        Protected by Aegis Sovereignty Protocol.
                    </p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-8 pb-24">
                    {messages.map((msg) => (
                        <div key={msg.id} className="group flex flex-col gap-1 animate-fadeIn">
                            {/* Message Header */}
                            <div className="flex items-center gap-2 px-1 mb-1">
                                <span className={`text-xs font-bold ${msg.role === 'user' ? 'text-slate-500 dark:text-gray-400' : 'text-blue-600 dark:text-aegis-400'}`}>
                                    {msg.role === 'user' ? 'You' : currentAgent.name}
                                </span>
                                {msg.isRedacted && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-transparent dark:text-aegis-alert border border-amber-200 dark:border-aegis-alert/30 px-1 rounded">Redacted</span>}
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`
                                text-[15px] leading-relaxed relative rounded-2xl p-4
                                ${msg.role === 'user' 
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-[#2b2d31] dark:text-white dark:border-none max-w-[90%] self-end' 
                                    : 'text-slate-800 dark:text-gray-200'}
                            `}>
                                {msg.role === 'model' ? (
                                    <ReactMarkdown className="markdown-body">{msg.content}</ReactMarkdown>
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                )}
                            </div>

                            {/* Actions */}
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                                    <button onClick={() => speakMessage(msg.content)} className="p-1 text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-white rounded"><Volume2 size={14}/></button>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(msg.content)}
                                        className="p-1 text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-white rounded"
                                    ><Copy size={14}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-500 text-sm animate-pulse pl-4">
                            <span className="w-2 h-2 bg-blue-500 dark:bg-aegis-500 rounded-full"></span>
                            Thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-100 via-slate-50 to-transparent dark:from-[#020617] dark:via-[#020617] pt-12 pb-6 px-4 z-20">
             <div className="max-w-3xl mx-auto">
                 
                 {/* Privacy Shield & Controls Row */}
                 <div className="flex justify-between items-center mb-2 px-1">
                     <PrivacyShield 
                        enabled={settings.privacyShield}
                        onToggle={() => setSettings(p => ({...p, privacyShield: !p.privacyShield}))}
                        redactionCount={0}
                     />
                 </div>

                 {/* Attachment Preview */}
                 {attachment && (
                    <div className="mb-2 relative inline-block">
                        <div className="bg-white dark:bg-aegis-900 border border-slate-200 dark:border-aegis-700 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                             <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 rounded overflow-hidden flex items-center justify-center text-slate-500 dark:text-gray-400">
                                {attachment.mimeType.startsWith('image') ? (
                                    <img src={`data:${attachment.mimeType};base64,${attachment.data}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-xs">File</div>
                                )}
                             </div>
                             <button 
                                onClick={() => setAttachment(null)} 
                                className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-white rounded-full p-0.5 hover:bg-red-500 hover:text-white"
                             >
                                <X size={12} />
                             </button>
                        </div>
                    </div>
                 )}

                 {/* Main Input Box */}
                 <div className="relative bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-gray-700 rounded-2xl shadow-xl dark:shadow-2xl flex flex-col focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-aegis-500/50 transition-all">
                     <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={`Message ${currentAgent.name}...`}
                        className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 border-none focus:ring-0 resize-none py-3 px-4 max-h-[200px] min-h-[52px]"
                        style={{ height: '52px' }}
                     />
                     
                     {/* Hidden File Input */}
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/webp" 
                        onChange={handleFileSelect}
                     />

                     {/* Input Toolbar */}
                     <div className="flex justify-between items-center px-2 pb-2">
                        <div className="flex items-center gap-1">
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                             >
                                <Paperclip size={18} />
                             </button>
                             <button 
                                onClick={toggleRecording}
                                className={`p-2 rounded-lg transition-colors ${isRecording ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700'}`}
                             >
                                {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
                             </button>
                        </div>
                        <button 
                            onClick={handleSendMessage}
                            disabled={(!input.trim() && !attachment) && !isRecording}
                            className={`p-2 rounded-lg transition-all ${input.trim() || attachment ? 'bg-blue-600 dark:bg-white text-white dark:text-black shadow-md' : 'bg-slate-200 dark:bg-gray-700 text-slate-400 dark:text-gray-500'}`}
                        >
                            <Send size={16} />
                        </button>
                     </div>
                 </div>
                 
                 <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400 dark:text-gray-500">
                        Aegis AI can make mistakes. Consider checking important information.
                    </p>
                 </div>
             </div>
        </div>

      </main>

      <AgentStore 
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        agents={AGENTS}
        onSelectAgent={handleAgentSelect}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} />
    </div>
  );
};

export default App;