import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Shield, Sparkles, Eye, EyeOff, KeyRound, Fingerprint } from "lucide-react";
import { toast } from "sonner";

interface VaultProps {
  onUnlock: () => void;
}

export default function Vault({ onUnlock }: VaultProps) {
  const [passcode, setPasscode] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [step, setStep] = useState<"check" | "enter" | "setup" | "confirm">("check");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const { data: vaultData, isLoading } = trpc.vault.hasPasscode.useQuery();
  const setPasscodeMutation = trpc.vault.setPasscode.useMutation();
  const verifyMutation = trpc.vault.verify.useMutation();

  useEffect(() => {
    // Generate floating particles
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    if (vaultData && !isLoading) {
      setStep(vaultData.hasPasscode ? "enter" : "setup");
    }
  }, [vaultData, isLoading]);

  const handleKeyPress = useCallback((digit: string) => {
    if (step === "setup") {
      if (passcode.length < 4) setPasscode(prev => prev + digit);
    } else if (step === "confirm") {
      if (confirmPasscode.length < 4) setConfirmPasscode(prev => prev + digit);
    } else if (step === "enter") {
      if (passcode.length < 4) setPasscode(prev => prev + digit);
    }
  }, [step, passcode.length, confirmPasscode.length]);

  const handleDelete = () => {
    if (step === "confirm") {
      setConfirmPasscode(prev => prev.slice(0, -1));
    } else {
      setPasscode(prev => prev.slice(0, -1));
    }
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (step === "setup" && passcode.length === 4) {
      setTimeout(() => setStep("confirm"), 300);
    }
  }, [passcode, step]);

  useEffect(() => {
    if (step === "confirm" && confirmPasscode.length === 4) {
      if (confirmPasscode === passcode) {
        setPasscodeMutation.mutate({ passcode }, {
          onSuccess: () => {
            setUnlocking(true);
            toast.success("Vault passcode set! Welcome to ZelvariWise!");
            setTimeout(onUnlock, 1500);
          },
        });
      } else {
        setShake(true);
        toast.error("Passcodes don't match. Try again.");
        setTimeout(() => {
          setShake(false);
          setConfirmPasscode("");
          setStep("setup");
          setPasscode("");
        }, 600);
      }
    }
  }, [confirmPasscode, step]);

  useEffect(() => {
    if (step === "enter" && passcode.length === 4) {
      verifyMutation.mutate({ passcode }, {
        onSuccess: (result) => {
          if (result.valid) {
            setUnlocking(true);
            setTimeout(onUnlock, 1500);
          } else {
            setShake(true);
            toast.error("Wrong passcode. Try again.");
            setTimeout(() => { setShake(false); setPasscode(""); }, 600);
          }
        },
      });
    }
  }, [passcode, step]);

  const currentCode = step === "confirm" ? confirmPasscode : passcode;
  const maxLen = 4;

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

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
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-primary/20"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-chart-2/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />

      <AnimatePresence mode="wait">
        {unlocking ? (
          <motion.div
            key="unlocking"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: [0, -20, 20, 0] }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center neon-purple">
                <Unlock className="h-12 w-12 text-white" />
              </div>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  style={{ top: "50%", left: "50%" }}
                  animate={{
                    x: [0, Math.cos(i * 45 * Math.PI / 180) * 80],
                    y: [0, Math.sin(i * 45 * Math.PI / 180) * 80],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-display font-bold gradient-text"
            >
              Welcome to ZelvariWise
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 px-6 w-full max-w-sm"
          >
            {/* Vault Icon */}
            <motion.div
              className="relative"
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-2 flex items-center justify-center neon-purple"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: step === "enter" ? [0, 5, -5, 0] : 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Lock className="h-10 w-10 text-white" />
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-chart-2 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold gradient-text">
                ZelvariWise
              </h1>
              <p className="text-muted-foreground text-sm">
                {step === "setup" && "Create your 4-digit vault passcode"}
                {step === "confirm" && "Confirm your passcode"}
                {step === "enter" && "Enter your vault passcode"}
              </p>
            </div>

            {/* Passcode dots */}
            <div className="flex gap-4">
              {Array.from({ length: maxLen }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                    i < currentCode.length
                      ? "bg-primary border-primary neon-purple scale-110"
                      : "border-muted-foreground/30"
                  }`}
                  animate={i < currentCode.length ? { scale: [0.8, 1.2, 1] } : {}}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {digits.map((digit, i) => {
                if (digit === "") return <div key={i} />;
                if (digit === "del") {
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDelete}
                      className="h-16 rounded-2xl bg-secondary/50 text-muted-foreground font-medium text-sm flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      Delete
                    </motion.button>
                  );
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: "oklch(0.25 0.04 280)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleKeyPress(digit)}
                    className="h-16 rounded-2xl bg-secondary/30 text-foreground font-display font-semibold text-xl flex items-center justify-center hover:bg-secondary/60 transition-colors border border-border/50"
                  >
                    {digit}
                  </motion.button>
                );
              })}
            </div>

            {/* Skip option for setup */}
            {step === "setup" && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => {
                  setPasscodeMutation.mutate({ passcode: "0000" }, {
                    onSuccess: () => {
                      setUnlocking(true);
                      setTimeout(onUnlock, 1500);
                    },
                  });
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Skip for now
              </motion.button>
            )}

            {/* Fingerprint hint */}
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
