const API_BASE = "http://localhost:5000";

// Storage keys
const TOKEN_KEY = "nexaai_auth_token";
const USER_KEY = "nexaai_auth_user";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Get stored authentication state
  getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setAuthSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // ==========================================
  // Authentication Endpoints
  // ==========================================
  async register({ name, email, password }) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }
      if (data.token && data.user) {
        this.setAuthSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  },

  async login({ email, password }) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }
      if (data.token && data.user) {
        this.setAuthSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  },

  async getMe() {
    try {
      const token = this.getStoredToken();
      if (!token) return null;

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        this.clearAuthSession();
        return null;
      }
      const data = await res.json();
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data.user;
    } catch (err) {
      console.warn("Verify session error:", err);
      return null;
    }
  },

  logout() {
    this.clearAuthSession();
  },

  // ==========================================
  // System Health
  // ==========================================
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE}/`);
      return await res.json();
    } catch (err) {
      console.warn("Backend offline or unreachable:", err.message);
      return { status: "offline" };
    }
  },

  // ==========================================
  // Chat & Threads Endpoints
  // ==========================================
  async createThread(userId = "guest_user", title = "New Conversation") {
    try {
      const res = await fetch(`${API_BASE}/api/chats/new-thread`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, title }),
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to create thread:", err);
      throw err;
    }
  },

  async getThreads(userId = "guest_user") {
    try {
      const res = await fetch(
        `${API_BASE}/api/chats/threads?userId=${encodeURIComponent(userId)}`,
        { headers: getAuthHeaders() }
      );
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch threads:", err);
      return { success: false, threads: [] };
    }
  },

  async getThread(id) {
    try {
      const res = await fetch(`${API_BASE}/api/chats/thread/${id}`, {
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch thread:", err);
      throw err;
    }
  },

  async deleteThread(id) {
    try {
      const res = await fetch(`${API_BASE}/api/chats/thread/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.error("Failed to delete thread:", err);
      throw err;
    }
  },

  // Real-time character-by-character streaming via SSE with attachment support
  async sendMessageStream({ threadId, message, attachments = [], userId = "guest_user", onChunk, onDone, onError }) {
    try {
      const res = await fetch(`${API_BASE}/api/chats/chat/stream`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          threadID: threadId,
          threadId: threadId,
          message,
          attachments,
          userId,
          sender: "user",
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // Retain incomplete line for next iteration

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataStr = trimmed.slice(6);

          if (dataStr === "[DONE]") {
            if (onDone) onDone();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.content && onChunk) {
              onChunk(parsed.content);
            }
            if (parsed.error) {
              if (onChunk) {
                onChunk(`\n\n⚠️ ${parsed.error}`);
              }
              if (onError) {
                onError(new Error(parsed.error));
              }
            }
            if (parsed.done && onDone) {
              onDone(parsed);
            }
          } catch (e) {
            console.warn("SSE parse error:", e);
          }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      console.error("Stream failed:", err);
      if (onError) onError(err);
      throw err;
    }
  },
};
