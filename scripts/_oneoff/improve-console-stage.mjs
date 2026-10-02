import fs from "node:fs";

let cs = fs.readFileSync("src/web/components/ledger/ConsoleStage.tsx", "utf8");

// Upgrade camera preset buttons to min-h-[44px]
const oldPresetClass = '"inline-flex min-h-[36px] sm:min-h-[28px] items-center rounded-full px-4 sm:px-3.5 py-1.5 sm:py-1 text-[12px] sm:text-[11px] font-medium transition-all " +';
const newPresetClass = '"inline-flex min-h-[44px] sm:min-h-[36px] items-center rounded-full px-4 sm:px-4 py-2 sm:py-1.5 text-[12px] sm:text-[12px] font-medium transition-all " +';

if (cs.includes(oldPresetClass)) {
  cs = cs.replace(oldPresetClass, newPresetClass);
  fs.writeFileSync("src/web/components/ledger/ConsoleStage.tsx", cs, "utf8");
  console.log("OK: upgraded preset button touch targets");
} else {
  console.error("Preset class string not found");
}
