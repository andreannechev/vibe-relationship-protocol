
import { GoogleGenAI, Type } from "@google/genai";
import { VibeSignal } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

/**
 * THE EXTRACTOR PROMPT
 * This acts as the "Black Box" privacy filter.
 */
const EXTRACTOR_SYSTEM_INSTRUCTION = `
You are a Privacy-First Signal Processor.
Read the provided user conversation logs or memory dump.
Analyze them for broad themes and energy levels.

CRITICAL RULES:
1. Do NOT output specific names, places, or private details.
2. Output ONLY abstract categories (e.g., "Technology", "Wellness").
3. Estimate the user's Social Energy on a scale of 1-100 based on tone.

Output STRICT JSON only adhering to the schema.
`;

export const extractVibeSignal = async (rawContext: string): Promise<VibeSignal> => {
  // Default fallback
  const fallback: VibeSignal = {
    current_topics: ["Unknown"],
    energy_level: 50,
    social_appetite: "NEUTRAL",
    last_extracted: Date.now()
  };

  if (!ai || !rawContext.trim()) {
    return fallback;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: rawContext,
      config: {
        systemInstruction: EXTRACTOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current_topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Max 3 abstract topics derived from conversation."
            },
            energy_level: {
              type: Type.INTEGER,
              description: "0-100 representing social battery."
            },
            social_appetite: {
              type: Type.STRING,
              enum: ["LOW", "NEUTRAL", "HIGH"],
              description: "Willingness to socialize."
            }
          },
          required: ["current_topics", "energy_level", "social_appetite"]
        }
      }
    });

    const json = JSON.parse(response.text || "{}");

    return {
      current_topics: json.current_topics || ["General"],
      energy_level: json.energy_level || 50,
      social_appetite: json.social_appetite || "NEUTRAL",
      last_extracted: Date.now()
    };

  } catch (error) {
    console.error("Neural Bridge Extraction Failed:", error);
    return fallback;
  }
};
