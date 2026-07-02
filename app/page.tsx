"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNodes, faPlus, faRotateRight, faXmark, faArrowRight, faRankingStar, faSatelliteDish,
} from "@fortawesome/free-solid-svg-icons";
import { OrbitView } from "@/components/OrbitView";
import { LeaderboardChart } from "@/components/Charts";
import { StatusChip, VerdictBadge, Banner, Empty, GhostOrbit, Stat, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import {
  getPublicStats, getRecentProjects, getProjectClaims, getProjectLeaderboard, hasContract,
} from "@/lib/orbitrank";
import { isHttpUrl, hostOf } from "@/lib/format";
import type { Project } from "@/lib/types";

export default function OrbitWorkspacePage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const stats = useLoader(() => getPublicStats(), []);
  const projects = useLoader<Project[]>(() => getRecentProjects(40), []);
  const list = projects.data ?? [];
  const project = useMemo(() => list.find((p) => p.projectId === selectedProject) ?? list[0], [list, selectedProject]);
  const pid = project?.projectId;

  const claims = useLoader(() => (pid ? getProjectClaims(pid) : Promise.resolve([])), [pid]);
  const leaderboard = useLoader(() => (pid ? getProjectLeaderboard(pid) : Promise.resolve([])), [pid]);
  const claim = (claims.data ?? []).find((c) => c.claimId === selectedClaim);

  if (!hasContract()) {
    return <Banner tone="warn" title="No contract configured">Set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> in <span className="mono">.env.local</span> to load the orbit.</Banner>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faCircleNodes} /> Reputation orbit</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Contribution orbit workspace</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal(true)}><FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" /> Register project</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.loading && !stats.data ? <div className="col-span-full"><GhostOrbit size={120} /></div> :
          stats.error ? <div className="col-span-full"><Banner tone="danger" title="Could not load stats" action={<button className="btn btn-ghost btn-xs" onClick={stats.reload}>Retry</button>}>{stats.error}</Banner></div> :
          <>
            <Stat label="Projects" value={stats.data?.projects ?? 0} tone="primary" />
            <Stat label="Claims" value={stats.data?.claims ?? 0} />
            <Stat label="Active" value={stats.data?.activeProjects ?? 0} tone="accent" />
            <Stat label="Ranked" value={stats.data?.rankedProjects ?? 0} tone="success" />
            <Stat label="Gaming flags" value={stats.data?.suspectedGaming ?? 0} tone="danger" />
            <Stat label="Audit" value={stats.data?.auditRecords ?? 0} />
          </>}
      </div>

      {/* project selector (orbit chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projects.loading && !projects.data ? <span className="text-xs text-muted">Loading projects…</span> :
          list.length === 0 ? <span className="text-xs text-muted">No projects yet - register one to start the orbit.</span> :
          list.map((p) => (
            <button key={p.projectId} type="button" onClick={() => { setSelectedProject(p.projectId); setSelectedClaim(null); }}
              className={`chip shrink-0 ${project?.projectId === p.projectId ? "border-primary bg-primary/15 text-text" : "border-line bg-surface text-muted hover:text-text"}`}>
              <FontAwesomeIcon icon={faCircleNodes} className="h-3 w-3" /> <span className="max-w-[180px] truncate">{p.title}</span>
            </button>
          ))}
      </div>

      {/* center orbit + right inspector drawer */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className="space-y-2">
          <OrbitView projectTitle={project?.title ?? ""} claims={claims.data ?? []} selectedClaimId={selectedClaim} onSelect={setSelectedClaim} loading={claims.loading && !claims.data} />
        </section>

        <aside className="panel h-fit p-4">
          <div className="label mb-2">Inspector</div>
          {!project ? <Empty title="No project" hint="Register or select a project." /> :
            claim ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold">{claim.contributionTitle}</div>
                <div className="flex flex-wrap items-center gap-2"><StatusChip status={claim.status} kind="claim" /><VerdictBadge verdict={claim.verdict} quality={claim.qualityScore} gaming={claim.gamingRiskScore} /></div>
                <div className="text-xs text-muted">contributor <Hex value={claim.contributor} /></div>
                {claim.assessmentSummary && <p className="text-sm text-muted">{claim.assessmentSummary}</p>}
                {claim.gamingFlags.length > 0 && <div><div className="label text-danger">Gaming flags</div><ul className="mt-1 list-disc pl-4 text-xs text-muted">{claim.gamingFlags.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
                {claim.qualitySignals.length > 0 && <div><div className="label text-success">Quality signals</div><ul className="mt-1 list-disc pl-4 text-xs text-muted">{claim.qualitySignals.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
                <Link href={`/project/${project.projectId}`} className="btn btn-ghost w-full justify-center btn-xs">Open project <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" /></Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2"><div className="text-sm font-semibold">{project.title}</div><StatusChip status={project.status} kind="project" /></div>
                <div className="text-xs text-muted">maintainer <Hex value={project.maintainer} /></div>
                <div className="flex flex-wrap gap-2 text-xs"><ExtLink href={project.repositoryUrl}>{hostOf(project.repositoryUrl)}</ExtLink>{project.docsUrl && <ExtLink href={project.docsUrl}>docs</ExtLink>}</div>
                <div className="text-xs text-muted">{project.claimIds.length} contributions | min quality {project.minQualityScore}</div>
                <p className="text-xs text-muted">Select an orbit node to inspect a contribution claim.</p>
                <Link href={`/project/${project.projectId}`} className="btn btn-ghost w-full justify-center btn-xs">Open project <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" /></Link>
              </div>
            )}
        </aside>
      </div>

      {/* bottom leaderboard ribbon */}
      <section className="panel">
        <div className="flex items-center justify-between border-b border-line p-3">
          <span className="label flex items-center gap-2"><FontAwesomeIcon icon={faRankingStar} className="text-accent" /> Leaderboard ribbon{project ? ` | ${project.title}` : ""}</span>
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => { claims.reload(); leaderboard.reload(); stats.reload(); projects.reload(); }}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${leaderboard.loading ? "animate-spin" : ""}`} /> Refresh</button>
        </div>
        <div className="p-4">
          {leaderboard.loading && !leaderboard.data ? <GhostOrbit size={120} /> : <LeaderboardChart rows={leaderboard.data ?? []} />}
        </div>
      </section>

      <CommandModal open={modal} onClose={() => setModal(false)} onCreated={() => { setModal(false); projects.reload(); stats.reload(); }} />
    </div>
  );
}

/* ── GSAP command modal: register project ── */
function CommandModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { run, busy, connected, wrongNetwork } = useTx();

  const [title, setTitle] = useState("");
  const [repo, setRepo] = useState("");
  const [docs, setDocs] = useState("");
  const [rules, setRules] = useState<string[]>([]);
  const [rubric, setRubric] = useState<string[]>([]);
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [minQ, setMinQ] = useState(50);
  const [maxC, setMaxC] = useState(50);

  useEffect(() => {
    if (open) setMounted(true);
    else if (mounted) {
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      if (panel.current) tl.to(panel.current, { scale: 0.92, opacity: 0, duration: 0.2, ease: "power2.in" }, 0);
      if (overlay.current) tl.to(overlay.current, { opacity: 0, duration: 0.2 }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (mounted && open) {
      if (overlay.current) gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      if (panel.current) gsap.fromTo(panel.current, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.28, ease: "power2.out" });
    }
  }, [mounted, open]);
  if (!mounted) return null;

  const valid = title.trim() && isHttpUrl(repo) && (!docs.trim() || isHttpUrl(docs)) && rules.length > 0 && rubric.length > 0;
  const submit = async () => {
    const h = await run("Register project", "register_project", [title.trim(), repo.trim(), docs.trim(), rules, rubric, sourceUrls, minQ, maxC]);
    if (h) onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div ref={overlay} className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div ref={panel} className="panel relative z-10 flex max-h-[88vh] w-[min(96vw,640px)] flex-col overflow-hidden shadow-pop">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold"><FontAwesomeIcon icon={faSatelliteDish} className="text-primary" /> Register project | command console</h2>
          <button type="button" className="text-muted hover:text-text" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!connected && <Banner tone="warn" title="Connect a wallet">Use Connect to sign the registration.</Banner>}
          {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet; we’ll prompt on submit.</Banner>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="label">Title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Open-source GenLayer repository contribution ranking" /></label>
            <label className="block"><span className="label">Repository URL</span><input className="field mt-1.5 mono" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/org/repo" /></label>
            <label className="block"><span className="label">Docs URL (optional)</span><input className="field mt-1.5 mono" value={docs} onChange={(e) => setDocs(e.target.value)} placeholder="https://docs.example" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="block"><span className="label">Min quality</span><input type="number" min={0} max={100} className="field mt-1.5 mono" value={minQ} onChange={(e) => setMinQ(Number(e.target.value))} /></label><label className="block"><span className="label">Max claims</span><input type="number" min={1} max={200} className="field mt-1.5 mono" value={maxC} onChange={(e) => setMaxC(Number(e.target.value))} /></label></div>
          </div>
          <ListInput label="Contribution rules (required)" items={rules} onChange={setRules} placeholder="evidence must point to visible source" max={12} />
          <ListInput label="Quality rubric (required)" items={rubric} onChange={setRubric} placeholder="technical relevance" max={12} />
          <ListInput label="Source URLs" items={sourceUrls} onChange={setSourceUrls} placeholder="https://github.com/org/repo" max={5} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line p-4">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "Submitting…" : "Register project"}</button>
        </div>
      </div>
    </div>
  );
}
