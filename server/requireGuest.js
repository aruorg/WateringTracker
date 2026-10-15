import { authClient, createUserClient } from './supabase.js';

export async function requireGuest(req, res, next) {
  const match = req.get('authorization')?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = match[1];

  try {
    // getUser asks Supabase Auth to validate the token; never just decode it.
    const { data, error } = await authClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    req.user = data.user;
    req.db = createUserClient(token);

    next();
  } catch (error) {
    next(error);
  }
}
