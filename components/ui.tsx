"use client";

import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy, faCheck, faArrowUpRightFromSquare, faCircleInfo, faTriangleExclamation,
  faCircleExclamation, faCircleCheck, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { truncateHex, explorerTx, explorerAddr, explorerContract } from "@/lib/format";

const PROJECT: Record<string, string> = {
  draft: "border-line text-muted bg-surface",
  active: "border-primary/50 text-primary bg-primary/10",
  reviewing: "border-primary/50 text-primary bg-primary/10",
  challenged: "border-warning/50 text-warning bg-warning/10",
  appealed: "border-warning/50 text-warning bg-warning/10",
  ranked: "border-success/50 text-success bg-success/10",
  archived: "border-line text-muted bg-surface",
};
const CLAIM: Record<string, string> = {
  submitted: "border-line text-muted bg-surface",
  assessed: "border-primary/50 text-primary bg-primary/10",
  accepted: "border-success/50 text-success bg-success/10",
  partial: "border-warning/50 text-warning bg-warning/10",
  rejected: "border-danger/50 text-danger bg-danger/10",
  suspected_gaming: "border-danger/50 text-danger bg-danger/10",
  challenged: "border-warning/50 text-warning bg-warning/10",
  appealed: "border-warning/50 text-warning bg-warning/10",
  finalized: "border-success/50 text-success bg-success/10",
};
const DECISION: Record<string, string> = {
  open: "border-warning/50 text-warning bg-warning/10",
  upheld: "border-success/50 text-success bg-success/10",
  dismissed: "border-muted/40 text-muted bg-surface",
  accepted: "border-success/50 text-success bg-success/10",
  denied: "border-danger/50 text-danger bg-danger/10",
};
const VERDICT: Record<string, string> = {
  accepted: "border-success/50 text-success bg-success/10",
  partial: "border-warning/50 text-warning bg-warning/10",
  rejected: "border-danger/50 text-danger bg-danger/10",
  suspected_gaming: "border-danger/50 text-danger bg-danger/10",
};

export function StatusChip({ status, kind }: { status: string; kind: "project" | "claim" | "decision" }) {
  const map = kind === "project" ? PROJECT : kind === "claim" ? CLAIM : DECISION;
  const cls = map[status] ?? "border-line text-muted bg-surface";
  return <span className={`chip ${cls}`}>{(status || "-").replace(/_/g, " ")}</span>;
}

export function VerdictBadge({ verdict, quality, gaming }: { verdict?: string; quality?: number; gaming?: number }) {
  const cls = VERDICT[verdict ?? ""] ?? "border-line text-muted bg-surface";
  return (
    <span className={`chip ${cls}`}>
      {(verdict || "unassessed").replace(/_/g, " ")}
      {typeof quality === "number" && quality > 0 ? <span className="mono opacity-80">· q{quality}</span> : null}
      {typeof gaming === "number" && gaming > 0 ? <span className="mono opacity-80">· g{gaming}</span> : null}
    </span>
  );
}

export function Copy({ value, className = "" }: { value: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label="Copy"
      className={`inline-grid h-6 w-6 place-items-center rounded-pill text-muted transition-colors hover:bg-surface hover:text-text ${className}`}
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch {} }}>
      <FontAwesomeIcon icon={done ? faCheck : faCopy} className={`h-3 w-3 ${done ? "text-success" : ""}`} />
    </button>
  );
}

export function Hex({ value, kind = "address", lead = 6, tail = 4 }: { value: string; kind?: "address" | "contract" | "tx"; lead?: number; tail?: number }) {
  if (!value) return <span className="text-muted">-</span>;
  const href = kind === "tx" ? explorerTx(value) : kind === "contract" ? explorerContract(value) : explorerAddr(value);
  return (
    <span className="inline-flex items-center gap-1">
      <a href={href} target="_blank" rel="noreferrer" className="mono text-xs text-text/90 underline-offset-2 hover:text-primary hover:underline" title={value}>
        {truncateHex(value, lead, tail)}
      </a>
      <Copy value={value} />
    </span>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      {children}<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
    </a>
  );
}

type Tone = "info" | "warn" | "danger" | "ok";
const TONE: Record<Tone, { c: string; i: typeof faCircleInfo; ic: string }> = {
  info: { c: "border-primary/40 bg-primary/5", i: faCircleInfo, ic: "text-primary" },
  warn: { c: "border-warning/40 bg-warning/5", i: faTriangleExclamation, ic: "text-warning" },
  danger: { c: "border-danger/40 bg-danger/5", i: faCircleExclamation, ic: "text-danger" },
  ok: { c: "border-success/40 bg-success/5", i: faCircleCheck, ic: "text-success" },
};
export function Banner({ tone = "info", title, children, action }: { tone?: Tone; title?: string; children?: ReactNode; action?: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${t.c}`}>
      <FontAwesomeIcon icon={t.i} className={`mt-0.5 h-4 w-4 ${t.ic}`} />
      <div className="flex-1">{title && <div className="font-semibold text-text">{title}</div>}{children && <div className="text-muted">{children}</div>}</div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint }: { icon?: typeof faInbox; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface/40 px-6 py-12 text-center">
      <FontAwesomeIcon icon={icon ?? faInbox} className="h-6 w-6 text-muted/60" />
      <div className="text-sm font-semibold text-text">{title}</div>
      {hint && <div className="max-w-sm text-xs text-muted">{hint}</div>}
    </div>
  );
}

/** Ghost orbit-ring loading skeleton (not grey rectangles). */
export function GhostOrbit({ size = 220 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ height: size }}>
      <div className="ghost-ring absolute animate-spinslow" style={{ width: size, height: size }} />
      <div className="ghost-ring absolute" style={{ width: size * 0.66, height: size * 0.66 }} />
      <div className="absolute h-5 w-5 rounded-pill bg-primary/40 animate-orbitpulse" />
      <div className="absolute h-3 w-3 rounded-pill bg-accent/50 animate-orbitpulse" style={{ left: "20%", top: "30%" }} />
      <div className="absolute h-3 w-3 rounded-pill bg-success/50 animate-orbitpulse" style={{ right: "22%", bottom: "28%" }} />
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "primary" | "accent" | "danger" | "success" | "warning" }) {
  const c = tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : tone === "primary" ? "text-primary" : "text-text";
  return (
    <div className="panel p-3.5">
      <div className="label">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}
