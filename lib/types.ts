export type ProjectStatus =
  | "draft" | "active" | "reviewing" | "challenged" | "appealed" | "ranked" | "archived";
export type ClaimStatus =
  | "submitted" | "assessed" | "accepted" | "partial" | "rejected" | "suspected_gaming" | "challenged" | "appealed" | "finalized";
export type Verdict = "" | "accepted" | "partial" | "rejected" | "suspected_gaming";
export type ChallengeStatus = "open" | "upheld" | "dismissed";
export type AppealStatus = "open" | "accepted" | "denied";

export interface Project {
  projectId: string;
  maintainer: string;
  title: string;
  repositoryUrl: string;
  docsUrl: string;
  contributionRules: string[];
  qualityRubric: string[];
  sourceUrls: string[];
  minQualityScore: number;
  maxClaims: number;
  status: ProjectStatus;
  createdAt: number;
  selectedClaimId: string;
  claimIds: string[];
  challengeIds: string[];
  appealIds: string[];
  auditTrailIds: string[];
}

export interface Claim {
  claimId: string;
  projectId: string;
  contributor: string;
  contributionTitle: string;
  contributionSummary: string;
  evidenceUrls: string[];
  contributionType: string;
  qualityScore: number;
  originalityScore: number;
  gamingRiskScore: number;
  verdict: Verdict;
  assessmentSummary: string;
  qualitySignals: string[];
  weakSignals: string[];
  gamingFlags: string[];
  status: ClaimStatus;
  createdAt: number;
  rawAssessmentJson: string;
}

export interface Challenge {
  challengeId: string;
  projectId: string;
  claimId: string;
  challenger: string;
  reason: string;
  evidenceUrls: string[];
  status: ChallengeStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Appeal {
  appealId: string;
  projectId: string;
  claimId: string;
  appellant: string;
  reason: string;
  evidenceUrls: string[];
  status: AppealStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Profile {
  address: string;
  projectsRegistered: number;
  claimsSubmitted: number;
  claimsAccepted: number;
  claimsPartial: number;
  claimsRejected: number;
  gamingFlags: number;
  challengesWon: number;
  challengesLost: number;
  appealsWon: number;
  appealsLost: number;
  reputationScore: number;
  lastActivity: number;
}

export interface AuditRecord {
  auditId: string;
  action: string;
  actor: string;
  projectId: string;
  claimId: string;
  challengeId: string;
  appealId: string;
  summary: string;
  statusAfter: string;
  at: number;
}

export interface PublicStats {
  projects: number;
  claims: number;
  challenges: number;
  appeals: number;
  activeProjects: number;
  rankedProjects: number;
  suspectedGaming: number;
  openChallenges: number;
  openAppeals: number;
  auditRecords: number;
  clock: number;
}

export interface LeaderboardRow {
  claimId: string;
  contributor: string;
  contributionTitle: string;
  qualityScore: number;
  originalityScore: number;
  gamingRiskScore: number;
  verdict: Verdict;
  status: ClaimStatus;
}

/** Verdict → orbit-node tone. */
export type NodeTone = "accepted" | "partial" | "risk" | "neutral";
export function toneOf(verdict?: string, status?: string): NodeTone {
  if (verdict === "accepted" || status === "accepted" || status === "finalized") return "accepted";
  if (verdict === "partial" || status === "partial") return "partial";
  if (verdict === "rejected" || verdict === "suspected_gaming" || status === "rejected" || status === "suspected_gaming") return "risk";
  return "neutral";
}
export const TONE_HEX: Record<NodeTone, string> = {
  accepted: "#22C55E", partial: "#F59E0B", risk: "#EF4444", neutral: "#60A5FA",
};
