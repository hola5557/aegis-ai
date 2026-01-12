import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GeminiOptions {
  modelId: string;
  history: { role: string; parts: { text: string }[] }[];
  newMessage: string;
  systemInstruction?: string;
  tools?: {
    googleSearch?: boolean;
  };
}

export const sendMessageToGemini = async ({
  modelId,
  history,
  newMessage,
  systemInstruction,
  tools
}: GeminiOptions): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    // Construct tool config if plugins are enabled
    const toolConfig = [];
    if (tools?.googleSearch) {
      toolConfig.push({ googleSearch: {} });
    }

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction || "You are Aegis AI.",
        tools: toolConfig.length > 0 ? toolConfig : undefined,
      },
      history: history,
    });

    const result = await chat.sendMessage({
      message: newMessage,
    });

    return {
        text: result.text || "No response generated.",
        groundingMetadata: result.candidates?.[0]?.groundingMetadata
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to connect to Aegis Neural Core.");
  }
};
