import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [version, sha256] = process.argv.slice(2);

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version ?? "")) {
  throw new Error(`Invalid release version: ${version ?? "(missing)"}`);
}

if (!/^[a-f0-9]{64}$/.test(sha256 ?? "")) {
  throw new Error("Expected a lowercase SHA-256 digest.");
}

const caskPath = resolve("Casks/kairos-pomodoro.rb");
const current = readFileSync(caskPath, "utf8");

if (!/^  version ".*"$/m.test(current) || !/^  sha256 arm: ".*"$/m.test(current)) {
  throw new Error("Could not find the cask version and checksum fields to update.");
}

const updated = current
  .replace(/^  version ".*"$/m, `  version "${version}"`)
  .replace(/^  sha256 arm: ".*"$/m, `  sha256 arm: "${sha256}"`);

writeFileSync(caskPath, updated);
