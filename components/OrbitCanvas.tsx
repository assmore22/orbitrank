"use client";

import { useEffect, useRef, useState } from "react";
import { TONE_HEX, toneOf, type Claim } from "@/lib/types";

export interface OrbitNode { claimId: string; label: string; quality: number; tone: keyof typeof TONE_HEX }

export function claimsToNodes(claims: Claim[]): OrbitNode[] {
  return claims.map((c) => ({
    claimId: c.claimId,
    label: c.contributionTitle || `Claim #${c.claimId}`,
    quality: c.qualityScore || 0,
    tone: toneOf(c.verdict, c.status),
  }));
}

/** Zdog pseudo-3D reputation orbit. Pure visual; selection handled via the HTML legend. */
export function OrbitCanvas({ nodes, size = 360, onFail }: { nodes: OrbitNode[]; size?: number; onFail?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf = 0;
    let illo: any = null;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("zdog");
        const Zdog = (mod as any).default ?? mod;
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        const TAU = Zdog.TAU;
        illo = new Zdog.Illustration({ element: canvas, zoom: dpr, dragRotate: true, rotate: { x: -0.5 } });

        // orbit rings
        new Zdog.Ellipse({ addTo: illo, diameter: size * 0.78, stroke: 1.4, color: "#26344D", rotate: { x: TAU / 4 } });
        new Zdog.Ellipse({ addTo: illo, diameter: size * 0.5, stroke: 1.2, color: "#1e2b44", rotate: { x: TAU / 4 } });

        // center project node
        new Zdog.Shape({ addTo: illo, stroke: 34, color: "#60A5FA" });
        new Zdog.Shape({ addTo: illo, stroke: 50, color: "#60A5FA", visible: true });
        new Zdog.Ellipse({ addTo: illo, diameter: 46, stroke: 2, color: "#93C5FD", rotate: { x: TAU / 4 } });

        // orbiting claim nodes
        const orbit = new Zdog.Anchor({ addTo: illo });
        const n = Math.max(nodes.length, 1);
        const R = size * 0.39;
        nodes.forEach((node, i) => {
          const a = (i / n) * TAU;
          const sz = 10 + Math.min(22, (node.quality / 100) * 22);
          new Zdog.Shape({ addTo: orbit, stroke: sz, color: TONE_HEX[node.tone], translate: { x: R * Math.cos(a), z: R * Math.sin(a) } });
        });
        // a few faint static stars
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * TAU;
          const rr = size * (0.46 + (i % 3) * 0.03);
          new Zdog.Shape({ addTo: illo, stroke: 2, color: "#334766", translate: { x: rr * Math.cos(ang), y: rr * Math.sin(ang) * 0.5 } });
        }

        setReady(true);
        const animate = () => {
          if (cancelled || !illo) return;
          illo.rotate.y += 0.006;
          orbit.rotate.y -= 0.004;
          illo.updateRenderGraph();
          raf = requestAnimationFrame(animate);
        };
        animate();
      } catch {
        if (!cancelled) onFail?.();
      }
    })();
    return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.map((n) => n.claimId + n.tone + n.quality).join("|"), size]);

  return (
    <div className="relative grid place-items-center" style={{ height: size }}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} className={ready ? "" : "opacity-0"} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted">Spinning up orbit…</div>
      )}
    </div>
  );
}
