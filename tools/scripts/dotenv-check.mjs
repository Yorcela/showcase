// scripts/check-env-sync.mjs
import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE = process.env.ENV_FILE ?? ".env";
const EXAMPLE_FILE = process.env.EXAMPLE_FILE ?? ".env.example";
const FIX = process.argv.includes("--fix");

const root = process.cwd();
const envPath = resolve(root, ENV_FILE);
const examplePath = resolve(root, EXAMPLE_FILE);

// very small .env parser: keeps the raw value (quotes and extra '=' preserved)
function parseEnvToMap(text) {
  const map = new Map(); // KEY -> rawValue (string | "")
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();

    // match: KEY=VALUE  (VALUE may contain '='; VALUE may be empty)
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*(.*))?$/);
    if (!m) continue;

    const key = m[1];
    const value = m[2] ?? ""; // keep as-is (including quotes)
    map.set(key, value);
  }
  return map;
}

function parseKeys(text) {
  const keys = new Set();
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=.*)?$/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function readOrEmpty(p) {
  if (!existsSync(p)) return "";
  return readFileSync(p, "utf8");
}

const envContent = readOrEmpty(envPath);
const exampleContent = readOrEmpty(examplePath);

const envMap = parseEnvToMap(envContent);
const envKeys = new Set(envMap.keys());
const exampleKeys = parseKeys(exampleContent);

const missingInExample = [...envKeys].filter((k) => !exampleKeys.has(k)).sort();
const extrasInExample = [...exampleKeys].filter((k) => !envKeys.has(k)).sort();

if (missingInExample.length === 0 && extrasInExample.length === 0) {
  console.log(`✅ ${EXAMPLE_FILE} est en phase avec ${ENV_FILE}`);
  process.exit(0);
}

let msg = "";
if (missingInExample.length) {
  msg +=
    `❌ Clés manquantes dans ${EXAMPLE_FILE}:\n` +
    missingInExample.map((k) => `  - ${k}`).join("\n") +
    "\n";
}
if (extrasInExample.length) {
  msg +=
    `⚠️  Clés en plus dans ${EXAMPLE_FILE} (absentes de ${ENV_FILE}):\n` +
    extrasInExample.map((k) => `  - ${k}`).join("\n") +
    "\n";
}

if (FIX && missingInExample.length) {
  const lines = "\n" + missingInExample.map((k) => `${k}=${envMap.get(k) ?? ""}`).join("\n") + "\n";
  appendFileSync(examplePath, lines, "utf8");
  console.log(
    `🛠️  Ajouté automatiquement dans ${EXAMPLE_FILE} (avec valeurs de ${ENV_FILE}) :\n` +
      missingInExample.map((k) => `  - ${k}`).join("\n"),
  );
  process.exit(0);
}

console.error(msg.trim());
process.exit(1);
