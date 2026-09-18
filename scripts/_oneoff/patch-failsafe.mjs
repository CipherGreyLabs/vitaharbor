import fs from 'fs';

let content = fs.readFileSync('src/web/routes/HomePage.tsx', 'utf8');

// Replace the entire refresh function safely
const regex = /async function refresh\(\) \{[\s\S]*?\n    \}/;
const newRefresh = "async function refresh() {\n" +
"      try {\n" +
"        const [projectsRes, updatesRes] = await Promise.all([\n" +
"          apiGet('/api/projects?limit=50', 'projects').catch(() => null),\n" +
"          apiGet('/api/updates?limit=8', 'updates').catch(() => null)\n" +
"        ]);\n" +
"        if (cancelled) return;\n" +
"        if (projectsRes && projectsRes.projects && Array.isArray(projectsRes.projects) && projectsRes.projects.length > 0) {\n" +
"          setProjects(projectsRes.projects);\n" +
"        }\n" +
"        if (updatesRes && updatesRes.updates && Array.isArray(updatesRes.updates) && updatesRes.updates.length > 0) {\n" +
"          setRecentUpdates(updatesRes.updates);\n" +
"        }\n" +
"      } catch (e) {\n" +
"        console.error('API Refresh Error:', e);\n" +
"      }\n" +
"\n" +
"      try {\n" +
"        const res = await fetch('/data/discovered.json', { headers: { accept: 'application/json' } });\n" +
"        if (!res.ok) return;\n" +
"        const text = await res.text();\n" +
"        if (!text.startsWith('{') && !text.startsWith('[')) return;\n" +
"        const body = JSON.parse(text);\n" +
"        if (cancelled) return;\n" +
"        if (body && Array.isArray(body.items)) setDiscovered(body.items);\n" +
"        if (body && typeof body.generated_at === 'string') setScannedAt(body.generated_at);\n" +
"      } catch {\n" +
"        // Scanner has not run yet\n" +
"      }\n" +
"    }";

content = content.replace(regex, newRefresh);
fs.writeFileSync('src/web/routes/HomePage.tsx', content);

