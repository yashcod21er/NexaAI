import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import SettingsModal from "./components/SettingsModal";
import AuthModal from "./components/AuthModal";
import AuthPage from "./components/AuthPage";
import { api } from "./services/api";
import "./App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(api.getStoredUser());
  const [authMode, setAuthMode] = useState(null); // "login" | "signup" | null
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState("nexa-4");

  const activeUserId = currentUser?.userId || "guest_user";

  // Check backend server status
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.getStatus();
      setBackendOnline(res?.status === "online");
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // Fetch thread history for the active user
  const loadThreads = useCallback(async (userId = activeUserId) => {
    if (!userId || userId === "guest_user") {
      setThreads([]);
      return;
    }
    try {
      const res = await api.getThreads(userId);
      if (res?.success && Array.isArray(res.threads)) {
        setThreads(res.threads);
      } else {
        setThreads([]);
      }
    } catch (err) {
      console.warn("Could not load threads:", err);
      setThreads([]);
    }
  }, [activeUserId]);

  // Initial load: verify session and load threads
  useEffect(() => {
    checkHealth();

    const verifySession = async () => {
      const user = await api.getMe();
      if (user?.userId) {
        setCurrentUser(user);
        loadThreads(user.userId);
      } else {
        setCurrentUser(null);
        setThreads([]);
      }
    };

    verifySession();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth, loadThreads]);

  // Reload threads when currentUser changes (clear immediately if logged out)
  useEffect(() => {
    if (currentUser?.userId) {
      loadThreads(currentUser.userId);
    } else {
      setThreads([]);
    }
  }, [currentUser, loadThreads]);

  // Hash routing for #login and #signup pages
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#login") {
        setAuthMode("login");
      } else if (hash === "#signup") {
        setAuthMode("signup");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleOpenAuth = (mode = "login") => {
    setAuthMode(mode);
    window.location.hash = mode;
  };

  const handleCloseAuth = () => {
    setAuthMode(null);
    if (window.location.hash === "#login" || window.location.hash === "#signup") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  // Global Keyboard Shortcuts (Alt+N for new chat)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  // Load a specific thread
  const handleSelectThread = async (id) => {
    if (!id || id === activeThreadId) return;

    try {
      setIsLoading(true);
      setActiveThreadId(id);

      const res = await api.getThread(id);
      if (res?.success && res.thread) {
        setActiveThread(res.thread);
        setMessages(res.thread.messages || []);
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a fresh conversation
  const handleNewChat = () => {
    setActiveThreadId(null);
    setActiveThread(null);
    setMessages([]);
  };

  // Delete a single thread
  const handleDeleteThread = async (id) => {
    try {
      await api.deleteThread(id);
      setThreads((prev) => prev.filter((t) => (t.threadId || t._id) !== id));

      if (activeThreadId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  // Clear all threads
  const handleClearAllChats = async () => {
    try {
      for (const t of threads) {
        const id = t.threadId || t._id;
        await api.deleteThread(id);
      }
      setThreads([]);
      handleNewChat();
    } catch (err) {
      console.error("Failed to clear threads:", err);
    }
  };

  // Handle successful login or registration
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadThreads(user.userId);
    handleCloseAuth();
  };

  // Handle user logout (immediately clear sidebar history and active chat)
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setThreads([]);
    handleNewChat();
  };

  // Send a message with character-by-character streaming and attachment support
  const handleSendMessage = async (userText, attachments = []) => {
    if ((!userText && (!attachments || attachments.length === 0)) || isLoading) return;

    const targetThreadId = activeThreadId || `thread_${Date.now()}`;
    if (!activeThreadId) {
      setActiveThreadId(targetThreadId);
    }

    const optimisticUserMsg = {
      _id: `temp_user_${Date.now()}`,
      sender: "user",
      role: "user",
      content: userText || "",
      message: userText || "",
      attachments: attachments || [],
      timestamp: new Date().toISOString(),
    };

    const assistantMsgId = `temp_ai_${Date.now()}`;
    const optimisticAiMsg = {
      _id: assistantMsgId,
      sender: "nexaai",
      role: "model",
      content: "",
      message: "",
      isStreaming: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg, optimisticAiMsg]);
    setIsLoading(true);

    try {
      await api.sendMessageStream({
        threadId: targetThreadId,
        message: userText || "",
        attachments: attachments || [],
        userId: activeUserId,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === assistantMsgId
                ? {
                    ...msg,
                    content: msg.content + chunk,
                    message: (msg.message || "") + chunk,
                  }
                : msg
            )
          );
        },
        onDone: (data) => {
          setIsLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === assistantMsgId
                ? {
                    ...msg,
                    content: msg.content || data?.fullReply || "I received your message, but no content was returned. Please try asking again.",
                    message: msg.message || data?.fullReply || "I received your message, but no content was returned. Please try asking again.",
                    isStreaming: false,
                  }
                : msg
            )
          );
          if (currentUser?.userId) {
            loadThreads(currentUser.userId);
          } else {
            // In guest mode, add thread to local sidebar for current session only
            const displayTitle = userText
              ? (userText.slice(0, 30) + (userText.length > 30 ? "..." : ""))
              : (attachments[0]?.name ? `File: ${attachments[0].name}` : "New Chat");

            setThreads((prev) => {
              const exists = prev.some((t) => (t.threadId || t._id) === targetThreadId);
              if (!exists) {
                return [
                  {
                    threadId: targetThreadId,
                    _id: targetThreadId,
                    userId: "guest_user",
                    title: displayTitle,
                    updatedAt: new Date().toISOString(),
                  },
                  ...prev,
                ];
              }
              return prev;
            });
          }
        },
        onError: (err) => {
          setIsLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === assistantMsgId
                ? {
                    ...msg,
                    content: `Error: ${err.message || "Failed to reach server"}`,
                    isStreaming: false,
                  }
                : msg
            )
          );
        },
      });
    } catch (err) {
      console.error("Chat error:", err);
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === assistantMsgId
            ? {
                ...msg,
                content: `Connection error: ${err.message || "Failed to reach server"}. Make sure the backend is running at http://localhost:5000`,
                isStreaming: false,
              }
            : msg
        )
      );
    }
  };

  return (
    <div className="chatgpt-app-container">
      {/* Sidebar with Motion */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        backendOnline={backendOnline}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onOpenAuth={(mode) => handleOpenAuth(mode || "login")}
        onLogout={handleLogout}
      />

      {/* Main Conversation Viewport with Center Home View */}
      <ChatArea
        thread={activeThread}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentModel={currentModel}
        onSelectModel={setCurrentModel}
        currentUser={currentUser}
        onOpenAuth={(mode) => handleOpenAuth(mode || "login")}
      />

      {/* Settings Modal Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        backendOnline={backendOnline}
        onClearAllChats={handleClearAllChats}
        currentModel={currentModel}
        onSelectModel={setCurrentModel}
      />

      {/* Dedicated ChatGPT-Style Full-Screen Login & Signup Page */}
      {authMode && (
        <AuthPage
          initialMode={authMode}
          onSwitchMode={(newMode) => {
            setAuthMode(newMode);
            window.location.hash = newMode;
          }}
          onAuthSuccess={handleAuthSuccess}
          onBack={handleCloseAuth}
        />
      )}

      {/* Fallback Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
