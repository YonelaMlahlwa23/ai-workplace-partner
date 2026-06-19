import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquare, Send, Loader2, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { PageHeader, ResponsibleAIBanner } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Aria" },
      { name: "description", content: "Chat with your AI workplace productivity assistant." },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "aria.chat.v1";

function loadInitial(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

const SUGGESTIONS = [
  "Help me prep for a 1:1 with my manager about a promotion.",
  "Rewrite this Slack message to sound more professional.",
  "What's a good agenda for a 30-minute project kickoff?",
  "How do I politely decline a meeting that should be an email?",
];

function ChatPage() {
  const [initial] = useState<UIMessage[]>(() => loadInitial());
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initial,
    transport: transport.current,
    onError: (err) => {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    },
  });

  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    taRef.current?.focus();
  }, [status]);

  const submit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const clear = () => {
    setMessages([]);
    window.localStorage.removeItem(STORAGE_KEY);
    taRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      <PageHeader
        icon={MessageSquare}
        title="AI Chatbot"
        description="Your conversational copilot for workplace questions."
        actions={
          messages.length > 0 ? (
            <Button variant="outline" size="sm" onClick={clear} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          ) : null
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">How can I help you today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask anything about your workday — writing, planning, prepping, or brainstorming.
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void submit(s)}
                    className="rounded-xl border bg-background p-3 text-left text-sm text-foreground/80 transition hover:border-primary/40 hover:bg-accent hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {status === "submitted" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t bg-background/60 p-3 backdrop-blur sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message Aria... (Shift+Enter for newline)"
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 shrink-0 rounded-xl p-0"
              aria-label="Send"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <ResponsibleAIBanner />
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-soft">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="prose-chat min-w-0 flex-1 text-foreground">
        <ReactMarkdown>{text || "..."}</ReactMarkdown>
      </div>
    </div>
  );
}
