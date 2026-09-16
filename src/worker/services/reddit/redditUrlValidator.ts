export interface ParsedRedditUrl {
  isValid: boolean;
  canonicalUrl: string;
  subreddit?: string;
  postId?: string;
  commentId?: string;
  error?: string;
}

const ALLOWED_HOSTS = new Set([
  "reddit.com",
  "www.reddit.com",
  "old.reddit.com",
  "np.reddit.com",
  "redd.it"
]);

/**
 * Validates, normalizes and parses a Reddit URL against SSRF and host spoofing.
 */
export function validateAndParseRedditUrl(rawUrl: string): ParsedRedditUrl {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return { isValid: false, canonicalUrl: "", error: "Empty URL" };
    }

    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

    // Host checking
    const hostname = parsed.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.has(hostname)) {
      return {
        isValid: false,
        canonicalUrl: "",
        error: `Disallowed host: ${hostname}. Only official Reddit domains are permitted.`
      };
    }

    // Protocol check
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { isValid: false, canonicalUrl: "", error: "Invalid URL protocol" };
    }

    // Shortlink format: https://redd.it/abc123
    if (hostname === "redd.it") {
      const postId = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (!postId) {
        return { isValid: false, canonicalUrl: "", error: "Invalid redd.it shortlink" };
      }
      return {
        isValid: true,
        canonicalUrl: `https://www.reddit.com/comments/${postId}`,
        postId
      };
    }

    // Full standard format: /r/{sub}/comments/{id}/{slug}/[{comment_id}]
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts[0]?.toLowerCase() === "r" && pathParts[1]) {
      const subreddit = pathParts[1];
      let postId: string | undefined;
      let commentId: string | undefined;

      if (pathParts[2]?.toLowerCase() === "comments" && pathParts[3]) {
        postId = pathParts[3];
        if (pathParts[5]) {
          commentId = pathParts[5];
        }
      }

      let canonical = `https://www.reddit.com/r/${subreddit}`;
      if (postId) {
        canonical += `/comments/${postId}`;
        if (commentId) {
          canonical += `/_/${commentId}`;
        }
      }

      return {
        isValid: true,
        canonicalUrl: canonical,
        subreddit,
        postId,
        commentId
      };
    }

    // Direct comments format: /comments/{id}
    if (pathParts[0]?.toLowerCase() === "comments" && pathParts[1]) {
      const postId = pathParts[1];
      const commentId = pathParts[3];
      let canonical = `https://www.reddit.com/comments/${postId}`;
      if (commentId) {
        canonical += `/_/${commentId}`;
      }
      return {
        isValid: true,
        canonicalUrl: canonical,
        postId,
        commentId
      };
    }

    return {
      isValid: true,
      canonicalUrl: `https://www.reddit.com${parsed.pathname}`
    };
  } catch (e) {
    return { isValid: false, canonicalUrl: "", error: String(e) };
  }
}

