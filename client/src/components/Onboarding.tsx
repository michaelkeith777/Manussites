import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Sparkles,
  Key,
  ExternalLink,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Rocket,
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const validateApiKey = trpc.settings.validateApiKey.useMutation();
  const saveApiKey = trpc.settings.saveApiKey.useMutation();
  const completeOnboarding = trpc.settings.completeOnboarding.useMutation();

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateApiKey.mutateAsync({ apiKey: apiKey.trim() });
      setIsValid(result.valid);
      if (result.valid) {
        toast.success("API key is valid!");
      } else {
        toast.error(result.error || "Invalid API key");
      }
    } catch (error) {
      setIsValid(false);
      toast.error("Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!isValid) {
      toast.error("Please validate your API key first");
      return;
    }

    try {
      await saveApiKey.mutateAsync({ apiKey: apiKey.trim() });
      await completeOnboarding.mutateAsync();
      toast.success("Setup complete! You're ready to create amazing images.");
      onComplete();
    } catch (error) {
      toast.error("Failed to save API key");
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding.mutateAsync();
      toast.info("You can add your API key later in Settings");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete setup");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const steps = [
    {
      title: "Welcome to CardKing1971 Customs",
      description: "Create stunning trading card artwork with AI",
    },
    {
      title: "Get Your kie.ai API Key",
      description: "Follow these steps to get your personal API key",
    },
    {
      title: "Enter Your API Key",
      description: "Paste your API key to start generating images",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-primary/20 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 glow-purple">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{steps[step - 1].title}</CardTitle>
            <CardDescription>{steps[step - 1].description}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-8 bg-primary"
                      : s < step
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">AI-Powered Image Generation</h3>
                        <p className="text-sm text-muted-foreground">
                          Transform trending topics into beautiful trading card artwork using advanced AI models.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Your Personal API Key</h3>
                        <p className="text-sm text-muted-foreground">
                          Use your own kie.ai API key for unlimited generations. Your key is stored securely and only used for your account.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Rocket className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Quick Setup</h3>
                        <p className="text-sm text-muted-foreground">
                          Getting started takes just a few minutes. We'll guide you through every step.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} className="gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Visit kie.ai</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Go to kie.ai and create an account if you don't have one.
                        </p>
                        <Button variant="outline" size="sm" asChild className="gap-2">
                          <a href="https://kie.ai" target="_blank" rel="noopener noreferrer">
                            Open kie.ai
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Go to API Settings</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          After logging in, navigate to your account settings and find the API section.
                        </p>
                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                          <span className="text-muted-foreground">Path: </span>
                          <code className="text-primary">Profile → Settings → API Keys</code>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Generate API Key</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Click "Create New API Key" and copy the generated key. Keep it safe - you won't be able to see it again!
                        </p>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400">
                          <AlertCircle className="w-4 h-4 inline mr-2" />
                          Make sure to copy your API key immediately after creation.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Add Credits (Optional)</h3>
                        <p className="text-sm text-muted-foreground">
                          Purchase credits on kie.ai to use for image generation. Each image costs a small amount of credits.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="gap-2">
                      I Have My API Key
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Your kie.ai API Key</Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="Paste your API key here..."
                          value={apiKey}
                          onChange={(e) => {
                            setApiKey(e.target.value);
                            setIsValid(null);
                          }}
                          className={`pr-24 ${
                            isValid === true
                              ? "border-green-500 focus-visible:ring-green-500"
                              : isValid === false
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={handleValidateKey}
                          disabled={isValidating || !apiKey.trim()}
                        >
                          {isValidating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isValid === true ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            "Validate"
                          )}
                        </Button>
                      </div>
                      {isValid === true && (
                        <p className="text-sm text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          API key is valid and ready to use
                        </p>
                      )}
                      {isValid === false && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Invalid API key. Please check and try again.
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <h4 className="font-medium text-sm">Your API key is:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Stored securely in your account
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Only used for your image generations
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Never shared with other users
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Can be updated or removed anytime in Settings
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleSkip}>
                        Skip for Now
                      </Button>
                      <Button
                        onClick={handleSaveAndContinue}
                        disabled={!isValid || saveApiKey.isPending}
                        className="gap-2"
                      >
                        {saveApiKey.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Complete Setup
                            <Check className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
