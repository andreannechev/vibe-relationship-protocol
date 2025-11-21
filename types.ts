
// Core Enums from PRD
export enum UserStatus {
  FLOW_STATE = 'FLOW_STATE', // Red
  RECHARGE = 'RECHARGE',     // Red
  TRAVEL = 'TRAVEL',         // Yellow
  OPEN = 'OPEN'              // Green
}

export enum ConnectionTier {
  INNER_CIRCLE = 'INNER_CIRCLE',
  FRIEND = 'FRIEND',
  ACQUAINTANCE = 'ACQUAINTANCE'
}

export enum InteractionMode {
  IRL_ONLY = 'IRL_ONLY',
  DIGITAL_OK = 'DIGITAL_OK',
  ANY = 'ANY'
}

export enum CommPolicyLevel {
  LOVE = 'LOVE',
  BLOCK = 'BLOCK',
  TOLERATE = 'TOLERATE'
}

// Directives Module Types
export type CalendarGranularity = 'BUSY_FREE' | 'FULL_CONTEXT';
export type LocationPrecision = 'CITY' | 'NEIGHBORHOOD' | 'PRECISE';
export type AgentAutonomyLevel = 'LIBRARIAN' | 'CHIEF_OF_STAFF' | 'PROMOTER';

export interface BlackoutWindow {
  day: string; // e.g. "Monday"
  start: string; // "09:00"
  end: string; // "18:00"
  reason: string;
}

export interface Directives {
  system_permissions: {
    calendar_granularity: CalendarGranularity;
    location_precision: LocationPrecision;
    health_sync: boolean;
  };
  agent_autonomy: {
    level: AgentAutonomyLevel;
  };
  social_policy: {
    blackout_windows: BlackoutWindow[];
    max_social_events_per_week: number;
  };
}

// --- CALENDAR ADAPTER TYPES ---
export type EnergyCategory = 'WORK_HIGH' | 'WORK_LOW' | 'SOCIAL' | 'WELLNESS' | 'TRAVEL' | 'MISC';

export interface CalendarConfig {
  sources: {
    google_work: boolean;
    icloud_personal: boolean;
    outlook_client: boolean;
  };
  filters: {
    ignore_all_day: boolean;
    focus_time_is_free: boolean;
  };
  work_hours: {
    enabled: boolean;
    start: string; // "09:00"
    end: string; // "18:00"
  };
}

export interface EnergyBlock {
  id: string;
  start_time: string;
  end_time: string;
  is_blocking: boolean;
  category: EnergyCategory;
  privacy_mask: string; // e.g. "Busy", "Deep Work", "Wellness"
  energy_drain_score: number; // 0-100
  can_be_interrupted_by: ConnectionTier[]; // Derived from drain score
}

// --- CONTEXT ENGINE TYPES ---
export interface ContextInput {
  users: User[]; // [Initiator, Receiver]
  constraints: {
    time_start: string;
    duration_minutes: number;
    location_centroid: { lat: number; lng: number };
    weather_description: string;
  };
}

export interface Venue {
  name: string;
  address: string;
  google_maps_link?: string;
  photo_url?: string;
  rating?: number;
}

export interface GoldenTicket {
  suggestion_id: string;
  venue: Venue;
  reasoning_badge: string; // e.g. "🍷 Quiet Wine Night"
  agent_note: string; // The "Pitch"
  action_buttons: { label: string; action: string }[];
}

// --- NEURAL BRIDGE TYPES ---
export type SocialAppetite = 'LOW' | 'NEUTRAL' | 'HIGH';

export interface VibeSignal {
  current_topics: string[]; // Max 3 abstract topics e.g. ["Sci-Fi", "Coding"]
  energy_level: number; // 0-100
  social_appetite: SocialAppetite;
  last_extracted: number; // Timestamp
}

export interface NeuralBridgeConfig {
  enabled: boolean;
  input_source: 'MANUAL_PASTE' | 'OPENAI_API' | 'LOCAL_LLM';
  last_sync_status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'NEVER';
  current_vibe: VibeSignal | null;
}

// Data Models
export interface BioRhythm {
  morning_person: boolean;
  weekend_availability: 'HIGH' | 'LOW';
}

export interface CommunicationPolicy {
  voice_notes: CommPolicyLevel;
  unannounced_calls: CommPolicyLevel;
  text_response_time: string; // e.g. "24H"
}

export interface User {
  id: string;
  name: string;
  current_status: UserStatus;
  avatar_url?: string; // For UI visualization
  is_shadow?: boolean; // IF true, this is a "Shadow Node" (offline user)
  bio_rhythm: BioRhythm;
  communication_policy: CommunicationPolicy;
  directives: Directives;
  calendar_config: CalendarConfig;
  neural_config: NeuralBridgeConfig; // New Adapter Config
}

