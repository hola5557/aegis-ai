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
  attachment?: {
    mimeType: string;
    data: string;
  };
}

export const sendMessageToGemini = async ({
  modelId,
  history,
  newMessage,
  systemInstruction,
  tools,
  attachment
}: GeminiOptions): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    // Construct tool config if plugins are enabled
    const toolConfig = [];
    if (tools?.googleSearch) {
      toolConfig.push({ googleSearch: {} });
    }

    // Prepare new message parts
    const currentParts: any[] = [];
    
    // Add attachment if present
    if (attachment) {
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }

    // Add text prompt
    if (newMessage) {
        currentParts.push({ text: newMessage });
    } else if (currentParts.length === 0) {
        // Fallback if absolutely nothing provided
        currentParts.push({ text: "" });
    }

    // Manual history construction for generateContent
    // This bypasses strict typing issues with Chat.sendMessage({ message: ... })
    // and correctly formats the request as a multi-turn conversation.
    const contents = [
        ...history,
        {
            role: 'user',
            parts: currentParts
        }
    ];

    const result = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are Aegis AI.",
        tools: toolConfig.length > 0 ? toolConfig : undefined,
      },
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
