import React from 'react';
import { ModelMetadata } from '../types';

interface ModelCardProps {
  model: ModelMetadata;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  return (
    <div className="bg-aegis-800/50 border border-aegis-700 rounded-lg p-3 font-mono text-[10px] leading-relaxed">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-aegis-700/50">
        <span className="text-aegis-400 font-bold uppercase tracking-wider">Automated Audit</span>
        <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 px-1.5 py-0.5 rounded">EU Compliant</span>
      </div>
      
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Provider</span>
          <span className="text-gray-200 font-semibold">{model.provider}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Training Cutoff</span>
          <span className="text-aegis-100 bg-aegis-700/50 px-1.5 rounded">{model.trainingCutoff}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Bias Score (Lower is better)</span>
            <span className="text-gray-200">{model.biasScore}/100</span>
          </div>
          <div className="w-full h-1 bg-aegis-900 rounded-full overflow-hidden">
             <div 
                className={`h-full transition-all duration-500 ${model.biasScore < 15 ? 'bg-emerald-500' : model.biasScore < 30 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${model.biasScore}%` }}
             ></div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-aegis-700/50 flex justify-between items-center text-gray-600">
        <span>License: <span className="text-gray-400">{model.license}</span></span>
      </div>
    </div>
  );
};

export default ModelCard;