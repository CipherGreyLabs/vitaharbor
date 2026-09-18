
async function check() {
  const res = await fetch('https://vitaharbor.vercel.app/', { cache: 'no-store' });
  const html = await res.text();
  console.log("Length:", html.length);
  console.log("Includes CustomCursor:", html.includes("CustomCursor"));
  console.log("Number of entries:", (html.match(/<li[^>]*id="entry-/g) || []).length);
}
check();

