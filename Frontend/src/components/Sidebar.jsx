import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeft,
  SquarePen,
  Search,
  Trash2,
  Sparkles,
  User,
  Settings,
  X,
  LogIn,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import NexaLogo from "./NexaLogo";

export default function Sidebar({
  threads = [],
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  isOpen,
  onToggleSidebar,
  onOpenSettings,
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const filteredThreads = searchQuery.trim()
    ? threads.filter((t) =>
        (t.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threads;

  // Group threads into time buckets
  const groupThreads = () => {
    const today = [];
    const yesterday = [];
    const previousDays = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfSevenDays = new Date(startOfToday);
    startOfSevenDays.setDate(startOfSevenDays.getDate() - 7);

    filteredThreads.forEach((t) => {
      const updatedAt = new Date(t.updatedAt || t.createdAt || Date.now());
      if (updatedAt >= startOfToday) {
        today.push(t);
      } else if (updatedAt >= startOfYesterday) {
        yesterday.push(t);
      } else if (updatedAt >= startOfSevenDays) {
        previousDays.push(t);
      } else {
        older.push(t);
      }
    });

    const groups = [];
    if (today.length > 0) groups.push({ label: "Today", items: today });
    if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
    if (previousDays.length > 0) groups.push({ label: "Previous 7 Days", items: previousDays });
    if (older.length > 0) groups.push({ label: "Previous 30 Days", items: older });

    return groups;
  };

  const threadGroups = groupThreads();

  // User display helpers
  const getDisplayName = () => {
    if (!currentUser) return "Guest";
    if (currentUser.name && currentUser.name.trim()) {
      if (currentUser.name.includes("@")) {
        const raw = currentUser.name.split("@")[0];
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      }
      return currentUser.name.trim();
    }
    if (currentUser.email) {
      const raw = currentUser.email.split("@")[0];
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return "User";
  };

  const displayName = getDisplayName();
  const userInitial = displayName.charAt(0).toUpperCase() || "U";
  const userEmail = currentUser?.email || "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sidebar-mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
          />
          <motion.aside
            className="chatgpt-sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
          {/* Top Actions Header */}
          {/* Top Actions Header with NexaAI Brand */}
          <div className="sidebar-top-bar">
            <div className="sidebar-brand-group">
              <NexaLogo size={26} showText={true} />
            </div>

            <div className="sidebar-top-actions">
              <motion.button
                type="button"
                className="sidebar-icon-btn"
                onClick={onNewChat}
                title="New chat (Alt+N)"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SquarePen size={18} />
              </motion.button>

              <motion.button
                type="button"
                className="sidebar-icon-btn"
                onClick={onToggleSidebar}
                title="Close sidebar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PanelLeft size={18} />
              </motion.button>
            </div>
          </div>

          {/* Search Box */}
          <div className="sidebar-search-wrap">
            <div className="search-input-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Conversations History List */}
          <div className="sidebar-history-container">
            {threads.length === 0 ? (
              <div className="sidebar-empty-threads">
                <Sparkles size={16} className="empty-sparkle" />
                <p>No conversations yet</p>
                <span>Ask anything to begin</span>
              </div>
            ) : threadGroups.length === 0 ? (
              <div className="sidebar-empty-threads">
                <p>No matching chats found</p>
              </div>
            ) : (
              threadGroups.map((group) => (
                <div key={group.label} className="thread-time-group">
                  <div className="thread-time-label">{group.label}</div>
                  <AnimatePresence>
                    {group.items.map((thread) => {
                      const id = thread.threadId || thread._id;
                      const isActive = activeThreadId === id;
                      const isHovered = hoveredId === id;

                      return (
                        <motion.div
                          key={id}
                          className={`sidebar-thread-row ${isActive ? "active" : ""}`}
                          onClick={() => onSelectThread(id)}
                          onMouseEnter={() => setHoveredId(id)}
                          onMouseLeave={() => setHoveredId(null)}
                          whileHover={{ x: 2 }}
                        >
                          <span className="thread-title-text" title={thread.title || "Chat"}>
                            {thread.title || "New Chat"}
                          </span>

                          {(isHovered || isActive) && (
                            <motion.button
                              type="button"
                              className="thread-action-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteThread(id);
                              }}
                              title="Delete conversation"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.15 }}
                            >
                              <Trash2 size={13} />
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>

          {/* Bottom Profile and Settings Footer */}
          <div className="sidebar-user-footer">
            {currentUser ? (
              <div className="user-profile-wrapper">
                {/* Floating ChatGPT Style Popover Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="user-popover-backdrop"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <motion.div
                        className="chatgpt-user-popover"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <div className="popover-user-card">
                          <div className="user-avatar-circle auth-avatar">
                            <span>{userInitial}</span>
                          </div>
                          <div className="user-meta">
                            <span className="user-display-name">{displayName}</span>
                            <span className="popover-email">{userEmail}</span>
                          </div>
                        </div>

                        <div className="popover-divider" />

                        <button
                          type="button"
                          className="popover-menu-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenSettings();
                          }}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>

                        <button
                          type="button"
                          className="popover-menu-item logout"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                        >
                          <LogOut size={16} />
                          <span>Log out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* ChatGPT User Profile Pill */}
                <button
                  type="button"
                  className={`user-profile-pill ${isUserMenuOpen ? "active" : ""}`}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  title="Account and settings"
                >
                  <div className="user-pill-left">
                    <div className="user-avatar-circle auth-avatar">
                      <span>{userInitial}</span>
                    </div>
                    <div className="user-meta">
                      <span className="user-display-name">{displayName}</span>
                      <span className="user-plan-badge">Free Plan</span>
                    </div>
                  </div>

                  <div className="user-pill-right">
                    <MoreHorizontal size={18} className="user-more-dots" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="guest-login-bar">
                <div className="guest-info" onClick={() => onOpenAuth?.("login")} title="Log in or create account">
                  <div className="user-avatar-circle guest-avatar">
                    <User size={15} />
                  </div>
                  <div className="user-meta">
                    <span className="user-display-name">Guest Mode</span>
                    <span className="user-plan-badge">Sign in to save chats</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  className="sidebar-login-btn"
                  onClick={() => onOpenAuth?.("login")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <LogIn size={13} />
                  <span>Log in</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
