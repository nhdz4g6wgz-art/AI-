import { GoogleGenAI } from "@google/genai";
import { stripBase64Prefix } from '../utils';

const getAiClient = () => {
  let apiKey = '';
  try {
    // Safely access process.env.API_KEY
    // In some browser builds, 'process' might not be defined if not replaced by the bundler.
    apiKey = process.env.API_KEY;
  } catch (e) {
    console.warn("process.env.API_KEY access failed", e);
  }

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Use 'gemini-2.5-flash-image' as mapped from "Nano Banana"
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateClothes = async (prompt: string): Promise<string> => {
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
  
  // Fallback if model returns text description of image (rare for image model but possible)
  throw new Error("No image generated. Please try a different prompt.");
};

export const generateTryOn = async (personBase64: string, clothBase64: string): Promise<string> => {
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
};