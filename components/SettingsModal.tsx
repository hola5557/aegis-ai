import React from 'react';
import { UserSettings } from '../types';
import { X, Shield, Globe, Database, Cpu, Moon, Sun, Monitor, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, onClearHistory }) => {
  if (!isOpen) return null;

  const toggle = (key: keyof UserSettings | 'webSearch') => {
      if (key === 'webSearch') {
          onUpdateSettings({
              ...settings,
              plugins: { ...settings.plugins, webSearch: !settings.plugins.webSearch }
          });
      } else {
          onUpdateSettings({
              ...settings,
              [key]: !settings[key as keyof UserSettings]
          });
      }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
      onUpdateSettings({ ...settings, theme });
  };

  const handleClear = () => {
      if (window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
          onClearHistory();
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-aegis-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn transition-colors duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-aegis-800 flex justify-between items-center bg-slate-50 dark:bg-[#020617]">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Cpu size={20} className="text-blue-500 dark:text-aegis-500" />
                System Configuration
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-aegis-800 rounded-full transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
            
            {/* Appearance Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-aegis-400 uppercase tracking-widest mb-3">Appearance</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${settings.theme === 'light' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-aegis-900 dark:border-aegis-500 dark:text-aegis-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-aegis-900/30 dark:border-aegis-800 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-aegis-800'}`}
                    >
                        <Sun size={24} className="mb-2" />
                        <span className="text-sm font-medium">Light</span>
                    </button>
                    <button 
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${settings.theme === 'dark' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-aegis-900 dark:border-aegis-500 dark:text-aegis-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-aegis-900/30 dark:border-aegis-800 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-aegis-800'}`}
                    >
                        <Moon size={24} className="mb-2" />
                        <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button 
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${settings.theme === 'system' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-aegis-900 dark:border-aegis-500 dark:text-aegis-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-aegis-900/30 dark:border-aegis-800 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-aegis-800'}`}
                    >
                        <Monitor size={24} className="mb-2" />
                        <span className="text-sm font-medium">System</span>
                    </button>
                </div>
            </div>

            {/* Behavior Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-aegis-400 uppercase tracking-widest mb-3">Custom Behavior</h3>
                <div className="bg-slate-50 dark:bg-aegis-900/50 border border-slate-200 dark:border-aegis-800 rounded-lg p-4">
                    <label className="block text-sm text-slate-700 dark:text-gray-300 mb-2 font-medium">Custom Instructions</label>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-3">
                        How would you like Aegis to respond? (e.g., "Be concise", "Always answer in code")
                    </p>
                    <textarea 
                        className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-aegis-700 rounded-lg p-3 text-sm text-slate-900 dark:text-gray-200 focus:border-blue-500 dark:focus:border-aegis-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-aegis-500 outline-none h-32 resize-none"
                        placeholder="Enter your custom instructions here..."
                        value={settings.customInstructions}
                        onChange={(e) => onUpdateSettings({...settings, customInstructions: e.target.value})}
                    />
                </div>
            </div>

            {/* Protocol Section */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-aegis-400 uppercase tracking-widest mb-3">Protocols & Plugins</h3>
                <div className="space-y-3">
                    
                    {/* Privacy Shield Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-aegis-900/30 border border-slate-200 dark:border-aegis-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.privacyShield ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                <Shield size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">Privacy Shield™</div>
                                <div className="text-xs text-slate-500 dark:text-gray-500">Redact PII (names, emails) client-side before sending.</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.privacyShield} onChange={() => toggle('privacyShield')} />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    {/* Web Search Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-aegis-900/30 border border-slate-200 dark:border-aegis-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.plugins.webSearch ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                <Globe size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">Live Web Uplink</div>
                                <div className="text-xs text-slate-500 dark:text-gray-500">Allow Aegis to access real-time information via Google Search.</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.plugins.webSearch} onChange={() => toggle('webSearch')} />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                     {/* Retention Toggle */}
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-aegis-900/30 border border-slate-200 dark:border-aegis-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.dataRetention ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                <Database size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">Local Retention</div>
                                <div className="text-xs text-slate-500 dark:text-gray-500">Save chat history to this device's local storage.</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.dataRetention} onChange={() => toggle('dataRetention')} />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                </div>
            </div>

            {/* Data Management Section */}
            <div>
                 <h3 className="text-xs font-bold text-slate-500 dark:text-aegis-400 uppercase tracking-widest mb-3">Data Management</h3>
                 <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                             <h4 className="text-sm font-bold text-red-900 dark:text-red-200 mb-1">Danger Zone</h4>
                             <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                                 Permanently delete all chat history stored on this device. This action cannot be undone.
                             </p>
                             <button 
                                onClick={handleClear}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                             >
                                <Trash2 size={16} />
                                Clear All Chat History
                             </button>
                        </div>
                    </div>
                 </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-aegis-800 bg-slate-50 dark:bg-[#020617] flex justify-end">
            <button 
                onClick={onClose}
                className="bg-slate-900 dark:bg-white text-white dark:text-black font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 dark:hover:bg-gray-200 transition-colors"
            >
                Done
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;