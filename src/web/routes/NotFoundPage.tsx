import React from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export const NotFoundPage: React.FC = () => {
  useDocumentMeta({
    title: "404 — Page not found",
    description:
      "This VitaHarbor route does not exist. Return to the port ledger to browse every tracked PlayStation Vita port."
  });

  return (
    <div className="card-panel p-12 text-center space-y-4 my-12">
      <h1 className="text-3xl font-bold text-[#3ad2ff]">404</h1>
      <h2 className="text-lg font-semibold text-[#f4f6f8]">Page Not Found</h2>
      <p className="text-xs text-[#9aaabd] max-w-sm mx-auto">
        The destination you are trying to visit does not exist or has moved.
      </p>
      <div className="pt-2">
        <Link to="/" className="btn-accent text-xs">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
