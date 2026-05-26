import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "2-day Ooty trip under ₹5000",
  "Best waterfalls near Chennai",
  "Budget-friendly hill stations",
  "Temple trip itinerary in 3 days",
  "Family-friendly weekend from Coimbatore",
  "Backpacker route: Madurai → Kanyakumari",
];

const CHAT_URL = "/api/chat";

const AIPlanner = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Auto-send if navigated with prompt state
  useEffect(() => {
    const initialPrompt = (location.state as any)?.prompt;

    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      send(initialPrompt);
    }
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || loading) return;

    const userMsg: Msg = {
      role: "user",
      content: trimmed,
    };

    const next = [...messages, userMsg];

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 20000);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: next,
        }),
      });

      window.clearTimeout(timeoutId);

      if (resp.status === 429) {
        toast.error("Too many requests. Try again shortly.");
        setLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error("AI credits exhausted.");
        setLoading(false);
        return;
      }

      if (!resp.ok) {
        toast.error("Sikkanam AI is unavailable right now.");
        setLoading(false);
        return;
      }

      const payload = await resp.json().catch(() => null) as { reply?: string; error?: string } | null;
      const reply = payload?.reply?.trim();

      if (!reply) {
        toast.error(payload?.error || "Sikkanam AI returned an empty reply.");
        setLoading(false);
        return;
      }

      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === "assistant") {
          return prev.map((message, index) =>
            index === prev.length - 1
              ? { ...message, content: reply }
              : message,
          );
        }

        return [...prev, { role: "assistant", content: reply }];
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof DOMException && e.name === "AbortError" ? "Sikkanam AI took too long. Please try again." : "Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md md:max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)] md:h-[calc(100vh-5rem)]">
      {/* Header banner */}
      <div className="px-4 pt-2 pb-3">
        <div className="gradient-saffron text-primary-foreground rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card">
          <Sparkles className="w-5 h-5" />

          <div className="flex-1">
            <p className="font-display font-bold text-sm">
              Sikkanam AI
            </p>

            <p className="text-[11px] opacity-90">
              Your Tamil Nadu travel companion
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-4"
      >
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Try asking
            </p>

            <div className="grid gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-left bg-card border border-border rounded-xl px-3.5 py-3 text-sm active:scale-[0.98] transition-transform hover:border-primary/40"
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "gradient-saffron text-primary-foreground rounded-br-md"
                    : "bg-card border border-border text-foreground rounded-bl-md"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground">
                    <ReactMarkdown>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {m.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sikkanam AI is planning…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pt-2 pb-2 border-t border-border bg-background/95 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a trip, budget, route…"
            className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="w-11 h-11 grid place-items-center rounded-full gradient-saffron text-primary-foreground shadow-card active:scale-95 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIPlanner;
