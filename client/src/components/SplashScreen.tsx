import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for fade animation to complete
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background ${
        isFadingOut ? "splash-fade-out" : ""
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-50" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden splash-logo glow-purple">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663079185454/NRqQyxtYjKwAQctQ.png"
            alt="CardKing1971 Customs"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand name */}
        <h1 className="mt-6 text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent splash-text">
          CardKing1971 Customs
        </h1>

        {/* Tagline */}
        <p className="mt-2 text-muted-foreground splash-text" style={{ animationDelay: "0.7s" }}>
          AI-Powered Trading Card Art
        </p>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-2 splash-text" style={{ animationDelay: "0.9s" }}>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
