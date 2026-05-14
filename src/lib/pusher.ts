import Pusher from 'pusher';

// Server-side Pusher client. Returns null if credentials aren't configured —
// callers should treat realtime as optional (messages still persist to the DB,
// the UI falls back to polling).
let instance: Pusher | null = null;
let resolved = false;

export function getPusher(): Pusher | null {
  if (resolved) return instance;
  resolved = true;
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    return null;
  }
  instance = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
  return instance;
}

export const conversationChannel = (conversationId: string) =>
  `private-chat-${conversationId}`;

export const PRESENCE_CHANNEL = 'presence-traders';
