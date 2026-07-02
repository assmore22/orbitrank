"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faCircleNodes, faMagnifyingGlassChart, faGavel, faScaleBalanced, faRankingStar,
  faPlay, faBoxArchive, faRotateRight, faFileLines, faClockRotateLeft, faLink,
} from "@fortawesome/free-solid-svg-icons";
import { OrbitView } from "@/components/OrbitView";
import { LeaderboardChart } from "@/components/Charts";
import { AuditTimeline } from "@/components/AuditTimeline";
import { StatusChip, VerdictBadge, Banner, Empty, GhostOrbit, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getProject, getProjectClaims, getProjectLeaderboard, getAuditTrail, hasContract } from "@/lib/orbitrank";
import { hostOf, isHttpUrl } from "@/lib/format";
import type { Claim } from "@/lib/types";

type Tab = "orbit" | "claims" | "audit";

export default function ProjectDetailPage() {
  const id = String(useParams().id);
  const [tab, setTab] = useState<Tab>("orbit");
  const [selClaim, setSelClaim] = useState<string | null>(null);
  const { run, busy, address } = useTx();

  const project = useLoader(() => getProject(id), [id]);
  const claims = useLoader(() => getProjectClaims(id), [id]);
  const leaderboard = useLoader(() => getProjectLeaderboard(id), [id]);
  const audit = useLoader(() => getAuditTrail(id), [id]);

  const reloadAll = () => { project.reload(); claims.reload(); leaderboard.reload(); audit.reload(); };
  const p = project.data;
  const isMaintainer = !!address && !!p && p.maintainer.toLowerCase() === address.toLowerCase();

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to view this project.</Banner>;

  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"><FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" /> Orbit workspace</Link>

      {project.loading && !p ? <GhostOrbit /> :
        project.error ? <Banner tone="danger" title="Failed to load project" action={<button className="btn btn-ghost btn-xs" onClick={project.reload}>Retry</button>}>{project.error}</Banner> :
        !p ? <Empty title={`Project #${id} not found`} hint="It may not exist on this contract." /> :
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faCircleNodes} /> Project #{p.projectId}</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{p.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>Maintainer <Hex value={p.maintainer} /></span>
                <span>Min quality <span className="mono text-text">{p.minQualityScore}</span></span>
                <span>Claims <span className="mono text-text">{p.claimIds.length}/{p.maxClaims}</span></span>
                <span>Top claim <span className="mono text-text">{p.selectedClaimId || "none"}</span></span>
              </div>
            </div>
            <StatusChip status={p.status} kind="project" />
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <ExtLink href={p.repositoryUrl}><FontAwesomeIcon icon={faLink} className="h-2.5 w-2.5" /> {hostOf(p.repositoryUrl)} (repo)</ExtLink>
            {p.docsUrl && <ExtLink href={p.docsUrl}><FontAwesomeIcon icon={faLink} className="h-2.5 w-2.5" /> {hostOf(p.docsUrl)} (docs)</ExtLink>}
            {p.sourceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="panel p-3"><div className="label">Contribution rules</div><ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted">{p.contributionRules.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
            <div className="panel p-3"><div className="label">Quality rubric</div><ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-muted">{p.qualityRubric.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
          </div>

          {isMaintainer && (
            <div className="panel flex flex-wrap items-center gap-2 p-3">
              <span className="label mr-1">Maintainer controls</span>
              {p.status === "draft" && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("Activate project", "activate_project", [p.projectId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faPlay} className="h-3 w-3" /> Activate</button>}
              {!["draft", "ranked", "archived"].includes(p.status) && p.claimIds.length > 0 && <button className="btn btn-accent btn-xs" disabled={busy} onClick={() => run("Finalize rank", "finalize_project_rank", [p.projectId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faRankingStar} className="h-3 w-3" /> Finalize rank</button>}
              {p.status === "ranked" && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Archive project", "archive_project", [p.projectId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faBoxArchive} className="h-3 w-3" /> Archive</button>}
            </div>
          )}

          <div className="flex items-center justify-between border-b border-line">
            <div className="flex gap-1">
              {([["orbit", faCircleNodes, 0], ["claims", faFileLines, claims.data?.length ?? 0], ["audit", faClockRotateLeft, audit.data?.length ?? 0]] as const).map(([t, icon, n]) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-text"}`}>
                  <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" /> {t}{t !== "orbit" ? <span className="mono text-xs opacity-70">{n}</span> : null}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={reloadAll}><FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" /> Refresh</button>
          </div>

          {tab === "orbit" && (
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,360px)]">
              <OrbitView projectTitle={p.title} claims={claims.data ?? []} selectedClaimId={selClaim} onSelect={setSelClaim} loading={claims.loading && !claims.data} />
              <div className="panel p-4"><div className="label mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faRankingStar} className="text-accent" /> Leaderboard</div>{leaderboard.loading && !leaderboard.data ? <GhostOrbit size={120} /> : <LeaderboardChart rows={leaderboard.data ?? []} />}</div>
            </div>
          )}
          {tab === "claims" && <ClaimsTab projectId={id} claims={claims.data} loading={claims.loading} error={claims.error} reload={claims.reload} onAction={reloadAll} run={run} busy={busy} />}
          {tab === "audit" && (
            audit.loading && !audit.data ? <GhostOrbit size={140} /> :
            (audit.data?.length ?? 0) === 0 ? <Empty icon={faClockRotateLeft} title="No audit records" /> :
            <div className="panel p-4"><AuditTimeline records={audit.data!} /></div>
          )}
        </>}
    </div>
  );
}

function ClaimsTab({
  projectId, claims, loading, error, reload, onAction, run, busy,
}: {
  projectId: string; claims?: Claim[]; loading: boolean; error: string | null; reload: () => void;
  onAction: () => void; run: ReturnType<typeof useTx>["run"]; busy: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"challenge" | "appeal" | null>(null);
  const [reason, setReason] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  if (loading && !claims) return <GhostOrbit size={140} />;
  if (error) return <Banner tone="danger" title="Failed to load claims" action={<button className="btn btn-ghost btn-xs" onClick={reload}>Retry</button>}>{error}</Banner>;
  if (!claims || claims.length === 0) return <Empty icon={faFileLines} title="No contributions yet" hint="Submit a contribution from the Contribute page." />;

  const start = (cid: string, m: "challenge" | "appeal") => { setOpenId(cid); setMode(m); setReason(""); setUrls([]); };
  const submit = async (c: Claim) => {
    const fn = mode === "challenge" ? "challenge_contribution" : "file_appeal";
    const label = mode === "challenge" ? "Challenge claim" : "File appeal";
    const h = await run(label, fn, [projectId, c.claimId, reason.trim(), urls]);
    if (h) { setOpenId(null); setMode(null); onAction(); }
  };

  return (
    <div className="space-y-3">
      {claims.map((c) => (
        <div key={c.claimId} className="panel p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><span className="text-sm font-semibold">#{c.claimId} {c.contributionTitle}</span><StatusChip status={c.status} kind="claim" /><VerdictBadge verdict={c.verdict} quality={c.qualityScore} gaming={c.gamingRiskScore} /></div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{c.contributionSummary}</p>
              <div className="mt-1 text-xs text-muted">{c.contributionType} | contributor <Hex value={c.contributor} /></div>
            </div>
          </div>
          {c.assessmentSummary && <p className="mt-2 text-xs text-muted">{c.assessmentSummary}</p>}
          {(c.qualitySignals.length > 0 || c.gamingFlags.length > 0) && (
            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
              {c.qualitySignals.length > 0 && <div><div className="label text-success">Quality signals</div><ul className="mt-1 list-disc pl-4 text-muted">{c.qualitySignals.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
              {c.gamingFlags.length > 0 && <div><div className="label text-danger">Gaming flags</div><ul className="mt-1 list-disc pl-4 text-muted">{c.gamingFlags.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
            </div>
          )}
          {c.evidenceUrls.length > 0 && <div className="mt-2 flex flex-wrap gap-2 text-xs">{c.evidenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
            {["submitted", "partial"].includes(c.status) && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("Assess contribution", "assess_contribution", [projectId, c.claimId]).then((h) => h && onAction())}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> Run AI assessment</button>}
            {["assessed", "accepted", "partial", "rejected", "suspected_gaming", "finalized"].includes(c.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => start(c.claimId, "challenge")}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> Challenge</button>}
            {["rejected", "partial", "suspected_gaming", "challenged", "accepted"].includes(c.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => start(c.claimId, "appeal")}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> Appeal</button>}
          </div>

          {openId === c.claimId && mode && (
            <div className="mt-3 space-y-3 rounded-md border border-line bg-surface/60 p-3">
              <div className="text-sm font-semibold capitalize">{mode} claim #{c.claimId}</div>
              <label className="block"><span className="label">Reason</span><textarea className="field mt-1.5 min-h-[70px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={mode === "challenge" ? "Why is this assessment wrong / inflated?" : "Why should this be reconsidered?"} /></label>
              <ListInput label="Evidence URLs" items={urls} onChange={setUrls} placeholder="https://github.com/org/repo" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
              <div className="flex justify-end gap-2"><button className="btn btn-ghost btn-xs" onClick={() => { setOpenId(null); setMode(null); }}>Cancel</button><button className="btn btn-primary btn-xs" disabled={busy || !reason.trim()} onClick={() => submit(c)}>{busy ? "Submitting…" : `Submit ${mode}`}</button></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
