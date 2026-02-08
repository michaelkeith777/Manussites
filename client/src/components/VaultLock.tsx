import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PASSCODE = "02141971";

// ── Web Audio API Sound Generator ──────────────────────────────────
class VaultSounds {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  click() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(3200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch { /* silent */ }
  }

  dialTurn(duration: number = 0.8) {
    try {
      const ctx = this.getCtx();
      const clickCount = Math.floor(duration * 30);
      for (let i = 0; i < clickCount; i++) {
        const t = ctx.currentTime + (i * duration) / clickCount;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1800 + Math.random() * 600, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.015);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.start(t);
        osc.stop(t + 0.02);
      }
    } catch { /* silent */ }
  }

  unlock() {
    try {
      const ctx = this.getCtx();
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.type = "sine";
      thud.frequency.setValueAtTime(80, ctx.currentTime);
      thud.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);
      thudGain.gain.setValueAtTime(0.4, ctx.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      thud.start(ctx.currentTime);
      thud.stop(ctx.currentTime + 0.6);

      const scrape = ctx.createOscillator();
      const scrapeGain = ctx.createGain();
      scrape.connect(scrapeGain);
      scrapeGain.connect(ctx.destination);
      scrape.type = "sawtooth";
      scrape.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
      scrape.frequency.linearRampToValueAtTime(60, ctx.currentTime + 1.2);
      scrapeGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
      scrapeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);
      scrape.start(ctx.currentTime + 0.1);
      scrape.stop(ctx.currentTime + 1.3);

      setTimeout(() => {
        const clank = ctx.createOscillator();
        const clankGain = ctx.createGain();
        clank.connect(clankGain);
        clankGain.connect(ctx.destination);
        clank.type = "triangle";
        clank.frequency.setValueAtTime(400, ctx.currentTime);
        clank.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        clankGain.gain.setValueAtTime(0.3, ctx.currentTime);
        clankGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        clank.start(ctx.currentTime);
        clank.stop(ctx.currentTime + 0.2);
      }, 600);

      setTimeout(() => {
        const hinge = ctx.createOscillator();
        const hingeGain = ctx.createGain();
        const hingeFilter = ctx.createBiquadFilter();
        hinge.connect(hingeFilter);
        hingeFilter.connect(hingeGain);
        hingeGain.connect(ctx.destination);
        hinge.type = "sawtooth";
        hingeFilter.type = "bandpass";
        hingeFilter.frequency.setValueAtTime(800, ctx.currentTime);
        hingeFilter.Q.setValueAtTime(5, ctx.currentTime);
        hinge.frequency.setValueAtTime(150, ctx.currentTime);
        hinge.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.4);
        hinge.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1.0);
        hingeGain.gain.setValueAtTime(0.06, ctx.currentTime);
        hingeGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
        hingeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        hinge.start(ctx.currentTime);
        hinge.stop(ctx.currentTime + 1.2);
      }, 1000);
    } catch { /* silent */ }
  }

  celebrate() {
    try {
      const ctx = this.getCtx();
      // Ascending triumphant chimes
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
      });
      // Shimmer effect
      for (let i = 0; i < 8; i++) {
        const t = ctx.currentTime + 0.8 + i * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000 + Math.random() * 3000, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
      }
    } catch { /* silent */ }
  }

  error() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* silent */ }
  }
}

// ── Floating Gear SVG ──────────────────────────────────────────────
function GearSVG({ teeth, innerR, outerR, size }: { teeth: number; innerR: number; outerR: number; size: number }) {
  const path = useMemo(() => {
    const steps: string[] = [];
    const toothAngle = (2 * Math.PI) / teeth;
    const halfTooth = toothAngle / 4;
    for (let i = 0; i < teeth; i++) {
      const a = i * toothAngle;
      const x1 = 50 + innerR * Math.cos(a - halfTooth);
      const y1 = 50 + innerR * Math.sin(a - halfTooth);
      const x2 = 50 + outerR * Math.cos(a - halfTooth * 0.6);
      const y2 = 50 + outerR * Math.sin(a - halfTooth * 0.6);
      const x3 = 50 + outerR * Math.cos(a + halfTooth * 0.6);
      const y3 = 50 + outerR * Math.sin(a + halfTooth * 0.6);
      const x4 = 50 + innerR * Math.cos(a + halfTooth);
      const y4 = 50 + innerR * Math.sin(a + halfTooth);
      if (i === 0) steps.push(`M ${x1} ${y1}`);
      steps.push(`L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`);
    }
    steps.push("Z");
    return steps.join(" ");
  }, [teeth, innerR, outerR]);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
      <circle cx="50" cy="50" r={innerR * 0.4} stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  );
}

