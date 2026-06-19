import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ListTodo, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, ResponsibleAIBanner } from "@/components/page-header";
import { OutputCard } from "@/components/output-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aria" },
      { name: "description", content: "Break any goal into a prioritized AI-generated task plan." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const callPlan = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Describe the goal you want to plan.");
      return;
    }
    setLoading(true);
    try {
      const res = await callPlan({ data: { goal, deadline, context } });
      setOutput(res.text);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ListTodo}
        title="AI Task Planner"
        description="Describe a goal — get a sequenced, prioritized task list."
      />
      <ResponsibleAIBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              placeholder="e.g. Launch the Q3 customer survey"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              placeholder="e.g. End of August"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Context (optional)</Label>
            <Textarea
              id="context"
              rows={6}
              placeholder="Team size, constraints, prior work, stakeholders..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? "Planning..." : "Generate plan"}
          </Button>
        </form>

        <OutputCard
          title="Task plan"
          value={output}
          onChange={setOutput}
          loading={loading}
          empty="Describe a goal to get a structured plan."
        />
      </div>
    </div>
  );
}
