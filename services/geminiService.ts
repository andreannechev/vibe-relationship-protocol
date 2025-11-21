import { GoogleGenAI, Type } from "@google/genai";
import { User, Relationship, Directives, ArtifactSuggestion, ReflectionLog } from "../types";

// Initialize the API client
// NOTE TO USER: Add your API Key here or in your environment variables
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateSocialContext = async (
  userA: User,
  userB: User,
  relationship: Relationship
): Promise<string> => {
  if (!ai) {
    return "Protocol Suggestion: Keep it brief. API key missing.";
  }

  const prompt = `
    You are 'The Agent', a social protocol manager.
    Your goal is to facilitate a high-signal, low-noise connection between two humans.

    User A (Me): Name: ${userA.name}, Status: ${userA.current_status}, Policy: ${JSON.stringify(userA.communication_policy)}
    User B (Target): Name: ${userB.name}, Status: ${userB.current_status}, Policy: ${JSON.stringify(userB.communication_policy)}
    Relationship: Tier: ${relationship.tier}, Shared Interests: ${relationship.shared_interests.join(", ")}.
    
    Task: Generate a single, short, specific sentence suggesting HOW User A should reach out to User B right now.
    Context: User B is currently in ${userB.current_status} mode.
    If Status is RECHARGE or FLOW_STATE, suggest respecting their space or a very async method.
    If Status is OPEN, suggest a direct action based on interests.
    
    Output ONLY the suggested sentence. No quotes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Agent Error:", error);
    return `Reconnect over ${relationship.shared_interests[0] || "coffee"}.`;
  }
};

export interface SimulationResult {
  outcome: string; // "ACCEPTED" | "DECLINED" | "NEGOTIATING"
  reasoning: string;
  agentMessage: string;
}

export const runAgentSimulation = async (
  directives: Directives,
  scenario: string
): Promise<SimulationResult> => {
  if (!ai) {
    return {
      outcome: "UNKNOWN",
      reasoning: "API Key missing. Cannot run simulation.",
      agentMessage: "Error."
    };
  }

  const prompt = `
    You are a Personal Agent implementing a user's social directives.
    
    MY DIRECTIVES (The Rules):
    ${JSON.stringify(directives, null, 2)}
    
    THE SCENARIO (Incoming Request):
    ${scenario}
    
    Your Personality based on Autonomy Level:
    - LIBRARIAN: Never initiate, always ask for approval. Risk averse.
    - CHIEF_OF_STAFF: Balanced. Tentatively accepts but requires confirmation.
    - PROMOTER: Proactive. Auto-accepts for Inner Circle.
    
    TASK:
    Determine how you handle this request.
    
    OUTPUT JSON ONLY:
    {
      "outcome": "ACCEPTED" | "DECLINED" | "NEGOTIATING",
      "reasoning": "One short sentence explaining which rule triggered this decision.",
      "agentMessage": "The response you would send to the requestor (or the note you'd give your user)."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as SimulationResult;
  } catch (error) {
    console.error("Simulation Error:", error);
    return {
      outcome: "NEGOTIATING",
      reasoning: "Fallback: Complexity too high.",
      agentMessage: "I'll check with my human."
    };
  }
};

/**
 * THE TONE TUNER
 * Rewrites a message based on a "Temperature" slider.
 */
