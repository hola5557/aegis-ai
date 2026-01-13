import React from 'react';

interface PrivacyShieldProps {
  enabled: boolean;
  onToggle: () => void;
  redactionCount: number;
}

const PrivacyShield: React.FC<PrivacyShieldProps> = ({ enabled, onToggle, redactionCount }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${enabled ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-aegis-accent/50' : 'bg-slate-100 dark:bg-aegis-800 border-slate-200 dark:border-aegis-700'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-aegis-accent dark:text-aegis-900' : 'bg-slate-200 text-slate-600 dark:bg-gray-600 dark:text-gray-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-gray-100 flex items-center gap-2">
            Aegis Privacy Shield™
            {enabled && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-aegis-accent dark:text-aegis-900 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Active</span>}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {enabled 
              ? "Client-side PII scrubbing enabled. Data is sanitized before transmission." 
              : "Direct transmission mode. Enable for PII protection."}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {redactionCount > 0 && enabled && (
            <div className="text-xs text-amber-600 dark:text-aegis-alert font-mono">
                {redactionCount} Threats Neutralized
            </div>
        )}
        <button 
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-aegis-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-aegis-900 ${enabled ? 'bg-emerald-500 dark:bg-aegis-accent' : 'bg-slate-300 dark:bg-gray-700'}`}
        >
          <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
      </div>
    </div>
  );
};

export default PrivacyShield;