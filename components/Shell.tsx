"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNodes, faFileArrowUp, faScaleBalanced, faUserAstronaut, faLayerGroup, faSatelliteDish,
} from "@fortawesome/free-solid-svg-icons";
import { OrbitRankLogo } from "./OrbitRankLogo";
import { WalletConnect } from "./WalletConnect";
import { hasContract, CONTRACT } from "@/lib/orbitrank";
import { CHAIN_ID } from "@/lib/studionet";
import { Hex } from "./ui";

const RINGS = [
  { href: "/", label: "Orbit", icon: faCircleNodes },
  { href: "/submit", label: "Contribute", icon: faFileArrowUp },
  { href: "/disputes", label: "Disputes", icon: faScaleBalanced },
  { href: "/profile", label: "Profile", icon: faUserAstronaut },
  { href: "/registry", label: "Registry", icon: faLayerGroup },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 lg:px-6">
          <Link href="/" className="shrink-0"><OrbitRankLogo /></Link>

          {/* orbit ring sections - circular icon nav */}
          <nav className="flex items-center gap-1.5 overflow-x-auto">
            {RINGS.map((r) => (
              <Link key={r.href} href={r.href} title={r.label}
                className={`group flex shrink-0 flex-col items-center gap-0.5 rounded-pill px-1.5 py-1`}>
                <span className={`grid h-9 w-9 place-items-center rounded-pill border transition-colors ${active(r.href) ? "border-primary/60 bg-primary/15 text-primary shadow-glow" : "border-line bg-surface text-muted group-hover:border-primary/40 group-hover:text-text"}`}>
                  <FontAwesomeIcon icon={r.icon} className="h-4 w-4" />
                </span>
                <span className={`text-[9px] font-semibold uppercase tracking-wide ${active(r.href) ? "text-primary" : "text-muted"}`}>{r.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-[11px] text-muted lg:flex">
              <FontAwesomeIcon icon={faSatelliteDish} className="h-3 w-3 text-success" /> chain {CHAIN_ID}
              <span className="text-line">|</span>
              {hasContract() ? <Hex value={CONTRACT} kind="contract" lead={5} tail={4} /> : <span className="text-warning">no contract</span>}
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-4 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
