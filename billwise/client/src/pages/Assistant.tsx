import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  MessageSquareText,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  { icon: Plus, label: "Add a bill", prompt: "Add a new electric bill for $150 due on the 15th of next month" },
  { icon: CheckCircle2, label: "Pay a bill", prompt: "Mark my most recent pending bill as paid" },
  { icon: Search, label: "Find bills", prompt: "Show me all my overdue bills" },
  { icon: BarChart3, label: "Spending report", prompt: "Give me a summary of my spending this month" },
  { icon: Lightbulb, label: "Budget tips", prompt: "Analyze my bills and suggest ways to save money" },
  { icon: CalendarDays, label: "What's due", prompt: "What bills do I have coming up this week?" },
  { icon: Receipt, label: "Add recurring", prompt: "Add a monthly Netflix subscription for $15.99 due on the 1st" },
  { icon: CreditCard, label: "Payment history", prompt: "Show me my recent payment history" },
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
      // Invalidate bill/payment data since AI might have made changes
      if (result.actions && result.actions.length > 0) {
        utils.bills.list.invalidate();
        utils.payments.list.invalidate();
        utils.analytics.dashboard.invalidate();
        utils.categories.list.invalidate();
        result.actions.forEach((action) => {
          toast.success(action);
        });
      }
    },
    onError: (err) => {
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

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[calc(100vh-12rem)] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-serif">AI Assistant</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal billing and budget assistant
          </p>
        </div>
        {displayMessages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => clearChat.mutate()}
            disabled={clearChat.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-hidden">
          {displayMessages.length === 0 && !sendMessage.isPending ? (
            <div className="flex h-full flex-col p-6">
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold font-serif">BillWise AI</h2>
                  <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
                    I can help you manage bills, track payments, analyze spending, and optimize your budget. Just tell me what you need!
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl w-full">
                  {SUGGESTED_PROMPTS.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(item.prompt)}
                      disabled={sendMessage.isPending}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors text-center group"
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col space-y-4 p-4">
                {displayMessages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end items-start"
                        : "justify-start items-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                        <User className="size-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {sendMessage.isPending && (
                  <div className="flex items-start gap-3">
                    <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="size-4 text-primary" />
                    </div>
                    <div className="rounded-xl bg-muted px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-background/50 p-3">
          {/* Quick Action Chips */}
          {displayMessages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: "Add bill", prompt: "I need to add a new bill" },
                { label: "Pay bill", prompt: "I want to mark a bill as paid" },
                { label: "Summary", prompt: "Give me a spending summary" },
                { label: "What's due?", prompt: "What bills are due soon?" },
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip.prompt)}
                  disabled={sendMessage.isPending}
                  className="shrink-0 px-3 py-1 rounded-full border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 items-end"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about a bill, ask for insights, or request an action..."
              className="flex-1 max-h-32 resize-none min-h-10 text-base"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sendMessage.isPending}
              className="shrink-0 h-10 w-10"
            >
              {sendMessage.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
