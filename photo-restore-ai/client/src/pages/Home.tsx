/*
 * DESIGN: Temporal Alchemy — Dark Cinematic Restoration Studio
 * Home Page: Hero with darkroom bg, feature cards with amber glow, before/after demo, CTA
 * Light text on dark images, Playfair Display for headlines
 */
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Wand2, Palette, Maximize, ArrowRight, Shield, Zap, Clock } from "lucide-react";
import { useRef } from "react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/hero-bg-KMMbPoz9L4SkHuFmmQXYKe.webp";
const BEFORE_AFTER = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/before-after-demo-mEuFHcjtAbDycd2GSiTC4h.webp";
const FEATURE_REPAIR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/feature-repair-kuyMg4RM6jkkMLG9uDFeah.webp";
const FEATURE_COLORIZE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/feature-colorize-mwx6FYzG9pG9WF9QjeEfsB.webp";
const FEATURE_UPSCALE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/feature-upscale-WNjpLLcUxRKoZQXP8SKikX.webp";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Wand2,
    title: "Damage Repair",
    description: "Remove tears, creases, scratches, and water damage. Our AI reconstructs missing details with remarkable accuracy.",
    image: FEATURE_REPAIR,
    gradient: "from-amber/20 to-amber-dark/10",
  },
  {
    icon: Palette,
    title: "Colorization",
    description: "Transform black & white photos into vivid, natural color. AI understands context to apply historically accurate colors.",
    image: FEATURE_COLORIZE,
    gradient: "from-teal/20 to-teal-light/10",
  },
  {
    icon: Maximize,
    title: "4K Upscaling",
    description: "Enhance resolution up to 4x. Sharpen blurry details and bring out textures that were previously invisible.",
    image: FEATURE_UPSCALE,
    gradient: "from-amber/15 to-teal/10",
  },
];

const stats = [
  { icon: Zap, value: "10s", label: "Average Processing" },
  { icon: Shield, value: "100%", label: "Private & Secure" },
  { icon: Clock, value: "4K", label: "Max Resolution" },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-background/70" />
        </motion.div>

        {/* Floating amber particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber/40"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-medium mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Photo Restoration
            </motion.div>

            {/* Headline */}
            <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight mb-6">
              <span className="text-foreground">Breathe Life Into</span>
              <br />
              <span className="text-gradient-amber">Your Memories</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Repair damaged photos, bring color to black & white images, and upscale everything to stunning 4K clarity — all powered by advanced AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/restore">
                <motion.span
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-amber text-primary-foreground rounded-xl font-semibold text-base amber-glow-strong hover:bg-amber-light transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Restore Your Photos
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
              <Link href="/how-it-works">
                <motion.span
                  className="inline-flex items-center gap-2 px-8 py-4 bg-secondary/50 border border-border rounded-xl font-medium text-base text-foreground hover:bg-secondary transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  See How It Works
                </motion.span>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-8 sm:gap-12 mt-14"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <stat.icon className="w-5 h-5 text-amber/70" />
                  <div className="text-left">
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-amber/30 flex items-start justify-center p-1.5"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-amber" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== BEFORE/AFTER SHOWCASE ===== */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4"
            >
              See the <span className="text-gradient-amber">Transformation</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              From damaged and faded to vibrant and crystal clear — witness the power of AI restoration.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden amber-glow">
              <img
                src={BEFORE_AFTER}
                alt="Before and after photo restoration comparison"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>
            {/* Labels */}
            <div className="absolute bottom-6 left-6 px-4 py-2 glass-card rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Before</span>
            </div>
            <div className="absolute bottom-6 right-6 px-4 py-2 glass-card rounded-lg">
              <span className="text-sm font-medium text-amber">After</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber/[0.02] to-transparent" />
        <div className="container relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-medium mb-6"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Powerful Features
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4"
            >
              Three Ways to <span className="text-gradient-amber">Restore</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              Each feature uses specialized AI models trained on millions of photographs to deliver exceptional results.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" as const }}
              >
                <motion.div
                  className="group relative glass-card rounded-2xl overflow-hidden h-full"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {/* Feature Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} to-transparent`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber/10 text-amber">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl ring-1 ring-amber/20" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS TEASER ===== */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4"
            >
              Simple as <span className="text-gradient-amber">1, 2, 3</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              No technical skills required. Just upload, choose your restoration, and download.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Upload", desc: "Drag & drop your old or damaged photo into the restoration studio." },
              { step: "02", title: "Choose", desc: "Select repair, colorize, upscale — or combine all three for maximum restoration." },
              { step: "03", title: "Download", desc: "Get your restored photo in stunning quality, ready to print or share." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative text-center group"
              >
                <div className="text-6xl font-[family-name:var(--font-display)] font-bold text-amber/10 group-hover:text-amber/20 transition-colors mb-2">
                  {item.step}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 text-amber/20">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber/[0.03] to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12 sm:p-16 relative overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal/10 rounded-full blur-3xl" />

            <div className="relative">
              <Sparkles className="w-10 h-10 text-amber mx-auto mb-6" />
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
                Ready to Restore Your <span className="text-gradient-amber">Memories</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Upload your first photo and experience the magic of AI-powered restoration. It takes just seconds.
              </p>
              <Link href="/restore">
                <motion.span
                  className="inline-flex items-center gap-2.5 px-10 py-4 bg-amber text-primary-foreground rounded-xl font-semibold text-lg amber-glow-strong hover:bg-amber-light transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Start Restoring Now
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
