"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ─── Color constants from reference (dark-adapted) ─────────────────
const CRIMSON = "#9B1515";
const CRIMSON_STRIPE = "#B01C1C";
const BOARD_BLACK = "#0E0C0B";
const BOARD_CREAM = "#1A1713";

// ─── Genre config ──────────────────────────────────────────────────
const GENRES = [
  { label: "Action",    color: "#fd802e" },
  { label: "Drama",     color: "#ffd2c2" },
  { label: "Thriller",  color: "#cbdde9" },
  { label: "Romance",   color: "#ffd2c2" },
  { label: "Comedy",    color: "#f1e194" },
  { label: "Horror",    color: "#5b0e14" },
];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali"];

// ─── Clapperboard SVG ──────────────────────────────────────────────
function ClapperboardSVG({ armControls }: { armControls: ReturnType<typeof useAnimationControls> }) {
  return (
    <svg
      viewBox="0 0 300 280"
      width="300"
      height="280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Diagonal stripe pattern — red + black (like reference) */}
        <pattern id="diagStripes" patternUnits="userSpaceOnUse" width="22" height="22" patternTransform="rotate(-42)">
          <rect width="11" height="22" fill={CRIMSON_STRIPE} />
          <rect x="11" width="11" height="22" fill={BOARD_BLACK} />
        </pattern>

        {/* Drop shadow filter */}
        <filter id="boardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        {/* Subtle inner glow on crimson section */}
        <filter id="crimsonGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip for arm stripe fill */}
        <clipPath id="armClip">
          <rect x="0" y="0" width="262" height="34" rx="4" />
        </clipPath>
        {/* Clip for top bar */}
        <clipPath id="barClip">
          <rect x="0" y="0" width="300" height="42" />
        </clipPath>
      </defs>

      {/* ── Main body ─────────────────────────────────────── */}
      <g filter="url(#boardShadow)">
        {/* Body outer rect */}
        <rect x="0" y="42" width="300" height="238" rx="4" fill={BOARD_BLACK} />

        {/* Crimson upper section */}
        <rect x="0" y="42" width="300" height="130" rx="4" fill={CRIMSON} />
        {/* Flatten bottom corners of crimson rect */}
        <rect x="0" y="148" width="300" height="24" fill={CRIMSON} />

        {/* Cream lower section */}
        <rect x="0" y="170" width="300" height="110" rx="0" fill={BOARD_CREAM} />

        {/* Divider line between red and cream */}
        <line x1="0" y1="170" x2="300" y2="170" stroke="#2D2B28" strokeWidth="1" />

        {/* ── Cream section labels ── */}
        {/* PRODUCTION */}
        <text x="18" y="200" fontFamily="'Courier Prime', monospace" fontSize="13" fontWeight="700" fill="#4A4640" letterSpacing="1">
          PRODUCTION
        </text>
        <line x1="18" y1="208" x2="282" y2="208" stroke="#2D2B28" strokeWidth="0.8" />

        {/* SCENE */}
        <text x="18" y="228" fontFamily="'Courier Prime', monospace" fontSize="13" fontWeight="700" fill="#4A4640" letterSpacing="1">
          SCENE
        </text>
        <line x1="18" y1="236" x2="282" y2="236" stroke="#2D2B28" strokeWidth="0.8" />

        {/* Bottom row: SCENE | TAKE | ROLL */}
        <line x1="0" y1="250" x2="300" y2="250" stroke="#2D2B28" strokeWidth="0.8" />
        <text x="36" y="265" fontFamily="'Courier Prime', monospace" fontSize="11" fill="#3A3835" letterSpacing="1" textAnchor="middle">SCENE</text>
        <line x1="110" y1="250" x2="110" y2="280" stroke="#2D2B28" strokeWidth="0.8" />
        <text x="150" y="265" fontFamily="'Courier Prime', monospace" fontSize="11" fill="#3A3835" letterSpacing="1" textAnchor="middle">TAKE</text>
        <line x1="190" y1="250" x2="190" y2="280" stroke="#2D2B28" strokeWidth="0.8" />
        <text x="242" y="265" fontFamily="'Courier Prime', monospace" fontSize="11" fill="#3A3835" letterSpacing="1" textAnchor="middle">ROLL</text>
      </g>

      {/* ── Top attachment bar ─────────────────────────────── */}
      <g clipPath="url(#barClip)" filter="url(#boardShadow)">
        {/* Black backing */}
        <rect x="0" y="4" width="300" height="42" fill={BOARD_BLACK} />
        {/* Diagonal stripe fill */}
        <rect x="0" y="4" width="300" height="42" fill="url(#diagStripes)" />
        {/* Top/bottom border lines */}
        <line x1="0" y1="4" x2="300" y2="4" stroke="#1A1816" strokeWidth="1" />
        <line x1="0" y1="46" x2="300" y2="46" stroke="#1A1816" strokeWidth="1" />
      </g>

      {/* ── Bolts ─────────────────────────────────────────── */}
      {[22, 42, 62].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="25" r="7" fill="#161412" stroke="#2D2B28" strokeWidth="1.5" />
          {/* Cross slot */}
          <line x1={cx - 3} y1="25" x2={cx + 3} y2="25" stroke="#3A3835" strokeWidth="1" />
          <line x1={cx} y1="22" x2={cx} y2="28" stroke="#3A3835" strokeWidth="1" />
        </g>
      ))}

      {/* ── Animated Clapper Arm ───────────────────────────── */}
      {/* Pivot point: (18, 4) — left edge of top bar */}
      <motion.g
        style={{ transformOrigin: "18px 38px" }}
        animate={armControls}
      >
        {/* Arm body */}
        <rect x="18" y="4" width="262" height="34" rx="3" fill={BOARD_BLACK} clipPath="url(#armClip)" />
        {/* Stripe fill */}
        <rect x="18" y="4" width="262" height="34" fill="url(#diagStripes)" clipPath="url(#armClip)" />
        {/* Arm border */}
        <rect x="18" y="4" width="262" height="34" rx="3" fill="none" stroke="#1A1816" strokeWidth="1" />
        {/* Pivot rivet */}
        <circle cx="18" cy="21" r="5" fill="#161412" stroke="#2D2B28" strokeWidth="1.5" />
        <circle cx="18" cy="21" r="2" fill="#3A3835" />
      </motion.g>
    </svg>
  );
}

