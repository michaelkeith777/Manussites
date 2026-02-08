import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Key,
  Loader2,
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const apiKeyStatus = trpc.settings.getApiKeyStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const validateApiKey = trpc.settings.validateApiKey.useMutation();
  const saveApiKey = trpc.settings.saveApiKey.useMutation({
    onSuccess: () => {
      utils.settings.getApiKeyStatus.invalidate();
      setApiKey("");
      toast.success("API key saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save API key");
    },
  });
  const deleteApiKey = trpc.settings.deleteApiKey.useMutation({
    onSuccess: () => {
      utils.settings.getApiKeyStatus.invalidate();
      toast.success("API key removed");
    },
    onError: () => {
      toast.error("Failed to remove API key");
    },
  });

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateApiKey.mutateAsync({ apiKey: apiKey.trim() });
      if (result.valid) {
        await saveApiKey.mutateAsync({ apiKey: apiKey.trim() });
      } else {
        toast.error(result.error || "Invalid API key");
      }
    } catch (error) {
      toast.error("Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteApiKey = () => {
    if (confirm("Are you sure you want to remove your API key? You'll need to enter a new one to generate images.")) {
      deleteApiKey.mutate();
    }
  };

  // Auth check
  if (authLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to manage your settings.
              </p>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and API configuration
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Account
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Name</Label>
                    <p className="font-medium">{user?.name || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Email</Label>
                    <p className="font-medium">{user?.email || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  kie.ai API Key
                </CardTitle>
                <CardDescription>
                  Enter your personal kie.ai API key to generate images. Your key is stored securely and used only for your image generations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Key Status */}
                {apiKeyStatus.data?.hasApiKey && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-500">API Key Configured</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleDeleteApiKey}
                        disabled={deleteApiKey.isPending}
                      >
                        {deleteApiKey.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Current key: <code className="bg-muted px-2 py-0.5 rounded">{apiKeyStatus.data.maskedKey}</code>
                    </p>
                  </div>
                )}

                {/* No Key Warning */}
                {!apiKeyStatus.data?.hasApiKey && !apiKeyStatus.isLoading && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-yellow-500">No API Key Set</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          You need to add your kie.ai API key to generate images.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add/Update Key Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">
                      {apiKeyStatus.data?.hasApiKey ? "Update API Key" : "Add API Key"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter your kie.ai API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleValidateAndSave}
                    disabled={!apiKey.trim() || isValidating || saveApiKey.isPending}
                    className="w-full"
                  >
                    {isValidating || saveApiKey.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isValidating ? "Validating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Validate & Save Key
                      </>
                    )}
                  </Button>
                </div>

                {/* Help Text */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">How to get your API key:</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium">Create a kie.ai account</p>
                        <p className="text-sm text-muted-foreground">Visit <a href="https://kie.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">kie.ai <ExternalLink className="w-3 h-3" /></a> and sign up for a free account.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium">Navigate to API Settings</p>
                        <p className="text-sm text-muted-foreground">Go to Profile → Settings → API Keys in your kie.ai dashboard.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium">Generate a new API key</p>
                        <p className="text-sm text-muted-foreground">Click "Create New API Key" and copy it immediately - you won't be able to see it again!</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        4
                      </div>
                      <div>
                        <p className="text-sm font-medium">Add credits (optional)</p>
                        <p className="text-sm text-muted-foreground">Purchase credits on kie.ai to use for image generation. Each image costs a small amount of credits.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Your key is secure:</strong> It's stored encrypted and only used for your image generations. No one else can access or use your API key.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
