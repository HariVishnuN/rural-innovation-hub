// Resilient WebSocket Client for real-time messaging

export class ChatWebSocketClient {
  constructor(partnerId, token, onMessage, onStatusChange) {
    this.partnerId = partnerId;
    this.token = token;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.isExplicitlyClosed = false;
  }

  connect() {
    if (!this.partnerId || !this.token) return;

    this.isExplicitlyClosed = false;
    const rawWsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000/api/ws';
    const baseWsUrl = rawWsUrl.endsWith('/api/ws') ? rawWsUrl : (rawWsUrl.endsWith('/') ? `${rawWsUrl}api/ws` : `${rawWsUrl}/api/ws`);
    const socketUrl = `${baseWsUrl}/chat/${this.partnerId}?token=${encodeURIComponent(this.token)}`;

    try {
      this.ws = new WebSocket(socketUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        if (this.onStatusChange) this.onStatusChange('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.error('Failed to parse incoming WebSocket message', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        if (this.onStatusChange) this.onStatusChange('error');
      };

      this.ws.onclose = () => {
        if (this.onStatusChange) this.onStatusChange('disconnected');
        if (!this.isExplicitlyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 8000);
          this.reconnectAttempts++;
          this.reconnectTimeout = setTimeout(() => this.connect(), timeout);
        }
      };
    } catch (e) {
      console.error('WebSocket initialization failure:', e);
    }
  }

  sendMessage(messageText, inventionId = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message: messageText, invention_id: inventionId }));
      return true;
    }
    return false;
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