// --- DOSSIER ANNOTATIONS ---
export type EnergyRequirement = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RelationshipAnnotations {
  tags: string[];
  energy_requirement: EnergyRequirement;
  notes: string;
  manual_override?: {
    active: boolean;
    forced_status: UserStatus;
  };
}

// --- REFLECTION AGENT (THE MIRROR) TYPES ---
export interface ReflectionLog {
  id: string;
  date: number;
  summary: {
    update: string[];
    vibe: string;
    insight: string;
  };
  raw_transcript: string;
}

export interface Relationship {
  user_a: string; // The logged-in user
  user_b: string; // The friend
  tier: ConnectionTier;
  drift_threshold_days: number;
  last_interaction: number; // Timestamp
  interaction_mode: InteractionMode;
  shared_interests: string[];
  treaty_id?: string; // Link to the protocol agreement
  is_hidden?: boolean; // Hides from Radar/Garden
  preferred_route?: string; // e.g. "WhatsApp", "iMessage" for Shadow Nodes
  active_rhythms?: string[]; // e.g. ["weekdays_pm"] for Shadow Nodes
  annotations: RelationshipAnnotations; // Private User Data
  reflection_logs: ReflectionLog[]; // History of "Mirror" sessions
}

// --- TREATY EXCHANGE TYPES ---
export type TreatyStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export interface Treaty {
  id: string;
  initiator_id: string;
  target_tier: ConnectionTier;
  status: TreatyStatus;
  code: string; // The "Magic Link" code
  created_at: number;
  expires_at: number;
  custom_message?: string;
}

// --- SIGNAL DECK (RECONNECTION ENGINE) TYPES ---
export interface SignalTemplate {
  type: 'NOSTALGIA' | 'VIBE' | 'PLAYFUL';
  text: string;
  copy_to_clipboard: boolean;
}

export interface FriendshipOSStep {
  week: number;
  action: string;
  effort: string;
}

export interface SignalDeckData {
  signals: SignalTemplate[];
  friendship_os: {
    plan_name: string;
    steps: FriendshipOSStep[];
  };
  micro_ritual: {
    title: string;
    description: string;
  };
  energy_model: {
    cost: 'LOW' | 'MEDIUM' | 'HIGH';
    justification: string;
  };
}

// --- ARTIFACT SCOUT TYPES ---
export interface ArtifactSuggestion {
  itemName: string;
  estimatedPrice: string;
  currency: string;
  reasoning: string;
  searchQuery: string;
}

export interface ReflectionSession {
  probeQuestion: string;
  transcript: string;
}


// Application State Helper
export type DashboardMode = 'RADAR' | 'LIST' | 'GARDEN';
export type ViewState = 
  | 'DASHBOARD' 
  | 'PROFILE' 
  | 'FRIEND_DOSSIER' // The Review Buffer
  | 'NEGOTIATION' // The Scout Action (previously FRIEND_DETAIL)
  | 'DIRECTIVES' 
  | 'PROTOCOL_SIMULATOR' 
  | 'CALENDAR_SETUP' 
  | 'NEURAL_BRIDGE' 
  | 'TREATY_GENERATOR' 
  | 'SHADOW_NODE_FORM' 
  | 'SHADOW_NODE_DETAIL'
  | 'SHADOW_NODE_EDIT'
  | 'INVITE_LANDING' 
  | 'SIGNAL_DECK'
  | 'REFLECTION_MIRROR'; // New View

export interface HandshakeLog {
  step: 'INTERNAL_CHECK' | 'SYN' | 'ACK' | 'PROPOSE' | 'COMMIT' | 'TERM';
  actor: 'INITIATOR' | 'RECEIVER';
  payload: any;
  timestamp: number;
}

export enum ProtocolCode {
  SUCCESS = 'SUCCESS',
  REJ_HARD = 'REJ_HARD',       // Blocked
  REJ_BATTERY = 'REJ_BATTERY', // Low Energy / Recharge
  REJ_CALENDAR = 'REJ_CALENDAR', // No Intersection
  REJ_DRIFT = 'REJ_DRIFT',     // Cooling off
  REJ_QUOTA = 'REJ_QUOTA'      // Max events exceeded
}

export interface NegotiationResult {
  allowed: boolean;
  method?: string;
  message: string;
  suggestion?: string;
  trafficColor: 'green' | 'yellow' | 'red';
  protocolCode?: ProtocolCode;
  goldenTicket?: GoldenTicket; // The output of Context Engine
  logs?: HandshakeLog[]; // The history of the negotiation
}

export interface ProtocolOutcome {
  success: boolean;
  code: ProtocolCode;
  humanMessage: string;
  finalSlot?: string;
  logs: HandshakeLog[];
}