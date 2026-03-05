/*
 * Design: Liquid Amethyst — Landing page with fluid organic shapes,
 * amethyst purple gradients, warm gold CTAs, glassmorphic cards,
 * and staggered scroll animations.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Rocket, Zap, BarChart3, Users, Shield, Globe, Layers, Brain,
  ChevronDown, ChevronRight, ArrowRight, Star, Check, Play,
  Megaphone, Target, TrendingUp, Clock, Sparkles, Menu, X,
  Monitor, Smartphone, Tablet, MousePointerClick, RefreshCw,
  FileText, Upload, Settings2, Eye, MessageSquare, Search as SearchIcon,
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/SmGTJiGQ8BnzXfV2HFoEoA/hero-bg-8G8sgR7n42AHiCuqYmJFUx.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/SmGTJiGQ8BnzXfV2HFoEoA/dashboard-mockup-8Acod9TRtdPDnDBe5fJpTq.webp";
const ANALYTICS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/SmGTJiGQ8BnzXfV2HFoEoA/analytics-feature-LvjANeBDHaCrN5Sr33Dh7G.webp";
const AI_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/SmGTJiGQ8BnzXfV2HFoEoA/ai-feature-k5qvED2fCKAkek9VLD9HDN.webp";
const TEAM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/SmGTJiGQ8BnzXfV2HFoEoA/team-collab-k2SeAVn6dd6jggZMfDYkk2.webp";

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-purple-950/10" : "bg-transparent"
    }`}>
      <div className="container flex items-center justify-between h-16 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/30">
            Z
          </div>
          <span className="font-heading font-bold text-xl text-foreground">Zelvari Ads</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Features</a>
          <a href="#platforms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Platforms</a>
          <a href="#pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Pricing</a>
          <a href="#testimonials" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Testimonials</a>
          <a href="#faq" className="text-sm text-foreground/60 hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/30 px-6">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <a href={getLoginUrl()}>
                <Button variant="ghost" className="text-foreground/70 hover:text-foreground">Log In</Button>
              </a>
              <a href={getLoginUrl()}>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/30 px-6">
                  Get Started Free
                </Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container py-4 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground/70">Features</a>
            <a href="#platforms" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground/70">Platforms</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground/70">Pricing</a>
            <a href="#testimonials" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground/70">Testimonials</a>
            <a href="#faq" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground/70">FAQ</a>
            <div className="pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link href="/dashboard"><Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white">Go to Dashboard</Button></Link>
              ) : (
                <>
                  <a href={getLoginUrl()}><Button variant="outline" className="w-full">Log In</Button></a>
                  <a href={getLoginUrl()}><Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white">Get Started Free</Button></a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const stats = useScrollAnimation(0.2);
  const adsCount = useCountUp(2847593, 2000, stats.isVisible);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      {/* Floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob-delay" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300">
              <Sparkles size={14} className="text-amber-400" />
              Built by media buyers, for media buyers
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight">
              Launch Ads{" "}
              <span className="gradient-text">10x Faster</span>{" "}
              Across Every Platform
            </h1>

            <p className="text-lg lg:text-xl text-foreground/60 max-w-lg leading-relaxed">
              The most powerful ad management platform. Bulk launch to Meta, TikTok, Google, Snapchat & Pinterest with AI-powered optimization, automated rules, and real-time analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-xl shadow-purple-600/30 h-14 px-8 text-base w-full sm:w-auto">
                  Start Launching Free <ArrowRight size={18} className="ml-2" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-border/50 hover:bg-secondary/50">
                <Play size={18} className="mr-2" /> Watch Demo
              </Button>
            </div>

            {/* Platform logos */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {["Meta", "TikTok", "Google", "Snapchat", "Pinterest"].map((p) => (
                <div key={p} className="flex items-center gap-2 text-foreground/40 text-sm">
                  <div className="w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs font-bold">{p[0]}</div>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30 glow-purple">
              <img src={DASHBOARD_IMG} alt="Zelvari Ads Dashboard" className="w-full h-auto" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -left-6 glass-card rounded-xl p-4 shadow-xl" ref={stats.ref}>
              <div className="text-xs text-foreground/50 mb-1">Ads Launched</div>
              <div className="text-2xl font-heading font-bold text-foreground">{adsCount.toLocaleString()}</div>
              <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> +24% this month
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trusted By / Stats ─── */
function StatsSection() {
  const anim = useScrollAnimation();
  const stat1 = useCountUp(2800000, 2000, anim.isVisible);
  const stat2 = useCountUp(15000, 2000, anim.isVisible);
  const stat3 = useCountUp(50, 2000, anim.isVisible);

  const stats = [
    { value: `${(stat1 / 1000000).toFixed(1)}M+`, label: "Ads Launched Monthly", icon: Rocket },
    { value: `${(stat2 / 1000).toFixed(0)}K+`, label: "Active Users", icon: Users },
    { value: `${stat3}+`, label: "Countries Served", icon: Globe },
    { value: "99.9%", label: "Uptime Guaranteed", icon: Shield },
  ];

  return (
    <section className="py-20 relative" ref={anim.ref}>
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-6 text-center transition-all duration-500 hover:scale-105 ${
                anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <s.icon size={24} className="mx-auto mb-3 text-purple-400" />
              <div className="text-2xl lg:text-3xl font-heading font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-foreground/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const anim = useScrollAnimation();
  const steps = [
    { num: "01", title: "Connect", desc: "Link your Meta, TikTok, Google, Snapchat & Pinterest ad accounts in one click.", icon: Globe },
    { num: "02", title: "Upload", desc: "Drag & drop creatives or import from Google Drive, Dropbox, Frame.io, Air.inc, or Box.", icon: Upload },
    { num: "03", title: "Launch", desc: "Hit launch and watch hundreds of ads go live across all platforms in seconds.", icon: Rocket },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="container relative">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <Zap size={14} className="text-amber-400" /> Simple Setup
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            Launch Ads in <span className="gradient-text">3 Steps</span>
          </h2>
          <p className="text-foreground/50 text-lg max-w-2xl mx-auto">No complex setup. No learning curve. Just plug and play.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative glass-card rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] group ${
                anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="absolute -top-4 -left-2 text-6xl font-heading font-extrabold text-purple-500/10">{step.num}</div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <step.icon size={24} className="text-purple-400" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-foreground/50 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-foreground/40 text-sm">Average setup time: <span className="text-amber-400 font-semibold">2 minutes</span></p>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Grid ─── */
function FeaturesSection() {
  const anim = useScrollAnimation();
  const features = [
    { icon: Rocket, title: "Bulk Ad Launching", desc: "Launch 50+ ads in under 60 seconds. Supports all ad formats across every platform.", color: "from-purple-500 to-purple-700" },
    { icon: Brain, title: "AI Ad Copy Generator", desc: "Generate high-converting ad copy with AI. Create variations, translate to 50+ languages instantly.", color: "from-amber-500 to-orange-600" },
    { icon: Layers, title: "Smart Auto-Grouping", desc: "Auto-detect aspect ratios and group creatives by filename. 40+ detection methods built in.", color: "from-blue-500 to-cyan-600" },
    { icon: BarChart3, title: "Creative Analytics", desc: "Deep dive into creative-level statistics. See which ads are winning and why with real-time data.", color: "from-green-500 to-emerald-600" },
    { icon: Zap, title: "Automated Rules Engine", desc: "Pause losers, scale winners, get CPA alerts. Set rules once and let them run 24/7.", color: "from-red-500 to-pink-600" },
    { icon: Users, title: "Team Workspaces", desc: "Custom workspaces with role-based permissions. Unlimited team members with analytics-only access.", color: "from-violet-500 to-indigo-600" },
    { icon: RefreshCw, title: "Post ID Scaling", desc: "Preserve all engagement when scaling. Search by POST ID and reuse proven creatives instantly.", color: "from-teal-500 to-cyan-600" },
    { icon: FileText, title: "Google Sheets Plugin", desc: "Launch ads directly from your spreadsheet. Map columns once, launch forever. No forced templates.", color: "from-yellow-500 to-amber-600" },
    { icon: Shield, title: "Enhancement Control", desc: "Disable Meta's Advantage+ features with one click. Your creatives stay exactly as designed.", color: "from-slate-500 to-gray-600" },
    { icon: Eye, title: "Competitor Spy Tool", desc: "Research competitor ads across all platforms. Track creative trends and discover winning strategies.", color: "from-purple-400 to-fuchsia-600" },
    { icon: MessageSquare, title: "AI Comment Manager", desc: "Automated sentiment analysis on ad comments. AI-powered responses and moderation at scale.", color: "from-sky-500 to-blue-600" },
    { icon: Target, title: "A/B Testing Suite", desc: "Built-in split testing for creatives, copy, and audiences. Statistical significance tracking included.", color: "from-orange-500 to-red-500" },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl" />
      <div className="container relative">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <Sparkles size={14} className="text-amber-400" /> Powerful Features
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            Everything You Need to <span className="gradient-text">Scale Ads</span>
          </h2>
          <p className="text-foreground/50 text-lg max-w-2xl mx-auto">48+ features packed into one platform. No hidden fees, no feature locks.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-6 transition-all duration-500 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-900/20 group ${
                anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(i % 4) * 80}ms` }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-heading font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-foreground/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Ad Formats ─── */
function AdFormatsSection() {
  const anim = useScrollAnimation();
  const [activeFormat, setActiveFormat] = useState(0);
  const formats = [
    { name: "Single Format", desc: "Classic static image ads with customizable headlines and copy.", tags: ["10x Faster", "Auto-resize", "Copy templates"] },
    { name: "Multi-Format", desc: "Combine multiple aspect ratios (9:16, 4:5, 1:1) in one ad for maximum reach.", tags: ["Auto-grouping", "9:16 + 4:5 + 1:1", "Placement optimization"] },
    { name: "Carousel Ads", desc: "Multi-card ads with unique links, headlines, and descriptions per card.", tags: ["Up to 10 cards", "Unique links", "Drag & drop ordering"] },
    { name: "Flexible Ads", desc: "Let Meta optimize which creative shows to each user.", tags: ["AI-powered", "Multiple creatives", "Auto-selection"] },
    { name: "Partnership Ads", desc: "All three partnership ad types: branded content, creator, and influencer.", tags: ["Branded content", "Creator partnerships", "Influencer collabs"] },
    { name: "Collection Ads", desc: "Catalog integration for e-commerce with instant experience.", tags: ["Product catalog sync", "Instant experience", "Dynamic products"] },
  ];

  return (
    <section className="py-24 relative">
      <div className="container">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <Layers size={14} className="text-amber-400" /> Ad Formats
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            Every Format. <span className="gradient-text">One Interface.</span>
          </h2>
          <p className="text-foreground/50 text-lg max-w-2xl mx-auto">Launch any ad type with the same simple workflow.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {formats.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveFormat(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeFormat === i
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "glass-card text-foreground/60 hover:text-foreground"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 lg:p-12 max-w-3xl mx-auto">
          <h3 className="font-heading font-bold text-2xl mb-3">{formats[activeFormat].name}</h3>
          <p className="text-foreground/60 mb-6">{formats[activeFormat].desc}</p>
          <div className="flex flex-wrap gap-3">
            {formats[activeFormat].tags.map((tag, i) => (
              <span key={i} className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 text-sm border border-purple-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Platform Support ─── */
function PlatformsSection() {
  const anim = useScrollAnimation();
  const platforms = [
    { name: "Meta Ads", features: 21, types: ["Single", "Multi-Format", "Partnership", "Collection", "Carousel", "Flexible", "Post ID", "Multi-Language", "App", "Lead Gen", "DPA"] },
    { name: "TikTok Ads", features: 16, types: ["Standard", "App Ads", "Smart+", "Smart+ 2.0", "Spark Ads", "Display Cards", "Countdown"] },
    { name: "Google Ads", features: 8, types: ["YouTube Uploads", "YouTube Shorts", "Video Ads", "Performance Max", "UAC", "Demand Gen", "Display", "Search"] },
    { name: "Snapchat Ads", features: 7, types: ["Single Image/Video", "Collection", "Story Ads", "AR Lenses"] },
    { name: "Pinterest Ads", features: 7, types: ["Promoted Pins", "Video Pins", "Carousel", "Shopping Ads"] },
  ];

  return (
    <section id="platforms" className="py-24 relative">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="container relative">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <Globe size={14} className="text-amber-400" /> Multi-Platform
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            One Tool. <span className="gradient-text">Every Ad Platform.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {platforms.map((p, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-6 transition-all duration-500 hover:scale-[1.03] ${
                anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-500/10 flex items-center justify-center mb-4 text-purple-400 font-bold text-sm">
                {p.name.split(" ")[0][0]}
              </div>
              <h3 className="font-heading font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-amber-400 font-medium mb-4">{p.features} Features</p>
              <div className="space-y-1.5">
                {p.types.slice(0, 5).map((t, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-foreground/50">
                    <Check size={12} className="text-purple-400 shrink-0" /> {t}
                  </div>
                ))}
                {p.types.length > 5 && (
                  <div className="text-xs text-foreground/30">+{p.types.length - 5} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Showcase (alternating) ─── */
function FeatureShowcase() {
  const anim1 = useScrollAnimation();
  const anim2 = useScrollAnimation();
  const anim3 = useScrollAnimation();

  return (
    <section className="py-24 space-y-32">
      {/* Analytics */}
      <div className="container" ref={anim1.ref}>
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700 ${anim1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
              <BarChart3 size={14} className="text-amber-400" /> Creative Analytics
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
              Know Your <span className="gradient-text">Top Performers</span>
            </h2>
            <p className="text-foreground/50 text-lg mb-8 leading-relaxed">
              Deep dive into creative-level statistics. See which ads are winning and why. Track ROAS, CTR, spend, and impressions in real-time with beautiful dashboards.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Spend", value: "$12,250", change: "+18%" },
                { label: "Impressions", value: "341K", change: "+24%" },
                { label: "Clicks", value: "9.3K", change: "+15%" },
                { label: "Avg. ROAS", value: "4.4x", change: "+0.3x" },
              ].map((m, i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="text-xs text-foreground/40 mb-1">{m.label}</div>
                  <div className="text-xl font-heading font-bold">{m.value}</div>
                  <div className="text-xs text-green-400">{m.change}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 glow-purple">
            <img src={ANALYTICS_IMG} alt="Analytics Dashboard" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="container" ref={anim2.ref}>
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700 ${anim2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 glow-purple">
            <img src={AI_IMG} alt="AI-Powered Features" className="w-full h-auto" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
              <Brain size={14} className="text-amber-400" /> AI-Powered
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
              <span className="gradient-text">AI That Actually</span> Drives Results
            </h2>
            <p className="text-foreground/50 text-lg mb-8 leading-relaxed">
              From ad copy generation to creative optimization, our AI engine helps you create winning ads at scale. Auto-translate to 50+ languages, generate variations, and predict performance.
            </p>
            <div className="space-y-4">
              {[
                "AI Ad Copy Generation with GPT-4",
                "Auto-translate to 50+ languages",
                "Creative performance prediction",
                "Smart audience suggestions",
                "Automated A/B test analysis",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-purple-400" />
                  </div>
                  <span className="text-foreground/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container" ref={anim3.ref}>
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-700 ${anim3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
              <Users size={14} className="text-amber-400" /> Enterprise Ready
            </div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
              Built For <span className="gradient-text">Teams That Scale</span>
            </h2>
            <p className="text-foreground/50 text-lg mb-8 leading-relaxed">
              Custom workspaces with workspace-level permissions. Give the right access to the right people. Unlimited team members with real-time collaboration.
            </p>
            <div className="space-y-3">
              {[
                { role: "Full Access", desc: "Complete control over all features" },
                { role: "Launch Only", desc: "Can create and launch ads" },
                { role: "Analytics View", desc: "View-only performance data" },
                { role: "Edit Only", desc: "Edit campaigns without launching" },
              ].map((r, i) => (
                <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.role[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{r.role}</div>
                    <div className="text-xs text-foreground/40">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 glow-purple">
            <img src={TEAM_IMG} alt="Team Collaboration" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const anim = useScrollAnimation();
  const testimonials = [
    { quote: "Zelvari Ads completely transformed our ad operations. We went from launching 10 ads a day to over 200. The time savings alone justify the investment ten times over.", author: "Sarah Chen", role: "Head of Growth, ScaleUp Agency", metric: "10 → 200+ ads/day" },
    { quote: "The AI copy generator is a game-changer. We're creating variations in seconds that used to take our copywriters hours. Plus the auto-translation feature opened up 12 new markets for us.", author: "Marcus Rivera", role: "CMO, DirectBrands Inc.", metric: "12 new markets" },
    { quote: "Before Zelvari, creating ads was painfully slow. Now everything is streamlined — it's eliminated errors, saved hours every week, and given our team the visibility we needed.", author: "Kate Williams", role: "Head of Paid Social, Wonderly", metric: "Hours saved weekly" },
    { quote: "We've saved over 200 hours as a team in the last 30 days using Zelvari! The automated rules engine alone has saved us from wasting thousands on underperforming ads.", author: "Tom Anderson", role: "Co-founder, MetricLab", metric: "200+ hrs saved/month" },
    { quote: "The bulk launching feature is unbeatable. I just launched 214 ads in 20 minutes for a client. Without any discount codes, without creative enhancements. Pure efficiency.", author: "Marin K.", role: "Performance Marketing Lead", metric: "214 ads in 20 min" },
    { quote: "Onboarding took 15 minutes. It integrates easily into existing workflows. If you want to scale ad production, this is the tool you need. Period.", author: "Alex P.", role: "Growth Consultant", metric: "15 min onboarding" },
  ];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="container relative">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <Star size={14} className="text-amber-400" /> Testimonials
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            Loved by <span className="gradient-text">15,000+ Marketers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] ${
                anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{t.author}</div>
                  <div className="text-xs text-foreground/40">{t.role}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20">
                  {t.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function PricingSection() {
  const anim = useScrollAnimation();
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for solo marketers getting started",
      price: annual ? 0 : 0,
      period: "forever",
      cta: "Start Free",
      popular: false,
      features: [
        "1 Ad Account",
        "1 Workspace",
        "50 Ad Launches / month",
        "Basic Analytics",
        "Email Support",
        "Single & Multi-Format Ads",
      ],
    },
    {
      name: "Pro",
      desc: "For growing teams and serious marketers",
      price: annual ? 299 : 349,
      period: annual ? "/mo billed annually" : "/month",
      cta: "Start 14-Day Trial",
      popular: false,
      features: [
        "3 Ad Accounts",
        "3 Workspaces",
        "Unlimited Ad Launches",
        "Full Analytics Suite",
        "AI Ad Copy Generator",
        "Automated Rules Engine",
        "All Ad Formats",
        "Priority Support",
        "Google Sheets Plugin",
      ],
    },
    {
      name: "Agency",
      desc: "For agencies managing multiple clients",
      price: annual ? 699 : 799,
      period: annual ? "/mo billed annually" : "/month",
      cta: "Start 14-Day Trial",
      popular: true,
      features: [
        "Unlimited Ad Accounts",
        "Unlimited Workspaces",
        "Unlimited Ad Launches",
        "Full Analytics Suite",
        "AI Ad Copy Generator",
        "Automated Rules Engine",
        "All Ad Formats",
        "Dedicated Slack Support",
        "Google Sheets Plugin",
        "Competitor Spy Tool",
        "White-Label Reports",
        "API Access",
      ],
    },
    {
      name: "Enterprise",
      desc: "Custom solutions for large organizations",
      price: null,
      period: "",
      cta: "Contact Sales",
      popular: false,
      features: [
        "Everything in Agency",
        "Custom Integrations",
        "Dedicated Account Manager",
        "SLA Guarantee",
        "Custom Training",
        "On-Premise Option",
        "Advanced Security",
        "Custom API Limits",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
      <div className="container relative">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <Sparkles size={14} className="text-amber-400" /> Pricing Plans
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            No % of Ad Spend. <span className="gradient-text">Scale Without Surprises.</span>
          </h2>
          <p className="text-foreground/50 text-lg max-w-2xl mx-auto mb-8">
            Fixed pricing that lets you scale without limits. No hidden fees based on your ad spend.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass-card rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-purple-600 text-white shadow-lg" : "text-foreground/50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? "bg-purple-600 text-white shadow-lg" : "text-foreground/50"
              }`}
            >
              Annual <span className="text-amber-400 text-xs ml-1">Save 15%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] ${
                plan.popular
                  ? "bg-gradient-to-b from-purple-600/20 to-purple-900/20 border-2 border-purple-500/40 shadow-xl shadow-purple-900/20"
                  : "glass-card"
              } ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-white text-xs font-semibold shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="font-heading font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-foreground/40 text-sm mb-6">{plan.desc}</p>
              <div className="mb-6">
                {plan.price !== null ? (
                  <>
                    <span className="text-4xl font-heading font-extrabold">${plan.price}</span>
                    <span className="text-foreground/40 text-sm ml-1">{plan.period}</span>
                  </>
                ) : (
                  <span className="text-2xl font-heading font-bold">Custom</span>
                )}
              </div>
              <a href={getLoginUrl()}>
                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </a>
              <div className="space-y-3">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2.5 text-sm text-foreground/60">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-foreground/30 text-sm mt-8">All plans include a 30-day money-back guarantee. Cancel anytime.</p>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQSection() {
  const anim = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: "How long does it take to launch my ads with Zelvari?", a: "Most users launch their first batch of ads within 2 minutes of signing up. Our 3-step process (Connect, Upload, Launch) is designed for zero learning curve. You can bulk launch 50+ ads in under 60 seconds once your account is connected." },
    { q: "Is Zelvari compatible with my existing ad management tools?", a: "Yes! Zelvari integrates seamlessly with Meta Ads Manager, TikTok Ads, Google Ads, Snapchat Ads, and Pinterest Ads. We also integrate with Google Drive, Dropbox, Frame.io, Air.inc, and Box for media management. Our Google Sheets plugin works with any existing spreadsheet workflow." },
    { q: "How does Zelvari ensure ad quality when launching in bulk?", a: "Every ad goes through our quality validation pipeline before launch. We check creative specifications, copy length limits, URL formatting, and platform-specific requirements. Our auto-grouping system uses 40+ detection methods to ensure creatives are properly matched to placements." },
    { q: "Can Zelvari help with ad creative generation?", a: "Absolutely! Our AI-powered ad copy generator creates high-converting copy variations in seconds. It can auto-translate to 50+ languages, generate headline and description variations, and even suggest creative improvements based on your historical performance data." },
    { q: "What kind of support does Zelvari offer?", a: "We offer tiered support based on your plan. All users get email support with <24hr response times. Pro users get priority live chat support. Agency and Enterprise users get dedicated Slack channels with <20 minute average response times from real media buying experts." },
    { q: "How quickly can I get started with Zelvari?", a: "You can sign up and launch your first ad in under 5 minutes. Connect your ad account with one click, drag and drop your creatives, and hit launch. No complex setup, no training required. We also offer free onboarding calls for Pro and Agency plans." },
    { q: "Is there a limit to how many ads I can launch?", a: "Starter plan includes 50 launches per month. Pro and Agency plans include unlimited ad launches with no caps on volume. We've had users launch over 1,000 ads in a single session without any issues." },
    { q: "How does Zelvari handle multi-language campaigns?", a: "Our AI auto-translation engine supports 50+ languages. You can write your ad copy once and launch to every market simultaneously with localized copy. Each translation is optimized for the target language's advertising conventions, not just literal translation." },
    { q: "What happens if Meta Ads Manager goes down?", a: "Zelvari operates independently of Meta's UI. Even when Ads Manager crashes or is slow, Zelvari continues to work through the API. Your ads will still launch, and you can still manage campaigns without any interruption." },
    { q: "Do you offer a free trial?", a: "Yes! Our Starter plan is completely free forever with 50 ad launches per month. Pro and Agency plans come with a 14-day free trial and a 30-day money-back guarantee. No credit card required to start." },
  ];

  return (
    <section id="faq" className="py-24 relative">
      <div className="container max-w-3xl">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 mb-6">
            <MessageSquare size={14} className="text-amber-400" /> FAQ
          </div>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
                anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-sm lg:text-base pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-foreground/40 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 pb-5" : "max-h-0"}`}>
                <p className="px-5 text-foreground/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const anim = useScrollAnimation();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-purple-800/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/20 rounded-full blur-3xl" />
      <div className={`container relative text-center transition-all duration-700 ${anim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} ref={anim.ref}>
        <h2 className="font-heading font-bold text-3xl lg:text-5xl mb-4">
          Stop Fighting Ad Managers.{" "}
          <span className="gradient-text">Start Launching.</span>
        </h2>
        <p className="text-foreground/50 text-lg max-w-2xl mx-auto mb-8">
          Join 15,000+ media buyers who launch 10x faster. First launch takes 2 minutes to set up.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-xl shadow-purple-600/30 h-14 px-8 text-base">
              Start Launching Free <ArrowRight size={18} className="ml-2" />
            </Button>
          </a>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base border-border/50">
            Book a Demo
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-foreground/40">
          <span className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Works when Ads Manager crashes</span>
          <span className="flex items-center gap-2"><Check size={14} className="text-green-400" /> 30-day money-back guarantee</span>
          <span className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Bulk Ad Launching", "Creative Analytics", "AI Ad Copy", "Automated Rules", "Ads Manager", "Google Sheets Plugin"],
    },
    {
      title: "Platforms",
      links: ["Meta Ads", "TikTok Ads", "Google Ads", "Snapchat Ads", "Pinterest Ads", "AppLovin / Axon"],
    },
    {
      title: "Resources",
      links: ["Blog", "Case Studies", "Documentation", "API Reference", "Status Page", "Changelog"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Contact", "Affiliates", "Terms of Service", "Privacy Policy"],
    },
  ];

  return (
    <footer className="border-t border-border/50 py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/30">
                Z
              </div>
              <span className="font-heading font-bold text-xl">Zelvari Ads</span>
            </div>
            <p className="text-foreground/40 text-sm leading-relaxed max-w-xs">
              The world's most powerful ad management platform. Launch ads 10x faster across every platform.
            </p>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="font-heading font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-foreground/30 text-sm">Built by Zelvari Ads. &copy; {new Date().getFullYear()} All rights reserved.</p>
          <div className="flex items-center gap-4 text-foreground/30 text-sm">
            <a href="#" className="hover:text-foreground/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground/50 transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <FeaturesSection />
      <AdFormatsSection />
      <PlatformsSection />
      <FeatureShowcase />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
