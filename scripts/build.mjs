import { build, context } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("manifest.json", "dist/manifest.json");

const config = {
  entryPoints: ["src/content.ts"],
  bundle: true,
  format: "iife",
  target: "es2022",
  outfile: "dist/content.js",
  legalComments: "none",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await context(config);
  await ctx.watch();
  console.log("[esbuild] watching src/...");
} else {
  await build(config);
}
