import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Sparkles } from "lucide-react";

import { PageHeader, ResponsibleAIBanner } from "@/components/page-header";
import { OutputCard } from "@/components/output-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = cfr("/_app/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aria" },
      { name: "description", content: "Draft professional emails with AI." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const callGenerate = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "concise" | "persuasive" | "apologetic">(
    "friendly",
  );
  const [keyPoints, setKeyPoints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Please fill in recipient and purpose.");
      return;
    }
    setLoading(true);
    try {
      const res = await callGenerate({
        data: { recipient, purpose, tone, keyPoints },
      });
      setOutput(res.text);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Describe what you need to send. Get a ready-to-edit draft in seconds."
      />
      <ResponsibleAIBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft"
        >
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g. My manager, the design team, a new client"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g. Request a deadline extension on Project Atlas"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="apologetic">Apologetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyPoints">Key points (optional)</Label>
            <Textarea
              id="keyPoints"
              placeholder="Bullet the main things to include..."
              rows={5}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating..." : "Generate email"}
          </Button>
        </form>

        <OutputCard
          title="Draft email"
          value={output}
          onChange={setOutput}
          loading={loading}
          empty="Fill out the form to draft a professional email."
        />
      </div>
    </div>
  );
}
