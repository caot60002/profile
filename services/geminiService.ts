import { GoogleGenAI } from "@google/genai";
import { GenerationTone } from "../types";

// Initialize lazily to avoid top-level crashes if environment variables are missing
const getAiClient = () => {
    // @ts-ignore - process.env is replaced by Vite at build time
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing. Bio generation will not work.");
        // Return a dummy instance or handle differently. 
        // For now, we return a client with a placeholder to allow the app to run, 
        // calls will fail gracefully in the try/catch block below.
        return new GoogleGenAI({ apiKey: "MISSING_KEY" });
    }
    return new GoogleGenAI({ apiKey });
};

export const generateAestheticBio = async (
  keywords: string,
  tone: GenerationTone
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const prompt = `
      You are an expert in "guns.lol" style bio aesthetics. These are typically used by gamers, coders, and internet culture enthusiasts.
      They are short, punchy, often lowercase, sometimes use special characters, and have a specific "vibe" (dark, moody, flexing, or poetic).
      
      Task: Generate a single short bio (max 150 characters) based on the following keywords and tone.
      
      Keywords: ${keywords}
      Tone: ${tone}
      
      Constraints:
      - Do NOT use hashtags.
      - Do NOT use emojis unless they fit the dark aesthetic (like 🖤, 💀, ⛓️).
      - If tone is "edgy", be bold and dark.
      - If tone is "aesthetic", use spacing or poetic fragments.
      - Return ONLY the bio text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "No bio generated.";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Error: Could not generate bio. (Check API Key)";
  }
};