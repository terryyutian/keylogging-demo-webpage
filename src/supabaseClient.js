// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Vite envs: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars are missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Simple helper to insert a participant and return the inserted row (or error).
 * payload should match participants columns (prolific_id, session_id, age, gender, education, consent_timestamp)
 */
export async function insertParticipant(payload) {
  const { data, error } = await supabase
    .from('participants')
    .insert([payload])
    .select()
    .single();

  return { data, error };
}
