
import React, { useState, useEffect, useRef } from 'react';
import { User, ReflectionLog } from '../types';
import { analyzeReflectionIntake, generateReflectionSummary, ReflectionIntakeAnalysis } from '../services/geminiService';
import { Mic, Square, X, Save, BrainCircuit, Sparkles, ChevronRight, Check, AlignLeft } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface ReflectionMirrorProps {
  friend: User;
  onClose: () => void;
  onSave?: (log: ReflectionLog) => void;
}

type MirrorPhase = 'INTAKE' | 'PROCESSING_PROBE' | 'PROBE' | 'PROCESSING_SUMMARY' | 'SUMMARY';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ReflectionMirror: React.FC<ReflectionMirrorProps> = ({ friend, onClose, onSave }) => {
  const [phase, setPhase] = useState<MirrorPhase>('INTAKE');
  
  // Intake Data
  const [transcript, setTranscript] = useState('');
  
  // Probe Data
  const [intakeAnalysis, setIntakeAnalysis] = useState<ReflectionIntakeAnalysis | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Controls
  const [isRecording, setIsRecording] = useState(false); // Toggles recording state
  const [activeField, setActiveField] = useState<'INTAKE' | number>('INTAKE'); // Tracks which field is receiving voice
  
  // Final Summary
  const [summary, setSummary] = useState<ReflectionLog['summary'] | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- SPEECH RECOGNITION HOOK ---
  useEffect(() => {
    let recognition: any = null;
    let interval: any = null;

    if (isRecording) {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Real Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
           let current = '';
           for (let i = 0; i < event.results.length; i++) {
             current += event.results[i][0].transcript;
           }
           
           // Update the active field
           if (activeField === 'INTAKE') {
             // For intake, we append to existing or replace? 
             // Standard dictation usually appends final results, but here we just set current for simplicity in this mock-up environment
             // To avoid infinite appending in this loop, we just set it to the current session result
             // In a robust app, we'd handle final vs interim results differently.
             // For this demo, we'll just set it.
             setTranscript(current); 
           } else if (typeof activeField === 'number') {
             setAnswers(prev => ({ ...prev, [activeField]: current }));
           }
        };
        
        recognition.onerror = (e: any) => {
          console.warn("Speech API Error, switching to sim", e);
        };
        recognition.start();
      } else {
        // Simulation Mode
        const mockText = activeField === 'INTAKE' 
          ? `I'm worried about ${friend.name}. They seemed really stressed when we last spoke about work. `
          : `I think I need to be more patient with them. `;

        let i = 0;
        interval = setInterval(() => {
           const char = mockText.charAt(i % mockText.length);
           
           if (activeField === 'INTAKE') {
             setTranscript(prev => prev + char);
           } else if (typeof activeField === 'number') {
             setAnswers(prev => ({ ...prev, [activeField]: (prev[activeField] || '') + char }));
           }
           i++;
        }, 50);
      }
    }

    return () => {
      if (recognition) recognition.stop();
      if (interval) clearInterval(interval);
    };
  }, [isRecording, activeField, friend.name]);

  const toggleRecording = (field: 'INTAKE' | number) => {
    if (isRecording && activeField === field) {
      setIsRecording(false);
    } else {
      setActiveField(field);
      setIsRecording(true);
    }
  };

  // --- HANDLERS ---

  const handleIntakeFinish = async () => {
    setIsRecording(false);
    if (!transcript.trim()) return;
    setPhase('PROCESSING_PROBE');
    
    const analysis = await analyzeReflectionIntake(transcript, friend.name);
    setIntakeAnalysis(analysis);
    setPhase('PROBE');
  };

  const handleProbeFinish = async () => {
    setPhase('PROCESSING_SUMMARY');
    
    const qaPairs = intakeAnalysis?.questions.map((q, i) => ({
      question: q,
      answer: answers[i] || "Skipped"
    })) || [];

    const result = await generateReflectionSummary(transcript, qaPairs, friend.name);
    setSummary(result);
    setPhase('SUMMARY');
  };

  const handleSave = () => {
    if (summary && onSave) {
      const qaText = intakeAnalysis?.questions.map((q, i) => `Q: ${q} A: ${answers[i] || 'Skipped'}`).join(' | ');
      const log: ReflectionLog = {
        id: `ref_${Date.now()}`,
        date: Date.now(),
        summary: summary,
        raw_transcript: transcript + " | " + qaText
      };
      onSave(log);
    }
    onClose();
  };

  const scrollToQuestion = (index: number) => {
     if (scrollContainerRef.current) {
        const cardWidth = scrollContainerRef.current.offsetWidth;
        scrollContainerRef.current.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        });
     }
  };

  // Animation Variants
  const fluidVariant: Variants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      borderRadius: ["30%", "50%", "30%"],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col text-zinc-200 font-sans overflow-hidden">
      
      {/* Top Bar */}
      <div className="p-6 flex items-center justify-between z-20 bg-black/50 backdrop-blur-sm sticky top-0">
         <div className="flex items-center space-x-2 text-zinc-500">
            <BrainCircuit size={18} className="text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest">The Mirror</span>
         </div>
         <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
         </button>
      </div>

      {/* PHASE 1: INTAKE (Voice) */}
      {phase === 'INTAKE' && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-6 relative"
        >
           {/* Fluid Visualizer */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div variants={fluidVariant} animate="animate" className="w-64 h-64 bg-indigo-900/20 blur-3xl rounded-full absolute" />
              <motion.div variants={fluidVariant} animate="animate" transition={{ delay: 1 }} className="w-48 h-48 bg-purple-900/20 blur-2xl rounded-full absolute" />
           </div>

           <div className="relative z-10 w-full max-w-md text-center space-y-8">
              <div>
                 <h2 className="text-2xl font-light text-white mb-2">Reflecting on {friend.name}</h2>
                 <p className="text-sm text-zinc-500">What's on your mind? Dump your raw thoughts.</p>
              </div>

              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Tap microphone to speak..."
                  className="w-full h-40 bg-transparent border-none text-center text-lg text-zinc-300 placeholder-zinc-700 focus:ring-0 resize-none outline-none"
                />
              </div>

              <div className="flex justify-center">
                 <button 
                   onClick={() => toggleRecording('INTAKE')}
                   className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording && activeField === 'INTAKE' ? 'bg-rose-500/20 text-rose-500 scale-110 border-2 border-rose-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                 >
                    {isRecording && activeField === 'INTAKE' ? <Square fill="currentColor" size={24} /> : <Mic size={32} />}
                 </button>
              </div>
              
              {isRecording && activeField === 'INTAKE' && (
                <div className="h-4 flex items-center justify-center space-x-1">
                   {[1,2,3,4,5].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ height: [4, 12, 4] }}
                       transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                       className="w-1 bg-rose-500 rounded-full"
                     />
                   ))}
                </div>
              )}

              {transcript.length > 3 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleIntakeFinish}
                  className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                   Analyze
                </motion.button>
              )}
           </div>
        </motion.div>
      )}

      {/* PHASE 2: THE PROBE (Multi-Step) */}
      {(phase === 'PROCESSING_PROBE' || phase === 'PROBE') && (
        <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
           className="flex-1 flex flex-col h-full relative"
        >
           {phase === 'PROCESSING_PROBE' ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                 <Sparkles className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                 <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Synthesizing Context...</p>
              </div>
           ) : (
              <div className="flex flex-col h-full">
                 
                 {/* 1. Context Header */}
                 <div className="p-6 pb-4 shrink-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900/50">
                    <div className="flex items-center text-emerald-500 mb-2 text-xs font-bold uppercase tracking-widest">
                       <Check size={12} className="mr-2" />
                       Context Acquired
                    </div>
                    <p className="text-lg font-light text-white leading-relaxed italic">
                       "{intakeAnalysis?.context_summary}"
                    </p>
                 </div>

                 {/* 2. Horizontal Scroll Container */}
                 <div 
                   ref={scrollContainerRef}
                   className="flex-1 flex overflow-x-auto snap-x snap-mandatory items-start no-scrollbar"
                 >
                    {intakeAnalysis?.questions.map((question, index) => (
                      <div key={index} className="w-full shrink-0 snap-center p-6 flex flex-col items-center justify-start h-full pt-8">
                         
                         {/* Indicator */}
                         <div className="flex items-center space-x-2 mb-6 opacity-50">
                            {[0,1,2].map(dot => (
                               <div key={dot} className={`w-2 h-2 rounded-full ${index === dot ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                            ))}
                         </div>

                         {/* QUESTION CARD */}
                         <div className="w-full max-w-md space-y-4">
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">Probe {index + 1}</div>
                                <h3 className="text-xl text-white leading-relaxed font-light">"{question}"</h3>
                            </div>

                            {/* INPUT UI */}
                            <div className="bg-black/40 border border-zinc-700 rounded-xl overflow-hidden flex flex-col focus-within:border-zinc-500 transition-colors relative group">
                                <textarea
                                  value={answers[index] || ''}
                                  onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                                  placeholder="Type your answer..."
                                  className="w-full min-h-[120px] bg-transparent border-none text-zinc-200 placeholder-zinc-600 p-4 resize-none outline-none text-sm leading-relaxed"
                                />
                                
                                {/* Toolbar attached to input */}
                                <div className="flex items-center justify-between p-2 bg-zinc-900/50 border-t border-zinc-800">
                                     <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest px-2 flex items-center">
                                         {isRecording && activeField === index ? (
                                            <span className="text-rose-500 flex items-center"><span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse mr-2"/>Recording</span>
                                         ) : (
                                            <span className="flex items-center"><AlignLeft size={10} className="mr-2"/> Text or Speech</span>
                                         )}
                                     </div>
                                     <button
                                         onClick={() => toggleRecording(index)}
                                         className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border shadow-sm ${
                                            isRecording && activeField === index 
                                            ? 'bg-rose-600 border-rose-500 text-white' 
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                         }`}
                                     >
                                         {isRecording && activeField === index ? <Square size={12} fill="currentColor" /> : <Mic size={14} />}
                                         <span className="text-xs font-bold uppercase tracking-wide">
                                            {isRecording && activeField === index ? 'Stop' : 'Dictate'}
                                         </span>
                                     </button>
                                </div>
                            </div>

                            {/* Navigation for this slide */}
                            <div className="flex justify-between pt-2">
                                <button 
                                   onClick={() => {
                                     if (index < 2) scrollToQuestion(index + 1);
                                     else handleProbeFinish();
                                   }}
                                   className="text-zinc-600 text-xs font-bold uppercase hover:text-zinc-400 transition-colors p-2"
                                >
                                   {answers[index] ? 'Next >' : 'Skip'}
                                </button>
                            </div>
                         </div>

                      </div>
                    ))}
                 </div>

                 {/* Global Finish Footer */}
                 <div className="p-4 pb-8 text-center z-30 bg-zinc-950 border-t border-zinc-900 sticky bottom-0">
                     <button 
                        onClick={handleProbeFinish} 
                        className="w-full max-w-md mx-auto py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all hover:scale-[1.01]"
                     >
                        <Sparkles size={16} className="mr-2 fill-white/20" />
                        Finish & Synthesize
                     </button>
                 </div>
              </div>
           )}
        </motion.div>
      )}

      {/* PHASE 3: SUMMARY (Synthesis) */}
      {(phase === 'PROCESSING_SUMMARY' || phase === 'SUMMARY') && (
        <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
           className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full overflow-y-auto"
        >
           {phase === 'PROCESSING_SUMMARY' ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                 <BrainCircuit className="w-12 h-12 text-emerald-500 animate-pulse mx-auto" />
                 <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Generating Insights...</p>
              </div>
           ) : (
              summary && (
                 <div className="space-y-6 pb-10">
                    <div className="text-center mb-6">
                       <h2 className="text-xl font-bold text-white">Reflection Complete</h2>
                       <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{new Date().toLocaleDateString()}</p>
                    </div>

                    {/* 1. THE UPDATE */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">The Update</h3>
                       <ul className="space-y-2">
                          {summary.update.map((item, i) => (
                             <li key={i} className="flex items-start text-sm text-zinc-300">
                                <span className="text-emerald-500 mr-2">•</span> {item}
                             </li>
                          ))}
                       </ul>
                    </div>

                    {/* 2. THE VIBE */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">The Vibe</h3>
                       <p className="text-sm text-indigo-200 italic">"{summary.vibe}"</p>
                    </div>

                    {/* 3. THE INSIGHT */}
                    <div className="bg-gradient-to-br from-indigo-900/30 to-zinc-900 border border-indigo-500/30 rounded-xl p-5">
                       <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                          <Sparkles size={12} className="mr-2" /> Strategic Insight
                       </h3>
                       <p className="text-sm text-zinc-200 leading-relaxed">
                          {summary.insight}
                       </p>
                    </div>

                    <button 
                      onClick={handleSave}
                      className="w-full py-4 bg-white text-black rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center mt-4"
                    >
                       <Save size={16} className="mr-2" /> Save to Memory
                    </button>
                 </div>
              )
           )}
        </motion.div>
      )}

    </div>
  );
};
