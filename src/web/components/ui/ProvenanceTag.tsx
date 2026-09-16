import React from "react";
import type { VerificationLevel } from "@/shared/types";
import { ExternalLink, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

interface ProvenanceTagProps {
  url?: string;
  community?: string;
  verificationLevel?: VerificationLevel;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({
  url,
  community = "Reddit",
  verificationLevel = "community_report"
}) => {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-[#9aaabd]">
      <span className="flex items-center gap-1">
        {verificationLevel === "developer_direct" && (
          <span title="Developer Direct Statement">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3ad2ff]" />
          </span>
        )}
        {verificationLevel === "maintainer_confirmed" && (
          <span title="Maintainer Verified">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        )}
        {verificationLevel === "community_report" && (
          <span title="Community Report">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          </span>
        )}
        <span>{community}</span>
      </span>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[#3ad2ff] hover:text-[#7fe3ff] underline underline-offset-2"
        >
          <span>View source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

