import { GoogleGenAI } from "@google/genai";
import { stripBase64Prefix } from '../utils';

// TODO: 在这里直接填入您的 API Key 进行测试
// 例如: const HARDCODED_API_KEY = "";
const HARDCODED_API_KEY = "AIzaSyDI-S7ThETC774Jw294Wn8FInGh3eiyvRc";

const getAiClient = () => {
  let apiKey = HARDCODED_API_KEY;

  // 如果硬编码为空，尝试从环境变量获取
  if (!apiKey) {
    try {
      if (typeof process !== 'undefined' && process.env) {
          apiKey = process.env.API_KEY || '';
      }
    } catch (e) {
      console.warn("process.env access failed", e);
    }
  }

  if (!apiKey) {
    throw new Error("API Key 缺失。请在代码 services/geminiService.ts 中填入 HARDCODED_API_KEY，或者在部署设置中配置 API_KEY 环境变量。");
  }
  return new GoogleGenAI({ apiKey });
};

// Use 'gemini-2.5-flash-image' as mapped from "Nano Banana"
const MODEL_NAME = 'gemini-2.5-flash-image';

const handleGeminiError = (error: any): never => {
  const msg = error.message || JSON.stringify(error);
  console.error("Gemini API Error:", msg);

  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
    throw new Error("API 调用太快了（触发生图模型免费版限制）。请休息 1 分钟后再试。");
  }
  
  if (msg.includes('503') || msg.includes('Overloaded')) {
    throw new Error("模型服务当前繁忙，请稍后重试。");
  }

  throw new Error(error.message || "生成失败，请检查网络连接。");
};

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
    handleGeminiError(error);
    return ""; // Unreachable but satisfies TS
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

    throw new Error("未能生成试穿图片，请重试。");
  } catch (error: any) {
    handleGeminiError(error);
    return ""; // Unreachable
  }
};