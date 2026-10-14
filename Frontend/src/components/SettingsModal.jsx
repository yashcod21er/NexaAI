import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders, Database, Cpu, Trash2, Sparkles, ShieldCheck } from "lucide-react";

export default function SettingsModal({
  isOpen,
  onClose,
  backendOnline,
  onClearAllChats,
  currentModel,
  onSelectModel,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [accent, setAccent] = useState("emerald");

  const accents = [
    { id: "emerald", label: "Emerald (Default)", color: "#10a37f" },
    { id: "cyan", label: "Neon Cyan", color: "#06b6d4" },
    { id: "violet", label: "Ultra Violet", color: "#8b5cf6" },
    { id: "amber", label: "Solar Amber", color: "#f59e0b" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="settings-modal-dialog glass"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-wrap">
              <Sliders size={18} className="modal-title-icon" />
              <h3>Settings & System Control</h3>
            </div>
            <motion.button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Modal Navigation Tabs */}
          <div className="modal-tabs-bar">
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              <Sliders size={14} />
              <span>General</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === "models" ? "active" : ""}`}
              onClick={() => setActiveTab("models")}
            >
              <Cpu size={14} />
              <span>Models</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === "database" ? "active" : ""}`}
              onClick={() => setActiveTab("database")}
            >
              <Database size={14} />
              <span>System & Data</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="modal-body-content">
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-panel"
              >
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Accent Tone</h4>
                    <p>Customize the visual accent highlights across the UI</p>
                  </div>
                  <div className="accent-picker">
                    {accents.map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        className={`accent-dot ${accent === item.id ? "selected" : ""}`}
                        style={{ backgroundColor: item.color }}
                        onClick={() => {
                          setAccent(item.id);
                          document.documentElement.style.setProperty("--accent-green", item.color);
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Keyboard Shortcuts</h4>
                    <p>Navigate with maximum developer velocity</p>
                  </div>
                  <div className="shortcuts-list">
                    <div className="shortcut-item">
                      <span>Send Message</span>
                      <kbd>Enter</kbd>
                    </div>
                    <div className="shortcut-item">
                      <span>New Line</span>
                      <kbd>Shift + Enter</kbd>
                    </div>
                    <div className="shortcut-item">
                      <span>New Conversation</span>
                      <kbd>Alt + N</kbd>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "models" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-panel"
              >
                <div className="model-cards-grid">
                  <motion.div
                    className={`model-option-card ${currentModel === "nexa-4" ? "selected" : ""}`}
                    onClick={() => onSelectModel("nexa-4")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="card-top">
                      <Sparkles size={18} className="model-icon nexa" />
                      <span className="badge">Recommended</span>
                    </div>
                    <h5>NexaAI 4.0 Omni</h5>
                    <p>High intelligence with streaming theory typewriter and instant code rendering.</p>
                  </motion.div>

                  <motion.div
                    className={`model-option-card ${currentModel === "gemini-3.6" ? "selected" : ""}`}
                    onClick={() => onSelectModel("gemini-3.6")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="card-top">
                      <Cpu size={18} className="model-icon gemini" />
                      <span className="badge fast">Lightning</span>
                    </div>
                    <h5>Gemini 3.6 Flash</h5>
                    <p>Direct low-latency streaming optimized for rapid code generation & queries.</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "database" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-panel"
              >
                <div className="status-health-box">
                  <div className="health-row">
                    <span className="label">MongoDB Cluster:</span>
                    <span className="val healthy">
                      <ShieldCheck size={14} /> nexaai.nmfwild.mongodb.net
                    </span>
                  </div>
                  <div className="health-row">
                    <span className="label">Backend Status:</span>
                    <span className={`val ${backendOnline ? "healthy" : "warning"}`}>
                      {backendOnline ? "Online & Synchronized" : "Reconnecting..."}
                    </span>
                  </div>
                  <div className="health-row">
                    <span className="label">Streaming Engine:</span>
                    <span className="val healthy">HTTP/SSE Active</span>
                  </div>
                </div>

                <div className="danger-zone">
                  <div className="setting-info">
                    <h4>Clear Conversations</h4>
                    <p>Permanently remove current conversation history from database</p>
                  </div>
                  <motion.button
                    type="button"
                    className="danger-btn"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear conversations?")) {
                        onClearAllChats();
                        onClose();
                      }
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Trash2 size={15} />
                    <span>Clear All</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
