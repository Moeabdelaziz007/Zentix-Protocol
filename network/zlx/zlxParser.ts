/**
 * ZentixLink (ZLX) - Unified Communication Protocol
 * Enables message encoding/decoding between digital beings
 * Format: { version, sender, receiver, messageType, payload }
 * 
 * @module zlxParser
 * @version 0.3.0
 */

export interface ZLXMessage {
  version: string;
  sender: string;
  receiver: string;
  messageType: 'query' | 'response' | 'event' | 'command';
  payload: any;
  timestamp: string;
}

export const ZLX = {
  /**
   * Encode a message to ZLX format
   */
  encode(msg: Partial<ZLXMessage>): string {
    const zlxMsg: ZLXMessage = {
      version: '1.0',
      sender: msg.sender || 'unknown',
      receiver: msg.receiver || 'broadcast',
      messageType: msg.messageType || 'event',
      payload: msg.payload || {},
      timestamp: msg.timestamp || new Date().toISOString(),
    };
    return JSON.stringify(zlxMsg);
  },

  /**
   * Decode a ZLX message
   */
  decode(zlx: string): ZLXMessage {
    try {
      const parsed = JSON.parse(zlx);
      return parsed as ZLXMessage;
    } catch (error) {
      throw new Error(`Invalid ZLX format: ${error}`);
    }
  },

  /**
   * Create a query message
   */
  query(sender: string, receiver: string, question: any): string {
    return this.encode({
      sender,
      receiver,
      messageType: 'query',
      payload: { question },
    });
  },

  /**
   * Create a response message
   */
  response(sender: string, receiver: string, answer: any): string {
    return this.encode({
      sender,
      receiver,
      messageType: 'response',
      payload: { answer },
    });
  },

  /**
   * Create an event message
   */
  event(sender: string, eventType: string, data: any): string {
    return this.encode({
      sender,
      receiver: 'broadcast',
      messageType: 'event',
      payload: { eventType, data },
    });
  },

  /**
   * Validate ZLX message structure
   */
  validate(zlx: string): boolean {
    try {
      const msg = this.decode(zlx);
      return !!(msg.version && msg.sender && msg.messageType && msg.payload);
    } catch {
      return false;
    }
  },
};
