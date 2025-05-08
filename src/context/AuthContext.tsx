import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthContextType, User } from '../types/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for active session on page load
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle session errors, including 'refresh_token_not_found'
          if (error.message.includes('Invalid Refresh Token: Refresh Token Not Found')) {
            await supabase.auth.signOut(); // Ensure clean state
            setUser(null);
            setLoading(false);
            console.error('Invalid refresh token, signing out.');
            return;
          }
          throw error;
        }

        if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email!
          });
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
        // Ensure user is signed out on any error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!
          });
        } else {
          // If session is lost, ensure user is signed out
          if (event === 'TOKEN_REFRESHED' && !session) {
            await supabase.auth.signOut();
          }
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign up';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Invalid email or password';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null); // Ensure user state is cleared
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};