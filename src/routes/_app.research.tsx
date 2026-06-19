import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, ResponsibleAIBanner } from "@/components/page-header";
import { OutputCard } from "@/components/output-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Aria" },
      { name: "description", content: "Get structured AI briefings on any workplace topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const callResearch = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"overview" | "deep-dive">("overview");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Enter a research topic.");
      return;
    }
    setLoading(true);
    try {
      const res = await callResearch({ data: { topic, depth } });
      setOutput(res.text);
    } catch (err) {
      console.error(err);
      toast.error("Failed to run research. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Get a structured briefing on any workplace topic."
      />
      <ResponsibleAIBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or question</Label>
            <Input
              id="topic"
              placeholder="e.g. Best practices for async team standups"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={(v) => setDepth(v as typeof depth)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="deep-dive">Deep dive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? "Researching..." : "Run research"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Tip: This summarizes the model's existing knowledge — it doesn't browse the web. Verify
            facts before relying on them.
          </p>
        </form>

        <OutputCard
          title="Research briefing"
          value={output}
          onChange={setOutput}
          loading={loading}
          empty="Enter a topic to get a structured briefing."
        />
      </div>
    </div>
  );
}
