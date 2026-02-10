
import { GoogleGenAI, Type } from "@google/genai";

// Always use a named parameter for the API key and get it from process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBookSummary = async (title: string, author: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise, engaging summary and why someone should read "${title}" by ${author}. Format as Markdown.`,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });
    // Use .text property directly, it's not a function.
    return response.text;
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Failed to generate AI summary.";
  }
};

export const getSearchSuggestions = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the search query "${query}", suggest 5 book titles or authors. Return only as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    // Use .text property directly
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
