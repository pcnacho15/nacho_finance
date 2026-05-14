'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import CardBox from '../shared/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getPusherClient } from '@/lib/pusher-client';

interface DirectoryUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  blockedByMe: boolean;
}

interface ChatUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface ConversationItem {
  id: string;
  other: ChatUser;
  lastMessage: { id: string; body: string; senderId: string; createdAt: string } | null;
  unread: number;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

const CONVERSATIONS_KEY = '/api/chat/conversations';
const DIRECTORY_KEY = '/api/chat/directory';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const initials = (name: string | null, email: string) =>
  (name?.trim() || email).slice(0, 2).toUpperCase();

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatModule: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOther, setSelectedOther] = useState<ChatUser | null>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useSWR<ConversationItem[]>(
    CONVERSATIONS_KEY,
    fetcher,
    { refreshInterval: 15_000 },
  );

  const messagesKey = selectedId
    ? `/api/chat/conversations/${selectedId}/messages`
    : null;
  const { data: messagesData } = useSWR<{ messages: ChatMessage[] }>(
    messagesKey,
    fetcher,
    { refreshInterval: 10_000 },
  );
  const messages = useMemo(() => messagesData?.messages ?? [], [messagesData]);

  // Presence channel: track who's online.
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe('presence-traders');
    const sync = () => {
      const members = (channel as unknown as { members?: { members: Record<string, unknown> } })
        .members;
      if (members) setOnlineIds(new Set(Object.keys(members.members)));
    };
    channel.bind('pusher:subscription_succeeded', sync);
    channel.bind('pusher:member_added', sync);
    channel.bind('pusher:member_removed', sync);
    return () => {
      pusher.unsubscribe('presence-traders');
    };
  }, []);

  // Private channel for the open conversation: live message delivery.
  useEffect(() => {
    if (!selectedId) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channelName = `private-chat-${selectedId}`;
    const channel = pusher.subscribe(channelName);
    const onNew = () => {
      globalMutate(`/api/chat/conversations/${selectedId}/messages`);
      globalMutate(CONVERSATIONS_KEY);
    };
    channel.bind('new-message', onNew);
    return () => {
      channel.unbind('new-message', onNew);
      pusher.unsubscribe(channelName);
    };
  }, [selectedId]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = (id: string, other: ChatUser) => {
    setSelectedId(id);
    setSelectedOther(other);
  };

  const startConversation = async (userId: string) => {
    try {
      const res = await fetch(CONVERSATIONS_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'No se pudo abrir el chat');
        return;
      }
      setDirectoryOpen(false);
      openConversation(data.id, data.other);
      globalMutate(CONVERSATIONS_KEY);
    } catch {
      toast.error('No se pudo abrir el chat');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'No se pudo enviar');
        return;
      }
      setText('');
      globalMutate(`/api/chat/conversations/${selectedId}/messages`);
      globalMutate(CONVERSATIONS_KEY);
    } finally {
      setSending(false);
    }
  };

  const toggleBlock = async (userId: string, blocked: boolean) => {
    const res = blocked
      ? await fetch(`/api/chat/block?id=${userId}`, { method: 'DELETE' })
      : await fetch('/api/chat/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
    if (res.ok) {
      toast.success(blocked ? 'Usuario desbloqueado' : 'Usuario bloqueado');
      globalMutate(DIRECTORY_KEY);
      globalMutate(CONVERSATIONS_KEY);
    } else {
      toast.error('No se pudo completar la acción');
    }
  };

  return (
    <>
      <CardBox className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[600px]">
          {/* Conversation list */}
          <div className="border-r border-border flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between gap-2">
              <h3 className="font-medium">Conversaciones</h3>
              <Button size="sm" onClick={() => setDirectoryOpen(true)}>
                <Icon icon="solar:add-circle-bold" className="size-4 mr-1" />
                Nuevo
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Aún no tienes conversaciones. Inicia una con “Nuevo”.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id, c.other)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${
                      selectedId === c.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="size-9">
                        <AvatarImage src={c.other.image ?? undefined} />
                        <AvatarFallback>{initials(c.other.name, c.other.email)}</AvatarFallback>
                      </Avatar>
                      {onlineIds.has(c.other.id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {c.other.name || c.other.email}
                        </span>
                        {c.unread > 0 && (
                          <span className="shrink-0 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.lastMessage
                          ? `${c.lastMessage.senderId === currentUserId ? 'Tú: ' : ''}${c.lastMessage.body}`
                          : 'Sin mensajes'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread */}
          <div className="flex flex-col">
            {!selectedId || !selectedOther ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <Icon
                  icon="solar:chat-round-line-bold"
                  className="size-12 text-muted-foreground mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Selecciona una conversación o inicia una nueva.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-9">
                      <AvatarImage src={selectedOther.image ?? undefined} />
                      <AvatarFallback>
                        {initials(selectedOther.name, selectedOther.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {selectedOther.name || selectedOther.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {onlineIds.has(selectedOther.id) ? 'En línea' : 'Desconectado'}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleBlock(selectedOther.id, false)}
                    title="Bloquear usuario"
                  >
                    <Icon icon="solar:forbidden-circle-bold" className="size-4 mr-1" />
                    Bloquear
                  </Button>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      Envía el primer mensaje.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = m.senderId === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                              mine
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            <span
                              className={`block text-[10px] mt-1 ${
                                mine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              {fmtTime(m.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="p-3 border-t border-border flex items-center gap-2"
                >
                  <Input
                    placeholder="Escribe un mensaje…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={2000}
                  />
                  <Button type="submit" disabled={sending || !text.trim()}>
                    <Icon icon="solar:plain-bold" className="size-4" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </CardBox>

      <DirectoryDialog
        open={directoryOpen}
        onClose={() => setDirectoryOpen(false)}
        onStart={startConversation}
        onToggleBlock={toggleBlock}
      />
    </>
  );
};

interface DirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (userId: string) => void;
  onToggleBlock: (userId: string, blocked: boolean) => void;
}

const DirectoryDialog: React.FC<DirectoryDialogProps> = ({
  open,
  onClose,
  onStart,
  onToggleBlock,
}) => {
  const { data: users = [], isLoading } = useSWR<DirectoryUser[]>(
    open ? DIRECTORY_KEY : null,
    fetcher,
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Directorio de traders</DialogTitle>
          <DialogDescription>
            Usuarios premium con los que puedes chatear.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Cargando…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No hay otros traders disponibles.
            </p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                <Avatar className="size-9">
                  <AvatarImage src={u.image ?? undefined} />
                  <AvatarFallback>{initials(u.name, u.email)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{u.name || u.email}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                {u.blockedByMe ? (
                  <Button size="sm" variant="outline" onClick={() => onToggleBlock(u.id, true)}>
                    Desbloquear
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onStart(u.id)}>
                    Chatear
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModule;
