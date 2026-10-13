/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_APP_STORE_URL?: string;
  readonly VITE_GOOGLE_PLAY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
