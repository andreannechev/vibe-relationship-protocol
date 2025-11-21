
import { User, Relationship, UserStatus, ProtocolCode, ProtocolOutcome, HandshakeLog } from '../types';

// MOCK: Generates random free slots for a user for the next 3 days
const generateMockSlots = (user: User) => {
  const slots: string[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0); // Round to hour

  // 3 Days of slots
  for (let i = 1; i <= 3; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() + i);
    
    // Work hours 9-18 usually blocked if status is FLOW
    const startHour = user.current_status === UserStatus.FLOW_STATE ? 19 : 10;
    const endHour = 21;

    for (let h = startHour; h < endHour; h++) {
      // Randomly decide if free (70% chance)
      if (Math.random() > 0.3) {
         day.setHours(h);
         slots.push(day.toISOString());
      }
    }
  }
  return slots;
};

// Helper to get polite human messages
const getHumanMessage = (code: ProtocolCode, friendName: string): string => {
  switch (code) {
    case ProtocolCode.REJ_HARD: return "Unable to sync schedules right now.";
    case ProtocolCode.REJ_BATTERY: return `${friendName} is taking some downtime. Try later.`;
    case ProtocolCode.REJ_CALENDAR: return "Schedules didn't align this week.";
    case ProtocolCode.REJ_DRIFT: return "Let's give it a few weeks before reconnecting.";
    case ProtocolCode.REJ_QUOTA: return `${friendName} is fully booked this week.`;
    case ProtocolCode.SUCCESS: return "Connection secure. Time slot found.";
    default: return "Negotiation failed.";
  }
};

