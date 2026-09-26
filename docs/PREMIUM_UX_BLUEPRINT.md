# VitaHarbor Premium UI/UX Blueprint (PlayStation Black Theme)

Deze blueprint is opgesteld om de VitaHarbor (VitaPort) tracker te moderniseren naar een high-end, professionele "PlayStation Black" 3D visualisatie-ervaring.

## 1. Visuele Identiteit (PlayStation Black Theme)

- **Achtergrond (Canvas):** Pure black (`#000000`) met zeer subtiele, geanimeerde gradients (bijv. radial glow rondom de 3D console) in "Vita Blue" (`#00439c` naar `#00e6ff`).
- **Surface & Panelen:** `#0A0A0C` met een 1px `rgba(255,255,255,0.05)` border (glassmorphism: `backdrop-filter: blur(12px)` voor zwevende elementen).
- **Accenten:** Signature PlayStation neon blue (`#2e6db4` of `#4d7cfe`) voor actieve statussen, knoppen en actieve filters.
- **Typografie:**
  - Headers & Grote metrics: *Space Grotesk* (technisch, breed).
  - Bodytekst: *Inter* of vergelijkbaar, met een hoge nadruk op leesbaarheid (`#f4f5f7`).
  - Data / Telemetry: *JetBrains Mono* (of een soortgelijke monospace font) voor versie-nummers, commits en data.

## 2. 3D Visuals & Interactiviteit (De "Live" Ervaring)

De huidige 3D Vita-console (`VitaConsoleScene.tsx`) vormt de kern, maar wordt visueel geüpgraded:
- **Materialen:** Realistischer polycarbonaat/glas reflecties. De `MeshStandardMaterial` wordt getweakt met hogere metalness/roughness maps en een realistische environment map (HDRI) voor studio-belichting.
- **Scherm:** In plaats van een statische textuur, kan het Vita-scherm de actieve port's video/GIF tonen, of een glitched "loading" animatie bij het wisselen van project.
- **Parallax & Scroll:** 
  - Vloeiend scrollen.
  - De console reageert op de muis, maar zweeft groot in de Hero-sectie en verkleint of roteert naar de zijkant wanneer de gebruiker naar beneden scrolt richting de data-tabel (scroll-linked animations).
- **Glow & Particles:** Subtiele, langzaam bewegende "PlayStation symbolen" (kruis, vierkant, driehoek, cirkel) als particles op de achtergrond.

## 3. Layout & UX Data Presentatie

- **Hero Sectie:** 
  - Headline links ("Tracking the bleeding edge of PS Vita homebrew ports").
  - Grote 3D Vita rechts (of gecentreerd) die direct reageert op muisbewegingen.
  - Live "Telemetry" balk bovenaan: Aantal ports in progress, laatste scan timestamp, actieve workers.
- **Directory / Ledger (De Tabel):**
  - Geen ouderwetse lijst, maar een "Terminal / Dashboard" view.
  - Rijen hebben hover-effecten waarbij de rand oplicht.
  - Bij een klik op een port opent geen nieuwe pagina, maar schuift een glassmorphism zijpaneel in (of de 3D console draait om en toont data op het scherm) om de context te behouden.
- **Micro-interacties:**
  - Knoppen (zoals filters) hebben een magnetisch effect op de cursor.
  - State-changes (bijv. van "WIP" naar "Playable") krijgen een zachte neon "pulse" animatie.

## 4. Technische Implementatie Richtlijnen voor Master

1. **Tailwind Config Update:** Verschuif het palet naar `#000000` als canvas. Voeg glow shadows toe.
2. **Three.js Update:** Update `VitaConsoleScene.tsx` met een environment map (bijv. een donkere studio EXR/HDR) voor professionele reflecties op de console.
3. **Framer Motion / GSAP:** Gebruik Framer Motion of CSS View-Driven animaties voor het inladen van de tabelrijen en het verplaatsen van de 3D console bij scroll.
4. **Component Restructure:** Zet de `DirectoryTable` om in een geavanceerde list-view met donkere panelen.
