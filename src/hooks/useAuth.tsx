import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/supabase';
import type { AuthUser, UserProfile } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    auth.getUser().then(({ data: { user } }) => {
      console.log('Initial session check:', user ? 'User found' : 'No user');
      setUser(user as AuthUser);
      if (user) {
        loadUserProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user ? 'User logged in' : 'No user');
      const currentUser = session?.user as AuthUser | null;
      setUser(currentUser);
      
      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const { data, error } = await db.getUserProfile(userId);
      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error loading profile:', error);
      } else if (data) {
        console.log('Profile loaded successfully');
        setProfile(data);
      } else {
        console.log('No profile found, creating default profile');
        // Create a default profile if none exists
        await db.updateUserProfile(userId, {
          full_name: 'Pengguna Baru',
          subscription_type: 'free'
        });
        // Reload profile after creation
        const { data: newProfile } = await db.getUserProfile(userId);
        if (newProfile) setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in...');
      const { data, error } = await auth.signIn(email, password);
      console.log('Sign in result:', { user: data?.user ? 'User found' : 'No user', error });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      // Don't set loading to false here, let the auth state change handle it
      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signUp(email, password, { full_name: fullName });
      
      if (!error && data.user) {
        // Create user profile
        await db.updateUserProfile(data.user.id, {
          full_name: fullName,
          subscription_type: 'free'
        });
      }
      
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };
    
    try {
      const { error } = await db.updateUserProfile(user.id, data);
      if (!error) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}