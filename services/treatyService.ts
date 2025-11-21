
import { User, ConnectionTier, Treaty } from '../types';

/**
 * Simulates the 'generate-treaty' Supabase Edge Function.
 * 
 * In a production environment, this would be:
 * const { data } = await supabase.functions.invoke('generate-treaty', { body: { ... } })
 */
export const draftTreaty = async (
  user: User, 
  tier: ConnectionTier, 
  includeStatus: boolean
): Promise<Treaty> => {
  
  // Simulate Network Latency (Wait for the "Server")
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Generate unique IDs acting as the database primary key
  const id = `treaty_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // The "Magic Code" derived from the ID (in reality, usually a short hash of the UUID)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase(); 
  
  // Backend logic: 48 Hour Expiry
  const expiresAt = Date.now() + (48 * 60 * 60 * 1000);

  // Create the snapshot based on user choice
  const snapshotNote = includeStatus 
    ? `Current Status: ${user.current_status.replace('_', ' ')}. Comm Policy: ${user.communication_policy.text_response_time} response time.` 
    : "Let's sync protocols.";

  return {
    id,
    initiator_id: user.id,
    target_tier: tier,
    status: 'PENDING',
    code: code,
    created_at: Date.now(),
    expires_at: expiresAt,
    custom_message: snapshotNote
  };
};
