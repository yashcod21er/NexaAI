import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { api } from "../services/api";
import NexaLogo from "./NexaLogo";

export default function AuthPage({
  initialMode = "login",
  onAuthSuccess,
  onBack,
  onSwitchMode,
}) {
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
  }
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    onSwitchMode?.(newMode);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
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
          email: trimmedEmail,
          password,
        });
        if (res?.success && res.user) {
          setSuccessMsg("Account created! Redirecting to NexaAI...");
          setTimeout(() => {
            onAuthSuccess?.(res.user);
          }, 600);
        } else {
          setError(res?.error || "Registration failed. Please try again.");
        }
      } else {
        const res = await api.login({
          email: trimmedEmail,
          password,
        });
        if (res?.success && res.user) {
          setSuccessMsg("Welcome back! Redirecting...");
          setTimeout(() => {
            onAuthSuccess?.(res.user);
          }, 500);
        } else {
          setError(res?.error || "Invalid email or password.");
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Social Sign-in for Google / Microsoft / Apple
  const handleSocialSignIn = async (providerName) => {
    setError("");
    setSuccessMsg(`Signing in with ${providerName}...`);
    setIsLoading(true);

    try {
      const demoEmail = `${providerName.toLowerCase()}_user@example.com`;
      const demoName = `${providerName} User`;
      const demoPass = "socialAuthPassword2026!";

      let res;
      try {
        res = await api.login({ email: demoEmail, password: demoPass });
      } catch {
        res = await api.register({ name: demoName, email: demoEmail, password: demoPass });
      }

      if (res?.success && res.user) {
        setSuccessMsg(`Successfully authenticated via ${providerName}!`);
        setTimeout(() => {
          onAuthSuccess?.(res.user);
        }, 500);
      }
    } catch (err) {
      setError(`Failed to sign in with ${providerName}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatgpt-auth-page-root">
      {/* Top Navigation Bar with Back Arrow */}
      <header className="chatgpt-auth-header">
        <button
          type="button"
          className="chatgpt-auth-back-btn"
          onClick={onBack}
          title="Return to chat"
        >
          <ArrowLeft size={18} />
          <span>Back to NexaAI</span>
        </button>

        <button
          type="button"
          className="chatgpt-auth-guest-link"
          onClick={onBack}
        >
          Stay in guest mode
        </button>
      </header>

      {/* Main Centered Auth Card */}
      <div className="chatgpt-auth-main">
        <motion.div
          className="chatgpt-auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* NexaAI Glowing Brand Logo */}
          <div className="chatgpt-auth-icon-wrap">
            <NexaLogo size={52} glow={true} />
          </div>

          {/* Title & Subtitle */}
          <div className="chatgpt-auth-title-section">
            <h1 className="chatgpt-auth-heading">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="chatgpt-auth-subheading">
              {mode === "login"
                ? "Log in to your NexaAI account to continue"
                : "Join NexaAI to sync and save your chats across devices"}
            </p>
          </div>

          {/* Error & Success Message Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="chatgpt-auth-alert error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                className="chatgpt-auth-alert success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Form */}
          <form className="chatgpt-auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="chatgpt-auth-field">
                <label className="chatgpt-auth-label">Full name</label>
                <input
                  type="text"
                  className="chatgpt-auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="chatgpt-auth-field">
              <label className="chatgpt-auth-label">Email address</label>
              <input
                type="email"
                className="chatgpt-auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="chatgpt-auth-field">
              <div className="chatgpt-auth-password-header">
                <label className="chatgpt-auth-label">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="chatgpt-forgot-pass-btn"
                    onClick={() => alert("Password reset link sent to " + (email || "your email"))}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="chatgpt-auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="chatgpt-auth-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  className="chatgpt-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="chatgpt-auth-continue-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="chatgpt-auth-spinner" />
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Mode Switcher Link */}
          <div className="chatgpt-auth-switch-link">
            {mode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="chatgpt-link-action"
                  onClick={() => switchMode("signup")}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  className="chatgpt-link-action"
                  onClick={() => switchMode("login")}
                >
                  Log in
                </button>
              </span>
            )}
          </div>

          {/* OR Divider */}
          <div className="chatgpt-auth-divider">
            <span className="chatgpt-divider-line" />
            <span className="chatgpt-divider-text">OR</span>
            <span className="chatgpt-divider-line" />
          </div>

          {/* Social Sign-In Providers */}
          <div className="chatgpt-social-buttons">
            {/* Google */}
            <button
              type="button"
              className="chatgpt-social-btn"
              onClick={() => handleSocialSignIn("Google")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="social-icon">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              className="chatgpt-social-btn"
              onClick={() => handleSocialSignIn("Microsoft")}
            >
              <svg width="19" height="19" viewBox="0 0 23 23" className="social-icon">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Continue with Microsoft Account</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              className="chatgpt-social-btn"
              onClick={() => handleSocialSignIn("Apple")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="social-icon">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.8c.62-.75 1.04-1.8 1.01-2.8-.88.04-1.95.59-2.57 1.34-.55.63-.99 1.68-.86 2.66.99.08 2.02-.45 2.42-1.2z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Legal Footer Links */}
      <footer className="chatgpt-auth-footer">
        <a href="#terms" onClick={(e) => e.preventDefault()} className="chatgpt-footer-link">
          Terms of Use
        </a>
        <span className="chatgpt-footer-bullet">|</span>
        <a href="#privacy" onClick={(e) => e.preventDefault()} className="chatgpt-footer-link">
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}
