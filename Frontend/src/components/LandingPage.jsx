import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Cpu,
  Zap,
  Database,
  ArrowRight,
  Code,
  Terminal,
  Check,
  Layers,
  Play,
  Flame,
  ChevronDown,
  Copy,
  Send,
} from "lucide-react";
import NexaLogo from "./NexaLogo";

export default function LandingPage({ onLaunchApp, onSelectPrompt, backendOnline }) {
  const [activeCodeTab, setActiveCodeTab] = useState("sse");
  const [activeModelTab, setActiveModelTab] = useState("nexa");
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [demoPromptInput, setDemoPromptInput] = useState("");
  const [demoStreaming, setDemoStreaming] = useState(false);
  const [demoText, setDemoText] = useState("");
  const [demoCodeVisible, setDemoCodeVisible] = useState(true);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 24, stiffness: 280 },
    },
  };

  // Sample prompt chips
  const samplePrompts = [
    { title: "Node.js SSE Stream", text: "Write an Express.js production REST API with Server-Sent Events (SSE) streaming." },
    { title: "Explain Quantum Qubits", text: "Explain quantum computing and qubits to someone who understands classical computers." },
    { title: "Atlas vs PostgreSQL", text: "Compare MongoDB Atlas vs PostgreSQL for real-time high-throughput chat applications." },
    { title: "AI SaaS Launch Pitch", text: "Draft a high-converting ProductHunt launch pitch for an AI developer platform in 2026." },
  ];

  // Code snippets for the Interactive Code Showcase
  const codeSnippets = {
    sse: {
      title: "Express.js Sub-Millisecond SSE Stream",
      lang: "javascript",
      code: `// Express.js Server-Sent Events Endpoint (Sub-200ms TTFT)
app.post("/api/chats/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const stream = getOpenAIStreamResponse(history, message);
  for await (const chunk of stream) {
    res.write(\`data: \${JSON.stringify({ chunk })}\\n\\n\`);
  }
  res.write("data: [DONE]\\n\\n");
  res.end();
});`,
    },
    mongodb: {
      title: "MongoDB Atlas Thread Memory & DNS Fallback",
      lang: "javascript",
      code: `// MongoDB Atlas Cluster Connection with Google DNS resolver
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Fix Windows SRV query issues

export const ThreadSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  threadId: { type: String, unique: true, required: true },
  title: { type: String, default: "New Chat" },
  messages: [{
    sender: { type: String, enum: ["user", "model", "nexaai"] },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });`,
    },
    typewriter: {
      title: "Instant Code + Theory Character Typewriter Hook",
      lang: "javascript",
      code: `// Character-by-character for theory; instant zero-delay for code
export function useTheoryTypewriter(fullText, speedMs = 14) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      // If cursor is inside code block (triple backticks), jump to end of code
      const currentPrefix = fullText.slice(0, index);
      const isInsideCode = (currentPrefix.split("\`\`\`").length - 1) % 2 === 1;
      
      if (isInsideCode) {
        const nextCodeEnd = fullText.indexOf("\`\`\`", index);
        index = nextCodeEnd !== -1 ? nextCodeEnd + 3 : fullText.length;
      } else {
        index += 1;
      }
      setDisplayed(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(interval);
    }, speedMs);
    return () => clearInterval(interval);
  }, [fullText, speedMs]);

  return displayed;
}`,
    },
    gemini: {
      title: "Dual-Core Gemini 3.6 Flash Neural Generator",
      lang: "javascript",
      code: `// Sub-200ms First Token Neural Pipeline
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function* getOpenAIStreamResponse(history, prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(prompt);

  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}`,
    },
  };

  // Model benchmark specifications
  const modelBenchmarks = {
    nexa: {
      name: "NexaAI 4.0 Omni",
      badge: "Flagship Dual-Core",
      tagline: "Highest accuracy code synthesis with streaming theory typewriter",
      latency: "185ms",
      throughput: "125 tok/s",
      accuracy: "98.4%",
      memory: "1M Context",
      color: "#10a37f",
    },
    gemini: {
      name: "Gemini 3.6 Flash",
      badge: "Ultra Low Latency",
      tagline: "Raw neural speed with direct streaming pipeline",
      latency: "198ms",
      throughput: "115 tok/s",
      accuracy: "95.8%",
      memory: "1M Context",
      color: "#3b82f6",
    },
    legacy: {
      name: "Legacy GPT-3.5",
      badge: "Baseline Comparison",
      tagline: "Traditional single-block response with standard latency",
      latency: "940ms",
      throughput: "38 tok/s",
      accuracy: "79.2%",
      memory: "16K Context",
      color: "#a855f7",
    },
  };

  // Bento feature items
  const bentoItems = [
    {
      icon: <Zap size={22} className="bento-icon zap" />,
      title: "Sub-200ms SSE Token Streaming",
      desc: "Delivers character-by-character live typewriter output with zero perceived latency, keeping your thought flow uninterrupted.",
      tag: "Real-Time Streaming",
      size: "large",
    },
    {
      icon: <Cpu size={22} className="bento-icon cpu" />,
      title: "Dual-Core Intelligence",
      desc: "Synchronizes raw Google Gemini inference speed with NexaAI structured synthesis for high-accuracy reasoning.",
      tag: "Multi-Model Fusion",
      size: "medium",
    },
    {
      icon: <Database size={22} className="bento-icon db" />,
      title: "MongoDB Atlas Cloud Cluster",
      desc: "Auto-saves threads, message roles, and contextual memory in real-time on MongoDB Atlas cloud cluster with custom DNS fallback.",
      tag: "Enterprise Cloud",
      size: "medium",
    },
    {
      icon: <Code size={22} className="bento-icon code" />,
      title: "Instant Code Engine",
      desc: "Theory types character-by-character while code blocks render in full immediately with one-click copy and syntax detection.",
      tag: "Developer-First",
      size: "medium",
    },
    {
      icon: <Layers size={22} className="bento-icon layers" />,
      title: "Framer Motion & ChatGPT UX",
      desc: "Pixel-perfect ChatGPT layout with Framer Motion spring micro-interactions, dark canvas (#212121), and accent customizers.",
      tag: "Modern Interface",
      size: "large",
    },
  ];

  // FAQ Items
  const faqItems = [
    {
      q: "How does the Theory-Only Typewriter work?",
      a: "NexaAI inspects token chunks in real-time. Explanatory sentences and prose type smoothly character-by-character at 14ms per char, while markdown code blocks (wrapped in triple backticks) bypass the typewriter delay and render in full instantaneously.",
    },
    {
      q: "Why does NexaAI use MongoDB Atlas instead of localStorage?",
      a: "MongoDB Atlas provides persistent multi-device conversation history, thread indexing, and time-grouped categorization (Today, Yesterday, Previous 7 Days) that survives browser cache clears or machine switching.",
    },
    {
      q: "Why is Server-Sent Events (SSE) used over WebSockets?",
      a: "SSE runs natively over standard HTTP/2, requires no socket handshake overhead, traverses corporate firewalls effortlessly, and provides automatic reconnection with built-in chunk buffering.",
    },
    {
      q: "Can I switch between the Showcase Website and the ChatGPT App anytime?",
      a: "Yes! There is a two-way view switcher. Click 'Launch App' from any button on the website, or click 'Showcase Website' in the top header of the ChatGPT conversation workspace.",
    },
  ];

  // Copy code helper
  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run interactive demo simulation
  const handleRunDemoSimulation = () => {
    setDemoStreaming(true);
    setDemoText("");
    setDemoCodeVisible(false);

    const fullTheory = "Here is a high-performance SSE streaming endpoint using Express:";
    let charIdx = 0;

    const timer = setInterval(() => {
      charIdx++;
      setDemoText(fullTheory.slice(0, charIdx));
      if (charIdx >= fullTheory.length) {
        clearInterval(timer);
        setDemoCodeVisible(true);
        setDemoStreaming(false);
      }
    }, 20);
  };

  return (
    <div className="landing-page-root">
      {/* Dynamic Animated Ambient Glows */}
      <motion.div
        className="landing-ambient-top"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="landing-ambient-bottom"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Modern Header */}
      <motion.nav
        className="landing-navbar glass"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="landing-nav-brand">
          <NexaLogo size={32} showTile={true} glow={true} />
          <span className="landing-brand-text">NexaAI</span>
          <span className="landing-badge">4.0 Omni</span>
        </div>

        <div className="landing-nav-links">
          <a href="#playground" className="nav-link">Live Preview</a>
          <a href="#code-engine" className="nav-link">Code Engine</a>
          <a href="#benchmarks" className="nav-link">Benchmarks</a>
          <a href="#features" className="nav-link">Architecture</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>

        <div className="landing-nav-actions">
          <motion.button
            type="button"
            className="launch-app-nav-btn glow-hover"
            onClick={onLaunchApp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch NexaAI App</span>
            <ArrowRight size={15} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="landing-hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Animated Announce Pill */}
        <motion.div
          className="hero-pill-badge"
          variants={itemVariants}
          whileHover={{ scale: 1.04 }}
        >
          <Flame size={14} className="flame-icon" />
          <span>Framer Motion & NexaAI 4.0 Dual-Core Engine</span>
          <ArrowRight size={13} />
        </motion.div>

        {/* Main Giant Headline */}
        <motion.h1 className="hero-main-title" variants={itemVariants}>
          Next-Gen Intelligence. <br />
          <span className="hero-gradient-text">Engineered for Builders.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p className="hero-subtext" variants={itemVariants}>
          Real-time character-by-character streaming, instant code-block rendering, and MongoDB Atlas persistence in an ultra-refined ChatGPT experience.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div className="hero-cta-group" variants={itemVariants}>
          <motion.button
            type="button"
            className="hero-primary-btn glow-hover"
            onClick={onLaunchApp}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Chat Workspace</span>
          </motion.button>

          <a href="#playground" className="hero-secondary-btn">
            <Terminal size={16} />
            <span>Interactive Demo</span>
          </a>
        </motion.div>

        {/* Status Pill */}
        <motion.div className="hero-status-pill" variants={itemVariants}>
          <span className={`hero-status-dot ${backendOnline ? "online" : "connecting"}`} />
          <span>
            {backendOnline
              ? "Connected to MongoDB Atlas (nexaai.nmfwild.mongodb.net)"
              : "Connecting to Backend Pipeline (http://localhost:5000)..."}
          </span>
        </motion.div>
      </motion.section>

      {/* Interactive Live Playground Preview */}
      <section id="playground" className="landing-demo-section">
        <motion.div
          className="demo-mockup-window glass glow-hover"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Mock Window Header */}
          <div className="mock-window-header">
            <div className="window-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="window-title-badge">
              <Sparkles size={13} />
              <span>NexaAI 4.0 Interactive Stream Terminal</span>
            </div>
            <div className="window-status">
              <span className="status-ping-dot pulse-dot" />
              <span>~185ms Latency</span>
            </div>
          </div>

          {/* Mock Window Content */}
          <div className="mock-window-body">
            <div className="mock-message user-mock">
              <div className="mock-bubble user-bubble">
                Write a fast Node.js streaming handler with Server-Sent Events.
              </div>
            </div>

            <div className="mock-message ai-mock">
              <div className="mock-avatar">
                <Sparkles size={16} />
              </div>
              <div className="mock-ai-content">
                <p className="mock-text">
                  {demoText || "Here is a high-performance SSE streaming endpoint using Express:"}
                  {demoStreaming && <span className="typing-cursor-bar">|</span>}
                </p>

                {demoCodeVisible && (
                  <motion.div
                    className="mock-codeblock"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mock-code-header">
                      <span>javascript</span>
                      <span className="copied-pill">Auto-Rendered (0ms Delay)</span>
                    </div>
                    <pre className="mock-code-pre">
{`app.post("/api/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders?.();

  for await (const chunk of stream) {
    res.write(\`data: \${JSON.stringify({ chunk })}\\n\\n\`);
  }
  res.write("data: [DONE]\\n\\n");
  res.end();
});`}
                    </pre>
                  </motion.div>
                )}

                <p className="mock-text">
                  This streams tokens with sub-millisecond dispatch and instant client rendering.
                </p>
              </div>
            </div>

            {/* Interactive Test Action Controls */}
            <div className="mock-interactive-bar">
              <div className="mock-input-row">
                <input
                  type="text"
                  className="mock-demo-input"
                  placeholder="Type any prompt or pick a chip below..."
                  value={demoPromptInput}
                  onChange={(e) => setDemoPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (demoPromptInput.trim()) {
                        onSelectPrompt(demoPromptInput.trim());
                      } else {
                        handleRunDemoSimulation();
                      }
                    }
                  }}
                />
                <motion.button
                  type="button"
                  className="mock-run-btn"
                  onClick={() => {
                    if (demoPromptInput.trim()) {
                      onSelectPrompt(demoPromptInput.trim());
                    } else {
                      handleRunDemoSimulation();
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={14} />
                  <span>Send to App</span>
                </motion.button>
              </div>

              {/* Quick Action Chips to immediately try in the App */}
              <div className="mock-prompt-prompts">
                <span className="mock-prompts-label">Try quick prompts:</span>
                <div className="mock-prompt-chips">
                  {samplePrompts.map((p, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      className="mock-chip-btn"
                      onClick={() => onSelectPrompt(p.text)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span>{p.title}</span>
                      <ArrowRight size={13} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Ribbon */}
      <section className="landing-stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-num">~185ms</span>
            <span className="stat-label">First Token Latency</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">Dual-Core</span>
            <span className="stat-label">Gemini 3.6 + NexaAI</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">99.9%</span>
            <span className="stat-label">MongoDB Atlas Sync</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">0ms</span>
            <span className="stat-label">Code Block Delay</span>
          </div>
        </div>
      </section>

      {/* Interactive Code Engine Showcase with Framer Motion Tabs */}
      <section id="code-engine" className="landing-code-section">
        <div className="section-header-wrap">
          <span className="section-badge">Production Architecture</span>
          <h2 className="section-title">Engineered Code Stack</h2>
          <p className="section-subtext">
            Explore the exact production modules running the NexaAI real-time pipeline.
          </p>
        </div>

        <div className="code-showcase-box glass glow-hover">
          {/* Tabs Bar with Framer Motion layoutId */}
          <div className="code-tabs-header">
            {[
              { id: "sse", label: "Express SSE Stream" },
              { id: "mongodb", label: "MongoDB Atlas Memory" },
              { id: "typewriter", label: "Theory Typewriter Hook" },
              { id: "gemini", label: "Gemini 3.6 Generator" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`code-tab-nav-btn ${activeCodeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveCodeTab(tab.id)}
              >
                <span>{tab.label}</span>
                {activeCodeTab === tab.id && (
                  <motion.div
                    className="code-tab-active-indicator"
                    layoutId="activeCodeTabPill"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}

            <button
              type="button"
              className="copy-snippet-btn"
              onClick={() => handleCopyCode(codeSnippets[activeCodeTab].code)}
              title="Copy code snippet"
            >
              {copiedCode ? <Check size={14} className="check-icon" /> : <Copy size={14} />}
              <span>{copiedCode ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCodeTab}
              className="code-snippet-viewport"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="snippet-meta-row">
                <span className="snippet-title">{codeSnippets[activeCodeTab].title}</span>
                <span className="snippet-lang-tag">{codeSnippets[activeCodeTab].lang}</span>
              </div>
              <pre className="code-display-pre">
                <code>{codeSnippets[activeCodeTab].code}</code>
              </pre>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Model Benchmarks Comparison Matrix */}
      <section id="benchmarks" className="landing-benchmarks-section">
        <div className="section-header-wrap">
          <span className="section-badge">Model Intelligence Matrix</span>
          <h2 className="section-title">Speed Meets Cognitive Depth</h2>
          <p className="section-subtext">
            Compare benchmark metrics between NexaAI 4.0 Dual-Core and conventional architectures.
          </p>
        </div>

        {/* Model Selector Tabs */}
        <div className="benchmark-tabs-row">
          {Object.keys(modelBenchmarks).map((key) => {
            const m = modelBenchmarks[key];
            const isActive = activeModelTab === key;
            return (
              <motion.button
                key={key}
                type="button"
                className={`benchmark-tab-card glass ${isActive ? "active" : ""}`}
                onClick={() => setActiveModelTab(key)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bench-card-top">
                  <span className="bench-name">{m.name}</span>
                  <span className="bench-badge" style={{ borderColor: m.color, color: m.color }}>
                    {m.badge}
                  </span>
                </div>
                <p className="bench-tagline">{m.tagline}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Benchmark Meter Display */}
        <motion.div
          className="benchmark-display-card glass glow-hover"
          key={activeModelTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bench-metrics-grid">
            <div className="bench-metric-item">
              <div className="metric-header">
                <span className="metric-label">First-Token Latency</span>
                <span className="metric-val">{modelBenchmarks[activeModelTab].latency}</span>
              </div>
              <div className="meter-track">
                <motion.div
                  className="meter-fill latency"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeModelTab === "nexa" ? "92%" : activeModelTab === "gemini" ? "88%" : "30%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="bench-metric-item">
              <div className="metric-header">
                <span className="metric-label">Stream Speed</span>
                <span className="metric-val">{modelBenchmarks[activeModelTab].throughput}</span>
              </div>
              <div className="meter-track">
                <motion.div
                  className="meter-fill speed"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeModelTab === "nexa" ? "95%" : activeModelTab === "gemini" ? "90%" : "35%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="bench-metric-item">
              <div className="metric-header">
                <span className="metric-label">Code Reasoning Accuracy</span>
                <span className="metric-val">{modelBenchmarks[activeModelTab].accuracy}</span>
              </div>
              <div className="meter-track">
                <motion.div
                  className="meter-fill accuracy"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeModelTab === "nexa" ? "98%" : activeModelTab === "gemini" ? "94%" : "70%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="bench-metric-item">
              <div className="metric-header">
                <span className="metric-label">Working Context Buffer</span>
                <span className="metric-val">{modelBenchmarks[activeModelTab].memory}</span>
              </div>
              <div className="meter-track">
                <motion.div
                  className="meter-fill memory"
                  initial={{ width: 0 }}
                  animate={{
                    width: activeModelTab === "nexa" ? "100%" : activeModelTab === "gemini" ? "100%" : "15%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="landing-bento-section">
        <div className="section-header-wrap">
          <span className="section-badge">Core Architecture</span>
          <h2 className="section-title">Built with Precision. Designed for Speed.</h2>
          <p className="section-subtext">
            Everything you need for cutting-edge AI interactions in one cohesive system.
          </p>
        </div>

        <div className="bento-grid">
          {bentoItems.map((item, idx) => (
            <motion.div
              key={idx}
              className={`bento-card ${item.size} glass glow-hover`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="bento-top">
                {item.icon}
                <span className="bento-tag">{item.tag}</span>
              </div>
              <h3 className="bento-title">{item.title}</h3>
              <p className="bento-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Topology Overview */}
      <section id="architecture" className="landing-arch-section">
        <div className="section-header-wrap">
          <span className="section-badge">System Topology</span>
          <h2 className="section-title">End-to-End Pipeline</h2>
          <p className="section-subtext">
            How your prompt travels from interface to cluster in milliseconds.
          </p>
        </div>

        <div className="arch-flow-diagram glass">
          <div className="arch-step">
            <div className="step-badge">1</div>
            <h4>User Prompt</h4>
            <p>Typed into floating capsule, formatted with session state.</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="arch-step">
            <div className="step-badge">2</div>
            <h4>Express SSE Core</h4>
            <p>HTTP/SSE chunk pipeline running on port 5000.</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="arch-step">
            <div className="step-badge">3</div>
            <h4>Gemini Flash Engine</h4>
            <p>Low-latency neural inference streaming tokens.</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="arch-step">
            <div className="step-badge">4</div>
            <h4>MongoDB Atlas</h4>
            <p>Persistent storage on cloud cluster with zero drop.</p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion with AnimatePresence */}
      <section id="faq" className="landing-faq-section">
        <div className="section-header-wrap">
          <span className="section-badge">Frequently Asked Questions</span>
          <h2 className="section-title">Everything You Need to Know</h2>
          <p className="section-subtext">Clear answers on how the NexaAI platform operates.</p>
        </div>

        <div className="faq-accordion-container">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="faq-accordion-item glass">
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span className="faq-question-text">{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="faq-chevron" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-answer-wrap"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <p className="faq-answer-text">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="landing-bottom-cta">
        <motion.div
          className="cta-banner-box glass glow-hover"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="cta-content">
            <h2>Ready to Experience Next-Gen AI?</h2>
            <p>Start a conversation now with character streaming, instant code generation, and cloud sync.</p>
            <motion.button
              type="button"
              className="cta-banner-btn glow-hover"
              onClick={onLaunchApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Launch NexaAI App</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <NexaLogo size={24} showTile={true} glow={false} />
            <span className="footer-title">NexaAI</span>
            <span className="footer-copy">© 2026 NexaAI Inc. Built with Framer Motion & Gemini.</span>
          </div>

          <div className="footer-status-pill">
            <span className="pulse-dot status-dot online" />
            <span>MongoDB Atlas Cluster Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
