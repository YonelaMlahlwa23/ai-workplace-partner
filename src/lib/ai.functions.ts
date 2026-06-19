import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

async function run(system: string, prompt: string) {
  const { text } = await generateText({ model: getModel(), system, prompt });
  return { text };
}

const EmailInput = z.object({
  recipient: z.string().min(1),
  purpose: z.string().min(1),
  tone: z.enum(["formal", "friendly", "concise", "persuasive", "apologetic"]),
  keyPoints: z.string().optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) =>
    run(
      "You are an expert workplace email writer. Always produce a clear subject line on the first line as 'Subject: ...' followed by a blank line and the body. Keep emails professional, well-structured, and ready to send.",
      `Write an email.\nRecipient: ${data.recipient}\nPurpose: ${data.purpose}\nTone: ${data.tone}\nKey points:\n${data.keyPoints || "(none)"}`,
    ),
  );

const NotesInput = z.object({
  notes: z.string().min(10),
  style: z.enum(["executive", "detailed", "action-only"]).default("executive"),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) =>
    run(
      "You summarize meeting notes for busy professionals. Always return markdown with these sections: ## TL;DR, ## Key Decisions, ## Action Items (with owner if mentioned and due date if mentioned), ## Open Questions, ## Risks. Be precise and avoid speculation.",
      `Style: ${data.style}\n\nRaw notes:\n${data.notes}`,
    ),
  );

const PlanInput = z.object({
  goal: z.string().min(1),
  deadline: z.string().optional().default(""),
  context: z.string().optional().default(""),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) =>
    run(
      "You are an AI task planner. Break a goal into a prioritized, sequenced task list as markdown. Use a numbered list with each item showing: **Task name** — short description, estimated effort (S/M/L), priority (P1/P2/P3), and any dependencies. End with a brief 'Suggested first step' line.",
      `Goal: ${data.goal}\nDeadline: ${data.deadline || "not specified"}\nContext:\n${data.context || "(none)"}`,
    ),
  );

const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.enum(["overview", "deep-dive"]).default("overview"),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) =>
    run(
      "You are an AI research assistant for workplace use. Return well-structured markdown with: ## Summary, ## Key Concepts, ## Important Considerations, ## Suggested Next Steps. Be balanced, cite uncertainty when relevant, and avoid fabricating sources.",
      `Topic: ${data.topic}\nDepth: ${data.depth}`,
    ),
  );
