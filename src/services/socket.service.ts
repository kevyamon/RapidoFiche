import { io, Socket } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_SERVER_URL = rawApiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  public getSocket(): Socket | null {
    return this.socket;
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token =
      localStorage.getItem('rapidofiche_access_token') ||
      localStorage.getItem('rapidofiche_admin_token') ||
      '';

    this.socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      const adminToken = localStorage.getItem('rapidofiche_admin_token');
      if (adminToken && this.socket) {
        this.socket.emit('join_admin_room', adminToken);
      }
    });

    // Réattacher les listeners enregistrés
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        this.socket?.on(event, cb);
      });
    });

    return this.socket;
  }

  public reconnectWithToken(token?: string): void {
    const activeToken =
      token ||
      localStorage.getItem('rapidofiche_access_token') ||
      localStorage.getItem('rapidofiche_admin_token') ||
      '';

    if (this.socket) {
      this.socket.auth = { token: activeToken };
      if (this.socket.connected) {
        this.socket.disconnect().connect();
      } else {
        this.socket.connect();
      }
    } else {
      this.connect();
    }
  }

  public joinAdminRoom(adminToken: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_admin_room', adminToken);
    }
  }

  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => {
      this.off(event, callback);
    };
  }

  public off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
