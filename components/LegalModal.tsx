import React from 'react';
import { TOS_TEXT } from '../constants';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-aegis-900 border border-slate-200 dark:border-aegis-500 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-2xl dark:shadow-aegis-500/20">
        <div className="p-6 border-b border-slate-200 dark:border-aegis-700 flex justify-between items-center bg-slate-50 dark:bg-aegis-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-aegis-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Sovereign IP Agreement
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto font-mono text-sm leading-relaxed text-slate-600 dark:text-gray-300 whitespace-pre-wrap">
          {TOS_TEXT.trim()}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-aegis-700 bg-slate-50 dark:bg-aegis-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-aegis-500 dark:hover:bg-aegis-400 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            I Acknowledge My Rights
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;