export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          title: string
          region: 'jawa' | 'sumatra' | 'sulawesi' | 'kalimantan' | 'other'
          difficulty: 'mudah' | 'sedang' | 'sulit'
          cooking_time: number | null
          image_url: string | null
          ingredients: Json
          steps: Json
          cultural_story: string | null
          description: string
          servings: number | null
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          region: 'jawa' | 'sumatra' | 'sulawesi' | 'kalimantan' | 'other'
          difficulty?: 'mudah' | 'sedang' | 'sulit'
          cooking_time?: number | null
          image_url?: string | null
          ingredients?: Json
          steps?: Json
          cultural_story?: string | null
          description: string
          servings?: number | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          region?: 'jawa' | 'sumatra' | 'sulawesi' | 'kalimantan' | 'other'
          difficulty?: 'mudah' | 'sedang' | 'sulit'
          cooking_time?: number | null
          image_url?: string | null
          ingredients?: Json
          steps?: Json
          cultural_story?: string | null
          description?: string
          servings?: number | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          status: 'bookmarked' | 'attempted' | 'completed'
          rating: number | null
          progress_percentage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          status?: 'bookmarked' | 'attempted' | 'completed'
          rating?: number | null
          progress_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          status?: 'bookmarked' | 'attempted' | 'completed'
          rating?: number | null
          progress_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          bio: string | null
          subscription_type: 'free' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          bio?: string | null
          subscription_type?: 'free' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          bio?: string | null
          subscription_type?: 'free' | 'premium'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}