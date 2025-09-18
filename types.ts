export type View = 'CALENDAR' | 'BAZI' | 'ICHING' | 'CHAT' | 'PROFILE';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BaziResult {
  summary: string;
  detailedAnalysis: string;
  recommendations: string[];
  baziPillars: {
    year: { canChi: string; wuXing: string; };
    month: { canChi: string; wuXing: string; };
    day: { canChi: string; wuXing: string; };
    hour: { canChi: string; wuXing: string; };
  };
}

export interface IChingResult {
    hexagramName: string;
    summary: string;
    judgment: string;
    image: string;
    lineExplanations: {
        lineNumber: number;
        text: string;
    }[];
    practicalAdvice: string[];
}

export interface DayDetails {
    lunarDate: string;
    dayCanChi: string;
    goodHours: string[];
    badHours: string[];
    goodStars: { name: string; meaning: string; }[];
    badStars: { name: string; meaning: string; }[];
    events: string[];
}

export interface Reminder {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  description: string;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
}
