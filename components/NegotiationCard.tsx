
import React, { useState, useEffect } from 'react';
import { User, Relationship, NegotiationResult, ProtocolCode, HandshakeLog } from '../types';
import { runHandshakeProtocol } from '../services/handshakeService';
import { generateContextSuggestion } from '../services/contextEngine';
import { GoldenTicketCard } from './GoldenTicketCard';
import { ArrowLeft, Check, X, MessageCircle, Loader2, Lock, ChevronDown, ChevronUp, GitCommit, Terminal, Zap, Share2, MoreVertical, EyeOff, Eye, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignalDeck } from './SignalDeck';

interface NegotiationCardProps {
  self: User;
  friend: User;
  relationship: Relationship;
  onClose: () => void;
  onToggleHide: () => void;
  onRemove: () => void;
}

const formatPayload = (step: string, payload: any): string => {
  if (step === 'SYN') return `Intent: ${payload.intent?.category} (${payload.intent?.energy_cost})`;
  if (step === 'ACK') return `Blind Slots: ${payload.blind_slots_count} found. State: ${payload.receiver_state?.vibe}`;
  if (step === 'PROPOSE') return `Suggested Slot: ${new Date(payload.selected_slot).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
  if (step === 'COMMIT') return `Handshake Sealed. Notification Triggered.`;
  if (step === 'TERM') return `Rejection Code: ${payload.code}. Reason: ${payload.reason}`;
  return JSON.stringify(payload);
};

const ReasoningTrace: React.FC<{ logs: HandshakeLog[] }> = ({ logs }) => {
  return (
    <div className="mt-4 bg-black/50 rounded-lg p-4 text-left overflow-hidden border border-zinc-800">
      <div className="flex items-center text-zinc-500 mb-3 text-[10px] uppercase tracking-widest font-bold">
        <Terminal size={12} className="mr-2" /> Protocol Execution Log
      </div>
      <div className="space-y-4 relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-zinc-800" />
        
        {logs.map((log, idx) => (
          <div key={idx} className="relative flex items-start pl-0">
            <div className={`
              relative z-10 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-[10px] font-bold border-2
              ${log.actor === 'INITIATOR' 
                ? 'bg-indigo-900/50 border-indigo-800 text-indigo-300' 
                : 'bg-amber-900/50 border-amber-800 text-amber-300'}
            `}>
              {log.actor[0]}
            </div>
            
            <div className="flex-1 pt-1">
               <div className="flex items-center justify-between">
                 <span className={`text-xs font-bold ${log.step === 'TERM' ? 'text-rose-400' : 'text-zinc-300'}`}>
                   {log.step}
                 </span>
                 <span className="text-[10px] text-zinc-600 font-mono">
                   {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).split(' ')[0]}
                 </span>
               </div>
               <p className="text-[10px] text-zinc-500 mt-0.5 font-mono leading-relaxed">
                 {formatPayload(log.step, log.payload)}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NegotiationCard: React.FC<NegotiationCardProps> = ({ self, friend, relationship, onClose, onToggleHide, onRemove }) => {
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContext, setGeneratingContext] = useState(false); 
  const [showActionSuccess, setShowActionSuccess] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showSignalDeck, setShowSignalDeck] = useState(false);

  // Drift Calculation
  const isDrifted = (Date.now() - relationship.last_interaction) > (relationship.drift_threshold_days * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const negotiate = async () => {
      setLoading(true);
      const outcome = await runHandshakeProtocol(self, friend, relationship);

      let trafficColor: 'green' | 'yellow' | 'red' = 'red';
      let allowed = false;

      if (outcome.success) {
        trafficColor = 'green';
        allowed = true;
      } else {
        switch (outcome.code) {
          case ProtocolCode.REJ_BATTERY:
          case ProtocolCode.REJ_HARD:
             trafficColor = 'red';
             break;
          case ProtocolCode.REJ_CALENDAR:
          case ProtocolCode.REJ_QUOTA:
             trafficColor = 'yellow'; 
             break;
          default:
             trafficColor = 'red';
        }
      }

      const initialResult: NegotiationResult = { 
        allowed, 
        trafficColor, 
        message: outcome.humanMessage, 
        suggestion: "", 
        method: "WHATSAPP",
        protocolCode: outcome.code,
        logs: outcome.logs
      };
      
      setResult(initialResult);
      setLoading(false);

      if (outcome.success && outcome.finalSlot) {
         setGeneratingContext(true);
         const contextInput = {
           users: [self, friend],
           constraints: {
             time_start: outcome.finalSlot,
             duration_minutes: 90,
             location_centroid: { lat: 51.5074, lng: -0.1278 },
             weather_description: "Rainy"
           }
         };
         const ticket = await generateContextSuggestion(contextInput);
         setResult(prev => prev ? { ...prev, goldenTicket: ticket } : null);
         setGeneratingContext(false);
      }
    };
    negotiate();
  }, [self, friend, relationship]);

  const handleAction = () => {
    if (!result?.allowed && result?.trafficColor !== 'yellow') return;
    setShowActionSuccess(true);
    setTimeout(() => {
       onClose();
    }, 2000);
  };

  // --- SIGNAL DECK MODE ---
  if (showSignalDeck) {
    return (
      <SignalDeck 
        self={self} 
        friend={friend} 
        relationship={relationship} 
        onClose={() => setShowSignalDeck(false)} 
      />
    );
  }

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="h-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 relative overflow-hidden">
        {/* Background Pulse */}
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-6" />
           <h2 className="text-lg font-light text-zinc-200 tracking-widest uppercase">Negotiating</h2>
           <p className="text-xs font-mono text-zinc-600 mt-2">Pinging {friend.name}'s Agent...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;
  const isYellow = result.trafficColor === 'yellow';

  return (
    <div className="h-full flex flex-col relative bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 shrink-0 border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-md flex items-start justify-between relative z-20">
         <div className="flex flex-col items-start">
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors mb-4 flex items-center">
               <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <div>
               <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                 {friend.name}
                 {relationship.is_hidden && <EyeOff size={16} className="ml-2 text-zinc-600" />}
               </h2>
               <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1 flex items-center">
               Status: <span className={`ml-2 ${friend.current_status === 'OPEN' ? 'text-emerald-500' : 'text-zinc-400'}`}>{friend.current_status}</span>
               </p>
            </div>
         </div>

         {/* Settings Menu */}
         <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
               <MoreVertical size={16} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50"
                >
                   <button 
                     onClick={() => { onToggleHide(); setShowMenu(false); }}
                     className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 flex items-center"
                   >
                      {relationship.is_hidden ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                      {relationship.is_hidden ? 'Unhide Node' : 'Hide Node'}
                   </button>
                   
                   {!confirmRemove ? (
                     <button 
                       onClick={() => setConfirmRemove(true)}
                       className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-rose-900 hover:bg-rose-950 hover:text-rose-500 flex items-center border-t border-zinc-800"
                     >
                        <Trash2 size={14} className="mr-2" />
                        Disconnect
                     </button>
                   ) : (
                     <button 
                       onClick={onRemove}
                       className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-white bg-rose-600 hover:bg-rose-500 flex items-center"
                     >
                        <Trash2 size={14} className="mr-2 fill-white" />
                        Confirm?
                     </button>
                   )}
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-2 pb-20" onClick={() => setShowMenu(false)}>
        
        {/* DRIFT WARNING & SIGNAL DECK TRIGGER */}
        {isDrifted && !generatingContext && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-950/30 border border-amber-900/50 rounded-lg p-4 flex items-center justify-between shadow-lg"
          >
             <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-900/50 rounded-full flex items-center justify-center text-amber-500 mr-3">
                   <Sparkles size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-amber-100">Connection Drifted</h4>
                   <p className="text-[10px] text-amber-400/70 uppercase tracking-wide">Soft-Touch Needed</p>
                </div>
             </div>
             <button 
               onClick={() => setShowSignalDeck(true)}
               className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded shadow-lg transition-colors"
             >
                Open Signal Deck
             </button>
          </motion.div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[30%]">
          
          {/* CASE 1: Context Engine Loading */}
          {generatingContext && (
            <div className="flex flex-col items-center py-10">
               <div className="w-12 h-12 border-2 border-zinc-800 border-t-zinc-200 rounded-full animate-spin mb-4" />
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Generating Itinerary...</p>
            </div>
          )}

          {/* CASE 2: Golden Ticket */}
          {!generatingContext && result.goldenTicket && (
             <div className="w-full">
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Protocol Accepted</h3>
                </div>
                <GoldenTicketCard ticket={result.goldenTicket} />
             </div>
          )}

          {/* CASE 3: Rejection / Warning */}
          {!generatingContext && !result.goldenTicket && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`
                w-full max-w-sm p-8 border relative overflow-hidden
                flex flex-col items-center text-center rounded-lg shadow-2xl
                ${result.trafficColor === 'red' ? 'bg-rose-950/20 border-rose-900' : 'bg-amber-950/20 border-amber-900'}
              `}
            >
              <div className={`
                w-3 h-3 rounded-full mb-6 relative z-10
                ${result.trafficColor === 'yellow' ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : ''}
                ${result.trafficColor === 'red' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : ''}
              `} />

              <h3 className="text-lg font-bold text-white mb-2 relative z-10 tracking-tight">
                {result.trafficColor === 'red' ? 'CONNECTION STOP' : 'PROTOCOL CAUTION'}
              </h3>
              
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed relative z-10 font-mono">
                {result.message}
              </p>

              {/* Action Button */}
              <motion.button
                whileTap={(result.allowed || isYellow) ? { scale: 0.97 } : {}}
                onClick={handleAction}
                disabled={!result.allowed && !isYellow}
                className={`
                  w-full py-4 flex items-center justify-center space-x-2 text-xs font-bold tracking-widest uppercase rounded
                  transition-all duration-300 relative z-10
                  ${isYellow ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}
                `}
              >
                {isYellow ? (
                  <span className="flex items-center"><Share2 size={14} className="mr-2" /> Send Async Nudge</span>
                ) : (
                  <span className="flex items-center"><Lock size={14} className="mr-2" /> Locked</span>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* REASONING COLLAPSIBLE */}
        {result.logs && (
          <div className="w-full max-w-sm mx-auto mt-8 border-t border-zinc-900 pt-6">
             <button 
               onClick={() => setShowReasoning(!showReasoning)}
               className="w-full flex items-center justify-between p-3 rounded bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 transition-colors group"
             >
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">
                   <GitCommit size={14} className="mr-2" />
                   View Agent Reasoning
                </div>
                {showReasoning ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
             </button>
             
             <AnimatePresence>
               {showReasoning && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <ReasoningTrace logs={result.logs} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};