import React, { useState, useEffect } from "react";

/**
 * NexaLogo - 100% Scalable Vector Graphics (SVG) Brand Logo
 * Crafted with agency-level mathematical precision, folded isometric bevels,
 * and zero AI artifacts.
 *
 * Supported Variants:
 * 1. "prism"   - The Nexus Prism (Folded isometric 3-facet origami 'N') [Default]
 * 2. "loop"    - The Quantum Core (Continuous topological neural loop)
 * 3. "hex"     - The Hex Monolith (Cybernetic compiler polygon)
 * 4. "minimal" - The Kinetic Monogram (Pure minimalist dual pillars & blade)
 */
export default function NexaLogo({
  size = 32,
  showText = false,
  showTile = true,
  className = "",
  glow = true,
  variant, // If supplied, forces a variant. Otherwise listens to localStorage "nexaai_logo_variant"
}) {
  const [activeVariant, setActiveVariant] = useState(() => {
    if (variant) return variant;
    try {
      return localStorage.getItem("nexaai_logo_variant") || "prism";
    } catch {
      return "prism";
    }
  });

  useEffect(() => {
    if (variant) {
      setActiveVariant(variant);
      return;
    }

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("nexaai_logo_variant") || "prism";
        setActiveVariant(stored);
      } catch {
        // ignore
      }
    };

    window.addEventListener("nexaai_logo_change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("nexaai_logo_change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [variant]);

  // Unique ID prefix to prevent SVG gradient ID collisions when multiple logos are rendered on the same screen
  const id = React.useId().replace(/:/g, "");

  return (
    <div
      className={`nexa-logo-container ${className}`}
      style={{ gap: showText ? `${Math.max(8, size * 0.28)}px` : 0 }}
    >
      <div
        className={`nexa-logo-svg-wrapper ${glow ? "glow-effect" : ""}`}
        style={{
          width: size,
          height: size,
          borderRadius: showTile ? `${Math.max(6, size * 0.22)}px` : "0px",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="nexa-logo-svg"
        >
          {/* =========================================================
              VARIANT 1: THE NEXUS PRISM (DEFAULT / RECOMMENDED)
              Folded 3-facet origami letterform with optical bevel depth
             ========================================================= */}
          {activeVariant === "prism" && (
            <>
              <defs>
                <linearGradient id={`${id}-prismStemL`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10a37f" />
                  <stop offset="100%" stopColor="#0a6b52" />
                </linearGradient>
                <linearGradient id={`${id}-prismDiag`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="45%" stopColor="#10a37f" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id={`${id}-prismStemR`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <filter id={`${id}-prismShadow`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="-1.5" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.65" />
                </filter>
                <filter id={`${id}-prismPulse`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Obsidian Tile Shield */}
              {showTile && (
                <rect
                  width="100"
                  height="100"
                  rx="22"
                  fill="#0d0e12"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1.5"
                />
              )}

              {/* Ambient Center Glow */}
              <circle cx="50" cy="50" r="28" fill="#10a37f" opacity="0.14" filter={`url(#${id}-prismPulse)`} />

              {/* Left Vertical Monolith */}
              <path
                d="M24 23C24 19.686 26.686 17 30 17H38C39.657 17 41 18.343 41 20V80C41 81.657 39.657 83 38 83H30C26.686 83 24 80.314 24 77V23Z"
                fill={`url(#${id}-prismStemL)`}
              />

              {/* Right Vertical Monolith */}
              <path
                d="M59 17H67C70.314 17 73 19.686 73 23V77C73 80.314 70.314 83 67 83H59C57.343 83 56 81.657 56 80V20C56 18.343 57.343 17 59 17Z"
                fill={`url(#${id}-prismStemR)`}
              />

              {/* Dynamic Folded Diagonal Ribbon */}
              <path
                d="M26 21C26 18.5 28.6 17.2 30.8 18.5L71.4 78.5C72.8 80.6 71.3 83 68.7 83H58.5C56.6 83 54.8 82 53.7 80.3L26.8 24.2C26.3 23.3 26 22.2 26 21Z"
                fill={`url(#${id}-prismDiag)`}
                filter={`url(#${id}-prismShadow)`}
              />

              {/* Neural Synapse Center Node */}
              <circle cx="50" cy="50" r="3.2" fill="#ffffff" filter={`url(#${id}-prismPulse)`} />
              <circle cx="50" cy="50" r="1.6" fill="#10a37f" />
            </>
          )}

          {/* =========================================================
              VARIANT 2: THE QUANTUM CORE
              Continuous mathematical loop (OpenAI / Perplexity style)
             ========================================================= */}
          {activeVariant === "loop" && (
            <>
              <defs>
                <linearGradient id={`${id}-coreGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10a37f" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id={`${id}-coreGlow`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.45" />
                </filter>
              </defs>

              {showTile && (
                <rect
                  width="100"
                  height="100"
                  rx="22"
                  fill="#0d0e12"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1.5"
                />
              )}

              {/* Interlocking Infinite Loop */}
              <path
                d="M 28 74 V 32 C 28 22 42 16 50 26 L 50 74 C 58 84 72 78 72 68 V 26"
                stroke={`url(#${id}-coreGrad)`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${id}-coreGlow)`}
              />
              <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
              <circle cx="50" cy="50" r="2.2" fill="#10a37f" />
            </>
          )}

          {/* =========================================================
              VARIANT 3: THE HEX MONOLITH
              Cybernetic microchip hexagon with kinetic diagonal
             ========================================================= */}
          {activeVariant === "hex" && (
            <>
              <defs>
                <linearGradient id={`${id}-hexGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10a37f" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {showTile && (
                <rect
                  width="100"
                  height="100"
                  rx="22"
                  fill="#0d0e12"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1.5"
                />
              )}

              <polygon
                points="50,15 82,33 82,67 50,85 18,67 18,33"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M 32 66 V 34 L 48 34 L 56 54 L 68 34 L 68 66"
                stroke={`url(#${id}-hexGrad)`}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="15" r="3" fill="#10a37f" />
              <circle cx="82" cy="67" r="3" fill="#06b6d4" />
              <circle cx="18" cy="67" r="3" fill="#8b5cf6" />
            </>
          )}

          {/* =========================================================
              VARIANT 4: THE KINETIC MONOGRAM
              Pure mathematical minimalism (Stripe / Supabase style)
             ========================================================= */}
          {activeVariant === "minimal" && (
            <>
              <defs>
                <linearGradient id={`${id}-minGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10a37f" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {showTile && (
                <rect
                  width="100"
                  height="100"
                  rx="22"
                  fill="#0d0e12"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1.5"
                />
              )}

              <rect x="25" y="21" width="12" height="58" rx="6" fill="#ffffff" opacity="0.95" />
              <rect x="63" y="21" width="12" height="58" rx="6" fill="#ffffff" opacity="0.95" />
              <path
                d="M 33 26 L 67 74"
                stroke={`url(#${id}-minGrad)`}
                strokeWidth="12"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="3" fill="#ffffff" />
            </>
          )}
        </svg>
      </div>

      {showText && (
        <div className="nexa-logo-brand-text">
          <span className="nexa-brand-nexa">Nexa</span>
          <span className="nexa-brand-ai">AI</span>
        </div>
      )}
    </div>
  );
}
