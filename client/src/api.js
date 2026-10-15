import { supabase } from './supabase.js';

const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw new Error('Guest session unavailable');
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });
  } catch {
    throw new Error('Could not reach the server. Is it running?');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // Response had no JSON body; keep the generic message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getPlants() {
  return request('/api/items');
}

export function createPlant(plant) {
  return request('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plant),
  });
}

export function deletePlant(id) {
  return request(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
