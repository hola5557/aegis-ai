import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, UserSettings, ModelMetadata, ChatSession } from './types';
import { AVAILABLE_MODELS, AGENTS } from './constants';
import { sendMessageToGemini } from './services/geminiService';
import { redactPII } from './services/privacyService';
import { saveChat, getChats, deleteChat, createNewSession, getChat } from './services/storageService';
import PrivacyShield from './components/PrivacyShield';
import LegalModal from './components/LegalModal';
import AuthPage from './components/AuthPage';
import ChatSidebar from './components/ChatSidebar';
import AgentStore from './components/AgentStore';
import { Mic, MicOff, Send, Paperclip, Globe, Volume2, Copy, Share2 } from 'lucide-react';

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // --- App State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelMetadata>(AVAILABLE_MODELS[0]);
  const [settings, setSettings] = useState<UserSettings>({
    privacyShield: true,
    dataRetention: true,
    voiceEnabled: false,
    plugins: {
        webSearch: false
    }
  });
  
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // SpeechRecognition

  // --- Initialization ---
  useEffect(() => {
    if (isAuthenticated) {
        const loadedSessions = getChats();
        setSessions(loadedSessions);
        if (loadedSessions.length > 0) {
            setCurrentSessionId(loadedSessions[0].id);
        } else {
            handleNewChat();
        }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionId, sessions]);

  // --- Helpers ---
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];
  const currentAgent = AGENTS.find(a => a.id === currentSession?.agentId) || AGENTS[0];

  // --- Handlers ---

  const handleLogin = (email: string) => {
      setUserEmail(email);
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setUserEmail(null);
      setCurrentSessionId(null);
      setSessions([]);
  };

  const handleNewChat = () => {
      const newSession = createNewSession();
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      saveChat(newSession);
  };

  const handleDeleteSession = (id: string) => {
      deleteChat(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
          setCurrentSessionId(null); // Will trigger UI to show empty state or effect will load new chat
      }
  };

  const handleAgentSelect = (agentId: string) => {
      // Create new chat with this agent
      const newSession = createNewSession(undefined, agentId);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      saveChat(newSession);
      setIsStoreOpen(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentSessionId) return;

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    let contentToSend = currentInput;
    let isRedacted = false;

    // 1. Privacy Shield
    if (settings.privacyShield) {
        const redactionResult = redactPII(currentInput);
        if (redactionResult.wasRedacted) {
            contentToSend = redactionResult.cleanedText;
            isRedacted = true;
        }
    }

    // 2. Optimistic Update
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToSend,
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
    saveChat(updatedSession);

    try {
      // 3. API Call
      const apiHistory = updatedSession.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }] 
        }));
      
      const result = await sendMessageToGemini({
        modelId: activeModel.id,
        history: apiHistory,
        newMessage: contentToSend,
        systemInstruction: currentAgent.systemInstruction,
        tools: { googleSearch: settings.plugins.webSearch }
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
      saveChat(finalSession);

      // Auto-read response if voice was used to prompt
      if (settings.voiceEnabled && isRecording === false) { 
        // Logic: if voice mode is "active" or we just used mic, read it. 
        // For now, simpler manual read is safer.
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

  if (!isAuthenticated) {
      return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            userEmail={userEmail}
            onOpenStore={() => setIsStoreOpen(true)}
        />
      </div>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative bg-[#212121] md:bg-[#0f172a]">
        
        {/* Top Bar (Mobile Menu + Model Select) */}
        <div className="h-14 border-b border-aegis-800 flex items-center justify-between px-4 bg-[#0f172a]">
            <div className="flex items-center gap-3">
                <span className="md:hidden text-aegis-500 text-xl font-bold">◈</span>
                <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-aegis-800 cursor-pointer transition-colors"
                    onClick={() => setIsStoreOpen(true)}
                >
                    <span className="text-sm font-semibold text-gray-200">{currentAgent.name}</span>
                    <span className="text-gray-500 text-xs">{(activeModel.id.includes('pro') ? '3.0 Pro' : '3.0 Flash')}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                 {/* Plugin Toggles */}
                 <button 
                    onClick={() => setSettings(p => ({...p, plugins: {...p.plugins, webSearch: !p.plugins.webSearch}}))}
                    className={`p-2 rounded-lg transition-colors ${settings.plugins.webSearch ? 'bg-aegis-500/20 text-aegis-400' : 'text-gray-500 hover:bg-aegis-800'}`}
                    title="Enable Web Search"
                >
                    <Globe size={18} />
                 </button>
                 <button 
                    onClick={() => setIsLegalModalOpen(true)}
                    className="text-gray-500 hover:text-white text-xs px-2"
                 >
                    Legal
                 </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <div className="w-16 h-16 bg-aegis-800/50 rounded-full flex items-center justify-center mb-4 text-3xl">
                        {currentAgent.icon}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                    <p className="text-sm text-gray-400 max-w-md">
                        Aegis AI protects your privacy while you work. <br/> 
                        Try asking about {currentAgent.category.toLowerCase()} tasks.
                    </p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-6 pb-24">
                    {messages.map((msg) => (
                        <div key={msg.id} className="group flex flex-col gap-1">
                            {/* Message Header */}
                            <div className="flex items-center gap-2 px-1">
                                <span className={`text-xs font-bold ${msg.role === 'user' ? 'text-gray-400' : 'text-aegis-400'}`}>
                                    {msg.role === 'user' ? 'You' : currentAgent.name}
                                </span>
                                {msg.isRedacted && <span className="text-[10px] text-aegis-alert border border-aegis-alert/30 px-1 rounded">Redacted</span>}
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`
                                text-[15px] leading-relaxed relative
                                ${msg.role === 'user' ? 'bg-aegis-800/40 px-4 py-3 rounded-2xl max-w-[90%] self-end' : 'text-gray-200'}
                            `}>
                                {msg.role === 'model' ? (
                                    <ReactMarkdown className="markdown-body">{msg.content}</ReactMarkdown>
                                ) : (
                                    <div className="whitespace-pre-wrap text-gray-200">{msg.content}</div>
                                )}
                            </div>

                            {/* Actions */}
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                                    <button onClick={() => speakMessage(msg.content)} className="p-1 text-gray-500 hover:text-white rounded"><Volume2 size={14}/></button>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(msg.content)}
                                        className="p-1 text-gray-500 hover:text-white rounded"
                                    ><Copy size={14}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
                            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                            Thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent pt-10 pb-6 px-4">
             <div className="max-w-3xl mx-auto">
                 
                 {/* Privacy Shield & Controls Row */}
                 <div className="flex justify-between items-center mb-2 px-1">
                     <PrivacyShield 
                        enabled={settings.privacyShield}
                        onToggle={() => setSettings(p => ({...p, privacyShield: !p.privacyShield}))}
                        redactionCount={0}
                     />
                 </div>

                 {/* Main Input Box */}
                 <div className="relative bg-[#1e293b] border border-gray-700 rounded-2xl shadow-xl flex flex-col">
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
                        className="w-full bg-transparent text-white placeholder-gray-500 border-none focus:ring-0 resize-none py-3 px-4 max-h-[200px] min-h-[52px]"
                        style={{ height: '52px' }}
                     />
                     
                     {/* Input Toolbar */}
                     <div className="flex justify-between items-center px-2 pb-2">
                        <div className="flex items-center gap-1">
                             <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                                <Paperclip size={18} />
                             </button>
                             <button 
                                onClick={toggleRecording}
                                className={`p-2 rounded-lg transition-colors ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                             >
                                {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
                             </button>
                        </div>
                        <button 
                            onClick={handleSendMessage}
                            disabled={!input.trim() && !isRecording}
                            className={`p-2 rounded-lg transition-all ${input.trim() ? 'bg-white text-black' : 'bg-gray-700 text-gray-500'}`}
                        >
                            <Send size={16} />
                        </button>
                     </div>
                 </div>
                 
                 <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-500">
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
      />

      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} />
    </div>
  );
};

export default App;
