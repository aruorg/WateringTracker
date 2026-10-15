import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

let sessionPromise = null;

// Shared promise so React StrictMode's double effect call
// does not create two anonymous users.
export function ensureGuestSession() {
  if (!sessionPromise) {
    sessionPromise = createOrReuseSession().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

async function createOrReuseSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  if (data.session) return data.session;

  const result = await supabase.auth.signInAnonymously();

  if (result.error) throw result.error;
  if (!result.data.session) throw new Error('Guest session unavailable');

  return result.data.session;
}
