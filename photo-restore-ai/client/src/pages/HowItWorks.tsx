/*
 * DESIGN: Temporal Alchemy — Dark Cinematic Restoration Studio
 * How It Works: Step-by-step process, technology explanation, FAQ
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Upload, Wand2, Palette, Maximize, Download, Sparkles,
  ArrowRight, Shield, Zap, Brain, Eye, Layers, ChevronDown
} from "lucide-react";
import { useState } from "react";

const FEATURE_REPAIR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/feature-repair-kuyMg4RM6jkkMLG9uDFeah.webp";
const FEATURE_COLORIZE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/feature-colorize-mwx6FYzG9pG9WF9QjeEfsB.webp";
const FEATURE_UPSCALE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663079185454/Z6CovHDeN7DQ2kopK4CjDL/feature-upscale-WNjpLLcUxRKoZQXP8SKikX.webp";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photo",
    description: "Drag and drop or browse to upload your old, damaged, or black & white photograph. We support JPG, PNG, and WEBP formats up to 20MB.",
    detail: "Your photo is processed locally in your browser for maximum privacy. No data is sent to external servers.",
  },
  {
    icon: Wand2,
    title: "Choose Restoration Mode",
    description: "Select from four powerful restoration modes: Damage Repair, Colorization, 4K Upscaling, or Full Restore which combines all three.",
    detail: "Each mode uses specialized algorithms optimized for that specific type of enhancement.",
  },
  {
    icon: Brain,
    title: "AI Processing",
    description: "Our advanced AI analyzes your photo pixel by pixel, identifying damage patterns, color contexts, and detail opportunities.",
    detail: "The processing pipeline includes noise reduction, detail reconstruction, color mapping, and resolution enhancement.",
  },
  {
    icon: Download,
    title: "Download & Share",
    description: "Review your restored photo with the before/after comparison slider, then download in full quality or save to your gallery.",
    detail: "Restored photos are saved in PNG format for maximum quality preservation.",
  },
];

const technologies = [
  {
    icon: Eye,
    title: "Damage Detection",
    description: "Identifies tears, creases, scratches, water damage, and fading through advanced pattern recognition.",
    image: FEATURE_REPAIR,
  },
  {
    icon: Palette,
    title: "Neural Colorization",
    description: "Understands scene context — sky, skin, foliage, clothing — to apply historically accurate and natural colors.",
    image: FEATURE_COLORIZE,
  },
  {
    icon: Layers,
    title: "Super Resolution",
    description: "Upscales images up to 4x while generating new detail that wasn't visible in the original low-resolution photo.",
    image: FEATURE_UPSCALE,
  },
];

const faqs = [
  {
    q: "What types of damage can be repaired?",
    a: "Our AI can repair tears, creases, scratches, water damage, fading, discoloration, and missing portions of photographs. It works best with physical damage to printed photos that have been scanned.",
  },
  {
    q: "How does colorization work?",
    a: "The AI analyzes the content of your black & white photo — recognizing objects, skin tones, sky, vegetation, and clothing — then applies contextually appropriate colors. The result is a natural-looking colorized image.",
  },
  {
    q: "What resolution can photos be upscaled to?",
    a: "Photos can be upscaled up to 2x their original resolution with enhanced detail and sharpness. A 1080p photo can be enhanced to near-4K quality with improved clarity.",
  },
  {
    q: "Is my photo data private?",
    a: "Yes, absolutely. All processing happens locally in your browser. Your photos are never uploaded to any external server. They stay on your device at all times.",
  },
  {
    q: "What file formats are supported?",
    a: "We support JPG, PNG, and WEBP formats for upload. Restored photos are downloaded in high-quality PNG format to preserve maximum detail.",
  },
  {
    q: "Can I restore multiple photos?",
    a: "Yes! You can restore as many photos as you like. Each restored photo can be saved to your local gallery for easy access and comparison later.",
  },
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute top-40 left-0 w-72 h-72 bg-amber/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[60%] right-0 w-72 h-72 bg-teal/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="container max-w-5xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-medium mb-6"
          >
            <Brain className="w-3.5 h-3.5" />
            Under the Hood
          </motion.div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            How <span className="text-gradient-amber">It Works</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A deep dive into the technology that brings your old photos back to life.
          </p>
        </motion.div>

        {/* Steps */}
        <section className="mb-24">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-amber/40 via-amber/20 to-transparent hidden md:block" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="relative flex gap-6 md:gap-8"
                >
                  {/* Step number */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-amber" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {step.description}
                    </p>
                    <p className="text-sm text-muted-foreground/70 italic">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Deep Dive */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold mb-3">
              The <span className="text-gradient-amber">Technology</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three specialized AI systems working in harmony to deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {technologies.map((tech, i) => (
              <motion.div
                key={tech.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card rounded-2xl overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tech.image}
                    alt={tech.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="p-2 rounded-lg bg-amber/20 text-amber inline-block">
                      <tech.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-foreground mb-2">
                    {tech.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Key Benefits */}
        <section className="mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Results in seconds, not hours. Our optimized pipeline delivers instant gratification." },
              { icon: Shield, title: "100% Private", desc: "All processing happens in your browser. Your photos never leave your device." },
              { icon: Sparkles, title: "Studio Quality", desc: "Professional-grade restoration that rivals expensive photo restoration services." },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 text-center"
              >
                <div className="p-3 rounded-xl bg-amber/10 text-amber inline-block mb-4">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold mb-3">
              Frequently <span className="text-gradient-amber">Asked</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? "auto" : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center glass-card rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
              Ready to Try It <span className="text-gradient-amber">Yourself</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Upload your first photo and see the transformation in seconds.
            </p>
            <Link href="/restore">
              <motion.span
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-amber text-primary-foreground rounded-xl font-semibold amber-glow-strong hover:bg-amber-light transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                Start Restoring
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
