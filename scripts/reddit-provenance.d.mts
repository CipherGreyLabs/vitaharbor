export const PROVENANCE_SCHEMA_VERSION: number;
export const CANDIDATE_STATES: readonly string[];
export const TERMINAL_STATES: readonly string[];

export interface ProvenanceRecord {
  schema_version: number;
  id: string;
  external_id: string;
  state: string;
  state_history: Array<Record<string, string>>;
  source: Record<string, unknown>;
  classification: Record<string, unknown>;
  provenance: Record<string, unknown>;
  risk_signals: string[];
  evidence_gaps: string[];
  content_hash: string;
  review: Record<string, unknown> | null;
}

export interface Assessment {
  accepted: boolean;
  explicitPoison?: boolean;
  errors: string[];
  record: ProvenanceRecord | null;
}

export function assessCandidate(entry: object, options?: Record<string, unknown>): Assessment;
export function migrateLegacyCandidate(item: object, options?: Record<string, unknown>): Assessment;
export function upgradeProvenanceRecord(record: ProvenanceRecord): ProvenanceRecord;
export function normalizeCampaignText(value: unknown): string;
export function fingerprintText(value: unknown): string;
export function campaignSignalsBetween(left: ProvenanceRecord, right: ProvenanceRecord, options?: Record<string, unknown>): Record<string, unknown>;
export function correlateCampaigns(records: ProvenanceRecord[], options?: Record<string, unknown>): ProvenanceRecord[];
export function markCrosspostDuplicates(records: ProvenanceRecord[]): ProvenanceRecord[];
export function containIncidentRecords(records: ProvenanceRecord[], options?: Record<string, unknown>): ProvenanceRecord[];
export function publicCandidate(record: ProvenanceRecord): Record<string, unknown> | null;
export function publicDocument(records: ProvenanceRecord[], generatedAt: string, sourceLabel: string): Record<string, unknown>;
export function canonicalizeRedditUrl(value: unknown): { url: string; subreddit: string; postId: string } | null;
export function canonicalizeEvidenceUrl(value: unknown): string | null;
export function transitionState(record: ProvenanceRecord, nextState: string, event?: Record<string, unknown>): ProvenanceRecord;
