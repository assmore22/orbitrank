"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faCircleCheck, faArrowRight, faCircleNodes } from "@fortawesome/free-solid-svg-icons";
import { StatusChip, Banner, Empty, GhostOrbit, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getActiveProjects, hasContract } from "@/lib/orbitrank";
import { isHttpUrl, hostOf } from "@/lib/format";

export default function SubmitContributionPage() {
  const { run, busy, connected, wrongNetwork } = useTx();
  const projects = useLoader(() => getActiveProjects(60), []);
  const [pid, setPid] = useState("");
  const [title, setTitle] = useState("");
  const [ctype, setCtype] = useState("Documentation / SDK evidence");
  const [summary, setSummary] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const list = projects.data ?? [];
  const selected = list.find((p) => p.projectId === pid);
  const valid = !!selected && title.trim().length > 0 && urls.length > 0;

  const submit = async () => {
    if (!selected) return;
    const h = await run("Submit contribution", "submit_contribution", [selected.projectId, title.trim(), summary.trim(), ctype.trim() || "Other", urls]);
    if (h) { setDone(selected.projectId); setTitle(""); setSummary(""); setUrls([]); projects.reload(); }
  };

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to submit contributions.</Banner>;

  return (
    <div className="space-y-4">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faFileArrowUp} /> Contributor intake</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Submit a contribution</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Provide evidence for an active project. The AI reviewer reads each source live and scores quality, originality, and gaming risk.</p>
      </div>

      {!connected && <Banner tone="warn" title="Connect a wallet">Connect your wallet to submit a contribution.</Banner>}
      {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet - we’ll prompt on submit.</Banner>}
      {done && <Banner tone="ok" title="Contribution submitted" action={<Link className="btn btn-ghost btn-xs" href={`/project/${done}`}>Open project <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" /></Link>}>It now awaits AI assessment in project #{done}’s orbit.</Banner>}

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,340px)]">
        <div className="panel space-y-4 p-4">
          <div>
            <span className="label">Target project</span>
            {projects.loading && !projects.data ? <div className="mt-1.5"><GhostOrbit size={100} /></div> :
              projects.error ? <div className="mt-1.5"><Banner tone="danger" title="Failed to load projects" action={<button className="btn btn-ghost btn-xs" onClick={projects.reload}>Retry</button>}>{projects.error}</Banner></div> :
              list.length === 0 ? <div className="mt-1.5"><Empty title="No active projects" hint="A maintainer must register + activate a project first." /></div> :
              <select className="field mt-1.5" value={pid} onChange={(e) => setPid(e.target.value)}>
                <option value="">Select a project…</option>
                {list.map((p) => <option key={p.projectId} value={p.projectId}>#{p.projectId} - {p.title}</option>)}
              </select>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="label">Contribution title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="GenLayer JS documentation/source evidence review" /></label>
            <label className="block"><span className="label">Type</span><input className="field mt-1.5" value={ctype} onChange={(e) => setCtype(e.target.value)} placeholder="Documentation / SDK evidence" /></label>
          </div>
          <label className="block"><span className="label">Summary</span><textarea className="field mt-1.5 min-h-[110px]" value={summary} maxLength={2000} onChange={(e) => setSummary(e.target.value)} placeholder="Describe the contribution and how the evidence supports it…" /><span className="mt-1 block text-right text-[11px] text-muted">{summary.length}/2000</span></label>
          <ListInput label="Evidence URLs (required, max 6)" items={urls} onChange={setUrls} placeholder="https://github.com/org/repo" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{valid ? <span className="inline-flex items-center gap-1 text-success"><FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> Ready</span> : "Select a project, add a title and at least one URL."}</span>
            <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "Submitting…" : "Submit contribution"}</button>
          </div>
        </div>

        <div className="space-y-3">
          {selected ? (
            <div className="panel space-y-2 p-4">
              <div className="flex items-center justify-between"><div className="text-sm font-semibold">{selected.title}</div><StatusChip status={selected.status} kind="project" /></div>
              <div className="flex flex-wrap gap-2 text-xs"><ExtLink href={selected.repositoryUrl}>{hostOf(selected.repositoryUrl)}</ExtLink>{selected.docsUrl && <ExtLink href={selected.docsUrl}>docs</ExtLink>}</div>
              <div className="label mt-1">Contribution rules</div>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted">{selected.contributionRules.slice(0, 5).map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          ) : (
            <div className="panel"><Empty icon={faCircleNodes} title="Pick a project" hint="Select a project to see its rules." /></div>
          )}
        </div>
      </div>
    </div>
  );
}
