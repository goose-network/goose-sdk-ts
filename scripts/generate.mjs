// scripts/generate.mjs — regenerate src/schema.ts from the goose engine's
// committed OpenAPI document.
//
// The spec is fetched from the goose repo's main branch (with a local-file
// override for development) and must remain a Swagger 2.0 document, which
// swagger2openapi converts to OpenAPI 3.0 before openapi-typescript turns it
// into TypeScript types.
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SPEC_URL =
  process.env.GOOSE_SPEC_URL ??
  "https://raw.githubusercontent.com/goose-network/goose/main/internal/api/docs/swagger.json";
const SPEC_LOCAL = process.env.GOOSE_SPEC_LOCAL ?? "";
const SPEC_V2 = path.join(root, ".spec", "swagger.json");
const SPEC_V3 = path.join(root, ".spec", "openapi3.json");
const OUT = path.join(root, "src", "schema.ts");

const bin = (name) =>
  path.join(root, "node_modules", ".bin", name);

async function main() {
  await mkdir(path.dirname(SPEC_V2), { recursive: true });
  let spec;
  if (SPEC_LOCAL) {
    spec = await readFile(SPEC_LOCAL, "utf8");
  } else {
    const res = await fetch(SPEC_URL, {
      headers: { "User-Agent": "goose-sdk-ts-generator" },
    });
    if (!res.ok) {
      throw new Error(`fetch spec: ${res.status} ${res.statusText} (${SPEC_URL})`);
    }
    spec = await res.text();
  }
  await writeFile(SPEC_V2, spec);

  // Swagger 2.0 -> OpenAPI 3.0. -p (purge) drops the original v2 file and
  // keeps the output minimal; -o writes the converted document.
  execFileSync(bin("swagger2openapi"), [SPEC_V2, "-o", SPEC_V3, "-p"], {
    stdio: "inherit",
  });

  await mkdir(path.dirname(OUT), { recursive: true });
  execFileSync(
    bin("openapi-typescript"),
    [SPEC_V3, "-o", OUT, "--export-type"],
    { stdio: "inherit" },
  );

  const generated = await readFile(OUT, "utf8");
  const banner =
    "// GENERATED CODE — DO NOT EDIT BY HAND.\n" +
    "// Regenerate with `npm run generate` from internal/api/docs/swagger.json\n" +
    "// in the goose repo. Source spec: " +
    (SPEC_LOCAL || SPEC_URL) +
    "\n\n";
  await writeFile(OUT, banner + generated);
  console.log(`wrote ${path.relative(root, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
