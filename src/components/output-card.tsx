import { useState, type ReactNode } from "react";
import { Copy, Check, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

export function OutputCard({
  title,
  value,
  onChange,
  loading,
  empty,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
  empty?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {value ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing((e) => !e)}
              className="h-8 gap-1.5 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              {editing ? "Preview" : "Edit"}
            </Button>
            <Button variant="ghost" size="sm" onClick={copy} className="h-8 gap-1.5 text-xs">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-auto p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : !value ? (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            {empty ?? "Your AI-generated output will appear here."}
          </div>
        ) : editing ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[420px] w-full resize-none border-0 p-0 font-mono text-sm shadow-none focus-visible:ring-0"
          />
        ) : (
          <div className="prose-chat max-w-none">
            <ReactMarkdown>{value}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
