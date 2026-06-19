import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListTodo,
  Search,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
} from "lucide-react";

import { PageHeader, ResponsibleAIBanner } from "@/components/page-header";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aria Workplace AI" },
      { name: "description", content: "Your AI workplace productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    title: "Smart Email Generator",
    description: "Draft polished, on-tone emails for any workplace situation.",
    icon: Mail,
    url: "/email" as const,
    accent: "from-blue-500/15 to-cyan-500/10",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Turn raw notes into TL;DR, decisions, and action items.",
    icon: FileText,
    url: "/meetings" as const,
    accent: "from-emerald-500/15 to-teal-500/10",
  },
  {
    title: "AI Task Planner",
    description: "Break goals into a prioritized, sequenced plan in seconds.",
    icon: ListTodo,
    url: "/planner" as const,
    accent: "from-violet-500/15 to-fuchsia-500/10",
  },
  {
    title: "AI Research Assistant",
    description: "Get structured briefings on any work topic — fast.",
    icon: Search,
    url: "/research" as const,
    accent: "from-amber-500/15 to-orange-500/10",
  },
  {
    title: "AI Chatbot",
    description: "A conversational copilot for all your workplace questions.",
    icon: MessageSquare,
    url: "/chat" as const,
    accent: "from-rose-500/15 to-pink-500/10",
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={Sparkles}
        title="Welcome back"
        description="Pick a tool to automate your next workplace task."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Zap} label="AI tools" value="5" hint="ready to use" />
        <Stat icon={Clock} label="Avg. time saved" value="~15 min" hint="per task" />
        <Stat icon={ShieldCheck} label="Privacy" value="No data stored" hint="by default" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.url}
            to={t.url}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div
              className={`absolute inset-0 -z-10 bg-gradient-to-br ${t.accent} opacity-0 transition group-hover:opacity-100`}
            />
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <t.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <ResponsibleAIBanner />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
