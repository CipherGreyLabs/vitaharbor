import fs from "node:fs";

let cs = fs.readFileSync("src/web/components/ledger/ConsoleStage.tsx", "utf8");

const oldButtonGroup = `              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous project"
                  title="Previous project"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next project"
                  title="Next project"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onCopyLink(selectedProject)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-caption font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >`;

const newButtonGroup = `              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onCopyLink(selectedProject)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-caption font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >`;

if (cs.includes(oldButtonGroup)) {
  cs = cs.replace(oldButtonGroup, newButtonGroup);
  fs.writeFileSync("src/web/components/ledger/ConsoleStage.tsx", cs, "utf8");
  console.log("OK: removed duplicate bottom arrows from ConsoleStage");
} else {
  console.error("oldButtonGroup pattern not found");
}
