
import React, { useState, useEffect, useRef } from 'react';
import { User, Relationship, SignalDeckData } from '../types';
import { generateSignalDeck } from '../services/reconnectionService';
import { tuneMessageTone } from '../services/geminiService';
import { STATIC_SIGNAL_LIBRARY } from '../constants';
import { ArrowLeft, Sparkles, Copy, Check, RefreshCw, Zap, Feather, Calendar, RotateCcw, Sliders, Loader2, PenTool, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignalDeckProps {
  self: User;
  friend: User;
  relationship: Relationship;
  onClose: () => void;
}

// Moved outside to prevent re-creation on every render
const AccordionItem: React.FC<{
  index: number;
  title: string;
  icon: any;
  children: React.ReactNode;
  expandedSection: number;
  setExpandedSection: (i: number) => void;
}> = ({ index, title, icon: Icon, children, expandedSection, setExpandedSection }) => {
  const isOpen = expandedSection === index;
  return (
    <div className="border-b border-zinc-800 bg-zinc-900/30">
      <button 
        onClick={() => setExpandedSection(isOpen ? -1 : index)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isOpen ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}`}
      >
        <div className="flex items-center space-x-3">
          <Icon size={16} className={isOpen ? 'text-emerald-400' : 'text-zinc-500'} />
          <span className={`text-sm font-bold uppercase tracking-wider ${isOpen ? 'text-white' : 'text-zinc-500'}`}>
            {title}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SignalDeck: React.FC<SignalDeckProps> = ({ self, friend, relationship, onClose }) => {
  const [deckData, setDeckData] = useState<SignalDeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number>(0); // 0: Signal, 1: OS, 2: Ritual, 3: Cost
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // -1 for custom
  const [showLibrary, setShowLibrary] = useState(false);

  // Tone Tuner State (Generated List)
  const [tuningIndex, setTuningIndex] = useState<number | null>(null);
  const [toneValue, setToneValue] = useState(50); // 0 - 100
  const [tunedTexts, setTunedTexts] = useState<{[key: number]: string}>({});
  const [isTuning, setIsTuning] = useState(false);
  const tuningDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Signal State
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [customTunedText, setCustomTunedText] = useState('');
  const [customToneValue, setCustomToneValue] = useState(50);
  const [isTuningCustom, setIsTuningCustom] = useState(false);

  useEffect(() => {
    const initDeck = async () => {
      setLoading(true);
      const data = await generateSignalDeck(self, friend, relationship);
      setDeckData(data);
      setLoading(false);
    };
    initDeck();
  }, [self, friend, relationship]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Tuner for List Items
  const handleToneChange = (newVal: number, idx: number, originalText: string) => {
    setToneValue(newVal);
    setIsTuning(true);

    if (tuningDebounceRef.current) clearTimeout(tuningDebounceRef.current);

    tuningDebounceRef.current = setTimeout(async () => {
      const newText = await tuneMessageTone(
        originalText, 
        newVal, 
        friend.name, 
        relationship.annotations.tags || []
      );
      setTunedTexts(prev => ({...prev, [idx]: newText}));
      setIsTuning(false);
    }, 600); // 600ms debounce
  };

  // Tuner for Custom Input
  const handleCustomToneChange = (newVal: number) => {
    setCustomToneValue(newVal);
    if (!customInputText.trim()) return;
    
    setIsTuningCustom(true);
    if (tuningDebounceRef.current) clearTimeout(tuningDebounceRef.current);

    tuningDebounceRef.current = setTimeout(async () => {
       const newText = await tuneMessageTone(
         customInputText,
         newVal,
         friend.name,
         relationship.annotations.tags || []
       );
       setCustomTunedText(newText);
       setIsTuningCustom(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <Sparkles size={48} className="text-emerald-500 relative z-10 animate-pulse" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest">Calibrating Signal...</p>
        <p className="text-[10px] text-zinc-600 mt-2 font-mono">Analyzing shared context</p>
      </div>
    );
  }

  if (!deckData) return null;

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-200 font-sans">
      {/* Header */}
      <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center sticky top-0 z-20">
        <button onClick={onClose} className="text-zinc-500 hover:text-white mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Signal Deck</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Soft-Touch Reconnection Engine</p>
        </div>
      </div>

      {/* Hero Context */}
      <div className="p-6 pb-2 border-b border-zinc-800 bg-zinc-900/20">
         <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Target</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Drift</span>
         </div>
         <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{friend.name}</span>
            <span className="text-sm font-mono text-amber-500">
              {Math.floor((Date.now() - relationship.last_interaction) / (1000 * 60 * 60 * 24))} Days
            </span>
         </div>
         <div className="mt-4 p-3 bg-emerald-900/10 border border-emerald-900/30 rounded-lg flex items-start">
            <Feather size={14} className="text-emerald-500 mt-0.5 mr-2 shrink-0" />
            <p className="text-xs text-emerald-200/80 italic leading-relaxed">
               "Soft-Touch Protocol active. Zero pressure. No questions. Just warmth."
            </p>
         </div>
      </div>

      {/* Accordion */}
      <div className="flex-1 overflow-y-auto">
        
        {/* 1. THE SIGNALS */}
        <AccordionItem 
          index={0} 
          title="The Signals" 
          icon={Zap}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
           <div className="space-y-3">

              {/* --- CUSTOM COMPOSE BUTTON --- */}
              {!showCustomInput && (
                <button 
                   onClick={() => setShowCustomInput(true)}
                   className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg text-xs text-zinc-400 hover:text-white font-bold uppercase tracking-widest transition-all flex items-center justify-center mb-4"
                >
                   <PenTool size={12} className="mr-2" /> Compose Custom Signal
                </button>
              )}

              {/* --- CUSTOM INPUT AREA --- */}
              <AnimatePresence>
                {showCustomInput && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="bg-zinc-900 border border-indigo-500/30 rounded-lg p-4 mb-6 relative overflow-hidden"
                   >
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center">
                            <Sparkles size={10} className="mr-1" /> Custom Lab
                         </span>
                         <button onClick={() => setShowCustomInput(false)} className="text-zinc-500 hover:text-white">
                            <X size={14} />
                         </button>
                      </div>

                      <textarea
                         value={customInputText}
                         onChange={(e) => {
                            setCustomInputText(e.target.value);
                            if (e.target.value === '') {
                               setCustomTunedText('');
                               setCustomToneValue(50);
                            }
                         }}
                         placeholder="Draft your raw thought here..."
                         className="w-full bg-black/50 border border-zinc-800 rounded p-3 text-sm text-zinc-300 focus:border-indigo-500/50 outline-none resize-none mb-4"
                         rows={2}
                      />

                      {/* RESULT PREVIEW */}
                      {(customInputText || customTunedText) && (
                         <div className="mb-4 p-3 bg-black/30 rounded border border-zinc-800 min-h-[3rem] flex items-center justify-between">
                            <div className="text-sm text-white italic font-serif">
                               {isTuningCustom ? (
                                  <span className="text-zinc-500 flex items-center"><Loader2 size={12} className="animate-spin mr-2"/> Rewriting...</span>
                               ) : (
                                  `"${customTunedText || customInputText}"`
                               )}
                            </div>
                            <button 
                              onClick={() => handleCopy(customTunedText || customInputText, -1)}
                              className="text-zinc-500 hover:text-emerald-400 ml-2"
                            >
                               {copiedIndex === -1 ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                         </div>
                      )}

                      {/* SLIDER FOR CUSTOM */}
                      {customInputText && (
                        <div className="pt-2 border-t border-zinc-800/50">
                           <div className="flex justify-between items-center mb-2 text-[9px] uppercase font-bold tracking-wider text-zinc-500">
                              <span className={customToneValue < 30 ? 'text-emerald-400' : ''}>Casual</span>
                              <span className={customToneValue > 30 && customToneValue < 70 ? 'text-white' : ''}>Neutral</span>
                              <span className={customToneValue > 70 ? 'text-rose-400' : ''}>Warm</span>
                           </div>
                           
                           <div className="relative h-6 flex items-center group/slider">
                              <div className="absolute w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-emerald-500 via-zinc-400 to-rose-500 opacity-50" style={{ width: '100%' }} />
                              </div>
                              <input 
                                type="range" 
                                min="0" max="100" step="25"
                                value={customToneValue}
                                onChange={(e) => handleCustomToneChange(Number(e.target.value))}
                                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <motion.div 
                                className="absolute w-3 h-3 bg-white border border-zinc-900 rounded-full shadow pointer-events-none"
                                animate={{ left: `calc(${customToneValue}% - 6px)` }}
                              />
                           </div>
                        </div>
                      )}
                   </motion.div>
                )}
              </AnimatePresence>


              {/* --- GENERATED SIGNALS --- */}
              {deckData.signals.map((signal, idx) => {
                const isTuningThis = tuningIndex === idx;
                const displayText = tunedTexts[idx] || signal.text;

                return (
                  <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 group hover:border-zinc-600 transition-colors">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                          {signal.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          {/* Tune Button */}
                          <button 
                            onClick={() => {
                              if (tuningIndex === idx) {
                                setTuningIndex(null); // Close tuner
                              } else {
                                setTuningIndex(idx); 
                                setToneValue(50); // Reset to Neutral
                              }
                            }}
                            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${isTuningThis ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-600'}`}
                            title="Tune Tone"
                          >
                            <Sliders size={14} />
                          </button>

                          {/* Copy Button */}
                          <button 
                            onClick={() => handleCopy(displayText, idx)}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors p-1.5"
                          >
                            {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                     </div>

                     <div className="min-h-[3rem] flex items-center">
                       {isTuning && isTuningThis ? (
                          <div className="w-full flex items-center justify-center py-2 text-zinc-500">
                             <Loader2 size={14} className="animate-spin mr-2" /> Tuning...
                          </div>
                       ) : (
                          <p className="text-sm text-zinc-300 leading-relaxed font-serif italic transition-all duration-300">
                            "{displayText}"
                          </p>
                       )}
                     </div>

                     {/* THE TONE TUNER UI */}
                     <AnimatePresence>
                       {isTuningThis && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden"
                         >
                           <div className="mt-4 pt-4 border-t border-zinc-800/50">
                              <div className="flex justify-between items-center mb-2 text-[9px] uppercase font-bold tracking-wider text-zinc-500">
                                 <span className={toneValue < 30 ? 'text-emerald-400' : ''}>Casual</span>
                                 <span className={toneValue > 30 && toneValue < 70 ? 'text-white' : ''}>Neutral</span>
                                 <span className={toneValue > 70 ? 'text-rose-400' : ''}>Warm</span>
                              </div>
                              
                              <div className="relative h-8 flex items-center group/slider">
                                 {/* Track */}
                                 <div className="absolute w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-500 via-zinc-400 to-rose-500 opacity-50" 
                                      style={{ width: '100%' }} 
                                    />
                                 </div>
                                 
                                 <input 
                                   type="range" 
                                   min="0" 
                                   max="100" 
                                   step="25" // Discrete steps: 0, 25, 50, 75, 100
                                   value={toneValue}
                                   onChange={(e) => handleToneChange(Number(e.target.value), idx, signal.text)}
                                   className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                 />
                                 
                                 {/* Thumb */}
                                 <motion.div 
                                   className="absolute w-4 h-4 bg-zinc-200 border border-zinc-950 rounded-full shadow shadow-black pointer-events-none"
                                   animate={{ left: `calc(${toneValue}% - 8px)` }}
                                 />
                              </div>
                              <p className="text-[9px] text-zinc-600 text-center mt-1 font-mono">
                                 Powered by Gemini Tuner
                              </p>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>

                  </div>
                );
              })}
              <button 
                onClick={() => setShowLibrary(true)}
                className="w-full py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center"
              >
                <RotateCcw size={12} className="mr-2" /> Browse Static Library
              </button>
           </div>
        </AccordionItem>

        {/* 2. THE RHYTHM */}
        <AccordionItem 
          index={1} 
          title="The Rhythm" 
          icon={Calendar}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
           <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase">Strategy</h3>
                 <span className="text-xs text-emerald-400 font-mono">{deckData.friendship_os.plan_name}</span>
              </div>
              <div className="space-y-6 relative">
                 <div className="absolute left-[19px] top-2 bottom-2 w-[1px] bg-zinc-800" />
                 {deckData.friendship_os.steps.map((step, idx) => (
                   <div key={idx} className="relative flex items-start pl-1">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 z-10">
                         <span className="text-[10px] font-bold text-zinc-500">W{step.week}</span>
                      </div>
                      <div className="ml-4 pt-1">
                         <div className="text-sm font-bold text-zinc-200">{step.action}</div>
                         <div className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wide">Effort: {step.effort}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </AccordionItem>

        {/* 3. THE RITUAL */}
        <AccordionItem 
          index={2} 
          title="The Ritual" 
          icon={RefreshCw}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
           <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                 <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-light text-white mb-2">{deckData.micro_ritual.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {deckData.micro_ritual.description}
              </p>
              <button className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors">
                Propose Ritual
              </button>
           </div>
        </AccordionItem>

        {/* 4. THE COST */}
        <AccordionItem 
          index={3} 
          title="The Cost" 
          icon={Zap}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
        >
           <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs text-zinc-500 uppercase tracking-wide">Energy Model</span>
                 <span className={`text-xs font-bold px-2 py-1 rounded bg-zinc-900 ${deckData.energy_model.cost === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {deckData.energy_model.cost} COST
                 </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {deckData.energy_model.justification}
              </p>
           </div>
        </AccordionItem>

      </div>

      {/* Static Library Modal */}
      <AnimatePresence>
        {showLibrary && (
           <motion.div 
             initial={{ y: '100%' }}
             animate={{ y: 0 }}
             exit={{ y: '100%' }}
             className="absolute inset-0 bg-zinc-950 z-50 flex flex-col"
           >
              <div className="p-6 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Template Library</h2>
                 <button onClick={() => setShowLibrary(false)} className="text-white text-sm font-bold">CLOSE</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {STATIC_SIGNAL_LIBRARY.map((template, i) => (
                    <button 
                      key={i}
                      onClick={() => { handleCopy(template.text, i); setShowLibrary(false); }}
                      className="w-full text-left bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-zinc-600 transition-all"
                    >
                       <span className="text-[10px] text-emerald-500 font-bold uppercase mb-2 block">{template.type}</span>
                       <p className="text-sm text-zinc-300 italic font-serif">"{template.text}"</p>
                    </button>
                 ))}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
