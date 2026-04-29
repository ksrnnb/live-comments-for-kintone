import { build, context } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("manifest.json", "dist/manifest.json");
copyFileSync("src/popup.html", "dist/popup.html");

const config = {
  entryPoints: ["src/content.ts", "src/popup.ts"],
  bundle: true,
  format: "iife",
  target: "es2022",
  outdir: "dist",
  legalComments: "none",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const buildContext = await context(config);
  await buildContext.watch();
  console.log("[esbuild] watching src/...");
} else {
  await build(config);
}
