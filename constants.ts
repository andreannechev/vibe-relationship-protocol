
import { User, UserStatus, BioRhythm, CommunicationPolicy, Relationship, ConnectionTier, InteractionMode, CommPolicyLevel, Directives, CalendarConfig, NeuralBridgeConfig, SignalTemplate } from './types';

export const APP_COLORS = {
  background: 'bg-zinc-50',
  surface: 'bg-white',
  text: 'text-zinc-800',
  textMuted: 'text-zinc-500',
  border: 'border-zinc-200',
  status: {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-400',
    red: 'bg-rose-500',
    textGreen: 'text-emerald-600',
    textYellow: 'text-amber-600',
    textRed: 'text-rose-600',
  }
};

export const DEFAULT_DIRECTIVES: Directives = {
  system_permissions: {
    calendar_granularity: 'BUSY_FREE',
    location_precision: 'CITY',
    health_sync: false
  },
  agent_autonomy: {
    level: 'CHIEF_OF_STAFF'
  },
  social_policy: {
    blackout_windows: [
      { day: 'Monday', start: '09:00', end: '18:00', reason: 'Deep Work' },
      { day: 'Sunday', start: '00:00', end: '23:59', reason: 'Family Day' }
    ],
    max_social_events_per_week: 3
  }
};

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  sources: {
    google_work: true,
    icloud_personal: true,
    outlook_client: false
  },
  filters: {
    ignore_all_day: true,
    focus_time_is_free: false
  },
  work_hours: {
    enabled: true,
    start: "09:00",
    end: "18:00"
  }
};

export const DEFAULT_NEURAL_CONFIG: NeuralBridgeConfig = {
  enabled: false,
  input_source: 'MANUAL_PASTE',
  last_sync_status: 'NEVER',
  current_vibe: null
};

// STATIC SIGNAL LIBRARY (Fallback for Reconnection Engine)
export const STATIC_SIGNAL_LIBRARY: SignalTemplate[] = [
  { type: 'NOSTALGIA', text: "Walked past that coffee spot we used to go to. Hope you're doing well.", copy_to_clipboard: true },
  { type: 'VIBE', text: "Saw this and thought of you. No reply needed, just sharing the vibe.", copy_to_clipboard: true },
  { type: 'PLAYFUL', text: "Contractually obligated quarterly check-in. 🖖", copy_to_clipboard: true },
  { type: 'PLAYFUL', text: "Sending a high-five from across the internet.", copy_to_clipboard: true },
  { type: 'NOSTALGIA', text: "Thinking about that time we [Memory]. Good times.", copy_to_clipboard: true }
];

// Mock Memory for Simulation
export const MOCK_USER_MEMORY = `
User: I'm feeling really drained today. Work was a nightmare with the Q3 review.
AI: I'm sorry to hear that. Do you want to talk about the review?
User: No, I just want to disconnect. Maybe listen to some jazz or read that sci-fi book I bought.
AI: That sounds restorative. "Dune" is great for escapism.
User: Exactly. I don't want to see anyone tonight.
`;

// Mock Current User (Self)
export const CURRENT_USER_ID = 'user-self';

export const MOCK_SELF: User = {
  id: CURRENT_USER_ID,
  name: "Alex",
  current_status: UserStatus.OPEN,
  avatar_url: "https://picsum.photos/100/100",
  bio_rhythm: {
    morning_person: true,
    weekend_availability: 'HIGH'
  },
  communication_policy: {
    voice_notes: CommPolicyLevel.LOVE,
    unannounced_calls: CommPolicyLevel.BLOCK,
    text_response_time: "4H"
  },
  directives: DEFAULT_DIRECTIVES,
  calendar_config: DEFAULT_CALENDAR_CONFIG,
  neural_config: DEFAULT_NEURAL_CONFIG
};

