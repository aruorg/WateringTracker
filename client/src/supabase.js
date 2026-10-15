import { createClient } from '@supabase/supabase-js';

const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = import.meta.env;
const configured = Boolean(VITE_SUPABASE_URL && VITE_SUPABASE_PUBLISHABLE_KEY);

// createClient throws on a missing URL, which would blank the whole page,
// so only create it when configured and report the problem in the UI instead.
export const supabase = configured
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
  : null;

let sessionPromise = null;

// Shared promise so React StrictMode's double effect call
// does not create two anonymous users.
export function ensureGuestSession() {
  if (!configured) {
    return Promise.reject(
      new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in client/.env.local')
    );
  }
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
