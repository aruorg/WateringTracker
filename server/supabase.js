import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in server/.env');
}

const noSession = { persistSession: false, autoRefreshToken: false };

// Used only to verify access tokens with Supabase Auth.
export const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: noSession,
});

// A client that runs queries as the given guest, so row-level security applies.
export function createUserClient(token) {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: noSession,
  });
}
