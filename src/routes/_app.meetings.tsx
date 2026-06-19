import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, ResponsibleAIBanner } from "@/components/page-header";
import { OutputCard } from "@/components/output-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Aria" },
      { name: "description", content: "Turn raw meeting notes into clear summaries and action items." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const callSummarize = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState<"executive" | "detailed" | "action-only">("executive");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 10) {
      toast.error("Paste your meeting notes (at least a few sentences).");
      return;
    }
    setLoading(true);
    try {
      const res = await callSummarize({ data: { notes, style } });
      setOutput(res.text);
    } catch (err) {
      console.error(err);
      toast.error("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summarizer"
        description="Paste rough notes or a transcript — get a TL;DR, decisions, and action items."
      />
      <ResponsibleAIBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <Label>Summary style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive (concise)</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="action-only">Action items only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Raw meeting notes</Label>
            <Textarea
              id="notes"
              rows={16}
              placeholder="Paste rough notes, bullet points, or a transcript..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? "Summarizing..." : "Summarize meeting"}
          </Button>
        </form>

        <OutputCard
          title="Summary"
          value={output}
          onChange={setOutput}
          loading={loading}
          empty="Paste notes and click summarize to see a structured recap."
        />
      </div>
    </div>
  );
}
