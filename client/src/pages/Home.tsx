import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Image,
  Heart,
  RefreshCw,
  ArrowRight,
  Star,
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: TrendingUp,
    title: "AI Trend Discovery",
    description:
      "Discover trending topics from social media and trading platforms powered by AI analysis.",
  },
  {
    icon: Sparkles,
    title: "Smart Prompts",
    description:
      "AI generates optimized prompts for stunning trading card artwork with one click.",
  },
  {
    icon: Zap,
    title: "Nano Banana Power",
    description:
      "Leverage kie.ai's Nano Banana and Pro models for fast, high-quality image generation.",
  },
  {
    icon: Image,
    title: "Multiple Variations",
    description:
      "Generate up to 10 unique variations of your trading card design in one batch.",
  },
  {
    icon: Heart,
    title: "Gallery & Favorites",
    description:
      "Save your creations, mark favorites, and easily recreate your best designs.",
  },
  {
    icon: RefreshCw,
    title: "One-Click Recreate",
    description:
      "Love a design? Recreate it instantly with the same prompt or tweak for variations.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-bg opacity-50" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                CardKing1971 Customs
                <br />
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">AI-Powered Trading Card Art</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Create stunning trading cards with CardKing1971 Customs' AI-powered design studio.
                Transform trending topics into beautiful artwork in seconds.
              </p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                {isAuthenticated ? (
                  <Button size="lg" asChild className="glow-purple group">
                    <Link href="/create">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Creating
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild className="glow-purple group">
                    <a href={getLoginUrl()}>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <Link href="/gallery">
                    <Image className="w-5 h-5 mr-2" />
                    View Gallery
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero Image/Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 relative"
            >
              <div className="relative mx-auto max-w-5xl">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur-3xl -z-10" />

                {/* Preview Cards */}
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="aspect-[3/4] rounded-xl bg-gradient-to-br from-card to-card/50 border border-border overflow-hidden group"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your Card #{i}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Create
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From trending topic discovery to final download, we've got every
                step covered with AI-powered tools.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Create in 4 Simple Steps
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined workflow makes creating trading cards effortless.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Choose Topic",
                  desc: "Pick from trending topics or enter your own idea",
                },
                {
                  step: "02",
                  title: "Generate Prompt",
                  desc: "AI creates an optimized prompt for your card",
                },
                {
                  step: "03",
                  title: "Select Variations",
                  desc: "Choose how many unique versions to generate",
                },
                {
                  step: "04",
                  title: "Download & Save",
                  desc: "Pick your favorites and download in high quality",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Create Your First Card?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of creators making stunning trading cards with AI.
                Start for free today.
              </p>
              {isAuthenticated ? (
                <Button size="lg" asChild className="glow-purple">
                  <Link href="/create">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Creating Now
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="glow-purple">
                  <a href={getLoginUrl()}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started Free
                  </a>
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden logo-hover">
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663079185454/NRqQyxtYjKwAQctQ.png" alt="CardKing1971 Customs" className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold">CardKing1971 Customs</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <span className="text-muted-foreground/50">•</span>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  AI-Powered Trading Card Art
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
