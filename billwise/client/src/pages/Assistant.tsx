import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  User,
  Loader2,
  Trash2,
  Receipt,
  CreditCard,
  BarChart3,
  Lightbulb,
  Search,
  CalendarDays,
  CheckCircle2,
  Plus,
  Brain,
  DollarSign,
  PiggyBank,
  Zap,
  TrendingUp,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_PROMPTS = [
  { icon: Plus, label: "Add a bill", prompt: "Add a new electric bill for $150 due on the 15th of next month", color: "text-primary" },
  { icon: CheckCircle2, label: "Pay a bill", prompt: "Mark my most recent pending bill as paid", color: "text-chart-5" },
  { icon: DollarSign, label: "Add income", prompt: "Add my monthly salary of $5,000", color: "text-chart-2" },
  { icon: BarChart3, label: "Spending report", prompt: "Give me a detailed summary of my spending this month", color: "text-chart-3" },
  { icon: Lightbulb, label: "Budget tips", prompt: "Analyze my bills and income, then suggest ways to save money", color: "text-chart-4" },
  { icon: CalendarDays, label: "What's due", prompt: "What bills do I have coming up this week?", color: "text-primary" },
  { icon: Receipt, label: "Add recurring", prompt: "Add a monthly Netflix subscription for $15.99 due on the 1st", color: "text-chart-2" },
  { icon: PiggyBank, label: "Budget plan", prompt: "Create a complete monthly budget plan based on my income and bills", color: "text-chart-5" },
  { icon: Search, label: "Find bills", prompt: "Show me all my overdue bills and suggest a payment plan", color: "text-destructive" },
  { icon: TrendingUp, label: "Financial health", prompt: "Give me a financial health score and tips to improve it", color: "text-chart-2" },
  { icon: Wallet, label: "Track income", prompt: "Show me a breakdown of all my income sources", color: "text-primary" },
  { icon: Zap, label: "Quick optimize", prompt: "What are the top 3 things I can do right now to improve my finances?", color: "text-chart-3" },
];

export default function Assistant() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const utils = trpc.useUtils();
  const { data: messages, isLoading: messagesLoading } = trpc.chat.messages.useQuery();

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (result) => {
      utils.chat.messages.invalidate();
      if (result.actions && result.actions.length > 0) {
        utils.bills.list.invalidate();
        utils.payments.list.invalidate();
        utils.analytics.dashboard.invalidate();
        utils.categories.list.invalidate();
        utils.income.list.invalidate();
        utils.income.monthlyTotal.invalidate();
        result.actions.forEach((action) => {
          toast.success(action);
        });
      }
    },
    onError: () => {
      toast.error("Failed to send message");
      utils.chat.messages.invalidate();
    },
  });

  const clearChat = trpc.chat.clear.useMutation({
    onSuccess: () => {
      utils.chat.messages.invalidate();
      toast.success("Chat history cleared");
    },
  });

  const displayMessages = messages?.filter((m) => m.role !== "system") ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement;
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        });
      }
    }
  }, [displayMessages.length, sendMessage.isPending]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || sendMessage.isPending) return;
    setInput("");
    sendMessage.mutate({ message: msg });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (messagesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="h-[calc(100vh-12rem)] bg-muted/10 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 shrink-0"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center neon-purple"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Brain className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">AI Assistant</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Your personal finance brain — ask me anything!
            </p>
          </div>
        </div>
        {displayMessages.length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => clearChat.mutate()} disabled={clearChat.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card/50 rounded-2xl border border-border/50 shadow-lg overflow-hidden backdrop-blur-sm">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-hidden">
          {displayMessages.length === 0 && !sendMessage.isPending ? (
            <div className="flex h-full flex-col p-6">
              <div className="flex flex-1 flex-col items-center justify-center gap-8">
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-2 flex items-center justify-center neon-purple"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-display font-bold gradient-text">ZelvariWise AI</h2>
                  <p className="text-sm text-muted-foreground text-center max-w-lg leading-relaxed">
                    I'm your personal finance assistant. I can add bills, track income, record payments, analyze spending, generate budgets, and give you smart financial advice. Just tell me what you need!
                  </p>
                </motion.div>

                {/* Suggested Prompts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-w-3xl w-full">
                  {SUGGESTED_PROMPTS.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSend(item.prompt)}
                      disabled={sendMessage.isPending}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all text-center group"
                    >
                      <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col space-y-4 p-4">
                <AnimatePresence>
                  {displayMessages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end items-start" : "justify-start items-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="size-8 shrink-0 mt-1 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                          <Brain className="size-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                            : "bg-muted/50 text-foreground border border-border/30"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="size-8 shrink-0 mt-1 rounded-xl bg-secondary flex items-center justify-center">
                          <User className="size-4 text-secondary-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sendMessage.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className="size-8 shrink-0 mt-1 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                      <Brain className="size-4 text-white" />
                    </div>
                    <div className="rounded-2xl bg-muted/50 px-4 py-3 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/30 bg-background/80 backdrop-blur-sm p-3">
          {/* Quick Action Chips */}
          {displayMessages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: "Add bill", prompt: "I need to add a new bill", icon: Plus },
                { label: "Pay bill", prompt: "I want to mark a bill as paid", icon: CheckCircle2 },
                { label: "Add income", prompt: "I want to add an income source", icon: DollarSign },
                { label: "Summary", prompt: "Give me a spending summary", icon: BarChart3 },
                { label: "Budget", prompt: "Generate a budget plan for me", icon: PiggyBank },
                { label: "What's due?", prompt: "What bills are due soon?", icon: CalendarDays },
              ].map((chip, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(chip.prompt)}
                  disabled={sendMessage.isPending}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <chip.icon className="h-3 w-3" />
                  {chip.label}
                </motion.button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-end"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about a bill, ask for insights, or let me manage your finances..."
              className="flex-1 max-h-32 resize-none min-h-10 text-sm bg-muted/20 border-border/30 rounded-xl focus:border-primary/50"
              rows={1}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sendMessage.isPending}
                className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-chart-2 text-white border-0 hover:opacity-90"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