// ─── Floating particles (film sprocket holes) ──────────────────────
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, bottom: 0 }}
      animate={{ y: [-20, -180], opacity: [0, 0.25, 0] }}
      transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, ease: "easeOut" }}
    >
      <div
        className="border border-border-default rounded-[1px]"
        style={{ width: size, height: size * 1.4, background: "transparent" }}
      />
    </motion.div>
  );
}

// ─── Generate Page (Story Input) ───────────────────────────────────
export default function GeneratePage() {
  const router = useRouter();
  const armControls = useAnimationControls();
  const boardControls = useAnimationControls();
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Thriller");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState(60);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Arm open on mount, snaps closed, rests slightly open
  const handleMountAnimation = async () => {
    // Start open
    await armControls.set({ rotate: -28 });
    // Snap shut with spring physics
    await armControls.start({
      rotate: 2,
      transition: { type: "spring", stiffness: 600, damping: 18, delay: 0.6 },
    });
    // Rest slightly open
    await armControls.start({
      rotate: -14,
      transition: { type: "spring", stiffness: 200, damping: 22 },
    });
  };

  const handleGenerate = async () => {
    if (!idea.trim() || isLaunching) return;
    setIsLaunching(true);

    // Clap the arm shut
    await armControls.start({
      rotate: 2,
      transition: { type: "spring", stiffness: 800, damping: 14 },
    });
    // Board jolt (fire and forget — no need to await)
    boardControls.start({
      y: [0, -6, 0],
      transition: { duration: 0.2 },
    });

    localStorage.setItem("scriptoria_request", JSON.stringify({
      story_idea: idea,
      genre,
      language,
      tone,
    }));

    router.push("/loading");
  };

  const particles = Array.from({ length: 10 }, (_, i) => ({
    delay: i * 0.5,
    x: 80 + i * 14,
    size: 6 + (i % 3) * 2,
  }));

  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col items-center film-grain">

      {/* ── Background: radial crimson glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, #2a0505 0%, #0A0908 70%)",
        }}
      />

      {/* ── Subtle horizontal scan lines ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #F5F5F5 0px, transparent 1px, transparent 3px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* ── Floating sprocket particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 w-full px-8 pt-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex flex-col gap-[3px] justify-center">
            <div className="w-full h-[2px] bg-brand-white" />
            <div className="w-3/4 h-[2px]" style={{ background: CRIMSON }} />
            <div className="w-full h-[2px] bg-brand-white" />
          </div>
          <span className="font-display text-[18px] text-brand-white uppercase leading-none tracking-widest">
            SCRIPTORIA
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-ui text-[10px] text-text-muted uppercase tracking-widest">Powered by</span>
          <span className="font-ui text-[10px] uppercase tracking-widest" style={{ color: CRIMSON }}>Groq · Sarvam AI</span>
        </div>
      </header>

      {/* ── Hero: Floating Clapperboard ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center mt-10"
        animate={boardControls}
        onViewportEnter={handleMountAnimation}
      >
        {/* Antigravity float loop */}
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotate: [-0.4, 0.4, -0.4],
          }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ filter: `drop-shadow(0 24px 40px ${CRIMSON}40)` }}
        >
          <ClapperboardSVG armControls={armControls} />
        </motion.div>

        {/* Reflection / ground shadow */}
        <div
          className="w-[200px] h-[12px] rounded-full mt-1"
          style={{
            background: `radial-gradient(ellipse, ${CRIMSON}30 0%, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
      </motion.div>

      {/* ── Main form area ── */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="relative z-10 w-full max-w-[680px] px-6 flex flex-col mt-6 pb-12"
      >
        {/* Title */}
        <h1 className="font-display text-[58px] text-text-primary text-center leading-none mb-1 tracking-wide">
          WHAT'S YOUR
          <span style={{ color: CRIMSON }}> STORY?</span>
        </h1>
        <p className="font-ui text-[12px] text-text-muted text-center mb-6 tracking-widest uppercase">
          AI-Powered Pre-Production · Screenplay → Moodboard → Export
        </p>

        {/* Idea textarea */}
        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A retired cop in Mumbai discovers his daughter is leading a cartel..."
            rows={3}
            className="w-full bg-bg-surface border border-border-default text-text-primary font-screenplay text-[13px] resize-none outline-none p-4 placeholder:text-text-muted rounded-[4px] transition-colors focus:border-[#9B1515]"
            style={{ lineHeight: 1.7 }}
          />
          <div className="absolute bottom-3 right-3 font-ui text-[10px] text-text-muted">
            {idea.length} chars
          </div>
        </div>

        {/* Genre pills */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="font-ui text-[10px] text-text-muted uppercase tracking-widest mr-1">GENRE</span>
          {GENRES.map(({ label, color }) => (
            <button
              key={label}
              onClick={() => setGenre(label)}
              className="px-3 py-1.5 rounded-[2px] font-ui text-[11px] uppercase tracking-wider border transition-all duration-150"
              style={{
                borderColor: genre === label ? color : "#2D2B28",
                color: genre === label ? color : "#6B6560",
                background: genre === label ? color + "18" : "transparent",
                boxShadow: genre === label ? `0 0 12px ${color}20` : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Language + Tone row */}
        <div className="flex items-center justify-between mt-4 gap-4">
          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-bg-surface border border-border-default rounded-[4px] px-3 py-2 font-ui text-[12px] text-text-primary hover:border-brand-white transition-colors"
            >
              <span className="text-text-muted uppercase text-[10px] tracking-wider mr-1">LANG</span>
              {language}
              <ChevronDown size={12} className="text-text-muted" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-1 left-0 min-w-full bg-bg-elevated border border-border-default rounded-[4px] z-20 overflow-hidden">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    className="w-full text-left px-3 py-2 font-ui text-[12px] text-text-primary hover:bg-bg-surface transition-colors"
                    onClick={() => { setLanguage(l); setDropdownOpen(false); }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tone slider */}
          <div className="flex items-center gap-3 flex-1">
            <span className="font-ui text-[10px] uppercase tracking-widest" style={{ color: "#f1e194" }}>
              MASALA
            </span>
            <div className="flex-1 relative h-4 flex items-center">
              <input
                type="range"
                min="0" max="100"
                value={tone}
                onChange={(e) => setTone(parseInt(e.target.value))}
                className="w-full h-[3px] appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #f1e194 0%, #cbdde9 100%)`,
                  borderRadius: "2px",
                }}
              />
            </div>
            <span className="font-ui text-[10px] uppercase tracking-widest" style={{ color: "#cbdde9" }}>
              NOLAN
            </span>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleGenerate}
          disabled={!idea.trim() || isLaunching}
          className="w-full h-[56px] mt-5 rounded-[4px] font-display text-[22px] tracking-widest transition-all duration-200 relative overflow-hidden"
          style={{
            background: idea.trim() ? CRIMSON : "#1C1A18",
            color: idea.trim() ? "#F5F5F5" : "#6B6560",
            border: `1px solid ${idea.trim() ? CRIMSON : "#2D2B28"}`,
          }}
          whileHover={idea.trim() ? { scale: 1.01, boxShadow: `0 0 32px ${CRIMSON}50` } : {}}
          whileTap={idea.trim() ? { scale: 0.99 } : {}}
        >
          {/* Subtle stripe shimmer inside button */}
          {idea.trim() && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["-100% 0", "200% 0"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className="relative z-10">
            {isLaunching ? "LIGHTS, CAMERA..." : "ROLL CAMERA"}
          </span>
        </motion.button>

        <p className="text-center font-ui text-[10px] text-text-muted mt-3 tracking-widest uppercase">
          Generates in ~30 seconds · Screenplay + AD Analysis + Moodboard
        </p>
      </motion.main>
    </div>
  );
}
