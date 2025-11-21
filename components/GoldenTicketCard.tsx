
import React from 'react';
import { GoldenTicket } from '../types';
import { MapPin, Star, ExternalLink, Zap, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoldenTicketCardProps {
  ticket: GoldenTicket;
}

export const GoldenTicketCard: React.FC<GoldenTicketCardProps> = ({ ticket }) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-sm bg-white border border-zinc-200 overflow-hidden shadow-xl relative"
    >
      {/* Decorative Top Border */}
      <div className="h-2 w-full bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900" />

      {/* Vibe Badge */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
          {ticket.reasoning_badge}
        </span>
      </div>

      <div className="p-6 pt-8">
        {/* Venue Name */}
        <h2 className="text-2xl font-light text-zinc-900 leading-tight mb-1">
          {ticket.venue.name}
        </h2>
        <div className="flex items-center text-zinc-500 text-sm mb-6">
          <MapPin size={14} className="mr-1" />
          <span className="truncate max-w-[200px]">{ticket.venue.address}</span>
          {ticket.venue.rating && (
             <span className="flex items-center ml-3 text-amber-500 font-medium">
               <Star size={12} fill="currentColor" className="mr-1" />
               {ticket.venue.rating}
             </span>
          )}
        </div>

        {/* The Hook (Agent Note) */}
        <div className="bg-zinc-50 p-4 border-l-2 border-zinc-900 italic text-zinc-700 text-sm font-serif leading-relaxed mb-6">
          "{ticket.agent_note}"
        </div>

        {/* Actions */}
        <div className="space-y-3">
           {ticket.action_buttons.map((btn, idx) => (
             <button
               key={idx}
               className={`w-full py-3 flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-colors
                 ${idx === 0 
                   ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                   : 'bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50'}
               `}
             >
               {btn.label}
             </button>
           ))}
           
           {ticket.venue.google_maps_link && (
             <a 
               href={ticket.venue.google_maps_link} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center justify-center text-[10px] text-zinc-400 hover:text-zinc-600 mt-4 uppercase tracking-wide font-bold"
             >
               <Navigation size={12} className="mr-1" />
               View on Maps
             </a>
           )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-zinc-50 p-2 text-center border-t border-zinc-100">
        <div className="flex items-center justify-center text-[9px] text-zinc-300 uppercase tracking-[0.2em]">
           <Zap size={8} className="mr-1" />
           Context Engine Generated
        </div>
      </div>

    </motion.div>
  );
};
