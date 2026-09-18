import fs from 'fs';

let home = fs.readFileSync('src/web/routes/HomePage.tsx', 'utf8');

// The refresh function calls the API and crashes the app silently when Vercel returns an HTML 404
const safeRefresh = sync function refresh() {
      try {
        const [projectsRes, updatesRes] = await Promise.all([
          apiGet("/api/projects?limit=50", "projects").catch(() => null),
          apiGet("/api/updates?limit=8", "updates").catch(() => null)
        ]);
        if (cancelled) return;
        if (projectsRes && Array.isArray(projectsRes.projects) && projectsRes.projects.length > 0) {
          setProjects(projectsRes.projects);
        }
        if (updatesRes && Array.isArray(updatesRes.updates) && updatesRes.updates.length > 0) {
          setRecentUpdates(updatesRes.updates);
        }
      } catch (e) {
        // Silently use the imported static FALLBACK_PROJECTS
      }

      try {
        const res = await fetch("/data/discovered.json", { headers: { accept: "application/json" } });
        if (!res.ok) return;
        const text = await res.text();
        if (!text.startsWith('{') && !text.startsWith('[')) return; // Failsafe for Vercel returning HTML
        const body = JSON.parse(text);
        if (cancelled) return;
        if (Array.isArray(body?.items)) setDiscovered(body.items);
        if (typeof body?.generated_at === "string") setScannedAt(body.generated_at);
      } catch {
        // Scanner hasn't run yet
      }
    };

home = home.replace(/async function refresh\(\) \{[\s\S]*?\n    \}/, safeRefresh);

fs.writeFileSync('src/web/routes/HomePage.tsx', home);
console.log("Safe refresh patched");

