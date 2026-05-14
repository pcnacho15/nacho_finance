'use client';

import PusherClient from 'pusher-js';

// Returns a shared Pusher browser client, or null when realtime isn't
// configured — callers should fall back to polling.
let client: PusherClient | null = null;
let resolved = false;

export function getPusherClient(): PusherClient | null {
  if (resolved) return client;
  resolved = true;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;
  client = new PusherClient(key, {
    cluster,
    authEndpoint: '/api/chat/pusher-auth',
  });
  return client;
}
