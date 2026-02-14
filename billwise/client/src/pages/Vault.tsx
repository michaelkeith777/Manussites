import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Shield, Sparkles, KeyRound, Delete } from "lucide-react";
import { toast } from "sonner";

interface VaultProps {
  onUnlock: () => void;
}

// Web Audio API sound generator
function useVaultSounds() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }, [getCtx]);

  const playDelete = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [getCtx]);

  const playUnlock = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } catch {}
  }, [getCtx]);

  const playError = useCallback(() => {
    try {
      const ctx = getCtx();
      [300, 200].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.15);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.15);
      });
    } catch {}
  }, [getCtx]);

  const playMechanical = useCallback(() => {
    try {
      const ctx = getCtx();
      // Mechanical clunk
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      // Metallic ring
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2000, ctx.currentTime + 0.05);
      gain2.gain.setValueAtTime(0.05, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime + 0.05);
      osc2.stop(ctx.currentTime + 0.6);
    } catch {}
  }, [getCtx]);

  return { playTick, playDelete, playUnlock, playError, playMechanical };
}

export default function Vault({ onUnlock }: VaultProps) {
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [step, setStep] = useState<"check" | "enter" | "setup" | "confirm">("check");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [dialRotation, setDialRotation] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [ringPulse, setRingPulse] = useState(false);
  const [dotAnimating, setDotAnimating] = useState(-1);

  const sounds = useVaultSounds();

  const { data: vaultData, isLoading } = trpc.vault.hasPasscode.useQuery();
  const setPasscodeMutation = trpc.vault.setPasscode.useMutation();
  const verifyMutation = trpc.vault.verify.useMutation();

  useEffect(() => {
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    if (vaultData && !isLoading) {
      setStep(vaultData.hasPasscode ? "enter" : "setup");
    }
  }, [vaultData, isLoading]);

  const currentCode = step === "confirm" ? confirmPasscode : passcode;

  // Handle digit press - using direct state setter, no useCallback dependency issues
  const handleDigitPress = (digit: string) => {
    if (unlocking) return;

    const code = step === "confirm" ? confirmPasscode : passcode;
    if (code.length >= 4) return;

    sounds.playTick();
    setDialRotation(prev => prev + 36);
    setRingPulse(true);
    setTimeout(() => setRingPulse(false), 200);

    const newLen = code.length + 1;
    setDotAnimating(newLen - 1);
    setTimeout(() => setDotAnimating(-1), 300);

    if (step === "confirm") {
      setConfirmPasscode(prev => prev + digit);
    } else {
      setPasscode(prev => prev + digit);
    }
  };

  const handleDeletePress = () => {
    if (unlocking) return;
    sounds.playDelete();
    setDialRotation(prev => prev - 36);

    if (step === "confirm") {
      setConfirmPasscode(prev => prev.slice(0, -1));
    } else {
      setPasscode(prev => prev.slice(0, -1));
    }
  };

  // Auto-submit for setup step
  useEffect(() => {
    if (step === "setup" && passcode.length === 4) {
      const timer = setTimeout(() => {
        sounds.playMechanical();
        setStep("confirm");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [passcode, step]);

  // Auto-submit for confirm step
  useEffect(() => {
    if (step === "confirm" && confirmPasscode.length === 4) {
      const timer = setTimeout(() => {
        if (confirmPasscode === passcode) {
          setPasscodeMutation.mutate({ passcode }, {
            onSuccess: () => {
              sounds.playUnlock();
              setUnlocking(true);
              toast.success("Vault secured! Welcome to ZelvariWise!");
              setTimeout(onUnlock, 2500);
            },
            onError: () => {
              sounds.playError();
              setShake(true);
              toast.error("Something went wrong. Try again.");
              setTimeout(() => { setShake(false); setConfirmPasscode(""); setStep("setup"); setPasscode(""); }, 600);
            },
          });
        } else {
          sounds.playError();
          setShake(true);
          toast.error("Passcodes don't match. Try again.");
          setTimeout(() => { setShake(false); setConfirmPasscode(""); setStep("setup"); setPasscode(""); }, 600);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [confirmPasscode, step]);

  // Auto-submit for enter step
  useEffect(() => {
    if (step === "enter" && passcode.length === 4) {
      const timer = setTimeout(() => {
        verifyMutation.mutate({ passcode }, {
          onSuccess: (result) => {
            if (result.valid) {
              sounds.playUnlock();
              setUnlocking(true);
              setTimeout(onUnlock, 2500);
            } else {
              sounds.playError();
              setShake(true);
              toast.error("Wrong passcode. Try again.");
              setTimeout(() => { setShake(false); setPasscode(""); }, 600);
            }
          },
          onError: () => {
            sounds.playError();
            setShake(true);
            toast.error("Verification failed. Try again.");
            setTimeout(() => { setShake(false); setPasscode(""); }, 600);
          },
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [passcode, step]);

  if (isLoading || step === "check") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center select-none">
      {/* Animated background particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `oklch(0.7 0.15 ${280 + Math.random() * 40})`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.15, 0.6, 0.15],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-chart-2/10 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        {unlocking ? (
          /* ==================== UNLOCK SEQUENCE ==================== */
          <motion.div
            key="unlocking"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Spinning vault door */}
            <motion.div className="relative">
              {/* Outer ring */}
              <motion.div
                className="w-48 h-48 rounded-full border-4 border-primary/30 flex items-center justify-center"
                animate={{ rotate: [0, 720], scale: [1, 1.1, 0.9, 1] }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{ boxShadow: "0 0 60px oklch(0.6 0.25 280 / 0.4), inset 0 0 30px oklch(0.6 0.25 280 / 0.2)" }}
              >
                {/* Middle ring with tick marks */}
                <motion.div
                  className="w-36 h-36 rounded-full border-2 border-chart-2/40 flex items-center justify-center relative"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-3 bg-primary/60 rounded-full"
                      style={{
                        top: "4px",
                        left: "50%",
                        transformOrigin: "50% 66px",
                        transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                    />
                  ))}

                  {/* Inner vault icon */}
                  <motion.div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-chart-2 to-primary flex items-center justify-center"
                    animate={{
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        "0 0 20px oklch(0.6 0.25 280 / 0.5)",
                        "0 0 60px oklch(0.6 0.25 280 / 0.8), 0 0 120px oklch(0.7 0.2 160 / 0.4)",
                        "0 0 20px oklch(0.6 0.25 280 / 0.5)",
                      ],
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -20, 20, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <Unlock className="h-10 w-10 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Burst particles */}
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: 4 + Math.random() * 4,
                    height: 4 + Math.random() * 4,
                    background: i % 2 === 0
                      ? "oklch(0.7 0.25 280)"
                      : "oklch(0.8 0.2 160)",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos(i * 22.5 * Math.PI / 180) * (100 + Math.random() * 60),
                    y: Math.sin(i * 22.5 * Math.PI / 180) * (100 + Math.random() * 60),
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                />
              ))}
            </motion.div>

            {/* Welcome text */}
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl font-display font-bold gradient-text"
                animate={{ scale: [0.9, 1.05, 1] }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                Vault unlocked successfully
              </motion.p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="w-48 h-1 rounded-full overflow-hidden bg-secondary/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 0.8, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        ) : (
          /* ==================== VAULT ENTRY ==================== */
          <motion.div
            key="vault-entry"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 px-6 w-full max-w-sm"
          >
            {/* Vault Dial */}
            <motion.div
              className="relative"
              animate={shake ? { x: [-12, 12, -12, 12, -6, 6, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {/* Outer spinning ring */}
              <motion.div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                animate={{ rotate: dialRotation }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                style={{
                  border: "3px solid oklch(0.5 0.15 280 / 0.4)",
                  boxShadow: ringPulse
                    ? "0 0 40px oklch(0.6 0.25 280 / 0.6), inset 0 0 20px oklch(0.6 0.25 280 / 0.2)"
                    : "0 0 20px oklch(0.6 0.25 280 / 0.2), inset 0 0 10px oklch(0.6 0.25 280 / 0.1)",
                }}
              >
                {/* Tick marks on dial */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2 rounded-full"
                    style={{
                      top: "6px",
                      left: "50%",
                      transformOrigin: "50% 50px",
                      transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      background: i % 3 === 0
                        ? "oklch(0.7 0.2 280)"
                        : "oklch(0.4 0.1 280)",
                    }}
                  />
                ))}

                {/* Inner icon */}
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-2 flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 30px oklch(0.6 0.25 280 / 0.4)",
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ rotate: step === "enter" ? [0, 3, -3, 0] : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Lock className="h-8 w-8 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Sparkle */}
              <motion.div
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-chart-2 flex items-center justify-center"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <div className="text-center space-y-1">
              <motion.h1
                className="text-3xl font-display font-bold gradient-text"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ZelvariWise
              </motion.h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-muted-foreground text-sm"
                >
                  {step === "setup" && "Create your 4-digit vault passcode"}
                  {step === "confirm" && "Confirm your passcode"}
                  {step === "enter" && "Enter your vault passcode"}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Passcode dots */}
            <div className="flex gap-5 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  animate={
                    dotAnimating === i
                      ? { scale: [0.5, 1.4, 1], y: [0, -8, 0] }
                      : i < currentCode.length
                        ? { scale: 1 }
                        : { scale: 1 }
                  }
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                >
                  <div
                    className={`h-5 w-5 rounded-full transition-all duration-300 ${
                      i < currentCode.length
                        ? "bg-gradient-to-br from-primary to-chart-2"
                        : "bg-secondary/30 border-2 border-muted-foreground/20"
                    }`}
                    style={
                      i < currentCode.length
                        ? { boxShadow: "0 0 15px oklch(0.6 0.25 280 / 0.6)" }
                        : {}
                    }
                  />
                  {i < currentCode.length && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/30"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitPress(String(num))}
                  className="vault-key h-16 rounded-2xl bg-secondary/20 text-foreground font-display font-semibold text-xl flex items-center justify-center border border-border/30 hover:bg-secondary/40 hover:border-primary/30 active:scale-90 transition-all duration-150 cursor-pointer"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {num}
                </button>
              ))}
              <div /> {/* empty cell */}
              <button
                type="button"
                onClick={() => handleDigitPress("0")}
                className="vault-key h-16 rounded-2xl bg-secondary/20 text-foreground font-display font-semibold text-xl flex items-center justify-center border border-border/30 hover:bg-secondary/40 hover:border-primary/30 active:scale-90 transition-all duration-150 cursor-pointer"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDeletePress}
                className="vault-key h-16 rounded-2xl bg-secondary/20 text-muted-foreground font-medium text-sm flex items-center justify-center gap-1 border border-border/30 hover:bg-destructive/20 hover:border-destructive/30 hover:text-destructive active:scale-90 transition-all duration-150 cursor-pointer"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <Delete className="h-4 w-4" />
              </button>
            </div>

            {/* Skip option for setup */}
            {step === "setup" && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => {
                  sounds.playMechanical();
                  setPasscodeMutation.mutate({ passcode: "0000" }, {
                    onSuccess: () => {
                      sounds.playUnlock();
                      setUnlocking(true);
                      setTimeout(onUnlock, 2500);
                    },
                  });
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 cursor-pointer"
              >
                Skip for now
              </motion.button>
            )}

            {/* Security badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <KeyRound className="h-3 w-3" />
              <span>Your vault is encrypted and secure</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
