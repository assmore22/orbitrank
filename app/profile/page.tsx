"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAstronaut, faMagnifyingGlass, faFileLines, faCircleNodes, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ReputationChart } from "@/components/Charts";
import { StatusChip, VerdictBadge, Banner, Empty, GhostOrbit, Hex, Stat } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getProfile, getContributorClaims, getMaintainerProjects, hasContract } from "@/lib/orbitrank";

function repTier(score: number): { label: string; tone: "danger" | "warning" | "primary" | "success" } {
  if (score < 80) return { label: "Probation", tone: "danger" };
  if (score < 120) return { label: "Standard", tone: "warning" };
  if (score < 300) return { label: "Trusted", tone: "primary" };
  return { label: "Core", tone: "success" };
}

export default function ProfilePage() {
  const { address } = useAccount();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  useEffect(() => { if (address && !target) { setTarget(address); setQuery(address); } }, [address, target]);

  const profile = useLoader(() => (target ? getProfile(target) : Promise.resolve(null)), [target]);
  const myClaims = useLoader(() => (target ? getContributorClaims(target) : Promise.resolve([])), [target]);
  const myProjects = useLoader(() => (target ? getMaintainerProjects(target) : Promise.resolve([])), [target]);

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to view profiles.</Banner>;

  const isValid = /^0x[0-9a-fA-F]{40}$/.test(query.trim());
  const p = profile.data;
  const tier = p ? repTier(p.reputationScore) : null;
  const toneClass = (t: string) => t === "danger" ? "text-danger" : t === "warning" ? "text-warning" : t === "success" ? "text-success" : "text-primary";
  const chipClass = (t: string) => t === "danger" ? "border-danger/50 text-danger bg-danger/10" : t === "warning" ? "border-warning/50 text-warning bg-warning/10" : t === "success" ? "border-success/50 text-success bg-success/10" : "border-primary/50 text-primary bg-primary/10";

  return (
    <div className="space-y-4">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faUserAstronaut} /> Reputation</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Contributor profile</h1>
      </div>

      <div className="panel flex flex-wrap items-end gap-2 p-3">
        <label className="min-w-[260px] flex-1"><span className="label">Wallet address</span><input className="field mt-1.5 mono" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="0x…" /></label>
        <button type="button" className="btn btn-primary" disabled={!isValid} onClick={() => setTarget(query.trim())}><FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" /> Look up</button>
        {address && <button type="button" className="btn btn-ghost" onClick={() => { setQuery(address); setTarget(address); }}>My profile</button>}
      </div>

      {!target ? <Empty icon={faUserAstronaut} title="Enter an address" hint="Connect a wallet or paste an address to view its reputation." /> :
        profile.loading && !p ? <GhostOrbit /> :
        profile.error ? <Banner tone="danger" title="Failed to load profile" action={<button className="btn btn-ghost btn-xs" onClick={profile.reload}>Retry</button>}>{profile.error}</Banner> :
        !p ? <Empty title="No profile" /> :
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="panel space-y-3 p-4">
              <div className="text-xs text-muted">Address</div>
              <Hex value={p.address} lead={10} tail={8} />
              <div className="flex items-end justify-between border-t border-line pt-3">
                <div><div className="label">Reputation</div><div className={`text-3xl font-semibold tabular-nums ${toneClass(tier!.tone)}`}>{p.reputationScore}</div></div>
                <span className={`chip ${chipClass(tier!.tone)}`}>{tier!.label}</span>
              </div>
              <div className="text-[11px] text-muted">Last activity tick {p.lastActivity}{p.gamingFlags > 0 ? ` | ${p.gamingFlags} gaming flag(s)` : ""}</div>
            </div>
            <div className="panel p-4"><div className="label mb-2">Activity breakdown</div><ReputationChart profile={p} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Submitted" value={p.claimsSubmitted} tone="primary" />
            <Stat label="Accepted" value={p.claimsAccepted} tone="success" />
            <Stat label="Partial" value={p.claimsPartial} tone="warning" />
            <Stat label="Rejected" value={p.claimsRejected} tone="danger" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section>
              <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faFileLines} /> Contributions</div>
              {myClaims.loading && !myClaims.data ? <GhostOrbit size={120} /> :
                (myClaims.data?.length ?? 0) === 0 ? <Empty title="No contributions" /> :
                <div className="space-y-2">{myClaims.data!.slice(0, 8).map((c) => (
                  <Link key={c.claimId} href={`/project/${c.projectId}`} className="panel flex items-center justify-between gap-2 p-3 hover:bg-surface/60">
                    <span className="min-w-0"><span className="text-sm font-medium">{c.contributionTitle}</span><span className="block truncate text-xs text-muted">{c.contributionType}</span></span>
                    <span className="flex shrink-0 items-center gap-2"><VerdictBadge verdict={c.verdict} quality={c.qualityScore} /><StatusChip status={c.status} kind="claim" /></span>
                  </Link>
                ))}</div>}
            </section>
            <section>
              <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faCircleNodes} /> Projects maintained</div>
              {myProjects.loading && !myProjects.data ? <GhostOrbit size={120} /> :
                (myProjects.data?.length ?? 0) === 0 ? <Empty title="No projects" /> :
                <div className="space-y-2">{myProjects.data!.slice(0, 8).map((pr) => (
                  <Link key={pr.projectId} href={`/project/${pr.projectId}`} className="panel flex items-center justify-between gap-2 p-3 hover:bg-surface/60">
                    <span className="min-w-0"><span className="text-sm font-medium">{pr.title}</span><span className="block truncate text-xs text-muted">{pr.claimIds.length} contributions</span></span>
                    <span className="flex shrink-0 items-center gap-2"><StatusChip status={pr.status} kind="project" /><FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-muted" /></span>
                  </Link>
                ))}</div>}
            </section>
          </div>
        </>}
    </div>
  );
}