export const tuneMessageTone = async (
  originalText: string,
  toneValue: number, // 0 (Casual) to 100 (Warm)
  friendName: string,
  contextTags: string[]
): Promise<string> => {
  if (!ai) {
    // Mock behavior if offline
    if (toneValue < 30) return originalText.toLowerCase().replace('.', '') + " lol";
    if (toneValue > 70) return `Hey ${friendName}, ${originalText.toLowerCase()} Hope you're well!`;
    return originalText;
  }

  let styleInstruction = "";
  if (toneValue <= 25) {
    styleInstruction = "Make it extremely casual. Lowercase only. No periods. Use slang/abbreviations (lol, rn, tbh) if it fits. Extremely low effort vibe.";
  } else if (toneValue <= 50) {
    styleInstruction = "Make it casual but clean. Sentence case is optional. Friendly but brief. 'Texting a buddy' vibe.";
  } else if (toneValue <= 75) {
    styleInstruction = "Make it warm and polite. Proper punctuation. Add a friendly emoji. 'Thoughtful friend' vibe.";
  } else {
    styleInstruction = "Make it very earnest and heartfelt. Use the friend's name. Show genuine care/vulnerability. Deep connection vibe.";
  }

  const prompt = `
    Task: Rewrite the following text message.
    Original Text: "${originalText}"
    Recipient Name: ${friendName}
    Relationship Context: ${contextTags.join(', ')}
    
    Goal Style: ${styleInstruction}
    
    Constraint: Keep the core meaning identical. Only change the tone/delivery.
    Output: ONLY the rewritten text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || originalText;
  } catch (error) {
    console.error("Tone Tuner Error:", error);
    return originalText;
  }
};

/**
 * THE ARTIFACT SCOUT
 * Finds physical "Tokens of Affection" under $25.
 */
export const generateArtifactSuggestion = async (
  friendName: string,
  interests: string[],
  notes: string
): Promise<ArtifactSuggestion | null> => {
   if (!ai) {
      // Fallback for demo without API Key
      return {
        itemName: "Vintage Kodak Film Canister Keychain",
        estimatedPrice: "15",
        currency: "$",
        reasoning: "Mock: Matches their interest in analog photography. Practical but cool.",
        searchQuery: "Vintage Kodak Film Canister Keychain"
      };
   }

   const prompt = `
    Role: You are 'The Scout', a tastemaker agent finding physical tokens of affection.
    Target: Friend named ${friendName}.
    Interests: ${interests.join(', ')}.
    Context: ${notes}

    Task: Suggest ONE physical "Artifact" (gift) under $25 USD.
    
    STRICT CONSTRAINTS:
    1. PRICE MUST BE UNDER $25.
    2. NO generic gift cards, candles, or Amazon gadgets.
    3. LOOK FOR: Zines, Enamel Pins, Obscure Snacks, Patches, Used Books, Special Coffee Beans, Retro Stationery, Stickers.
    4. VIBE: "Lagom" - Just enough. Not too much. Low pressure. Thoughtful but casual.

    Output JSON Schema:
    {
      "itemName": "string (Name of item)",
      "estimatedPrice": "string (number only)",
      "reasoning": "string (Short sentence why it fits)",
      "searchQuery": "string (Optimal search query to find this item)"
    }
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
            itemName: { type: Type.STRING },
            estimatedPrice: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            searchQuery: { type: Type.STRING }
          },
          required: ["itemName", "estimatedPrice", "reasoning", "searchQuery"]
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      itemName: json.itemName || "Cool Mystery Item",
      estimatedPrice: json.estimatedPrice || "20",
      currency: "$",
      reasoning: json.reasoning || "It fits their vibe.",
      searchQuery: json.searchQuery || "Cool gift under 25"
    };

   } catch (error) {
     console.error("Artifact Scout Error:", error);
     return null;
   }
}

export interface ReflectionIntakeAnalysis {
  context_summary: string;
  questions: string[];
}

/**
 * THE MIRROR (REFLECTION AGENT) - PHASE 1: THE PROBE
 * Analyzes initial brain dump, summarizes it, and generates 3 distinct follow-up questions.
 */
export const analyzeReflectionIntake = async (
  transcript: string,
  friendName: string
): Promise<ReflectionIntakeAnalysis> => {
  const fallback = {
    context_summary: "I hear you. It sounds like there's a lot on your mind regarding this connection.",
    questions: [
      "How did that interaction make you feel specifically?",
      "What is one thing you wish you had said?",
      "Do you feel energized or drained when thinking about this?"
    ]
  };

  if (!ai) return fallback;

  const prompt = `
    You are "The Mirror". A Socratic reflection agent.
    
    Context: The user is talking about their friend, ${friendName}.
    User Transcript: "${transcript}"
    
    Task: 
    1. Summarize the user's input in one empathetic sentence starting with "I hear that..." or "It seems like...".
    2. Generate 3 distinct, short follow-up questions to help the user dig deeper.
    
    Output JSON Schema:
    {
      "context_summary": "string",
      "questions": ["string", "string", "string"]
    }
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
            context_summary: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["context_summary", "questions"]
        }
      }
    });
    const json = JSON.parse(response.text || "{}");
    return {
      context_summary: json.context_summary || fallback.context_summary,
      questions: json.questions || fallback.questions
    };
  } catch (error) {
    console.error("Reflection Probe Error:", error);
    return fallback;
  }
};

/**
 * THE MIRROR (REFLECTION AGENT) - PHASE 2: THE SYNTHESIS
 * Summarizes the session into structured insights.
 */
export const generateReflectionSummary = async (
  intakeTranscript: string,
  qaPairs: { question: string, answer: string }[],
  friendName: string
): Promise<ReflectionLog['summary']> => {
  if (!ai) {
    return {
      update: ["Interaction logged manually."],
      vibe: "Neutral / Unprocessed.",
      insight: "Keep monitoring this connection."
    };
  }

  const conversationStr = `
    Initial Thoughts: ${intakeTranscript}
    Follow Up Questions & Answers:
    ${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')}
  `;

  const prompt = `
    You are "The Mirror".
    Task: Synthesize this reflection session about ${friendName} into a strategic summary.
    
    Full Transcript: 
    "${conversationStr}"
    
    Output JSON Schema:
    {
      "update": ["List of 1-3 hard facts/life updates mentioned"],
      "vibe": "One sentence summarizing the emotional context (e.g. 'High energy but stressed')",
      "insight": "One strategic observation for the user (e.g. 'You seem to be doing all the planning.')"
    }
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
            update: { type: Type.ARRAY, items: { type: Type.STRING } },
            vibe: { type: Type.STRING },
            insight: { type: Type.STRING }
          },
          required: ["update", "vibe", "insight"]
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      update: json.update || [],
      vibe: json.vibe || "No clear vibe detected.",
      insight: json.insight || "No specific insight generated."
    };
  } catch (error) {
    console.error("Reflection Summary Error:", error);
    return {
      update: ["Error processing reflection."],
      vibe: "Unknown",
      insight: "System could not synthesize."
    };
  }
};