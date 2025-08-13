import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helpers
export const auth = {
  signUp: (email: string, password: string, metadata?: any) => 
    supabase.auth.signUp({ email, password, options: { data: metadata } }),
  
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  getUser: () => supabase.auth.getUser(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => 
    supabase.auth.onAuthStateChange(callback)
};

// Database helpers
export const db = {
  // Recipes
  getRecipes: (filters?: { region?: string; difficulty?: string; search?: string }) => {
    let query = supabase.from('recipes').select('*');
    
    if (filters?.region && filters.region !== 'all') {
      query = query.eq('region', filters.region);
    }
    
    if (filters?.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty);
    }
    
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    return query.order('created_at', { ascending: false });
  },
  
  getRecipe: (id: string) => 
    supabase.from('recipes').select('*').eq('id', id).single(),
  
  getFeaturedRecipes: (limit = 6) => 
    supabase.from('recipes').select('*').eq('is_premium', false).limit(limit),
  
  // User Bookmarks
  getUserBookmarks: (userId: string) => 
    supabase.from('user_bookmarks')
      .select('*, recipes(*)')
      .eq('user_id', userId),
  
  addBookmark: (userId: string, recipeId: string) => 
    supabase.from('user_bookmarks').insert({ user_id: userId, recipe_id: recipeId }),
  
  removeBookmark: (userId: string, recipeId: string) => 
    supabase.from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId),
  
  checkBookmark: (userId: string, recipeId: string) => 
    supabase.from('user_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single(),
  
  // User Progress
  getUserProgress: (userId: string) => 
    supabase.from('user_progress')
      .select('*, recipes(*)')
      .eq('user_id', userId),
  
  updateProgress: (userId: string, recipeId: string, status: string, rating?: number) => 
    supabase.from('user_progress')
      .upsert({ 
        user_id: userId, 
        recipe_id: recipeId, 
        status, 
        rating,
        updated_at: new Date().toISOString()
      }),
  
  // User Profile
  getUserProfile: (userId: string) => 
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
  
  updateUserProfile: (userId: string, data: any) => 
    supabase.from('user_profiles')
      .upsert({ id: userId, ...data, updated_at: new Date().toISOString() })
};

// Export individual functions for easier imports
export const getRecipes = async (filters?: { region?: string; difficulty?: string; search?: string }) => {
  const { data, error } = await db.getRecipes(filters);
  if (error) throw error;
  return data;
};

export const getRecipe = async (id: string) => {
  const { data, error } = await db.getRecipe(id);
  if (error) throw error;
  return data;
};

export const getFeaturedRecipes = async (limit = 6) => {
  const { data, error } = await db.getFeaturedRecipes(limit);
  if (error) throw error;
  return data;
};

export const getUserBookmarks = async (userId: string) => {
  const { data, error } = await db.getUserBookmarks(userId);
  if (error) throw error;
  return data?.map(bookmark => bookmark.recipes).filter(Boolean) || [];
};

export const addBookmark = async (userId: string, recipeId: string) => {
  const { data, error } = await db.addBookmark(userId, recipeId);
  if (error) throw error;
  return data;
};

export const removeBookmark = async (userId: string, recipeId: string) => {
  const { data, error } = await db.removeBookmark(userId, recipeId);
  if (error) throw error;
  return data;
};

export const checkBookmark = async (userId: string, recipeId: string) => {
  const { data, error } = await db.checkBookmark(userId, recipeId);
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found" error
  return !!data;
};

export const getUserProgress = async (userId: string) => {
  const { data, error } = await db.getUserProgress(userId);
  if (error) throw error;
  return data || [];
};

export const updateProgress = async (userId: string, recipeId: string, progressPercentage: number) => {
  const status = progressPercentage >= 100 ? 'completed' : progressPercentage > 0 ? 'attempted' : 'bookmarked';
  const { data, error } = await supabase.from('user_progress')
    .upsert({ 
      user_id: userId, 
      recipe_id: recipeId, 
      progress_percentage: progressPercentage,
      status, 
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await db.getUserProfile(userId);
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const { data, error } = await db.updateUserProfile(userId, profileData);
  if (error) throw error;
  return data;
};

// Export auth functions
export const { signUp, signIn, signOut, getUser, onAuthStateChange } = auth;