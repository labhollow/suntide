import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://websedmfnfmpdqjgbzuj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYnNlZG1mbmZtcGRxamdienVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDAzNTcsImV4cCI6MjA1NDAxNjM1N30.ift6LXm_5SBCoLXcCPariyZqdJi2ziKw3mAr5GPp2n8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    lockThread: false, // Disable thread locking to avoid LockManager warnings
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
});