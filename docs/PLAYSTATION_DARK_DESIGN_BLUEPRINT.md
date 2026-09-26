# Dark PlayStation direction for VitaHarbor

**Date:** 2026-09-26
**Status:** Approved direction, implemented as a local candidate for master review.

This direction replaces the warm-light palette for `VH-PORT-ATLAS-024`. The implementation is a local, unpushed candidate. It is an independent VitaHarbor treatment, not PlayStation branding.

## Research observations

The following official pages were viewed on 2026-09-26. These are observations of the pages, not requirements for VitaHarbor.

| Reference | Observed design | Useful lesson |
|---|---|---|
| [PlayStation 5](https://www.playstation.com/en-us/ps5/) | The current page opens with a saturated blue console hero, restrained product navigation, a short introduction, and clear buy/video links. It follows with small feature sections and a console spin interaction labelled “Drag to spin, hover to zoom.” The global and product navigation bars are light. | Use a large, carefully lit hardware image and a real, bounded interaction. The reference is blue-led rather than an all-black page. Keep VitaHarbor’s archive usable before the showcase. |
| [Xbox Series X](https://www.xbox.com/en-US/consoles/xbox-series-x) | The captured hero places a white console and controller against black textured material. Edition choices are selectable; the lime purchase action is distinct from the rest of the page. | Black can give a hardware render contrast and depth. Keep a single accent role; do not borrow Xbox green or its purchase-led page structure. |
| [Nintendo Switch 2](https://www.nintendo.com/us/gaming-systems/switch-2/) | The page uses Nintendo red as a large identity block, then presents featured games as wide artwork cards, with darker sections and direct links to features, accessories, games and specifications. | Strong brand identity can come from consistent surfaces and card framing. Do not import Nintendo’s red blocks or let game art replace VitaHarbor’s project information. |

## Direction

Build a dark, screen-like project atlas with the console showcase as a secondary, optional experience. The overall read should be an independent hardware field guide: precise edges, cool white text, deep charcoal surfaces, and a restrained PlayStation blue signal. Avoid a generic neon gaming template: no glowing cyan borders, oversized gradients, ambient particles, or large decorative 3D scenes.

This follows the existing intent in `docs/MASTER_BLUEPRINT.md`: “Data first. Branding second,” muted semantic status colors, OLED-like dark surfaces, cool blue illumination, compact information density, and no official Sony or PlayStation logos. Do not recreate Vita LiveArea literally or imitate a PlayStation typeface.

### Palette

Use the values already proposed in section 90 of `docs/MASTER_BLUEPRINT.md` as the starting source of truth:

| Role | Token | Value |
|---|---|---|
| Page background | `--bg` | `#090c11` |
| Main card | `--surface-1` | `#0f141b` |
| Raised / selected card | `--surface-2` | `#151b24` |
| Deep interactive surface | `--surface-3` | `#1b2330` |
| Hairline | `--border` | `#202a38` |
| Main text | `--text-primary` | `#edf5ff` |
| Supporting text | `--text-secondary` | `#9aaabd` |
| Quiet metadata | `--text-muted` | `#68788c` |
| Main accent | `--accent` | `#249cf4` |
| Accent hover / focus | `--accent-hover` | `#4fb5ff` |
| Soft accent fill | `--accent-soft` | `rgba(36, 156, 244, 0.12)` |

Map these roles into the repository’s existing `canvas`, `surface`, `sunken`, `hairline`, `ink`, `stage.*`, and `accent` Tailwind tokens. Keep stage and verification colors subdued and preserve their text labels; never rely on color alone. Use blue for links, focus rings, selection edges, and a few small marks, not for large page panels or permanent glows.

### Page composition

Keep the current Port Atlas order and tighten its proportions for the black treatment:

1. Compact site header and section links.
2. Short field-guide introduction with the live project count, set as text rather than a dashboard tile.
3. The source-linked latest signal.
4. Search, filters and the project directory, visible near the first screen.
5. The collapsed interactive Vita showcase.
6. Methodology and community material.

At desktop widths, retain the existing three-column card grid. Use one column on phones and two where the viewport allows comfortable reading. Give each card one quiet surface, a thin border and a small blue active/focus edge. Keep source-backed screenshots when available and the existing typographic fallback when they are not. Preserve the visible project stage, type, activity date, evidence copy and source links. Expansion may span the directory width, as it does now.

Keep the display hierarchy simple: one compact uppercase eyebrow, a clear sentence-case heading, and readable prose. Use the already present Inter family throughout; use a mono face only for short metadata if it is already loaded. Do not add a sci-fi or PlayStation-like display font.

### Console showcase and motion

Keep the current Three.js Vita scene inside the existing “Interactive Vita console” disclosure below the directory. Opening it should be the user’s choice. Retain the existing deferred WebGL loading, static preview, save-data behavior, renderer-failure fallback, reduced-motion preference, and keyboard/touch controls. Use a subtle cool-blue rim light only where it improves the device silhouette. Do not add autoplay video, background animation, or a second always-running 3D scene.

On narrow screens, keep the static fallback immediately useful and the controls at least 44 px. The directory remains the primary task; users should not have to pass a full-screen effect to reach search or projects.

### Repository implementation map

- `tailwind.config.js`: replace the warm palette values through the existing semantic color names; do not introduce a parallel naming system.
- `src/web/styles/index.css`: align global surfaces, text, borders, focus states, static markup and reduced-motion styling to the same token set. Keep body copy readable against every surface.
- `src/web/routes/HomePage.tsx`: retain the directory-first structure, compact introduction, live count, latest signal and closed-by-default console disclosure.
- `src/web/components/ledger/DirectoryTable.tsx`: preserve search/filter behavior, source evidence and visible text labels while restyling cards and selected/focus states.
- `src/web/components/ledger/ConsoleStage.tsx` and `src/web/components/3d/VitaConsoleScene.tsx`: keep the current deferred 3D and fallback behavior; only adjust presentation and accent lighting.
- `scripts/prerender.mjs`: keep no-JavaScript content and section order consistent with the live page. The prerendered markup uses the shared stylesheet and root tokens, so a separate color map in the generator is not needed.
- `index.html` and generated social cards: update theme/background colors only if the implementation changes those surfaces; keep page metadata and project-specific source imagery accurate.

Do not change `src/shared/constants/fallbackData.ts`, discovery records, source URLs, project claims or status semantics as part of this visual direction.

## Implementation acceptance checks

These gates apply to the exact implementation candidate before master review:

- Desktop, 390 px mobile and 768 px tablet screenshots show the directory and its controls before the console showcase; there is no horizontal page overflow.
- Search, filters, sorting, project expansion, source links, keyboard focus and the no-JavaScript directory remain usable.
- Normal text meets WCAG AA contrast; focus is visible without relying on a color-only state. Mobile interactive controls retain the project’s 44 px target.
- Reduced-motion and save-data users receive the static preview; the console is not initialized until requested.
- `npm run verify`, lint, the existing E2E suite, mobile audit and contrast audit pass on the exact implementation candidate. Inspect the rendered browser and screenshots; a green build alone does not establish visual acceptance.
- No curated ledger changes, push, merge or production deployment occurs until the master reviews the implemented direction and explicitly advances the release.
