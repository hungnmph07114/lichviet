import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import type { UserProfile, BaziResult, IChingResult } from '../types';

// The API key is expected to be set in the environment, e.g., via env.js
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will be caught by the app's error boundary or logged to the console.
  // It prevents the app from making API calls without a key.
  console.error("Gemini API key is not configured. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

// --- Chat Session Management ---
let chatSession: Chat | null = null;
let chatProfileContext: string | null = null;

function createUserContext(userProfile: UserProfile | null): string {
    if (!userProfile || !userProfile.name || !userProfile.birthDate) {
        return "Người dùng chưa cung cấp thông tin cá nhân.";
    }
    return `Thông tin người dùng: Tên: ${userProfile.name}, Ngày sinh: ${userProfile.birthDate}, Giờ sinh: ${userProfile.birthTime || 'Không rõ'}, Giới tính: ${userProfile.gender}.`;
}

export function getChatSession(userProfile: UserProfile | null): Chat {
  const newUserContext = createUserContext(userProfile);
  if (!chatSession || chatProfileContext !== newUserContext) {
    chatProfileContext = newUserContext;
    const systemInstruction = `Bạn là một trợ lý AI am hiểu về văn hóa, lịch và tử vi Việt Nam. Hãy trả lời các câu hỏi của người dùng một cách thân thiện, chi tiết và hữu ích. ${chatProfileContext} Hãy sử dụng thông tin này để cá nhân hóa câu trả lời nếu phù hợp. Ngôn ngữ giao tiếp là tiếng Việt.`;
    
    chatSession = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }
  return chatSession;
}

export function resetChatSession(): void {
  chatSession = null;
  chatProfileContext = null;
}

// --- Helper for safe JSON parsing ---
async function generateAndParseJson<T>(prompt: string, schema: any): Promise<T | null> {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            console.error("Gemini API returned empty text response.");
            return null;
        }
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error generating or parsing JSON from Gemini:", error);
        return null;
    }
}


// --- Bazi Analysis ---
export async function analyzeBazi(birthDate: string, birthTime: string, gender: string): Promise<BaziResult | null> {
  const prompt = `Phân tích lá số Bát Tự (Tứ Trụ) cho một người sinh vào ngày ${birthDate}, lúc ${birthTime || 'không rõ giờ'}, giới tính ${gender}. Vui lòng cung cấp kết quả phân tích chi tiết bằng tiếng Việt theo định dạng JSON.
  - 'summary': Một đoạn tóm tắt ngắn gọn, khoảng 2-3 câu, về bản mệnh và tính cách.
  - 'detailedAnalysis': Một bài luận giải chi tiết về các mối quan hệ Ngũ Hành, Can Chi, các cung và ảnh hưởng của chúng đến sự nghiệp, tài vận, tình duyên, sức khỏe.
  - 'recommendations': Một danh sách (array of strings) gồm 3-5 lời khuyên thực tế dựa trên lá số để cải thiện vận mệnh.
  - 'baziPillars': Một object chứa thông tin về Tứ Trụ, mỗi trụ có 'canChi' (ví dụ: 'Giáp Tý') và 'wuXing' (ví dụ: 'Hải Trung Kim'). Các trụ là 'year', 'month', 'day', 'hour'.`;

  const baziSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      detailedAnalysis: { type: Type.STRING },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      baziPillars: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.OBJECT, properties: { canChi: { type: Type.STRING }, wuXing: { type: Type.STRING } }, required: ['canChi', 'wuXing'] },
          month: { type: Type.OBJECT, properties: { canChi: { type: Type.STRING }, wuXing: { type: Type.STRING } }, required: ['canChi', 'wuXing'] },
          day: { type: Type.OBJECT, properties: { canChi: { type: Type.STRING }, wuXing: { type: Type.STRING } }, required: ['canChi', 'wuXing'] },
          hour: { type: Type.OBJECT, properties: { canChi: { type: Type.STRING }, wuXing: { type: Type.STRING } }, required: ['canChi', 'wuXing'] },
        },
        required: ['year', 'month', 'day', 'hour'],
      },
    },
    required: ['summary', 'detailedAnalysis', 'recommendations', 'baziPillars']
  };
  
  return generateAndParseJson<BaziResult>(prompt, baziSchema);
}


// --- IChing Divination ---
export async function interpretIChing(hexagramNumber: number): Promise<IChingResult | null> {
  const prompt = `Luận giải quẻ Kinh Dịch số ${hexagramNumber}. Vui lòng cung cấp kết quả chi tiết bằng tiếng Việt theo định dạng JSON.
  - 'hexagramName': Tên quẻ (ví dụ: 'Thuần Càn').
  - 'summary': Tóm tắt ngắn gọn ý nghĩa tổng quan của quẻ.
  - 'judgment': Lời Thoán (Thoán từ) đầy đủ của quẻ.
  - 'image': Lời Tượng (Tượng từ) đầy đủ của quẻ.
  - 'lineExplanations': Một danh sách giải thích ý nghĩa của từng hào, từ hào 1 đến hào 6. Mỗi hào có 'lineNumber' và 'text'.
  - 'practicalAdvice': Một danh sách (array of strings) gồm 3-5 lời khuyên thực tế, dễ hiểu dựa trên ý nghĩa của quẻ trong bối cảnh hiện đại.`;

  const iChingSchema = {
    type: Type.OBJECT,
    properties: {
      hexagramName: { type: Type.STRING },
      summary: { type: Type.STRING },
      judgment: { type: Type.STRING },
      image: { type: Type.STRING },
      lineExplanations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lineNumber: { type: Type.INTEGER }, text: { type: Type.STRING } }, required: ['lineNumber', 'text'] } },
      practicalAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
     required: ['hexagramName', 'summary', 'judgment', 'image', 'lineExplanations', 'practicalAdvice']
  };

  return generateAndParseJson<IChingResult>(prompt, iChingSchema);
}
