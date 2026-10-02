import fs from "node:fs";

let cs = fs.readFileSync("src/web/components/ledger/ConsoleStage.tsx", "utf8");

const targetSnippet = '<div className="vh-oled-aura" aria-hidden="true" />';

const replacementSnippet = `<div className="vh-oled-aura" aria-hidden="true" />
          {/* Floating Left / Right project navigators */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Vita project (left arrow or K)"
            title="Previous project (← or K)"
            className="absolute left-2 sm:left-6 top-1/2 z-30 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-black/60 p-2.5 text-zinc-300 backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-black/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Vita project (right arrow or J)"
            title="Next project (→ or J)"
            className="absolute right-2 sm:right-6 top-1/2 z-30 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-black/60 p-2.5 text-zinc-300 backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-black/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>`;

if (cs.includes(targetSnippet)) {
  cs = cs.replace(targetSnippet, replacementSnippet);
  fs.writeFileSync("src/web/components/ledger/ConsoleStage.tsx", cs, "utf8");
  console.log("OK: added floating navigation chevrons to 3D stage");
} else {
  console.error("Target snippet not found in ConsoleStage.tsx");
}
