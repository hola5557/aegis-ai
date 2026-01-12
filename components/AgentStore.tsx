import React from 'react';
import { Agent } from '../types';
import { X } from 'lucide-react';

interface AgentStoreProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
}

const AgentStore: React.FC<AgentStoreProps> = ({ isOpen, onClose, agents, onSelectAgent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-aegis-700 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-aegis-800 flex justify-between items-center bg-[#020617]">
            <div>
                <h2 className="text-2xl font-bold text-white">Aegis Store</h2>
                <p className="text-gray-400 text-sm mt-1">Discover specialized agents tailored for your needs.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-aegis-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f172a]">
            
            {/* Featured Section */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-aegis-400 uppercase tracking-widest mb-4">Top Picks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agents.slice(0, 2).map(agent => (
                        <div 
                            key={agent.id}
                            onClick={() => onSelectAgent(agent.id)}
                            className="p-5 border border-aegis-700 bg-aegis-800/30 hover:bg-aegis-800 rounded-xl cursor-pointer transition-all hover:border-aegis-500 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-aegis-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                {agent.icon}
                            </div>
                            <h4 className="text-lg font-bold text-white mb-1">{agent.name}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{agent.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Agents */}
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">All Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agents.map(agent => (
                        <div 
                            key={agent.id}
                            onClick={() => onSelectAgent(agent.id)}
                            className="p-4 border border-aegis-800 bg-aegis-900 hover:bg-aegis-800 rounded-lg cursor-pointer transition-all flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">{agent.icon}</span>
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-aegis-800 text-aegis-400 border border-aegis-700">{agent.category}</span>
                            </div>
                            <h4 className="font-bold text-gray-200">{agent.name}</h4>
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{agent.description}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default AgentStore;
