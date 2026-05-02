import type * as Party from 'partykit/server';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
}

interface PresenceMessage {
  type: 'presence';
  userId: string;
  state: 'typing' | 'online' | 'idle';
}

type WireMessage =
  | { type: 'message'; message: ChatMessage }
  | PresenceMessage
  | { type: 'history'; messages: ChatMessage[] };

/**
 * One Durable Object per conversation. Stores the last 200 messages so a
 * client opening the chat sees a buffered history immediately, then streams
 * live as new messages arrive. Auth is enforced by the API server, which
 * is the only entity that signs PartyKit join tokens.
 */
export default class ConversationServer implements Party.Server {
  static options = { hibernate: true };

  history: ChatMessage[] = [];

  constructor(readonly room: Party.Room) {}

  async onStart() {
    const stored = await this.room.storage.get<ChatMessage[]>('history');
    if (stored) this.history = stored;
  }

  async onConnect(conn: Party.Connection) {
    const init: WireMessage = { type: 'history', messages: this.history };
    conn.send(JSON.stringify(init));
  }

  async onMessage(message: string, sender: Party.Connection) {
    let parsed: WireMessage;
    try {
      parsed = JSON.parse(message) as WireMessage;
    } catch {
      return;
    }

    if (parsed.type === 'message') {
      this.history.push(parsed.message);
      if (this.history.length > 200) this.history = this.history.slice(-200);
      await this.room.storage.put('history', this.history);
      this.room.broadcast(JSON.stringify(parsed), [sender.id]);
    } else if (parsed.type === 'presence') {
      this.room.broadcast(JSON.stringify(parsed), [sender.id]);
    }
  }
}
