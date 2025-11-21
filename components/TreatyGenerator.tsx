
import React, { useState } from 'react';
import { User, ConnectionTier, Treaty } from '../types';
import { draftTreaty } from '../services/treatyService';
import { ArrowLeft, Copy, QrCode, Share2, Shield, Link as LinkIcon, Check, Loader2, Battery } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreatyGeneratorProps {
  user: User;
  onGenerateTreaty: (treaty: Treaty) => void;
  onShadowMode: () => void;
  onBack: () => void;
}

export const TreatyGenerator: React.FC<TreatyGeneratorProps> = ({ user, onGenerateTreaty, onShadowMode, onBack }) => {
  const [tier, setTier] = useState<ConnectionTier>(ConnectionTier.FRIEND);
  const [includeStatus, setIncludeStatus] = useState(true);
  const [generatedTreaty, setGeneratedTreaty] = useState<Treaty | null>(null);
  const [viewMode, setViewMode] = useState<'LINK' | 'QR'>('LINK');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newTreaty = await draftTreaty(user, tier, includeStatus);
      setGeneratedTreaty(newTreaty);
      onGenerateTreaty(newTreaty);
    } catch (error) {
      console.error("Failed to generate treaty", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedTreaty) return;
    const url = `https://compact.app/treaty/${generatedTreaty.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-300">
      {/* Header */}
      <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center">
        <button onClick={onBack} className="text-zinc-500 hover:text-white mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Draft Treaty</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">New Connection Protocol</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        
        {!generatedTreaty ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tier Selection */}
            <section>
              <label className="block text-[10px] uppercase text-zinc-500 mb-3 font-bold tracking-widest">
                Select Clearance Level
              </label>
              <div className="space-y-3">
                {[
                  { id: ConnectionTier.INNER_CIRCLE, label: "Inner Circle", desc: "High Access. Precise Location. Auto-Approve." },
                  { id: ConnectionTier.FRIEND, label: "Friend", desc: "Standard Access. City Location. Negotiated." },
                  { id: ConnectionTier.ACQUAINTANCE, label: "Acquaintance", desc: "Low Access. Busy/Free Only. Manual Approval." }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTier(option.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all relative overflow-hidden
                      ${tier === option.id 
                        ? 'bg-zinc-800 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'}
                    `}
                  >
                    <div className="relative z-10">
                      <div className={`font-bold text-sm ${tier === option.id ? 'text-white' : 'text-zinc-400'}`}>
                        {option.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">{option.desc}</div>
                    </div>
                    {tier === option.id && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                        <Shield size={18} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Options */}
            <section>
               <button 
                onClick={() => setIncludeStatus(!includeStatus)}
                className={`w-full flex items-center p-3 rounded-lg border transition-all
                  ${includeStatus ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/30 border-zinc-800 opacity-70'}
                `}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${includeStatus ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-transparent'}`}>
                   {includeStatus && <Check size={12} className="text-black" />}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-zinc-300 flex items-center">
                    Attach Status Snapshot
                    <Battery size={10} className="ml-2 text-zinc-500" />
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    "Warn them I am currently in <span className="text-zinc-300 uppercase">{user.current_status.replace('_', ' ')}</span> mode."
                  </div>
                </div>
              </button>
            </section>

            {/* Action */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                w-full py-4 font-bold uppercase tracking-widest text-sm rounded-lg shadow-lg transition-all flex items-center justify-center
                ${isGenerating 
                  ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'}
              `}
            >
              {isGenerating ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Encrypting Treaty...</>
              ) : (
                <><LinkIcon size={16} className="mr-2" /> Generate Treaty</>
              )}
            </button>
            
            <div className="text-center pt-4">
               <button onClick={onShadowMode} className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4">
                 Or create a "Shadow Node" (No App Required)
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
            
            {/* The Card */}
            <div className="w-full max-w-xs bg-white text-zinc-900 rounded-xl overflow-hidden shadow-2xl relative">
               <div className="h-2 bg-zinc-900 w-full" />
               <div className="p-6 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">
                    Protocol Invitation
                  </div>
                  
                  {viewMode === 'LINK' ? (
                    <div className="bg-zinc-100 rounded p-4 mb-4 border border-zinc-200">
                       <div className="text-3xl font-mono font-bold tracking-tighter text-zinc-900">
                         {generatedTreaty.code}
                       </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 p-4 rounded mb-4 aspect-square flex items-center justify-center">
                       {/* Mock QR */}
                       <div className="w-full h-full border-4 border-white border-dashed opacity-50 flex items-center justify-center text-white font-mono text-xs">
                         [ QR DATA ]
                       </div>
                    </div>
                  )}

                  <div className="text-xs text-zinc-500 font-medium leading-relaxed">
                     Scan to accept <strong>{user.name}</strong>'s communication protocol.
                     <br/>
                     <span className="text-[10px] uppercase opacity-75 mt-2 block">Expires in 48h</span>
                  </div>
               </div>
               
               {/* Footer Action */}
               <button 
                 onClick={handleCopy}
                 className="w-full py-4 bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center"
               >
                  {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                  {copied ? 'Link Copied' : 'Copy Link'}
               </button>
            </div>

            {/* Toggles */}
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button 
                onClick={() => setViewMode('LINK')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${viewMode === 'LINK' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Link
              </button>
              <button 
                onClick={() => setViewMode('QR')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${viewMode === 'QR' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                QR Code
              </button>
            </div>
            
            <button onClick={() => setGeneratedTreaty(null)} className="text-zinc-500 text-xs hover:text-white">
               Create New
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
