import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { api } from "../services/api";
import NexaLogo from "./NexaLogo";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (res.success && res.user) {
          setSuccessMsg("Account created! Logging you in...");
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 800);
        }
      } else {
        const res = await api.login({
          email: email.trim(),
          password,
        });
        if (res.success && res.user) {
          setSuccessMsg("Welcome back!");
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 600);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="auth-modal-dialog glass"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 350 }}
        >
          {/* Header */}
          <div className="auth-modal-header">
            <div className="auth-brand-badge">
              <NexaLogo size={24} showTile={true} />
              <span className="auth-brand-title">NexaAI</span>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="auth-modal-titles">
            <h2>{mode === "login" ? "Welcome back" : "Create an account"}</h2>
            <p>
              {mode === "login"
                ? "Log in to access your saved chat threads and history."
                : "Sign up to sync conversations across all your devices."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`auth-mode-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => handleModeSwitch("login")}
            >
              <span>Log in</span>
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => handleModeSwitch("signup")}
            >
              <span>Sign up</span>
            </button>
          </div>

          {/* Error / Success Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="auth-alert-box error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                className="auth-alert-box success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <CheckCircle2 size={15} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-field-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-field-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="chatgpt-loading-spinner" />
              ) : (
                <>
                  <span>{mode === "login" ? "Log in" : "Create account"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Guest Option Footer */}
          <div className="auth-modal-footer">
            <span className="auth-or-divider">or</span>
            <button
              type="button"
              className="auth-guest-btn"
              onClick={onClose}
            >
              Continue exploring as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
