import fs from "node:fs";

let dt = fs.readFileSync("src/web/components/ledger/DirectoryTable.tsx", "utf8");

// Import GameCardBanner at top
if (!dt.includes("import { GameCardBanner }")) {
  dt = 'import { GameCardBanner } from "../projects/GameCardBanner";\n' + dt;
}

const oldBannerSnippet = `                  {/* Card Media Banner */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 border-b border-white/[0.06]">
                    {(() => {
                      const imageSrc = project.screenshot_url || \`/og/projects/\${project.slug}.png\`;
                      return (
                        <img
                          src={imageSrc}
                          alt={project.screenshot_alt || title.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      );
                    })()}`;

const newBannerSnippet = `                  {/* Card Media Banner */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 border-b border-white/[0.06]">
                    {project.screenshot_url ? (
                      <img
                        src={project.screenshot_url}
                        alt={project.screenshot_alt || title.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <GameCardBanner
                        project={project}
                        titleName={title.name}
                        engineLabel={title.engine}
                      />
                    )}`;

if (dt.includes(oldBannerSnippet)) {
  dt = dt.replace(oldBannerSnippet, newBannerSnippet);
  fs.writeFileSync("src/web/components/ledger/DirectoryTable.tsx", dt, "utf8");
  console.log("OK: patched DirectoryTable with bespoke GameCardBanner");
} else {
  console.error("oldBannerSnippet not found in DirectoryTable.tsx");
}
