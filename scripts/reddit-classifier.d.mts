export interface RedditEntry {
  title: string;
  url: string;
  author: string;
  published: string;
  body: string;
  outbound_urls?: string[];
  media_urls?: string[];
  media_hashes?: string[];
  content_href?: string;
}

export interface Classification {
  accept: boolean;
  confidence: string;
  reason: string;
  question?: boolean;
  spam?: boolean;
}

export function classify(entry: Partial<RedditEntry>): Classification;
export function classifyCandidateType(entry: Partial<RedditEntry>): string;
export function isTrackableCandidateType(value: unknown): boolean;
export function parseEntries(xml: string): RedditEntry[];
export function keyOf(url: unknown): string;
