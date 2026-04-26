import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const manifestPath = "manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

if (manifest.version !== pkg.version) {
  manifest.version = pkg.version;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`[sync-version] manifest.json -> ${pkg.version}`);
}