// Mock Friends
export const MOCK_FRIENDS: User[] = [
  {
    id: 'user-1',
    name: 'Sarah',
    current_status: UserStatus.FLOW_STATE,
    avatar_url: "https://picsum.photos/101/101",
    bio_rhythm: { morning_person: false, weekend_availability: 'HIGH' },
    communication_policy: { voice_notes: CommPolicyLevel.TOLERATE, unannounced_calls: CommPolicyLevel.BLOCK, text_response_time: "2H" },
    directives: {
      ...DEFAULT_DIRECTIVES,
      social_policy: { ...DEFAULT_DIRECTIVES.social_policy, max_social_events_per_week: 1 }
    },
    calendar_config: DEFAULT_CALENDAR_CONFIG,
    neural_config: DEFAULT_NEURAL_CONFIG
  },
  {
    id: 'user-2',
    name: 'Marcus',
    current_status: UserStatus.OPEN,
    avatar_url: "https://picsum.photos/102/102",
    bio_rhythm: { morning_person: true, weekend_availability: 'LOW' },
    communication_policy: { voice_notes: CommPolicyLevel.LOVE, unannounced_calls: CommPolicyLevel.LOVE, text_response_time: "12H" },
    directives: {
      ...DEFAULT_DIRECTIVES,
      agent_autonomy: { level: 'PROMOTER' }
    },
    calendar_config: DEFAULT_CALENDAR_CONFIG,
    neural_config: DEFAULT_NEURAL_CONFIG
  },
  {
    id: 'user-3',
    name: 'Elena',
    current_status: UserStatus.RECHARGE,
    avatar_url: "https://picsum.photos/103/103",
    bio_rhythm: { morning_person: false, weekend_availability: 'LOW' },
    communication_policy: { voice_notes: CommPolicyLevel.BLOCK, unannounced_calls: CommPolicyLevel.BLOCK, text_response_time: "48H" },
    directives: DEFAULT_DIRECTIVES,
    calendar_config: DEFAULT_CALENDAR_CONFIG,
    neural_config: DEFAULT_NEURAL_CONFIG
  },
  {
    id: 'user-4',
    name: 'David',
    current_status: UserStatus.TRAVEL,
    avatar_url: "https://picsum.photos/104/104",
    bio_rhythm: { morning_person: true, weekend_availability: 'HIGH' },
    communication_policy: { voice_notes: CommPolicyLevel.LOVE, unannounced_calls: CommPolicyLevel.TOLERATE, text_response_time: "6H" },
    directives: DEFAULT_DIRECTIVES,
    calendar_config: DEFAULT_CALENDAR_CONFIG,
    neural_config: DEFAULT_NEURAL_CONFIG
  }
];

// Mock Relationships (Self -> Friend)
export const MOCK_RELATIONSHIPS: Relationship[] = [
  {
    user_a: CURRENT_USER_ID,
    user_b: 'user-1',
    tier: ConnectionTier.INNER_CIRCLE,
    drift_threshold_days: 7,
    last_interaction: Date.now() - (1000 * 60 * 60 * 24 * 8), // 8 days ago (Drifted)
    interaction_mode: InteractionMode.DIGITAL_OK,
    shared_interests: ["Modernist Architecture", "Coffee", "Sci-Fi"],
    annotations: {
      tags: ["Inner Circle", "College"],
      energy_requirement: "MEDIUM",
      notes: "Sarah hates early morning texts. Love her dog, Rover.",
      manual_override: { active: false, forced_status: UserStatus.OPEN }
    }
  },
  {
    user_a: CURRENT_USER_ID,
    user_b: 'user-2',
    tier: ConnectionTier.FRIEND,
    drift_threshold_days: 14,
    last_interaction: Date.now() - (1000 * 60 * 60 * 24 * 2),
    interaction_mode: InteractionMode.ANY,
    shared_interests: ["Jazz", "Squash", "Coding"],
    annotations: {
      tags: ["Squash Buddy", "Tech"],
      energy_requirement: "HIGH",
      notes: "Marcus is always down for a spontaneous hang.",
      manual_override: { active: false, forced_status: UserStatus.OPEN }
    }
  },
  {
    user_a: CURRENT_USER_ID,
    user_b: 'user-3',
    tier: ConnectionTier.INNER_CIRCLE,
    drift_threshold_days: 30,
    last_interaction: Date.now() - (1000 * 60 * 60 * 24 * 40), // 40 days (Drifted)
    interaction_mode: InteractionMode.IRL_ONLY,
    shared_interests: ["Pottery", "Wine", "Silence"],
    annotations: {
      tags: ["Art", "Quiet"],
      energy_requirement: "LOW",
      notes: "Elena needs space. Don't double text.",
      manual_override: { active: false, forced_status: UserStatus.OPEN }
    }
  },
  {
    user_a: CURRENT_USER_ID,
    user_b: 'user-4',
    tier: ConnectionTier.ACQUAINTANCE,
    drift_threshold_days: 60,
    last_interaction: Date.now() - (1000 * 60 * 60 * 24 * 5),
    interaction_mode: InteractionMode.DIGITAL_OK,
    shared_interests: ["Tech", "Startups"],
    annotations: {
      tags: ["Networking"],
      energy_requirement: "MEDIUM",
      notes: "",
      manual_override: { active: false, forced_status: UserStatus.OPEN }
    }
  }
];
