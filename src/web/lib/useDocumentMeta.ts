import { useEffect } from "react";

const SITE_NAME = "VitaHarbor";

export interface DocumentMeta {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string): void {
  if (typeof document === "undefined") return;
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const created = document.createElement("meta");
  created.setAttribute(attribute, key);
  created.setAttribute("content", content);
  document.head.appendChild(created);
}

/**
 * Applies per-route document metadata. Kept dependency-free so the ledger can be
 * crawled, shared and bookmarked without pulling in a head-manager library.
 */
export function applyDocumentMeta({ title, description, image, imageAlt }: DocumentMeta): string {
  const full = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  if (typeof document === "undefined") return full;

  document.title = full;
  upsertMeta("property", "og:title", full);
  upsertMeta("name", "twitter:title", full);

  if (description) {
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:description", description);
  }

  if (image) {
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:image", image);
  }
  if (imageAlt) upsertMeta("property", "og:image:alt", imageAlt);

  return full;
}

export function useDocumentMeta({ title, description, image, imageAlt }: DocumentMeta): void {
  useEffect(() => {
    applyDocumentMeta({ title, description, image, imageAlt });
  }, [title, description, image, imageAlt]);
}
