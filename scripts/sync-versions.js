/**
 * Syncs the version from package.json into src-tauri/Cargo.toml.
 *
 * Tauri's tauri.conf.json reads its version directly from package.json
 * (version is set to "../package.json"), but Cargo.toml cannot read from
 * an external file, so we copy the value here. Runs as a `prebuild` step
 * so the two files can never drift.
 *
 * Exits non-zero on mismatch after sync (shouldn't happen unless Cargo.toml
 * is malformed), so CI fails loudly instead of shipping a mismatched version.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const { version } = pkg;
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`[sync-versions] invalid version in package.json: ${version}`);
  process.exit(1);
}

const cargoPath = resolve(root, "src-tauri/Cargo.toml");
const cargo = readFileSync(cargoPath, "utf8");
const patched = cargo.replace(
  /^(\[package\][\s\S]*?version\s*=\s*)"[^"]*"/m,
  `$1"${version}"`,
);

if (patched === cargo) {
  console.log(`[sync-versions] Cargo.toml already at ${version}`);
} else {
  writeFileSync(cargoPath, patched);
  console.log(`[sync-versions] Cargo.toml synced to ${version}`);
}
