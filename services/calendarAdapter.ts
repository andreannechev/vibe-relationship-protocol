
import { EnergyBlock, CalendarConfig, ConnectionTier, EnergyCategory } from '../types';

// --- 1. MOCK DATA INGESTION ---
// Generates realistic "Raw" calendar events including PII
export const mockFetchRawEvents = async (config: CalendarConfig) => {
  // Simulate API Latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const today = new Date();
  today.setHours(0,0,0,0);

  // Helper to create date
  const at = (h: number, m: number = 0) => {
    const d = new Date(today);
    d.setHours(h, m);
    return d.toISOString();
  };

  const rawEvents: any[] = [];

  if (config.sources.google_work) {
    rawEvents.push(
      { summary: "Q3 Financial Review with Steve", start: at(10), end: at(11, 30), source: 'google_work' },
      { summary: "Team Sync", start: at(13), end: at(13, 30), source: 'google_work' },
      { summary: "URGENT: Client Fire Drill", start: at(15), end: at(16), source: 'google_work' }
    );
  }

  if (config.sources.icloud_personal) {
    rawEvents.push(
      { summary: "Therapy with Dr. Jones", start: at(17), end: at(18), source: 'icloud_personal' },
      { summary: "Lunch with Sarah", start: at(12), end: at(13), source: 'icloud_personal' },
      { summary: "Gym - Leg Day", start: at(7), end: at(8, 30), source: 'icloud_personal' }
    );
  }

  if (config.sources.outlook_client) {
     rawEvents.push(
       { summary: "Contract Negotiation", start: at(14), end: at(15), source: 'outlook_client' }
     );
  }

  // Ghost Filter Test: All Day Event
  rawEvents.push({ summary: "Thanksgiving", start: at(0), end: at(23, 59), allDay: true, source: 'holiday_cal' });

  // Ghost Filter Test: Focus Time
  if (config.sources.google_work) {
     rawEvents.push({ summary: "Focus Time", start: at(9), end: at(10), source: 'google_work' });
  }

  return rawEvents;
};


// --- 2. HEURISTIC ENGINE ---
// Calculates how tired a user gets based on keywords
const calculateEnergyDrain = (title: string, durationMinutes: number): number => {
  const t = title.toLowerCase();
  const panicWords = ['deadline', 'urgent', 'important', 'review', 'fire', 'negotiation'];
  const chillWords = ['lunch', 'coffee', 'gym', 'walk', 'break'];
  const wellnessWords = ['therapy', 'doctor', 'meditation', 'yoga'];

  let score = 50; // Baseline

  if (panicWords.some(w => t.includes(w))) score += 40;
  if (chillWords.some(w => t.includes(w))) score -= 30;
  if (wellnessWords.some(w => t.includes(w))) score -= 10; // Wellness is good but takes emotional energy
  
  // Duration Penalty: Long meetings drain more
  if (durationMinutes > 90) score += 20;
  if (durationMinutes < 30) score -= 10;

  return Math.min(Math.max(score, 0), 100);
};


// --- 3. THE SCRUBBER (Privacy Layer) ---
// Transforms raw event into safe EnergyBlock
export const processEvents = (rawEvents: any[], config: CalendarConfig): EnergyBlock[] => {
  
  return rawEvents
    .filter(event => {
      // Ghost Filter: Ignore All Day?
      if (event.allDay && config.filters.ignore_all_day) return false;
      
      // Ghost Filter: Focus Time?
      if (event.summary.toLowerCase().includes('focus time') && config.filters.focus_time_is_free) return false;
      
      return true;
    })
    .map((event, index) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      const title = event.summary.toLowerCase();
      const energyScore = calculateEnergyDrain(event.summary, durationMinutes);
      
      let category: EnergyCategory = 'MISC';
      let privacyMask = 'Busy';

      // Categorization Logic
      if (['therapy', 'doctor', 'medical', 'gym', 'yoga'].some(w => title.includes(w))) {
        category = 'WELLNESS';
        privacyMask = 'Health/Wellness';
      } else if (['lunch', 'dinner', 'drinks', 'date', 'party'].some(w => title.includes(w))) {
        category = 'SOCIAL';
        privacyMask = 'Social';
      } else if (['flight', 'train', 'commute'].some(w => title.includes(w))) {
        category = 'TRAVEL';
        privacyMask = 'Transit';
      } else if (['review', 'sync', 'meeting', 'call', 'deadline', 'client'].some(w => title.includes(w)) || event.source === 'google_work') {
        category = energyScore > 70 ? 'WORK_HIGH' : 'WORK_LOW';
        privacyMask = energyScore > 70 ? 'Deep Work' : 'Work';
      }

      // Interruption Logic based on Energy Score
      let interruptibleBy: ConnectionTier[] = [];
      if (energyScore < 30) interruptibleBy = [ConnectionTier.INNER_CIRCLE, ConnectionTier.FRIEND];
      else if (energyScore < 60) interruptibleBy = [ConnectionTier.INNER_CIRCLE];
      else interruptibleBy = []; // High drain = Zero interruption

      return {
        id: `block_${index}`,
        start_time: event.start,
        end_time: event.end,
        is_blocking: true,
        category,
        privacy_mask: privacyMask,
        energy_drain_score: energyScore,
        can_be_interrupted_by: interruptibleBy
      };
    });
};

// Main Adapter Function
export const runCalendarSync = async (config: CalendarConfig) => {
  const raw = await mockFetchRawEvents(config);
  const sanitized = processEvents(raw, config);
  return { raw, sanitized };
};
