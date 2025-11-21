
import { GoogleGenAI, Type } from "@google/genai";
import { User, Relationship, SignalDeckData } from "../types";
import { STATIC_SIGNAL_LIBRARY } from "../constants";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// Fallback Data
const FALLBACK_DECK: SignalDeckData = {
  signals: STATIC_SIGNAL_LIBRARY.slice(0, 3),
  friendship_os: {
    plan_name: "The Slow Orbit",
    steps: [
      { week: 1, action: "Send the Signal", effort: "Low" },
      { week: 2, action: "Ghost (Let it breathe)", effort: "None" },
      { week: 3, action: "Digital Touch (Meme)", effort: "Micro" },
      { week: 4, action: "Voice Note", effort: "Medium" }
    ]
  },
  micro_ritual: {
    title: "The Monthly Photo",
    description: "Send 1 photo from your camera roll on the 1st of the month. No context needed."
  },
  energy_model: {
    cost: "LOW",
    justification: "Async interactions minimize social battery drain."
  }
};

export const generateSignalDeck = async (
  self: User, 
  friend: User, 
  relationship: Relationship
): Promise<SignalDeckData> => {
  if (!ai) return FALLBACK_DECK;

  const lastContactDays = Math.floor((Date.now() - relationship.last_interaction) / (1000 * 60 * 60 * 24));
  
  const prompt = `
    You are the "Lagom Connection Engine." Your goal is to generate low-effort, high-warmth connection ideas for a drifted friend.

    CONTEXT:
    - User: Me
    - Friend: ${friend.name}
    - Shared Interests: ${relationship.shared_interests.join(", ")}
    - Time since last contact: ${lastContactDays} days

    CORE PHILOSOPHY (STRICT ADHERENCE REQUIRED):
    1. NO QUESTIONS. Never ask "How are you?" or "What's new?".
    2. NO OPEN LOOPS. The message must be complete in itself.
    3. LOW COGNITIVE LOAD. No scheduling, no decisions.
    4. ASYNCHRONOUS. Assume they might reply in 3 weeks or never.
    5. GENEROSITY. The message is a gift, not a bid for attention.

    TASK:
    Generate a JSON object with 4 sections based on the categories below.

    SECTION 1: THE SIGNALS (3 Drafts)
    Create 3 unique messages based on the "Shared Interests".
    - Option A: Nostalgic ("Remember that time...")
    - Option B: Vibe/Atmosphere ("This made me think of you...")
    - Option C: Random/Playful ("Ninja ping...")
    *Refer to specific shared interests if possible.*

    SECTION 2: THE OS (Timeline)
    Create a "Slow Burn" plan for the next month.
    - Week 1: The Signal (Text)
    - Week 2: The Ghost (Silence)
    - Week 3: The Digital Touch (Share a link/meme, no text)
    - Week 4: The Pulse (Voice Note)

    SECTION 3: THE RITUAL
    Invent ONE "Micro-Ritual" for these two friends.
    A low-stakes repetitive action they can share. (e.g., "The Full Moon Song Swap" or "The Bad Design Spotter").

    SECTION 4: THE ENERGY MODEL
    Estimate the "Cost" of reconnecting.
    - Cost: (LOW/MEDIUM/HIGH)
    - Justification: (One sentence justification based on the Soft-Touch philosophy).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["NOSTALGIA", "VIBE", "PLAYFUL"] },
                  text: { type: Type.STRING },
                  copy_to_clipboard: { type: Type.BOOLEAN }
                },
                required: ["type", "text", "copy_to_clipboard"]
              }
            },
            friendship_os: {
              type: Type.OBJECT,
              properties: {
                plan_name: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      week: { type: Type.INTEGER },
                      action: { type: Type.STRING },
                      effort: { type: Type.STRING }
                    },
                    required: ["week", "action", "effort"]
                  }
                }
              },
              required: ["plan_name", "steps"]
            },
            micro_ritual: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            },
            energy_model: {
              type: Type.OBJECT,
              properties: {
                cost: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                justification: { type: Type.STRING }
              },
              required: ["cost", "justification"]
            }
          },
          required: ["signals", "friendship_os", "micro_ritual", "energy_model"]
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    // Basic validation to ensure not empty
    if (!json.signals || json.signals.length === 0) return FALLBACK_DECK;
    
    return json as SignalDeckData;

  } catch (error) {
    console.error("Signal Deck Generation Failed:", error);
    return FALLBACK_DECK;
  }
};
