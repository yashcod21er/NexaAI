import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders, Database, Cpu, Trash2, Sparkles, ShieldCheck, Palette, Check, Layers } from "lucide-react";
import NexaLogo from "./NexaLogo";

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
  const [logoVariant, setLogoVariant] = useState(() => {
    try {
      return localStorage.getItem("nexaai_logo_variant") || "prism";
    } catch {
      return "prism";
    }
  });

  const accents = [
    { id: "emerald", label: "Emerald (Default)", color: "#10a37f" },
    { id: "cyan", label: "Neon Cyan", color: "#06b6d4" },
    { id: "violet", label: "Ultra Violet", color: "#8b5cf6" },
    { id: "amber", label: "Solar Amber", color: "#f59e0b" },
  ];

  const logoOptions = [
    {
      id: "prism",
      title: "The Nexus Prism",
      subtitle: "3-facet folded origami letterform with optical bevel depth & dual-core gradient.",
      inspiration: "Linear & Raycast Inspired",
      badge: "Flagship / Recommended",
    },
    {
      id: "loop",
      title: "The Quantum Core",
      subtitle: "Continuous topological infinity loop mirroring neural synaptic computation.",
      inspiration: "OpenAI & Perplexity Inspired",
      badge: "Algorithmic",
    },
    {
      id: "hex",
      title: "The Hex Monolith",
      subtitle: "Cybernetic isometric microchip polygon with high-contrast kinetic path cuts.",
      inspiration: "Compiler & DeepTech Inspired",
      badge: "Cybernetic",
    },
    {
      id: "minimal",
      title: "The Kinetic Monogram",
      subtitle: "Ultra-pure dual monoliths bridged by a dynamic 45° supersonic vector blade.",
      inspiration: "Supabase & Stripe Inspired",
      badge: "Minimalist",
    },
  ];

  const handleSelectLogo = (id) => {
    setLogoVariant(id);
    try {
      localStorage.setItem("nexaai_logo_variant", id);
      window.dispatchEvent(new Event("nexaai_logo_change"));
    } catch (e) {
      console.warn("Could not save logo preference:", e);
    }
  };

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
              className={`modal-tab-btn ${activeTab === "branding" ? "active" : ""}`}
              onClick={() => setActiveTab("branding")}
            >
              <Palette size={14} />
              <span>Brand & Logo</span>
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
                    <h4>Streaming Typewriter Speed</h4>
                    <p>Paces explanatory text smoothly while bypassing code blocks</p>
                  </div>
                  <span className="badge">14ms / char</span>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Interface Theme</h4>
                    <p>High-contrast OpenAI Dark Obsidian theme</p>
                  </div>
                  <span className="badge">Obsidian Dark</span>
                </div>
              </motion.div>
            )}

            {/* BRAND & LOGO SELECTOR TAB */}
            {activeTab === "branding" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-panel"
              >
                <div className="branding-header-banner">
                  <div className="banner-left">
                    <NexaLogo size={42} showTile={true} glow={true} variant={logoVariant} />
                    <div>
                      <h4 className="banner-title">100% Vector SVG Architecture</h4>
                      <p className="banner-desc">
                        Razor-sharp mathematical geometry with zero raster compression or AI airbrush artifacts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="logo-cards-grid">
                  {logoOptions.map((opt) => {
                    const isSelected = logoVariant === opt.id;
                    return (
                      <motion.div
                        key={opt.id}
                        className={`logo-option-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectLogo(opt.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="logo-card-top">
                          <span className={`logo-card-badge ${opt.id === "prism" ? "flagship" : ""}`}>
                            {opt.badge}
                          </span>
                          {isSelected && (
                            <div className="logo-card-check">
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        <div className="logo-card-preview">
                          <NexaLogo size={56} showTile={true} glow={isSelected} variant={opt.id} />
                        </div>

                        <div className="logo-card-info">
                          <h5 className="logo-card-title">{opt.title}</h5>
                          <span className="logo-card-inspire">{opt.inspiration}</span>
                          <p className="logo-card-desc">{opt.subtitle}</p>
                        </div>
                      </motion.div>
                    );
                  })}
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
                    <h4>Clear Local & Thread Cache</h4>
                    <p>Permanently remove current conversation history</p>
                  </div>
                  <motion.button
                    type="button"
                    className="danger-btn"
                    onClick={() => {
                      if (window.confirm("Clear all conversations and reset state?")) {
                        onClearAllChats();
                        onClose();
                      }
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Trash2 size={14} />
                    <span>Clear All Chats</span>
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
