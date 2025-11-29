import { GoogleGenAI } from "@google/genai";
import { stripBase64Prefix } from '../utils';

// TODO: 在这里直接填入您的 API Key 进行测试
const HARDCODED_API_KEY = "AIzaSyDa_JpomxCEfLz-HSy5Gx8sCN1Wa79sUtc";

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

// 辅助函数：等待指定毫秒
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 核心重试逻辑：指数退避
// 默认重试 3 次，初始延迟 2 秒 (2s -> 4s -> 8s)
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const msg = error.message || JSON.stringify(error);
    
    // 检查是否为频率限制 (429) 或 服务过载 (503)
    const isRateLimit = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded');
    const isOverloaded = msg.includes('503') || msg.includes('Overloaded');

    if (retries > 0 && (isRateLimit || isOverloaded)) {
      console.warn(`API 请求受限或繁忙，正在尝试自动重连... 剩余重试次数: ${retries}。等待 ${delay}ms`);
      await wait(delay);
      return retryOperation(operation, retries - 1, delay * 2);
    }
    
    // 如果重试次数用尽，或者不是可重试的错误，则抛出
    throw error;
  }
}

const handleGeminiError = (error: any): never => {
  const msg = error.message || JSON.stringify(error);
  console.error("Gemini API Error (Final):", msg);

  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
    throw new Error("今日免费额度已耗尽，或请求过于频繁。程序已自动重试多次但失败。建议更换 API Key 或明日再试。");
  }
  
  if (msg.includes('503') || msg.includes('Overloaded')) {
    throw new Error("模型服务当前繁忙，请稍后重试。");
  }

  throw new Error(error.message || "生成失败，请检查网络连接。");
};

export const generateClothes = async (prompt: string): Promise<string> => {
  // 使用 retryOperation 包装整个 API 调用逻辑
  return retryOperation(async () => {
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
      // 这里的 catch 只是为了打印日志或重新抛出给 retryOperation 捕获
      throw error;
    }
  }).catch(handleGeminiError);
};

export const generateTryOn = async (personBase64: string, clothBase64: string): Promise<string> => {
  // 使用 retryOperation 包装整个 API 调用逻辑
  return retryOperation(async () => {
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
      throw error;
    }
  }).catch(handleGeminiError);
};