import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  PanelLeft,
  SquarePen,
  Share2,
  Sparkles,
  Code,
  Compass,
  Lightbulb,
  Check,
  CheckCircle,
  Cpu,
  Brain,
  Zap,
  Layers,
  Search,
  BookOpen,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import NexaLogo from "./NexaLogo";

const PROMPTS_DATA = {
  All: [
    {
      icon: <Code size={18} className="icon-green" />,
      title: "Express SSE Stream",
      desc: "Write an Express.js production REST API with Server-Sent Events (SSE) streaming.",
      text: "Write an Express.js production REST API with Server-Sent Events (SSE) streaming and error handling.",
    },
    {
      icon: <Brain size={18} className="icon-purple" />,
      title: "Explain Quantum Qubits",
      desc: "Explain quantum computing and superposition to someone with classical computer knowledge.",
      text: "Explain quantum computing, qubits, and superposition to someone who understands classical computers.",
    },
    {
      icon: <Compass size={18} className="icon-blue" />,
      title: "MongoDB vs PostgreSQL",
      desc: "Compare MongoDB Atlas vs PostgreSQL for real-time high-throughput AI chat applications.",
      text: "Compare MongoDB Atlas vs PostgreSQL for real-time high-throughput AI chat applications with streaming.",
    },
    {
      icon: <Lightbulb size={18} className="icon-amber" />,
      title: "Startup Launch Pitch",
      desc: "Draft a high-converting ProductHunt launch pitch for an AI developer platform in 2026.",
      text: "Draft a high-converting ProductHunt launch pitch for an AI developer platform in 2026.",
    },
  ],
  Coding: [
    {
      icon: <Code size={18} className="icon-green" />,
      title: "React Virtualized List",
      desc: "Write a high-performance virtualized list custom hook in React with TypeScript.",
      text: "Write a high-performance virtualized list custom hook in React with TypeScript.",
    },
    {
      icon: <Zap size={18} className="icon-blue" />,
      title: "Production Dockerfile",
      desc: "Create a multi-stage Dockerfile for a Node.js + Vite production deployment.",
      text: "Create a multi-stage Dockerfile for a Node.js + Vite production deployment.",
    },
    {
      icon: <Layers size={18} className="icon-purple" />,
      title: "WebSocket vs SSE",
      desc: "Architect a real-time event pipeline comparing WebSockets vs SSE for LLM streaming.",
      text: "Architect a real-time event pipeline comparing WebSockets vs Server-Sent Events for LLM streaming.",
    },
    {
      icon: <Code size={18} className="icon-amber" />,
      title: "Dijkstra's Algorithm",
      desc: "Explain Dijkstra's shortest path algorithm with a fully commented Python implementation.",
      text: "Explain Dijkstra's shortest path algorithm with a clean Python implementation and time complexity analysis.",
    },
  ],
  Writing: [
    {
      icon: <Lightbulb size={18} className="icon-amber" />,
      title: "Product Announcement",
      desc: "Write a concise, high-converting product release notes email for developers.",
      text: "Write a concise, high-converting product release notes email for developers.",
    },
    {
      icon: <BookOpen size={18} className="icon-blue" />,
      title: "Technical Deep-Dive",
      desc: "Outline an in-depth technical article on sub-millisecond SSE token streaming.",
      text: "Outline an in-depth technical article on sub-millisecond SSE token streaming and token buffering.",
    },
    {
      icon: <Brain size={18} className="icon-purple" />,
      title: "Investor Memo",
      desc: "Draft a compelling seed-stage investor pitch memo for an AI devtool startup.",
      text: "Draft a compelling seed-stage investor pitch memo for an AI devtool startup.",
    },
  ],
  Research: [
    {
      icon: <Search size={18} className="icon-blue" />,
      title: "LLM Reasoning Trends",
      desc: "Summarize the state of test-time compute scaling and chain-of-thought distillation in 2026.",
      text: "Summarize the state of test-time compute scaling and chain-of-thought distillation in 2026.",
    },
    {
      icon: <Brain size={18} className="icon-purple" />,
      title: "Vector Databases in 2026",
      desc: "Evaluate HNSW indexing vs DiskANN for million-scale RAG retrieval systems.",
      text: "Evaluate HNSW indexing vs DiskANN for million-scale RAG retrieval systems.",
    },
  ],
};