export const runHandshakeProtocol = async (
  initiator: User,
  receiver: User,
  relationship: Relationship
): Promise<ProtocolOutcome> => {
  const logs: HandshakeLog[] = [];
  const addLog = (step: HandshakeLog['step'], actor: HandshakeLog['actor'], payload: any) => {
    logs.push({ step, actor, payload, timestamp: Date.now() });
  };

  // --- STEP 0: REFLECTION CHECK (Internal Monologue) ---
  // The Initiator consults the Mirror before reaching out.
  const reflectionHistory = relationship.reflection_logs || [];
  const latestReflection = reflectionHistory.length > 0 
    ? reflectionHistory.sort((a, b) => b.date - a.date)[0] 
    : null;

  if (latestReflection) {
     addLog('INTERNAL_CHECK', 'INITIATOR', {
       source: 'REFLECTION_AGENT',
       status: 'INSIGHT_FOUND',
       insight: latestReflection.summary.insight,
       vibe: latestReflection.summary.vibe
     });
     
     // Simulate processing time for the check
     await new Promise(r => setTimeout(r, 500));
  } else {
      addLog('INTERNAL_CHECK', 'INITIATOR', {
       source: 'REFLECTION_AGENT',
       status: 'NO_DATA',
       message: 'No prior reflection logs found. Proceeding with standard protocol.'
     });
     await new Promise(r => setTimeout(r, 300));
  }

  // --- STEP 1: THE SYN (Initiator) ---
  // Agent A creates the intent
  const intent = {
    category: 'SOCIAL_CATCHUP',
    proposed_modality: relationship.interaction_mode,
    energy_cost: 'MEDIUM'
  };
  
  addLog('SYN', 'INITIATOR', {
    target_id: receiver.id,
    intent,
    signature: 'hmac_mock_sig_123'
  });

  // Simulate Network Delay
  await new Promise(r => setTimeout(r, 600));

  // --- STEP 2: THE ACK/NACK (Receiver Gatekeeper) ---
  // Agent B validates policy
  
  // Gate 1: Status Check
  if (receiver.current_status === UserStatus.RECHARGE) {
    addLog('TERM', 'RECEIVER', { code: ProtocolCode.REJ_BATTERY, reason: "User status is RECHARGE" });
    return { success: false, code: ProtocolCode.REJ_BATTERY, humanMessage: getHumanMessage(ProtocolCode.REJ_BATTERY, receiver.name), logs };
  }

  if (receiver.current_status === UserStatus.FLOW_STATE) {
      // Soft reject or very limited slots. Let's strict reject for MVP.
      // Or maybe allow it but only if Initiator is Inner Circle?
      if (relationship.tier !== 'INNER_CIRCLE') {
        addLog('TERM', 'RECEIVER', { code: ProtocolCode.REJ_BATTERY, reason: "User in FLOW, only Inner Circle allowed." });
        return { success: false, code: ProtocolCode.REJ_BATTERY, humanMessage: `${receiver.name} is in Flow State.`, logs };
      }
  }

  // Gate 2: Quota Check (Mocked)
  // In real app, we'd check database for count of events this week
  // Here we just use random chance if max events is low
  if (receiver.directives.social_policy.max_social_events_per_week < 2 && Math.random() > 0.5) {
     addLog('TERM', 'RECEIVER', { code: ProtocolCode.REJ_QUOTA, reason: "Weekly social quota exceeded" });
     return { success: false, code: ProtocolCode.REJ_QUOTA, humanMessage: getHumanMessage(ProtocolCode.REJ_QUOTA, receiver.name), logs };
  }

  // Gate 3: Calendar Intersection (The Blind Slots)
  const receiverRealSlots = generateMockSlots(receiver);
  
  // Slot Fuzzing: Randomly pick subset and offset slightly to not reveal exact calendar
  const blindSlots = receiverRealSlots
    .filter(() => Math.random() > 0.3) // Hide 30% of slots
    .map(s => {
      // Maybe add 30 mins
      if (Math.random() > 0.5) {
        const d = new Date(s);
        d.setMinutes(30);
        return d.toISOString();
      }
      return s;
    });

  if (blindSlots.length === 0) {
    addLog('TERM', 'RECEIVER', { code: ProtocolCode.REJ_CALENDAR, reason: "No available slots after masking" });
    return { success: false, code: ProtocolCode.REJ_CALENDAR, humanMessage: getHumanMessage(ProtocolCode.REJ_CALENDAR, receiver.name), logs };
  }

  addLog('ACK', 'RECEIVER', {
    status: 'NEGOTIATING',
    receiver_state: { vibe: receiver.current_status === UserStatus.OPEN ? 'SOCIAL' : 'LOW_KEY' },
    blind_slots_count: blindSlots.length,
    blind_slots_sample: blindSlots.slice(0, 2)
  });

  await new Promise(r => setTimeout(r, 800));

  // --- STEP 3: THE PROPOSE (Initiator) ---
  // Agent A checks its own calendar against blind slots
  const initiatorSlots = generateMockSlots(initiator);
  
  // Find simple intersection (string match for MVP, real app uses time ranges)
  // In simulation, we just pick the first blind slot that looks "good"
  const selectedSlot = blindSlots[0]; // Naive selection

  if (!selectedSlot) {
     addLog('TERM', 'INITIATOR', { code: ProtocolCode.REJ_CALENDAR, reason: "Initiator could not match any blind slots" });
     return { success: false, code: ProtocolCode.REJ_CALENDAR, humanMessage: getHumanMessage(ProtocolCode.REJ_CALENDAR, receiver.name), logs };
  }

  addLog('PROPOSE', 'INITIATOR', {
    selected_slot: selectedSlot,
    context_suggestion: {
       title: "Social Catchup",
       location_type: "QUIET_BAR",
       reasoning: "Matched vibes."
    }
  });

  await new Promise(r => setTimeout(r, 600));

  // --- STEP 4: THE COMMIT (Receiver) ---
  // Agent B finalizes
  addLog('COMMIT', 'RECEIVER', {
    status: 'CONFIRMED',
    notification_triggered: true
  });

  return {
    success: true,
    code: ProtocolCode.SUCCESS,
    humanMessage: getHumanMessage(ProtocolCode.SUCCESS, receiver.name),
    finalSlot: selectedSlot,
    logs
  };
};