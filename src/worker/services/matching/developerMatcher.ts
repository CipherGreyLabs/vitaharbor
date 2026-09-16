import type { DeveloperIdentity } from "../../../shared/types";

export interface DeveloperMatchResult {
  developerId: number;
  username: string;
}

export class DeveloperMatcher {
  match(
    authorUsername: string | null | undefined,
    identities: DeveloperIdentity[]
  ): DeveloperMatchResult | null {
    if (!authorUsername) return null;
    const normAuthor = authorUsername.toLowerCase().trim();

    const identity = identities.find(
      (i) => i.provider === "reddit" && i.username.toLowerCase() === normAuthor
    );

    if (identity) {
      return {
        developerId: identity.developer_id,
        username: identity.username
      };
    }

    return null;
  }
}

