
import React, { useState } from 'react';
import { CalendarConfig, EnergyBlock } from '../types';
import { runCalendarSync } from '../services/calendarAdapter';
import { ArrowLeft, RefreshCw, Check, Lock, Eye, EyeOff, Server, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarSetupProps {
  config: CalendarConfig;
  onUpdateConfig: (newConfig: CalendarConfig) => void;
  onBack: () => void;
}

export const CalendarSetup: React.FC<CalendarSetupProps> = ({ config, onUpdateConfig, onBack }) => {
  const [syncData, setSyncData] = useState<{ raw: any[], sanitized: EnergyBlock[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setSyncData(null);
    const data = await runCalendarSync(config);
    setSyncData(data);
    setLoading(false);
  };

  const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${checked ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-zinc-700' : 'bg-zinc-200'}`}>
        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-zinc-200 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="text-zinc-400 hover:text-zinc-900 mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-light text-zinc-900">The Airlock</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest">Calendar Adapter v1.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* 1. Source Configuration */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center">
            <Server size={12} className="mr-1" /> Data Ingestion Sources
          </h3>
          <div className="grid gap-2">
            <Toggle 
              label="Google Calendar (Work)" 
              checked={config.sources.google_work} 
              onChange={() => onUpdateConfig({ ...config, sources: { ...config.sources, google_work: !config.sources.google_work } })}
            />
            <Toggle 
              label="iCloud (Personal)" 
              checked={config.sources.icloud_personal} 
              onChange={() => onUpdateConfig({ ...config, sources: { ...config.sources, icloud_personal: !config.sources.icloud_personal } })}
            />
            <Toggle 
              label="Outlook (Clients)" 
              checked={config.sources.outlook_client} 
              onChange={() => onUpdateConfig({ ...config, sources: { ...config.sources, outlook_client: !config.sources.outlook_client } })}
            />
          </div>
        </section>

        {/* 2. Ghost Filters */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center">
            <EyeOff size={12} className="mr-1" /> Ghost Filters
          </h3>
          <div className="grid gap-2">
             <Toggle 
              label="Ignore All-Day Events" 
              checked={config.filters.ignore_all_day} 
              onChange={() => onUpdateConfig({ ...config, filters: { ...config.filters, ignore_all_day: !config.filters.ignore_all_day } })}
            />
            <Toggle 
              label="Treat 'Focus Time' as Free" 
              checked={config.filters.focus_time_is_free} 
              onChange={() => onUpdateConfig({ ...config, filters: { ...config.filters, focus_time_is_free: !config.filters.focus_time_is_free } })}
            />
          </div>
        </section>

        {/* 3. Airlock Visualizer */}
        <section className="pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-sm font-bold text-zinc-900">Privacy Check</h3>
                <p className="text-xs text-zinc-500">Verify what the Agent sees.</p>
             </div>
             <button 
               onClick={handleSync}
               disabled={loading}
               className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wide hover:bg-emerald-600 disabled:opacity-50"
             >
               {loading ? <RefreshCw className="animate-spin mr-2" size={14} /> : <ShieldCheck className="mr-2" size={14} />}
               Run Sync
             </button>
          </div>

          <AnimatePresence>
            {syncData && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-4"
              >
                {/* RAW COLUMN */}
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 overflow-hidden">
                   <div className="flex items-center text-rose-700 mb-2 border-b border-rose-200 pb-2">
                      <Eye size={12} className="mr-1" />
                      <span className="text-[10px] font-bold uppercase">Raw Input (Discarded)</span>
                   </div>
                   <div className="space-y-2">
                      {syncData.raw.map((evt, i) => (
                        <div key={i} className="bg-white/50 p-2 rounded text-[10px] text-rose-900 font-mono border border-rose-100">
                           <div className="font-bold truncate">{evt.summary}</div>
                           <div className="opacity-75">{new Date(evt.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* SANITIZED COLUMN */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 overflow-hidden">
                   <div className="flex items-center text-emerald-700 mb-2 border-b border-emerald-200 pb-2">
                      <Lock size={12} className="mr-1" />
                      <span className="text-[10px] font-bold uppercase">Sanitized (Stored)</span>
                   </div>
                   <div className="space-y-2">
                      {syncData.sanitized.map((block, i) => (
                        <div key={i} className="bg-white/50 p-2 rounded text-[10px] text-emerald-900 font-mono border border-emerald-100 relative">
                           <div className="flex justify-between">
                              <span className="font-bold">{block.privacy_mask}</span>
                              <span className="bg-emerald-200 text-emerald-800 px-1 rounded">{block.energy_drain_score}%</span>
                           </div>
                           <div className="opacity-75">{new Date(block.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                           {block.can_be_interrupted_by.length > 0 && (
                             <div className="mt-1 text-[8px] uppercase tracking-tighter text-emerald-600">
                               Allowed: {block.can_be_interrupted_by[0]}
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!syncData && !loading && (
            <div className="text-center p-8 text-zinc-400 text-xs italic border border-dashed border-zinc-300 rounded-lg">
              Press "Run Sync" to simulate the ingestion pipeline.
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
