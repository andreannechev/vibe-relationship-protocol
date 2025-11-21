
import React, { useState } from 'react';
import { NeuralBridgeConfig, VibeSignal } from '../types';
import { extractVibeSignal } from '../services/neuralBridgeService';
import { MOCK_USER_MEMORY } from '../constants';
import { ArrowLeft, BrainCircuit, Key, Lock, Zap, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NeuralBridgeSetupProps {
  config: NeuralBridgeConfig;
  onUpdateConfig: (newConfig: NeuralBridgeConfig) => void;
  onBack: () => void;
}

export const NeuralBridgeSetup: React.FC<NeuralBridgeSetupProps> = ({ config, onUpdateConfig, onBack }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [rawContext, setRawContext] = useState(MOCK_USER_MEMORY);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExtraction = async () => {
    setIsProcessing(true);
    
    // Simulate "Network" delay to emphasize the "Black Box" processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const signal = await extractVibeSignal(rawContext);
    
    onUpdateConfig({
      ...config,
      enabled: true,
      last_sync_status: 'SUCCESS',
      current_vibe: signal
    });
    
    setIsProcessing(false);
  };

  const getMoodColor = (appetite: string) => {
    if (appetite === 'HIGH') return 'text-emerald-400';
    if (appetite === 'NEUTRAL') return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-300 font-mono">
      
      {/* Header - Cyberpunk Style */}
      <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="text-zinc-500 hover:text-white mr-4 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tighter flex items-center">
            <BrainCircuit className="mr-2 text-indigo-500" size={24} />
            NEURAL BRIDGE
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Psychographic Sensor v1.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* 1. Connection Panel */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
            <Key size={14} className="mr-2" /> Source Connection
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase text-zinc-600 mb-1">OpenAI API Key (Simulated)</label>
              <div className="flex">
                 <input 
                   type="password" 
                   value={apiKeyInput}
                   onChange={(e) => setApiKeyInput(e.target.value)}
                   placeholder="sk-proj-..."
                   className="flex-1 bg-black border border-zinc-800 rounded-l px-3 py-2 text-sm text-zinc-400 focus:border-indigo-500 outline-none"
                 />
                 <button className="bg-zinc-800 px-4 rounded-r border border-l-0 border-zinc-800 hover:bg-zinc-700">
                   <Lock size={14} />
                 </button>
              </div>
              <p className="text-[9px] text-zinc-600 mt-1">
                Keys are encrypted locally. For this demo, we use a simulation buffer below.
              </p>
            </div>
          </div>
        </section>

        {/* 2. The Source Buffer (Simulating Chat History) */}
        <section>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
            <Activity size={14} className="mr-2" /> Neural Buffer (Input)
          </h2>
          <div className="relative">
            <textarea 
              value={rawContext}
              onChange={(e) => setRawContext(e.target.value)}
              className="w-full h-32 bg-black border border-zinc-800 rounded-lg p-3 text-xs leading-relaxed text-zinc-500 focus:border-indigo-900 focus:text-zinc-300 outline-none resize-none"
              spellCheck={false}
            />
            <div className="absolute bottom-3 right-3 text-[9px] text-zinc-700 uppercase">
              Unstructured Data
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 italic">
             * In production, this would autonomously query your LLM history. For this demo, paste your recent context here.
          </p>
        </section>

        {/* Action: Run Extractor */}
        <button
          onClick={handleExtraction}
          disabled={isProcessing}
          className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center transition-all
            ${isProcessing 
              ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'}
          `}
        >
           {isProcessing ? (
             <><RefreshCw className="animate-spin mr-2" size={16} /> Extracting Signals...</>
           ) : (
             <><Zap className="mr-2" size={16} /> Process Vibe Signal</>
           )}
        </button>

        {/* 3. The Signal Output (The Black Box Result) */}
        {config.enabled && config.current_vibe && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-indigo-900/30 rounded-xl p-6 relative overflow-hidden"
          >
             {/* Cyberpunk Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

             <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Signal Packet</h2>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(config.current_vibe.last_extracted).toLocaleTimeString()}
                  </span>
               </div>

               {/* Topics */}
               <div className="mb-6">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-2">Active Topics</span>
                  <div className="flex flex-wrap gap-2">
                    {config.current_vibe.current_topics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-900/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-full font-medium">
                        #{topic.toLowerCase()}
                      </span>
                    ))}
                  </div>
               </div>

               {/* Energy Meter */}
               <div className="mb-6">
                  <div className="flex justify-between text-[10px] text-zinc-500 uppercase mb-2">
                    <span>Energy Level</span>
                    <span>{config.current_vibe.energy_level}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${config.current_vibe.energy_level}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${config.current_vibe.energy_level > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    />
                  </div>
               </div>

               {/* Social Appetite */}
               <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-zinc-800">
                  <span className="text-xs text-zinc-400 uppercase">Social Appetite</span>
                  <span className={`text-sm font-bold ${getMoodColor(config.current_vibe.social_appetite)}`}>
                    {config.current_vibe.social_appetite}
                  </span>
               </div>

               <div className="mt-6 text-center">
                 <div className="inline-flex items-center text-[10px] text-emerald-500 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50">
                   <CheckCircle2 size={10} className="mr-1" />
                   Synced to Context Engine
                 </div>
               </div>
             </div>
          </motion.section>
        )}

      </div>
    </div>
  );
};
