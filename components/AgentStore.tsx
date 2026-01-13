import React, { useState } from 'react';
import { Agent, UserSettings } from '../types';
import { X, Search, Star, Download, ShieldCheck, Globe, Zap, Cpu } from 'lucide-react';

interface AgentStoreProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

const CATEGORIES = ['All', 'Productivity', 'Coding', 'Security', 'Writing', 'Business', 'Creative'];
const TABS = ['Agents', 'Capabilities'];

const AgentStore: React.FC<AgentStoreProps> = ({ isOpen, onClose, agents, onSelectAgent, settings, onUpdateSettings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Agents');

  if (!isOpen) return null;

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const togglePlugin = (key: 'webSearch') => {
    onUpdateSettings({
        ...settings,
        plugins: { ...settings.plugins, [key]: !settings.plugins[key] }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-aegis-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-300 animate-slideUp">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-aegis-800 bg-slate-50 dark:bg-[#020617] flex-shrink-0">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Aegis Marketplace
                        <span className="text-[10px] font-mono bg-blue-100 dark:bg-aegis-900 text-blue-600 dark:text-aegis-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-aegis-800">BETA</span>
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Discover specialized neural configurations and extended capabilities.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-aegis-800 rounded-full transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
                    <X size={24} />
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Tab Switcher */}
                <div className="flex bg-slate-200 dark:bg-aegis-900 p-1 rounded-lg">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab 
                                ? 'bg-white dark:bg-aegis-800 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Agents' && (
                    <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto justify-end">
                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search agents..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-aegis-900/50 border border-slate-300 dark:border-aegis-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-aegis-500 transition-all text-sm"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        activeCategory === cat 
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' 
                                        : 'bg-slate-200 dark:bg-aegis-800 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-aegis-700'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0f172a]">
            
            {activeTab === 'Agents' ? (
                // Agents Grid
                filteredAgents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-gray-500 opacity-60">
                        <Search size={48} className="mb-4" />
                        <p>No agents found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredAgents.map(agent => (
                            <div 
                                key={agent.id}
                                onClick={() => onSelectAgent(agent.id)}
                                className="flex flex-col bg-white dark:bg-aegis-900/40 border border-slate-200 dark:border-aegis-800 rounded-xl p-5 cursor-pointer hover:border-blue-400 dark:hover:border-aegis-500 hover:shadow-lg dark:hover:shadow-aegis-500/10 transition-all group relative overflow-hidden"
                            >
                                {/* Card Top */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-aegis-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                                        {agent.icon}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-aegis-800 px-2 py-1 rounded-md">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            {agent.rating}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                            <Download size={10} />
                                            {agent.users}
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="mb-4 flex-1">
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-aegis-400 transition-colors">{agent.name}</h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-aegis-800 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-aegis-700">
                                            {agent.category}
                                        </span>
                                        {agent.category === 'Security' && (
                                            <span className="text-[10px] flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck size={10} /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {agent.description}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t border-slate-100 dark:border-aegis-800/50 flex justify-between items-center text-xs">
                                    <span className="text-slate-400 dark:text-gray-600">By <span className="text-slate-600 dark:text-gray-400 font-medium">{agent.author}</span></span>
                                    <span className="font-bold text-blue-600 dark:text-aegis-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        Install &rarr;
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                // Capabilities / Plugins Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Google Search Plugin Card */}
                    <div className="flex flex-col bg-white dark:bg-aegis-900/40 border border-slate-200 dark:border-aegis-800 rounded-xl p-5 hover:border-blue-400 dark:hover:border-aegis-500 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Globe size={28} />
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.plugins.webSearch} 
                                    onChange={() => togglePlugin('webSearch')} 
                                />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-aegis-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Live Web Uplink</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 flex-1">
                            Connects Aegis to Google Search for real-time information retrieval, news, and fact-checking grounding.
                        </p>
                        <div className="pt-4 border-t border-slate-100 dark:border-aegis-800/50 flex items-center gap-2 text-xs text-slate-500 dark:text-gray-500">
                            <Zap size={12} className="text-yellow-500" />
                            <span>Consumes more tokens</span>
                        </div>
                    </div>

                    {/* Placeholder for future plugins */}
                    <div className="flex flex-col bg-slate-50 dark:bg-aegis-900/20 border border-dashed border-slate-300 dark:border-aegis-800 rounded-xl p-5 items-center justify-center text-center opacity-70">
                         <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-aegis-800 flex items-center justify-center text-slate-400 dark:text-gray-600 mb-4">
                            <Cpu size={24} />
                         </div>
                         <h4 className="font-bold text-slate-900 dark:text-white">Coming Soon</h4>
                         <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                             More plugins like Code Execution and Image Gen are under development.
                         </p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AgentStore;