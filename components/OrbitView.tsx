"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNodes, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { OrbitCanvas, claimsToNodes } from "./OrbitCanvas";
import { GhostOrbit } from "./ui";
import { TONE_HEX, type Claim } from "@/lib/types";
import { truncateHex } from "@/lib/format";

export function OrbitView({
  projectTitle, claims, selectedClaimId, onSelect, loading,
}: {
  projectTitle: string; claims: Claim[]; selectedClaimId?: string | null; onSelect?: (claimId: string) => void; loading?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const nodes = claimsToNodes(claims);
  const size = Math.max(240, Math.min(w - 8, 440));

  return (
    <div ref={ref} className="w-full">
      <div className="relative grid place-items-center rounded-lg border border-line bg-[#0a0f1e] p-3" style={{ minHeight: 300 }}>
        {/* center project label */}
        <div className="pointer-events-none absolute left-3 top-3 chip border-primary/40 bg-primary/10 text-primary">
          <FontAwesomeIcon icon={faCircleNodes} className="h-3 w-3" /> {projectTitle ? (projectTitle.length > 28 ? projectTitle.slice(0, 27) + "…" : projectTitle) : "no project"}
        </div>
        {loading ? (
          <GhostOrbit size={Math.min(size, 300)} />
        ) : claims.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center"><GhostOrbit size={200} /><div className="text-sm font-semibold text-text">No contributors in orbit yet</div><div className="text-xs text-muted">Submit a contribution to add the first node.</div></div>
        ) : failed ? (
          <FallbackList nodes={nodes} onSelect={onSelect} selectedClaimId={selectedClaimId} />
        ) : w > 0 ? (
          <OrbitCanvas nodes={nodes} size={size} onFail={() => setFailed(true)} />
        ) : null}
      </div>

      {/* node legend (selection) */}
      {claims.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {claims.map((c) => {
            const tone = nodes.find((n) => n.claimId === c.claimId)!.tone;
            const sel = selectedClaimId === c.claimId;
            return (
              <button key={c.claimId} type="button" onClick={() => onSelect?.(c.claimId)}
                className={`chip transition-colors ${sel ? "border-primary bg-primary/15 text-text" : "border-line bg-surface text-muted hover:text-text"}`}>
                <span className="h-2.5 w-2.5 rounded-pill" style={{ background: TONE_HEX[tone] }} />
                <span className="max-w-[150px] truncate">{c.contributionTitle || `Claim #${c.claimId}`}</span>
                <span className="mono text-[10px] opacity-70">q{c.qualityScore}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FallbackList({ nodes, onSelect, selectedClaimId }: { nodes: ReturnType<typeof claimsToNodes>; onSelect?: (id: string) => void; selectedClaimId?: string | null }) {
  return (
    <div className="w-full max-w-md space-y-2 py-4">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted"><FontAwesomeIcon icon={faTriangleExclamation} className="h-3 w-3 text-warning" /> Orbit canvas unavailable - node list fallback</div>
      {nodes.map((n) => (
        <button key={n.claimId} type="button" onClick={() => onSelect?.(n.claimId)}
          className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left ${selectedClaimId === n.claimId ? "border-primary bg-primary/10" : "border-line bg-surface"}`}>
          <span className="h-3 w-3 rounded-pill" style={{ background: TONE_HEX[n.tone] }} />
          <span className="flex-1 truncate text-sm text-text">{n.label}</span>
          <span className="mono text-xs text-muted">q{n.quality}</span>
        </button>
      ))}
    </div>
  );
}
