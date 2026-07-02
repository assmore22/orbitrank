"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { TONE_HEX, toneOf, type LeaderboardRow, type Profile } from "@/lib/types";
import { truncateHex } from "@/lib/format";

/** D3 horizontal bar chart of a project's contribution leaderboard (quality score). */
export function LeaderboardChart({ rows }: { rows: LeaderboardRow[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = rows.slice(0, 10);
    const W = 520, rowH = 30, M = { top: 6, right: 36, bottom: 6, left: 150 };
    const H = M.top + M.bottom + Math.max(data.length, 1) * rowH;
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();
    if (data.length === 0) {
      svg.append("text").attr("x", W / 2).attr("y", H / 2).attr("text-anchor", "middle").attr("fill", "#94A3B8").attr("font-size", 12).text("No contributions yet");
      return;
    }
    const x = d3.scaleLinear().domain([0, 100]).range([0, W - M.left - M.right]);
    const y = d3.scaleBand<string>().domain(data.map((d) => d.claimId)).range([M.top, H - M.bottom]).padding(0.3);
    const g = svg.append("g").attr("transform", `translate(${M.left},0)`);
    g.selectAll("line.track").data(data).join("line")
      .attr("x1", 0).attr("x2", x(100)).attr("y1", (d) => (y(d.claimId) ?? 0) + y.bandwidth() / 2).attr("y2", (d) => (y(d.claimId) ?? 0) + y.bandwidth() / 2)
      .attr("stroke", "#26344D").attr("stroke-width", 1);
    g.selectAll("rect.bar").data(data).join("rect")
      .attr("x", 0).attr("y", (d) => y(d.claimId) ?? 0).attr("height", y.bandwidth()).attr("rx", 4)
      .attr("fill", (d) => TONE_HEX[toneOf(d.verdict, d.status)]).attr("opacity", 0.9)
      .attr("width", 0).transition().duration(550).attr("width", (d) => Math.max(d.qualityScore > 0 ? 4 : 0, x(d.qualityScore)));
    svg.append("g").selectAll("text.lbl").data(data).join("text")
      .attr("x", M.left - 10).attr("y", (d) => (y(d.claimId) ?? 0) + y.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .attr("fill", "#94A3B8").attr("font-size", 11).attr("font-family", "ui-monospace, monospace").text((d) => truncateHex(d.contributor, 6, 4));
    g.selectAll("text.val").data(data).join("text")
      .attr("x", (d) => x(d.qualityScore) + 6).attr("y", (d) => (y(d.claimId) ?? 0) + y.bandwidth() / 2 + 4)
      .attr("fill", "#F8FAFC").attr("font-size", 11).attr("font-family", "ui-monospace, monospace").text((d) => `${d.qualityScore} | g${d.gamingRiskScore}`);
  }, [rows]);
  return <svg ref={ref} role="img" aria-label="Project leaderboard" />;
}

/** D3 bar chart of a contributor's on-chain reputation activity. */
export function ReputationChart({ profile }: { profile: Profile }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = [
      { k: "Accepted", v: profile.claimsAccepted, c: "#22C55E" },
      { k: "Partial", v: profile.claimsPartial, c: "#F59E0B" },
      { k: "Rejected", v: profile.claimsRejected, c: "#EF4444" },
      { k: "Gaming flags", v: profile.gamingFlags, c: "#EF4444" },
      { k: "Challenges won", v: profile.challengesWon, c: "#22C55E" },
      { k: "Challenges lost", v: profile.challengesLost, c: "#F59E0B" },
      { k: "Appeals won", v: profile.appealsWon, c: "#22C55E" },
      { k: "Appeals lost", v: profile.appealsLost, c: "#F59E0B" },
    ];
    const W = 480, rowH = 28, M = { top: 6, right: 32, bottom: 6, left: 130 };
    const H = M.top + M.bottom + data.length * rowH;
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();
    const max = Math.max(1, d3.max(data, (d) => d.v) ?? 1);
    const x = d3.scaleLinear().domain([0, max]).range([0, W - M.left - M.right]);
    const y = d3.scaleBand<string>().domain(data.map((d) => d.k)).range([M.top, H - M.bottom]).padding(0.32);
    const g = svg.append("g").attr("transform", `translate(${M.left},0)`);
    g.selectAll("line.track").data(data).join("line")
      .attr("x1", 0).attr("x2", x(max)).attr("y1", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2).attr("y2", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2)
      .attr("stroke", "#26344D").attr("stroke-width", 1);
    g.selectAll("rect.bar").data(data).join("rect")
      .attr("x", 0).attr("y", (d) => y(d.k) ?? 0).attr("height", y.bandwidth()).attr("rx", 3)
      .attr("fill", (d) => d.c).attr("opacity", 0.9)
      .attr("width", 0).transition().duration(500).attr("width", (d) => Math.max(d.v > 0 ? 4 : 0, x(d.v)));
    svg.append("g").selectAll("text.lbl").data(data).join("text")
      .attr("x", M.left - 10).attr("y", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .attr("fill", "#94A3B8").attr("font-size", 11).text((d) => d.k);
    g.selectAll("text.val").data(data).join("text")
      .attr("x", (d) => x(d.v) + 6).attr("y", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2 + 4)
      .attr("fill", "#F8FAFC").attr("font-size", 11).attr("font-family", "ui-monospace, monospace").text((d) => d.v);
  }, [profile]);
  return <svg ref={ref} role="img" aria-label="Reputation breakdown" />;
}
