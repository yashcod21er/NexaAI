export default function NexaLogo({
  size = 32,
  showText = false,
  className = "",
  glow = true,
  variant = "image", // "image" | "svg"
}) {
  return (
    <div className={`nexa-logo-container ${className}`} style={{ gap: showText ? `${Math.max(8, size * 0.28)}px` : 0 }}>
      {variant === "image" ? (
        <div
          className={`nexa-logo-image-wrapper ${glow ? "glow-effect" : ""}`}
          style={{
            width: size,
            height: size,
            borderRadius: `${Math.max(6, size * 0.22)}px`,
          }}
        >
          <img
            src="/nexaai-icon.jpg"
            alt="NexaAI Logo"
            className="nexa-logo-img"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`nexa-logo-svg ${glow ? "glow-effect" : ""}`}
        >
          <defs>
            <linearGradient id="nexaGrad1" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#10a37f" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <radialGradient id="nexaCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38ef7d" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <filter id="nexaShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10a37f" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Background Rounded Shield */}
          <rect width="100" height="100" rx="22" fill="#0d0e12" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          
          {/* Ambient Core Glow */}
          <circle cx="50" cy="50" r="28" fill="url(#nexaCoreGlow)" />

          {/* Stylized Futuristic Interlocking 'N' and Quantum Orbit */}
          <path
            d="M26 72V28L48 58V28M48 58L74 28V72"
            stroke="url(#nexaGrad1)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#nexaShadow)"
          />

          {/* Quantum Infinity Ring */}
          <path
            d="M32 40C32 34 38 28 48 38C58 48 68 54 74 46C80 38 74 28 64 32"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="4 2"
            opacity="0.85"
          />

          {/* Central Neural Orb */}
          <circle cx="48" cy="50" r="5" fill="#ffffff" filter="url(#nexaShadow)" />
          <circle cx="48" cy="50" r="2.5" fill="#10a37f" />
        </svg>
      )}

      {showText && (
        <div className="nexa-logo-brand-text">
          <span className="nexa-brand-nexa">Nexa</span>
          <span className="nexa-brand-ai">AI</span>
        </div>
      )}
    </div>
  );
}
