import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const REMEMBER_KEY = 'omegs.auth.remember';

export const setRememberSession = (remember: boolean) => {
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
};

const shouldRemember = () => localStorage.getItem(REMEMBER_KEY) !== '0';

/** Persists the session in localStorage when "remember me" is on, otherwise only for the browser session. */
const rememberAwareStorage = {
  getItem: (k: string) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  setItem: (k: string, v: string) => {
    if (shouldRemember()) {
      localStorage.setItem(k, v);
      sessionStorage.removeItem(k);
    } else {
      sessionStorage.setItem(k, v);
      localStorage.removeItem(k);
    }
  },
  removeItem: (k: string) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  },
};

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { storage: rememberAwareStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;
