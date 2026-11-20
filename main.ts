// The World in One Page — 19 November 2026 (Node 22, standard library only).
//
// The entry is the entry.png beside this file: a vintage newspaper front page
// summing up 19 November 2026. This program copies it byte-for-byte to
// /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png outside the grader's
// container), creating the output directory first. The same bytes are written
// on every run: it is a plain copy, no regeneration, no randomness. After the
// copy it verifies the output against the source by size and by SHA-256 hash,
// so a corrupted copy fails loudly instead of passing silently.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = "entry.png";

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

function sha256(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, OUTPUT_FILE);

  if (!existsSync(source)) {
    fail(`source image not found: ${source}`);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const before = statSync(source).size;
  try {
    copyFileSync(source, join(OUTPUT_DIR, OUTPUT_FILE));
  } catch (error) {
    fail(`copy failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const after = statSync(join(OUTPUT_DIR, OUTPUT_FILE)).size;
  if (after !== before) {
    fail(`size mismatch after copy: source ${before} bytes, output ${after} bytes`);
  }

  const sourceHash = sha256(source);
  const outputHash = sha256(join(OUTPUT_DIR, OUTPUT_FILE));
  if (outputHash !== sourceHash) {
    fail(`hash mismatch after copy: source sha256 ${sourceHash}, output sha256 ${outputHash}`);
  }

  console.log(`main.ts: wrote ${join(OUTPUT_DIR, OUTPUT_FILE)} (${after} bytes)`);
}

main();
