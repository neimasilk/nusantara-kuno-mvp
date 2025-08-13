// Core types for Nusantara Kuno application

export interface Recipe {
  id: string;
  title: string;
  description: string;
  region: 'jawa' | 'sumatra' | 'sulawesi' | 'kalimantan' | 'other';
  difficulty: 'mudah' | 'sedang' | 'sulit';
  cooking_time: number; // in minutes
  servings: number;
  image_url?: string;
  ingredients: string[];
  steps: string[];
  cultural_story?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  subscription_type: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  recipe_id: string;
  progress_percentage: number;
  status: 'bookmarked' | 'attempted' | 'completed';
  rating?: number; // 1-5
  recipe?: Recipe;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  region?: string;
  difficulty?: string;
  query?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

// Regional mapping for display
export const REGION_LABELS = {
  jawa: 'Jawa',
  sumatra: 'Sumatra',
  sulawesi: 'Sulawesi',
  kalimantan: 'Kalimantan',
  other: 'Lainnya'
} as const;

// Difficulty mapping for display
export const DIFFICULTY_LABELS = {
  mudah: 'Mudah',
  sedang: 'Sedang',
  sulit: 'Sulit'
} as const;