export default function ChatArea({
  messages = [],
  isLoading = false,
  onSendMessage,
  onNewChat,
  isSidebarOpen,
  onToggleSidebar,
  currentModel = "nexa-4",
  onSelectModel,
  currentUser,
  onOpenAuth,
}) {
  const messagesEndRef = useRef(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [shareSuccess, setShareSuccess] = useState(false);

  // Auto-scroll to bottom as new tokens arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasMessages = messages && messages.length > 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const modelLabels = {
    "nexa-4": { name: "NexaAI 4.0 Omni", desc: "Dual Core Intelligence (Fast & Deep)" },
    "gemini-3.6": { name: "Gemini 3.6 Flash", desc: "Ultra-low Latency Direct Stream" },
  };

  return (
    <main className="chatgpt-main-viewport">
      {/* Top Header */}
      <header className="chatgpt-top-header">
        <div className="header-left-actions">
          {!isSidebarOpen && (
            <>
              <motion.button
                type="button"
                className="header-icon-btn"
                onClick={onToggleSidebar}
                title="Open sidebar"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <PanelLeft size={19} />
              </motion.button>
              <motion.button
                type="button"
                className="header-icon-btn"
                onClick={onNewChat}
                title="New chat"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <SquarePen size={19} />
              </motion.button>
            </>
          )}

          {/* Model Selector Dropdown with Framer Motion Popover */}
          <div className="model-dropdown-container">
            <motion.div
              className="model-selector-btn"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="model-name">
                {modelLabels[currentModel]?.name || "NexaAI 4.0 Omni"}
              </span>
              <ChevronDown
                size={14}
                className={`chevron-icon ${modelDropdownOpen ? "open" : ""}`}
              />
            </motion.div>

            <AnimatePresence>
              {modelDropdownOpen && (
                <motion.div
                  className="model-dropdown-menu glass"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className={`model-menu-item ${currentModel === "nexa-4" ? "active" : ""}`}
                    onClick={() => {
                      onSelectModel?.("nexa-4");
                      setModelDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-col">
                      <Sparkles size={16} className="item-sparkle" />
                    </div>
                    <div className="item-text-col">
                      <div className="item-header">
                        <span className="item-title">NexaAI 4.0 Omni</span>
                        {currentModel === "nexa-4" && <Check size={14} className="check-icon" />}
                      </div>
                      <span className="item-sub">Flagship intelligence with instant code rendering.</span>
                    </div>
                  </div>

                  <div
                    className={`model-menu-item ${currentModel === "gemini-3.6" ? "active" : ""}`}
                    onClick={() => {
                      onSelectModel?.("gemini-3.6");
                      setModelDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-col">
                      <Cpu size={16} className="item-cpu" />
                    </div>
                    <div className="item-text-col">
                      <div className="item-header">
                        <span className="item-title">Gemini 3.6 Flash</span>
                        {currentModel === "gemini-3.6" && <Check size={14} className="check-icon" />}
                      </div>
                      <span className="item-sub">Direct neural inference with ~190ms latency.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="header-right-actions">
          {!currentUser ? (
            <div className="header-auth-group">
              <motion.button
                type="button"
                className="header-login-btn"
                onClick={() => onOpenAuth?.("login")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span>Log in</span>
              </motion.button>

              <motion.button
                type="button"
                className="header-signup-btn"
                onClick={() => onOpenAuth?.("signup")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span>Sign up</span>
              </motion.button>
            </div>
          ) : (
            <div
              className="header-user-avatar"
              title={`Logged in as ${currentUser.name} (${currentUser.email})`}
            >
              <span>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}</span>
            </div>
          )}

          <motion.button
            type="button"
            className="share-chat-btn"
            title="Share chat link"
            onClick={handleShare}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {shareSuccess ? (
              <>
                <CheckCircle size={15} className="copied" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={15} />
                <span>Share</span>
              </>
            )}
          </motion.button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <div className={`chatgpt-scroll-container ${!hasMessages ? "home-mode" : ""}`}>
        {!hasMessages ? (
          /* =========================================================
             ChatGPT.com / Perplexity Style Center Home View
             ========================================================= */
          <div className="perplexity-home-container">
            {/* Soft Ambient Radial Behind Home View */}
            <div className="home-ambient-glow" />

            {/* NexaAI Glowing Hero Emblem */}
            <motion.div
              className="home-hero-logo-wrap"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="home-hero-logo-halo" />
              <NexaLogo size={64} glow={true} />
            </motion.div>

            <motion.div
              className="home-hero-badge"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
            >
              <Sparkles size={14} className="badge-sparkle" />
              <span>NexaAI 4.0 Dual-Core Intelligence</span>
            </motion.div>

            <motion.h1
              className="home-hero-title"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4 }}
            >
              What can I help with today?
            </motion.h1>

            {/* Prominent Centered Chat Input Capsule */}
            <motion.div
              className="home-main-input-box"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
            >
              <ChatInput
                onSendMessage={onSendMessage}
                isLoading={isLoading}
                isHomeCenter={true}
                placeholder="Ask anything, write code, or search the web..."
              />
            </motion.div>

            {/* Perplexity-style Category Filter Tabs */}
            <motion.div
              className="home-category-tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {["All", "Coding", "Writing", "Research"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`home-category-pill ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Suggestion Prompt Cards Grid with Framer Motion Springs */}
            <motion.div
              className="home-suggestions-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {(PROMPTS_DATA[activeCategory] || PROMPTS_DATA.All).map((item, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  className="home-suggestion-card glass glow-hover"
                  onClick={() => onSendMessage(item.text)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="suggestion-card-header">
                    <div className="suggestion-icon-wrap">{item.icon}</div>
                    <span className="suggestion-card-title">{item.title}</span>
                  </div>
                  <p className="suggestion-card-desc">{item.desc}</p>
                </motion.button>
              ))}
            </motion.div>

            {/* Subtle bottom disclaimer */}
            <div className="home-footer-disclaimer">
              NexaAI 4.0 can make mistakes. Verify critical code and information.
            </div>
          </div>
        ) : (
          /* =========================================================
             Active Conversation Stream
             ========================================================= */
          <div className="chatgpt-conversation-stream">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg._id || idx}
                message={msg}
                onRegenerate={
                  idx === messages.length - 1 && msg.sender !== "user"
                    ? () => onSendMessage(messages[idx - 1]?.content || "")
                    : null
                }
              />
            ))}

            {/* Thinking / Streaming Indicator */}
            {isLoading && (
              <motion.div
                className="chatgpt-thinking-row"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="thinking-avatar">
                  <Sparkles size={15} />
                </div>
                <div className="thinking-bubble">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Docked Floating Capsule Input (Active when in conversation) */}
      {hasMessages && (
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          isHomeCenter={false}
        />
      )}
    </main>
  );
}
