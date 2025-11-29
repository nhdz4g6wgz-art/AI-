export interface ImageAsset {
  id: string;
  url: string;
  base64?: string; // Cache base64 for API calls
  isGenerated?: boolean;
}

export interface HistoryItem {
  id: string;
  personImage: string; // URL
  clothImage: string; // URL
  resultImage: string; // URL
  timestamp: number;
}

export enum AppStep {
  SELECT_PERSON = 1,
  SELECT_CLOTHES = 2,
  GENERATE_RESULT = 3,
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
