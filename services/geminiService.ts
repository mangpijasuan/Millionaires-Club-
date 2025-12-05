import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || "YOUR_API_KEY_HERE"; // Ensure API_KEY is set in environment

export const callGemini = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error calling AI service. Please try again.";
  }
};