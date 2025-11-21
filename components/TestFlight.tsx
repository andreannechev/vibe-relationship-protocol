
import React, { useState } from 'react';
import { Directives } from '../types';
import { runAgentSimulation, SimulationResult } from '../services/geminiService';
import { Loader2, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestFlightProps {
  directives: Directives;
  onClose: () => void;
}

export const TestFlight: React.FC<TestFlightProps> = ({ directives, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>("");

  const scenarios = [
    "Your 'Inner Circle' friend Sarah asks for dinner tonight (Tuesday) at 7pm.",
    "An 'Acquaintance' invites you to a Networking Event on Sunday morning.",
    "A 'Friend' wants to schedule a call during your Work Hours (Mon 2pm).",
    "You haven't seen your best friend in 30 days. Should you reach out?"
  ];

  const handleRun = async () => {
    if (!selectedScenario) return;
    setLoading(true);
    const res = await runAgentSimulation(directives, selectedScenario);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Test Flight</h3>
            <p className="text-xs text-zinc-500">Simulate your Agent's behavior.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-medium text-sm">
            CLOSE
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Scenario Selection */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">
              Select Scenario
            </label>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedScenario(s); setResult(null); }}
                  className={`w-full text-left p-3 text-sm rounded-lg border transition-colors
                    ${selectedScenario === s 
                      ? 'bg-zinc-900 text-white border-zinc-900' 
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <button
            disabled={!selectedScenario || loading}
            onClick={handleRun}
            className={`
              w-full py-3 flex items-center justify-center font-bold tracking-wide text-sm uppercase rounded-lg
              ${!selectedScenario 
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'}
            `}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <span className="flex items-center"><Play size={16} className="mr-2" /> Run Simulation</span>}
          </button>

          {/* Results */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase">Outcome</span>
                <span className={`
                  flex items-center text-sm font-bold
                  ${result.outcome === 'ACCEPTED' ? 'text-emerald-600' : 
                    result.outcome === 'DECLINED' ? 'text-rose-600' : 'text-amber-600'}
                `}>
                  {result.outcome === 'ACCEPTED' && <CheckCircle size={14} className="mr-1" />}
                  {result.outcome === 'DECLINED' && <XCircle size={14} className="mr-1" />}
                  {result.outcome === 'NEGOTIATING' && <AlertCircle size={14} className="mr-1" />}
                  {result.outcome}
                </span>
              </div>
              
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Agent Logic</span>
                <p className="text-zinc-800 text-sm mt-1 font-medium">{result.reasoning}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Output Message</span>
                <div className="mt-1 p-3 bg-white border border-zinc-100 rounded text-zinc-600 text-sm italic font-serif">
                  "{result.agentMessage}"
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
