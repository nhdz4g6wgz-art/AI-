import { GoogleGenAI } from "@google/genai";
import { stripBase64Prefix } from '../utils';

const getAiClient = () => {
  let apiKey = '';
  try {
    // Safely access process.env.API_KEY
    // Note: In Vite/Netlify, ensure 'API_KEY' is set in your environment variables.
    // We access it safely to avoid crashing if 'process' is undefined.
    if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("process.env access failed", e);
  }

  if (!apiKey) {
    throw new Error("API Key is missing. Please set the 'API_KEY' environment variable in your deployment settings (e.g., Netlify Environment Variables).");
  }
  return new GoogleGenAI({ apiKey });
};

// Use 'gemini-2.5-flash-image' as mapped from "Nano Banana"
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateClothes = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();

    const fullPrompt = `Design a clothing item based on this description: "${prompt}". 
    Generate a high-quality, photorealistic image of the clothing item isolated on a plain white or light grey background. 
    Flat lay or mannequin style.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
          // Nano Banana doesn't support responseMimeType or responseSchema
      }
    });

    // Iterate to find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("模型未生成图片，请重试或修改提示词。");
  } catch (error: any) {
    console.error("Generate Clothes Error:", error);
    throw new Error(error.message || "生成衣服失败");
  }
};

export const generateTryOn = async (personBase64: string, clothBase64: string): Promise<string> => {
  try {
    const ai = getAiClient();

    const personData = stripBase64Prefix(personBase64);
    const clothData = stripBase64Prefix(clothBase64);

    const prompt = `Generate a high-quality photorealistic full-body image of the person in the first image wearing the clothing shown in the second image.
    Instructions:
    1. Retain the person's identity, facial features, skin tone, and body shape from the first image.
    2. Replace their current outfit with the clothing from the second image. Fit the clothing naturally to their pose.
    3. If the person is cropped, extend the body reasonably to show the outfit if possible, or crop the outfit to fit the frame.
    4. Maintain high resolution and realistic lighting.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: personData,
            },
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: clothData,
            },
          },
          { text: prompt },
        ],
      },
    });

     // Iterate to find image part
     for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Failed to generate try-on image.");
  } catch (error: any) {
    console.error("Generate Try-On Error:", error);
    // Propagate the specific error message (e.g., API Key missing)
    throw new Error(error.message || "试穿生成失败");
  }
};