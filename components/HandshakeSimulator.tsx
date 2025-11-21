
import React, { useState, useRef, useEffect } from 'react';
import { User, Relationship, ProtocolOutcome } from '../types';
import { runHandshakeProtocol } from '../services/handshakeService';
import { Terminal, Play, X, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface HandshakeSimulatorProps {
  self: User;
  friends: User[];
  relationships: Relationship[];
  onClose: () => void;
}

export const HandshakeSimulator: React.FC<HandshakeSimulatorProps> = ({ self, friends, relationships, onClose }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [outcome, setOutcome] = useState<ProtocolOutcome | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const handleRun = async () => {
    if (!selectedTargetId) return;
    setIsRunning(true);
    setOutcome(null);
    
    const target = friends.find(f => f.id === selectedTargetId)!;
    const rel = relationships.find(r => r.user_b === selectedTargetId)!;

    const result = await runHandshakeProtocol(self, target, rel);
    setOutcome(result);
    setIsRunning(false);
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outcome]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-zinc-950 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px] border border-zinc-800 font-mono text-sm">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center space-x-2 text-emerald-500">
            <Terminal size={16} />
            <span className="font-bold tracking-wider">PROTOCOL_CONSOLE // A2A_V1</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex gap-4">
           <select 
             value={selectedTargetId}
             onChange={(e) => { setSelectedTargetId(e.target.value); setOutcome(null); }}
             className="bg-zinc-900 text-zinc-300 border border-zinc-700 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none flex-1"
           >
             <option value="">Select Target Node...</option>
             {friends.map(f => (
               <option key={f.id} value={f.id}>
                 Node: {f.name} [{f.current_status}]
               </option>
             ))}
           </select>
           <button
             disabled={!selectedTargetId || isRunning}
             onClick={handleRun}
             className={`
               px-6 py-2 font-bold uppercase tracking-wide rounded flex items-center
               ${!selectedTargetId || isRunning ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}
             `}
           >
             {isRunning ? 'Negotiating...' : <><Play size={14} className="mr-2" /> EXEC</>}
           </button>
        </div>

        {/* Log Output */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black text-zinc-400">
          {!outcome && !isRunning && (
            <div className="text-zinc-600 italic">Ready to initiate handshake sequence...</div>
          )}

          {outcome && outcome.logs.map((log, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="border-l-2 border-zinc-800 pl-3"
             >
                <div className="flex items-center gap-2 mb-1">
                   <span className={`text-[10px] px-1 rounded ${log.actor === 'INITIATOR' ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-900 text-amber-300'}`}>
                     {log.actor}
                   </span>
                   <span className="text-xs font-bold text-zinc-200">{log.step}</span>
                   <span className="text-[10px] text-zinc-600 ml-auto">{new Date(log.timestamp).toISOString().split('T')[1]}</span>
                </div>
                <pre className="text-[10px] leading-relaxed text-zinc-500 whitespace-pre-wrap break-all">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
             </motion.div>
          ))}
          
          {/* Final Result */}
          {outcome && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: outcome.logs.length * 0.1 }}
              className={`mt-6 p-4 border rounded-lg ${outcome.success ? 'border-emerald-900 bg-emerald-900/10' : 'border-rose-900 bg-rose-900/10'}`}
            >
               <div className="flex items-center gap-3 mb-2">
                  {outcome.success ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                  <h3 className={`font-bold ${outcome.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    PROTOCOL {outcome.success ? 'COMPLETE' : 'TERMINATED'}
                  </h3>
               </div>
               <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                  <div>
                    <span className="block text-zinc-500 uppercase mb-1">Code</span>
                    <span className="font-mono text-zinc-300">{outcome.code}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 uppercase mb-1">Human Output</span>
                    <span className="font-serif italic text-zinc-300">"{outcome.humanMessage}"</span>
                  </div>
               </div>
            </motion.div>
          )}
          
          <div ref={logEndRef} />
        </div>

      </div>
    </div>
  );
};
