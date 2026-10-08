import fs from "node:fs";
import path from "node:path";

const VITADB_ENDPOINT = "https://www.rinnegatamante.eu/vitadb/list_hbs_json.php";
const CACHE_OUT = path.resolve(process.cwd(), "data/vitadb-cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

export async function syncVitaDbCache() {
  console.log("Fetching live VitaDB catalog from " + VITADB_ENDPOINT + "...");
  try {
    const res = await fetch(VITADB_ENDPOINT, {
      headers: { "User-Agent": USER_AGENT }
    });

    if (!res.ok) {
      console.warn("VitaDB fetch returned HTTP " + res.status);
      return { success: false, status: res.status };
    }

    const text = await res.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      console.warn("VitaDB response is not an array");
      return { success: false, status: "invalid_format" };
    }

    const cacheDoc = {
      schema_version: 1,
      synced_at: new Date().toISOString(),
      total_items: parsed.length,
      items: parsed.map((item) => ({
        id: item.id || null,
        name: item.name || item.title || "",
        author: item.author || "",
        version: item.version || "",
        date: item.date || "",
        type: item.type || "",
        description: item.description || "",
        source: item.source || "",
        release_page: item.release_page || "",
        url: item.url || ""
      }))
    };

    fs.mkdirSync(path.dirname(CACHE_OUT), { recursive: true });
    fs.writeFileSync(CACHE_OUT, JSON.stringify(cacheDoc, null, 2) + "\n", "utf8");
    console.log("Successfully cached " + parsed.length + " VitaDB entries into " + path.relative(process.cwd(), CACHE_OUT));
    return { success: true, count: parsed.length };
  } catch (err) {
    console.warn("Failed to sync VitaDB cache:", err.message);
    return { success: false, error: err.message };
  }
}

// Run standalone if invoked directly
if (process.argv[1] && process.argv[1].includes("sync-vitadb-cache.mjs")) {
  await syncVitaDbCache();
}
