
import { GoogleGenAI } from "@google/genai";
import { ContextInput, GoldenTicket } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// MOCK: If Maps API is not enabled or fails, use this fallback to ensure app functionality
const FALLBACK_TICKET: GoldenTicket = {
  suggestion_id: "mock_fallback_123",
  venue: {
    name: "The Electric Diner",
    address: "191 Portobello Rd, London",
    google_maps_link: "https://maps.google.com/?q=Electric+Diner",
    rating: 4.5
  },
  reasoning_badge: "🍔 Comfort Food",
  agent_note: "Since it's raining and you both love low-key vibes, I picked a diner with booths.",
  action_buttons: [
    { label: "Send Invite", action: "SHARE_WHATSAPP" },
    { label: "Book Table", action: "OPEN_RESY" }
  ]
};

export const generateContextSuggestion = async (input: ContextInput): Promise<GoldenTicket> => {
  if (!ai) return FALLBACK_TICKET;

  const { users, constraints } = input;
  const userA = users[0];
  const userB = users[1];

  // --- STEP 1: THE VIBE SYNTHESIS (Abstract) ---
  const vibePrompt = `
    You are a social planner.
    User A: ${userA.name} (Status: ${userA.current_status}).
    User B: ${userB.name} (Status: ${userB.current_status}).
    Context: It is ${constraints.weather_description}. Time: ${constraints.time_start}.
    Shared Interests: [Derived from app context].
    
    Goal: Generate 2 specific Google Maps search queries for a venue.
    Rules:
    1. If weather is bad, strictly indoors.
    2. If status is RECHARGE/LOW, quiet places.
    3. If status is OPEN/HIGH, active places.
    
    Output only the 2 query strings separated by | symbol.
  `;

  let queries = ["Quiet bar", "Cozy cafe"];
  try {
    const vibeResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: vibePrompt
    });
    if (vibeResp.text) {
      queries = vibeResp.text.split('|').map(s => s.trim());
    }
  } catch (e) {
    console.warn("Vibe Step Failed", e);
  }

  // --- STEP 2: THE GROUNDING (Real World Data) ---
  // We use the first query to find a real place
  const searchBuffer = queries[0] || "Coffee shop";
  const groundPrompt = `
    Find a real place matching "${searchBuffer}" near coordinates ${constraints.location_centroid.lat}, ${constraints.location_centroid.lng}.
    It must be open at ${constraints.time_start}.
    Tell me the name, address, and a short reason why it fits.
  `;

  let groundedVenue: any = { name: "Local Spot", address: "Nearby" };
  let mapsUri = "";

  try {
    const groundResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: groundPrompt,
      config: {
        tools: [{ googleMaps: {} }] // THE MAGIC: Grounding
      }
    });
    
    // Extract Grounding Metadata
    const chunks = groundResp.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
       // Look for a map entry
       const mapChunk = chunks.find(c => c.web?.uri || (c as any).maps?.uri); // Type definition might vary in SDK, safe check
       if (mapChunk) {
          mapsUri = mapChunk.web?.uri || (mapChunk as any).maps?.uri || "";
       }
    }

    // Parse the text for name/address (Gemini usually returns conversational text)
    // For this specific "Engine", we ideally want JSON, but Maps Grounding returns text.
    // We will use the text as the "Agent Note" foundation and try to extract Name heuristically or via a second pass.
    // To keep latency low, we will assume the response contains the name.
    groundedVenue.name = "Recommended Venue"; // Fallback if parsing fails
    groundedVenue.desc = groundResp.text;
    
  } catch (e) {
    console.warn("Grounding Step Failed (Likely API Config)", e);
    return FALLBACK_TICKET;
  }

  // --- STEP 3: THE PITCH (Formatting) ---
  const finalPrompt = `
    Create a "Golden Ticket" JSON for this venue recommendation.
    
    Venue Info from Search: ${groundedVenue.desc}
    Maps Link: ${mapsUri}
    User A: ${userA.name}, User B: ${userB.name}.
    Weather: ${constraints.weather_description}.
    
    Output JSON Format:
    {
      "venue": { "name": "extracted name", "address": "extracted address" },
      "reasoning_badge": "Short 2-3 word vibe summary with emoji",
      "agent_note": "One sentence hook explaining why this specific place fits the users and weather."
    }
  `;

  try {
     const finalResp = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: finalPrompt,
       config: { responseMimeType: "application/json" }
     });
     
     const json = JSON.parse(finalResp.text || "{}");
     
     return {
       suggestion_id: `sug_${Date.now()}`,
       venue: {
         name: json.venue?.name || "Selected Spot",
         address: json.venue?.address || "City Center",
         google_maps_link: mapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(json.venue?.name)}`,
         rating: 4.5
       },
       reasoning_badge: json.reasoning_badge || "✨ Great Match",
       agent_note: json.agent_note || "A perfect spot for the current vibe.",
       action_buttons: [
         { label: "Send Invite", action: "SHARE_WHATSAPP" },
         { label: "Book Table", action: "OPEN_RESY" }
       ]
     };

  } catch (e) {
    console.error("Context Engine Final Step Error", e);
    return FALLBACK_TICKET;
  }
};
