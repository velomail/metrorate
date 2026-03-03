/**
 * Reads urls.json and writes config.js into landing/ and docs/
 * so the static landing page has one place to update store/landing links.
 * Run: node scripts/sync-landing-urls.js
 * Or: npm run sync-urls
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const urlsPath = path.join(root, "urls.json");
const urls = JSON.parse(fs.readFileSync(urlsPath, "utf8"));

const configJs = `// Generated from urls.json - do not edit by hand. Run: npm run sync-urls
window.METRORATE_URLS = ${JSON.stringify(urls, null, 2)};
`;

for (const dir of ["landing", "docs"]) {
  const outPath = path.join(root, dir, "config.js");
  fs.writeFileSync(outPath, configJs, "utf8");
  console.log("Wrote " + outPath);
}