// ── Floating Gears Background ──────────────────────────────────────
function FloatingGears() {
  const gears = useMemo(() => [
    { id: 1, x: "5%", y: "8%", size: 120, teeth: 12, innerR: 32, outerR: 42, duration: 30, direction: 1, opacity: 0.08 },
    { id: 2, x: "85%", y: "5%", size: 90, teeth: 8, innerR: 30, outerR: 40, duration: 25, direction: -1, opacity: 0.06 },
    { id: 3, x: "92%", y: "60%", size: 150, teeth: 16, innerR: 34, outerR: 44, duration: 40, direction: 1, opacity: 0.05 },
    { id: 4, x: "3%", y: "70%", size: 100, teeth: 10, innerR: 31, outerR: 41, duration: 35, direction: -1, opacity: 0.07 },
    { id: 5, x: "20%", y: "85%", size: 70, teeth: 6, innerR: 28, outerR: 40, duration: 20, direction: 1, opacity: 0.06 },
    { id: 6, x: "75%", y: "80%", size: 80, teeth: 9, innerR: 30, outerR: 42, duration: 28, direction: -1, opacity: 0.05 },
    { id: 7, x: "45%", y: "3%", size: 60, teeth: 7, innerR: 29, outerR: 41, duration: 22, direction: 1, opacity: 0.04 },
    { id: 8, x: "15%", y: "40%", size: 55, teeth: 8, innerR: 30, outerR: 40, duration: 32, direction: -1, opacity: 0.05 },
    { id: 9, x: "80%", y: "35%", size: 65, teeth: 11, innerR: 33, outerR: 43, duration: 27, direction: 1, opacity: 0.04 },
    { id: 10, x: "55%", y: "90%", size: 95, teeth: 14, innerR: 33, outerR: 43, duration: 38, direction: -1, opacity: 0.06 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {gears.map((g) => (
        <motion.div
          key={g.id}
          className="absolute text-purple-400"
          style={{ left: g.x, top: g.y, opacity: g.opacity, translateX: "-50%", translateY: "-50%" }}
          animate={{
            rotate: g.direction > 0 ? [0, 360] : [360, 0],
            y: [0, -8, 0, 8, 0],
          }}
          transition={{
            rotate: { duration: g.duration, repeat: Infinity, ease: "linear" },
            y: { duration: g.duration * 0.4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <GearSVG teeth={g.teeth} innerR={g.innerR} outerR={g.outerR} size={g.size} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Modern Combination Dial ────────────────────────────────────────
function ModernDial({ rotation, isUnlocking }: { rotation: number; isUnlocking: boolean }) {
  const segments = 40;
  const majorEvery = 5;

  return (
    <div className="relative" style={{ width: 'clamp(140px, 25vh, 208px)', height: 'clamp(140px, 25vh, 208px)' }}>
      {/* Outer glow ring */}
      <div
        className="absolute -inset-2 rounded-full"
        style={{
          background: isUnlocking
            ? "conic-gradient(from 0deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3), rgba(139,92,246,0.3))"
            : "conic-gradient(from 0deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
          filter: "blur(8px)",
          transition: "all 0.5s ease",
        }}
      />

      {/* Main dial body */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/[0.06]"
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 35, damping: 14, mass: 2 }}
        style={{
          background: "linear-gradient(145deg, rgba(30,30,50,0.95), rgba(15,15,30,0.98))",
          boxShadow: `
            0 0 0 1px rgba(139,92,246,0.1),
            inset 0 1px 3px rgba(255,255,255,0.04),
            inset 0 -2px 6px rgba(0,0,0,0.4),
            0 8px 32px rgba(0,0,0,0.5)
          `,
        }}
      >
        {/* Segment marks */}
        {Array.from({ length: segments }, (_, i) => {
          const angle = (i * 360) / segments;
          const isMajor = i % majorEvery === 0;
          return (
            <div
              key={i}
              className="absolute top-0 left-1/2 origin-bottom"
              style={{
                transform: `translateX(-50%) rotate(${angle}deg)`,
                height: "50%",
              }}
            >
              <div
                style={{
                  width: isMajor ? "2px" : "1px",
                  height: isMajor ? "10px" : "5px",
                  marginTop: "4px",
                  background: isMajor
                    ? "linear-gradient(180deg, rgba(167,139,250,0.8), rgba(167,139,250,0.2))"
                    : "rgba(255,255,255,0.15)",
                  borderRadius: "1px",
                }}
              />
            </div>
          );
        })}

        {/* Numbers */}
        {Array.from({ length: 8 }, (_, i) => {
          const num = i * 5;
          const angle = (i * 360) / 8 - 90;
          const radius = 36;
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <div
              key={num}
              className="absolute font-mono text-[10px] sm:text-xs font-semibold"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                color: "rgba(167,139,250,0.7)",
              }}
            >
              {num}
            </div>
          );
        })}

        {/* Center hub - modern concentric rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 40% 40%, rgba(40,40,60,1), rgba(15,15,25,1))",
              boxShadow: "inset 0 1px 4px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{
                background: isUnlocking
                  ? "radial-gradient(circle at 40% 40%, rgba(139,92,246,0.6), rgba(99,102,241,0.3))"
                  : "radial-gradient(circle at 40% 40%, rgba(40,40,55,1), rgba(20,20,35,1))",
                boxShadow: isUnlocking
                  ? "0 0 20px rgba(139,92,246,0.4), inset 0 1px 3px rgba(255,255,255,0.1)"
                  : "inset 0 1px 3px rgba(255,255,255,0.04)",
                transition: "all 0.6s ease",
                border: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                style={{
                  background: isUnlocking
                    ? "radial-gradient(circle, #a78bfa, #7c3aed)"
                    : "radial-gradient(circle, rgba(60,60,80,1), rgba(30,30,45,1))",
                  boxShadow: isUnlocking ? "0 0 12px rgba(139,92,246,0.6)" : "none",
                  transition: "all 0.6s ease",
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed indicator - modern arrow */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "14px solid #a78bfa",
            filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))",
          }}
        />
      </div>
    </div>
  );
}

// ── Number Pad ─────────────────────────────────────────────────────
function NumberPad({
  onPress,
  onClear,
  disabled,
}: {
  onPress: (n: string) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "⏎"],
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5" style={{ width: 'clamp(140px, 25vh, 208px)' }}>
      {keys.flat().map((key) => (
        <motion.button
          key={key}
          whileHover={disabled ? {} : { scale: 1.06, borderColor: "rgba(139,92,246,0.4)" }}
          whileTap={disabled ? {} : { scale: 0.92 }}
          disabled={disabled}
          onClick={() => {
            if (key === "C") onClear();
            else if (key !== "⏎") onPress(key);
          }}
          style={{ height: 'clamp(32px, 5vh, 44px)' }}
          className={`
            rounded-lg font-semibold text-sm
            transition-all duration-150 backdrop-blur-sm
            ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
            ${key === "C"
              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              : key === "⏎"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                : "bg-white/[0.03] text-gray-300 border border-white/[0.08] hover:bg-white/[0.06]"
            }
          `}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}

// ── Digit Display ──────────────────────────────────────────────────
function DigitDisplay({ entered, maxLen, error }: { entered: string; maxLen: number; error: boolean }) {
  const slots = Array.from({ length: maxLen }, (_, i) => entered[i] || null);

  return (
    <div className="flex gap-1">
      {slots.map((digit, i) => (
        <motion.div
          key={i}
          animate={error ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ width: 'clamp(24px, 3.5vh, 32px)', height: 'clamp(28px, 4vh, 40px)' }}
          className={`
            rounded-md flex items-center justify-center
            font-mono text-sm font-bold
            border backdrop-blur-sm transition-all duration-200
            ${error
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : digit !== null
                ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                : "border-white/[0.08] bg-white/[0.02] text-gray-600"
            }
          `}
        >
          {digit !== null ? "●" : "–"}
        </motion.div>
      ))}
    </div>
  );
}

// ── Celebration Effect (Confetti + Sparkles) ──────────────────────
function CelebrationEffect() {
  const confettiPieces = useMemo(() => {
    const colors = [
      '#c4b5fd', '#a78bfa', '#818cf8', '#7c3aed', '#6d28d9',
      '#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6',
      '#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#06b6d4'
    ];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 1.5,
      duration: Math.random() * 2 + 2,
      rotation: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 200,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));
  }, []);

  const sparkles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 2,
      duration: Math.random() * 1 + 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[10001] pointer-events-none overflow-hidden">
      {/* Confetti pieces falling from top */}
      {confettiPieces.map((p) => (
        <motion.div
          key={`confetti-${p.id}`}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            y: '110vh',
            x: `calc(${p.x}vw + ${p.drift}px)`,
            opacity: [0, 1, 1, 0.8, 0],
            rotate: p.rotation,
            scale: [0, 1, 1, 0.8, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            width: p.shape === 'rect' ? p.size : p.size,
            height: p.shape === 'rect' ? p.size * 0.4 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '1px',
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}40`,
          }}
        />
      ))}

      {/* Sparkle bursts */}
      {sparkles.map((s) => (
        <motion.div
          key={`sparkle-${s.id}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: 2,
            repeatDelay: 0.3,
          }}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
        >
          {/* 4-pointed star sparkle */}
          <svg width={s.size * 3} height={s.size * 3} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z"
              fill="white"
              opacity="0.9"
            />
          </svg>
        </motion.div>
      ))}

      {/* Central burst flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0, 2, 3] }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}

// ── Hinge Dust Particles ──────────────────────────────────────────
function HingeDust() {
  // Hinge positions: left door hinges at x=0%, right door hinges at x=100%
  // Y positions at 20%, 50%, 80% matching the hinge details on the doors
  const particles = useMemo(() => {
    const hinges = [
      // Left door hinges
      { x: 0, y: 20 },
      { x: 0, y: 50 },
      { x: 0, y: 80 },
      // Right door hinges
      { x: 100, y: 20 },
      { x: 100, y: 50 },
      { x: 100, y: 80 },
    ];
    const result: Array<{
      id: number;
      startX: number;
      startY: number;
      driftX: number;
      fallDistance: number;
      size: number;
      delay: number;
      duration: number;
      opacity: number;
      color: string;
    }> = [];
    let id = 0;
    const dustColors = [
      'rgba(120,100,80,0.8)',
      'rgba(140,120,90,0.7)',
      'rgba(100,85,70,0.6)',
      'rgba(160,140,110,0.5)',
      'rgba(90,75,60,0.7)',
      'rgba(130,110,85,0.6)',
    ];
    hinges.forEach((hinge) => {
      // 12-18 particles per hinge
      const count = 12 + Math.floor(Math.random() * 7);
      for (let i = 0; i < count; i++) {
        const isLeft = hinge.x === 0;
        result.push({
          id: id++,
          startX: hinge.x + (isLeft ? Math.random() * 3 : -Math.random() * 3),
          startY: hinge.y + (Math.random() - 0.5) * 8,
          driftX: isLeft ? (Math.random() * 6 + 2) : -(Math.random() * 6 + 2),
          fallDistance: Math.random() * 25 + 10,
          size: Math.random() * 4 + 1.5,
          delay: 0.6 + Math.random() * 1.2, // Start when doors begin moving
          duration: Math.random() * 1.8 + 1.2,
          opacity: Math.random() * 0.6 + 0.3,
          color: dustColors[Math.floor(Math.random() * dustColors.length)],
        });
      }
    });
    return result;
  }, []);

  // Additional fine dust cloud that puffs outward from center seam
  const seamDust = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      startY: 20 + Math.random() * 60,
      driftX: (Math.random() - 0.5) * 15,
      driftY: (Math.random() - 0.5) * 10,
      size: Math.random() * 3 + 1,
      delay: 0.8 + Math.random() * 0.8,
      duration: Math.random() * 1.5 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[10002] pointer-events-none overflow-hidden">
      {/* Hinge dust particles */}
      {particles.map((p) => (
        <motion.div
          key={`dust-${p.id}`}
          initial={{
            x: `${p.startX}vw`,
            y: `${p.startY}vh`,
            opacity: 0,
            scale: 0.3,
          }}
          animate={{
            x: `calc(${p.startX}vw + ${p.driftX}vw)`,
            y: `calc(${p.startY}vh + ${p.fallDistance}vh)`,
            opacity: [0, p.opacity, p.opacity * 0.8, 0],
            scale: [0.3, 1, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Center seam dust puff */}
      {seamDust.map((p) => (
        <motion.div
          key={`seam-${p.id}`}
          initial={{
            x: '50vw',
            y: `${p.startY}vh`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: `calc(50vw + ${p.driftX}vw)`,
            y: `calc(${p.startY}vh + ${p.driftY}vh)`,
            opacity: [0, p.opacity, 0],
            scale: [0, 1.5, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: p.size * 3,
            height: p.size * 3,
            borderRadius: '50%',
            backgroundColor: 'rgba(140,120,90,0.3)',
            filter: `blur(${p.size}px)`,
          }}
        />
      ))}

      {/* Dust cloud puffs at each hinge */}
      {[20, 50, 80].map((y) => (
        <motion.div
          key={`puff-l-${y}`}
          initial={{ opacity: 0, scale: 0, x: '0vw', y: `${y}vh` }}
          animate={{
            opacity: [0, 0.25, 0],
            scale: [0, 2, 3],
            x: '3vw',
          }}
          transition={{ delay: 0.7, duration: 1.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(140,120,90,0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      ))}
      {[20, 50, 80].map((y) => (
        <motion.div
          key={`puff-r-${y}`}
          initial={{ opacity: 0, scale: 0, x: '100vw', y: `${y}vh` }}
          animate={{
            opacity: [0, 0.25, 0],
            scale: [0, 2, 3],
            x: '97vw',
          }}
          transition={{ delay: 0.7, duration: 1.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(140,120,90,0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      ))}
    </div>
  );
}

// ── Main VaultLock Component ───────────────────────────────────────
interface VaultLockProps {
  onUnlock: () => void;
}

export function VaultLock({ onUnlock }: VaultLockProps) {
  const [entered, setEntered] = useState("");
  const [dialRotation, setDialRotation] = useState(0);
  const [phase, setPhase] = useState<"locked" | "unlocking" | "opening" | "welcome">("locked");
  const [error, setError] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const soundsRef = useRef<VaultSounds | null>(null);

  useEffect(() => {
    soundsRef.current = new VaultSounds();
  }, []);

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (phase !== "locked" || entered.length >= PASSCODE.length) return;

      soundsRef.current?.click();

      const direction = entered.length % 2 === 0 ? 1 : -1;
      const amount = (parseInt(digit) + 1) * 30 * direction;
      setDialRotation((prev) => prev + amount);
      soundsRef.current?.dialTurn(0.3);

      const newEntered = entered + digit;
      setEntered(newEntered);
      setError(false);

      if (newEntered.length === PASSCODE.length) {
        setTimeout(() => {
          if (newEntered === PASSCODE) {
            setPhase("unlocking");
            soundsRef.current?.dialTurn(1.5);
            setDialRotation((prev) => prev + 720);

            setTimeout(() => {
              soundsRef.current?.unlock();
              setPhase("opening");
              setShowCelebration(true);
              soundsRef.current?.celebrate();
            }, 1800);

            setTimeout(() => {
              setPhase("welcome");
            }, 3800);

            setTimeout(() => {
              onUnlock();
            }, 6000);
          } else {
            setError(true);
            soundsRef.current?.error();
            setTimeout(() => {
              setEntered("");
              setError(false);
            }, 1200);
          }
        }, 300);
      }
    },
    [entered, phase, onUnlock]
  );

  const handleClear = useCallback(() => {
    if (phase !== "locked") return;
    setEntered("");
    setError(false);
    soundsRef.current?.click();
  }, [phase]);

  // Keyboard support - use refs to avoid stale closures
  const handleDigitPressRef = useRef(handleDigitPress);
  const handleClearRef = useRef(handleClear);
  useEffect(() => { handleDigitPressRef.current = handleDigitPress; }, [handleDigitPress]);
  useEffect(() => { handleClearRef.current = handleClear; }, [handleClear]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigitPressRef.current(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "Escape") {
        handleClearRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {phase === "welcome" ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at center, #1a1030 0%, #0a0a15 100%)",
          }}
        >
          <FloatingGears />
          {showCelebration && <CelebrationEffect />}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="text-center relative z-10"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-3xl sm:text-5xl font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-gray-400 text-base sm:text-lg"
            >
              Entering the Creation Vault...
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 1.5, ease: "easeInOut" }}
              className="mt-6 h-0.5 w-40 mx-auto rounded-full origin-left"
              style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)" }}
            />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="vault"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at center, #1a1030 0%, #0a0a15 100%)",
          }}
        >
          {/* Floating gears background */}
          <FloatingGears />

          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.04) 60px, rgba(255,255,255,0.04) 61px),
                repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.04) 60px, rgba(255,255,255,0.04) 61px)
              `,
            }}
          />

          {/* Ambient glow behind dial */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Content container - fits viewport using dvh */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full" style={{ height: '100dvh', maxHeight: '100dvh', gap: 'clamp(4px, 1.5vh, 16px)' }}>
            {/* Title */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center"
            >
              <h1
                className="font-bold mb-1"
                style={{
                  fontSize: 'clamp(1.2rem, 3.5vh, 2.25rem)',
                  background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome to the Creation Vault
              </h1>
              <p className="text-gray-500 tracking-[0.2em] uppercase" style={{ fontSize: 'clamp(0.6rem, 1.3vh, 0.875rem)' }}>
                Enter the combination to proceed
              </p>
            </motion.div>

            {/* Dial */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <ModernDial
                rotation={dialRotation}
                isUnlocking={phase === "unlocking" || phase === "opening"}
              />
            </motion.div>

            {/* Digit display */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col items-center gap-1"
            >
              <DigitDisplay entered={entered} maxLen={PASSCODE.length} error={error} />
              <div className="h-4 flex items-center">
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs"
                  >
                    Incorrect combination
                  </motion.p>
                )}
                {phase === "unlocking" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-purple-400 text-xs"
                  >
                    Unlocking vault...
                  </motion.p>
                )}
                {phase === "opening" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-purple-300 text-xs"
                  >
                    Vault open!
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Number pad */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <NumberPad
                onPress={handleDigitPress}
                onClear={handleClear}
                disabled={phase !== "locked"}
              />
            </motion.div>

            {/* Keyboard hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-gray-600 text-[10px]"
            >
              You can also type on your keyboard
            </motion.p>
          </div>

          {/* Celebration confetti & sparkles */}
          {showCelebration && <CelebrationEffect />}

          {/* 3D Vault door opening overlay */}
          <AnimatePresence>
            {phase === "opening" && (
              <div className="fixed inset-0 z-[10000]" style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
                {/* Left door - hinges from left edge */}
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -105 }}
                  transition={{ delay: 0.6, duration: 2.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute top-0 left-0 w-1/2 h-full"
                  style={{
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Door front face */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 30%, #1e1e38 60%, #141428 100%)',
                    boxShadow: 'inset -2px 0 8px rgba(139,92,246,0.1), 4px 0 30px rgba(0,0,0,0.8)',
                  }}>
                    {/* Metallic brushed texture */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)',
                    }} />
                    {/* Rivets */}
                    {[10, 25, 40, 55, 70, 85].map((y) => (
                      <div key={`lr-${y}`} className="absolute" style={{ right: '12px', top: `${y}%` }}>
                        <div className="w-3 h-3 rounded-full" style={{
                          background: 'radial-gradient(circle at 35% 35%, #3a3a5c, #1a1a2e)',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                    ))}
                    {[10, 25, 40, 55, 70, 85].map((y) => (
                      <div key={`ll-${y}`} className="absolute" style={{ left: '20px', top: `${y}%` }}>
                        <div className="w-3 h-3 rounded-full" style={{
                          background: 'radial-gradient(circle at 35% 35%, #3a3a5c, #1a1a2e)',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                    ))}
                    {/* Hinge details on left edge */}
                    {[20, 50, 80].map((y) => (
                      <div key={`lh-${y}`} className="absolute left-0" style={{ top: `${y}%`, transform: 'translateY(-50%)' }}>
                        <div className="w-2 h-12 rounded-r-sm" style={{
                          background: 'linear-gradient(90deg, #2a2a4a, #3a3a5c, #2a2a4a)',
                          boxShadow: '1px 0 4px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                    ))}
                    {/* Center seam edge */}
                    <div className="absolute top-0 right-0 w-[3px] h-full" style={{
                      background: 'linear-gradient(180deg, #0a0a15, #2a2a4a 20%, #1a1a2e 50%, #2a2a4a 80%, #0a0a15)',
                      boxShadow: '-2px 0 8px rgba(0,0,0,0.6)',
                    }} />
                    {/* Door number plate */}
                    <div className="absolute top-[15%] right-[15%] w-16 h-8 rounded-sm flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #2a2a4a, #1e1e38)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                    }}>
                      <span className="text-[10px] text-purple-400/40 font-mono tracking-wider">L-01</span>
                    </div>
                  </div>
                </motion.div>

                {/* Right door - hinges from right edge */}
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 105 }}
                  transition={{ delay: 0.6, duration: 2.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute top-0 right-0 w-1/2 h-full"
                  style={{
                    transformOrigin: 'right center',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Door front face */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(-135deg, #1a1a2e 0%, #16162a 30%, #1e1e38 60%, #141428 100%)',
                    boxShadow: 'inset 2px 0 8px rgba(139,92,246,0.1), -4px 0 30px rgba(0,0,0,0.8)',
                  }}>
                    {/* Metallic brushed texture */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)',
                    }} />
                    {/* Rivets */}
                    {[10, 25, 40, 55, 70, 85].map((y) => (
                      <div key={`rl-${y}`} className="absolute" style={{ left: '12px', top: `${y}%` }}>
                        <div className="w-3 h-3 rounded-full" style={{
                          background: 'radial-gradient(circle at 35% 35%, #3a3a5c, #1a1a2e)',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                    ))}
                    {[10, 25, 40, 55, 70, 85].map((y) => (
                      <div key={`rr-${y}`} className="absolute" style={{ right: '20px', top: `${y}%` }}>
                        <div className="w-3 h-3 rounded-full" style={{
                          background: 'radial-gradient(circle at 35% 35%, #3a3a5c, #1a1a2e)',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                    ))}
                    {/* Hinge details on right edge */}
                    {[20, 50, 80].map((y) => (
                      <div key={`rh-${y}`} className="absolute right-0" style={{ top: `${y}%`, transform: 'translateY(-50%)' }}>
                        <div className="w-2 h-12 rounded-l-sm" style={{
                          background: 'linear-gradient(-90deg, #2a2a4a, #3a3a5c, #2a2a4a)',
                          boxShadow: '-1px 0 4px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                    ))}
                    {/* Center seam edge */}
                    <div className="absolute top-0 left-0 w-[3px] h-full" style={{
                      background: 'linear-gradient(180deg, #0a0a15, #2a2a4a 20%, #1a1a2e 50%, #2a2a4a 80%, #0a0a15)',
                      boxShadow: '2px 0 8px rgba(0,0,0,0.6)',
                    }} />
                    {/* Door number plate */}
                    <div className="absolute top-[15%] left-[15%] w-16 h-8 rounded-sm flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #2a2a4a, #1e1e38)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                    }}>
                      <span className="text-[10px] text-purple-400/40 font-mono tracking-wider">R-01</span>
                    </div>
                  </div>
                </motion.div>

                {/* Hinge dust particles */}
                <HingeDust />

                {/* Light beam from behind the doors */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 0.4, 0.2], scaleX: [0, 1, 1.5] }}
                  transition={{ delay: 1.2, duration: 2, ease: 'easeOut' }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), rgba(167,139,250,0.2), rgba(139,92,246,0.15), transparent)',
                    filter: 'blur(20px)',
                  }}
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
