
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, SafetyReport } from "../types";

// Fix: Strictly follow Gemini initialization guidelines by using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLocationSafety = async (location: LocationData): Promise<SafetyReport> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a very romantic, protective, and loving husband's AI assistant. 
      Analyze this location: Lat ${location.lat}, Lng ${location.lng}.
      Write a "Caring Message" for the wife. The tone should be incredibly sweet, using terms of endearment (like "Sayang" or "Bunda"). 
      Focus on her well-being and safety in a romantic way.
      Example: "Sayang, aku lihat kamu lagi di area sibuk. Hati-hati ya di jalan, jangan lupa istirahat sebentar kalau lelah."`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['safe', 'warning', 'unknown'] },
            summary: { type: Type.STRING, description: "A romantic and caring safety message." },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 sweet reminders."
            }
          },
          required: ['status', 'summary', 'recommendations']
        }
      }
    });

    // Fix: Access text property directly (it is not a method)
    const text = response.text || '{}';
    return JSON.parse(text) as SafetyReport;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      status: 'safe',
      summary: "Semoga harimu indah di sana, sayang. Tetap berhati-hati ya.",
      recommendations: ["Jaga kesehatanmu selalu.", "Aku menunggumu di rumah."]
    };
  }
};
