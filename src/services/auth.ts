import { supabase } from '../lib/supabase';

const TOKEN_KEY = 'auth_token';
const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const authService = {
  login: async (email: string, password: string): Promise<boolean> => {
    if (SUPABASE_CONFIGURED) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        localStorage.setItem(TOKEN_KEY, 'supabase_session');
        return true;
      }
      throw new Error(error.message);
    }

    // Demo mode fallback when Supabase is not configured
    if (
      (email === 'test' || email === 'test@buildwell.ai') &&
      (password === 'test')
    ) {
      localStorage.setItem(TOKEN_KEY, 'mock_token');
      return true;
    }
    if (email === 'demo' && password === 'demo') {
      localStorage.setItem(TOKEN_KEY, 'mock_token');
      return true;
    }
    throw new Error('Invalid credentials');
  },

  signup: async (email: string, password: string): Promise<boolean> => {
    if (!SUPABASE_CONFIGURED) throw new Error('Sign-up requires Supabase configuration.');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return true;
  },

  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),

  logout: async (): Promise<void> => {
    if (SUPABASE_CONFIGURED) await supabase.auth.signOut();
    localStorage.removeItem(TOKEN_KEY);
  },

  isDemoMode: (): boolean => !SUPABASE_CONFIGURED,
};
