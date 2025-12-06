import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

const srcPg = path.join(projectRoot, "prisma", "postgres", "schema.postgres.prisma");
const dstSqlite = path.join(projectRoot, "prisma", "sqlite", "schema.sqlite.prisma");

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Fichier introuvable: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function replaceDatasourceToSqlite(text) {
  // Remplace tout le bloc datasource db { ... } par une version sqlite
  return text.replace(
    /datasource\s+db\s*\{[^}]*\}/gs,
    `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`,
  );
}

function stripNativeTypes(text) {
  // Supprime tous les "@db.*" (ex: @db.Char(6), @db.Text, @db.VarChar(255))
  return text.replace(/@db\.[A-Za-z0-9_()]+/g, "");
}

function replaceEnumsUsage(text) {
  // 1) role: UserRole -> role String @default("USER")
  text = text.replace(
    /(\brole\s*:\s*)UserRole(\s*@default\(\s*\w+\s*\))?/g,
    `$1String @default("USER")`,
  );
  text = text.replace(
    /(\brole\s+)UserRole(\s+@default\(\s*\w+\s*\))?/g,
    `$1String @default("USER")`,
  );

  // 2) status: UserStatus -> status String @default("PENDING_VERIFICATION")
  text = text.replace(
    /(\bstatus\s*:\s*)UserStatus(\s*@default\(\s*\w+\s*\))?/g,
    `$1String @default("PENDING_VERIFICATION")`,
  );
  text = text.replace(
    /(\bstatus\s+)UserStatus(\s+@default\(\s*\w+\s*\))?/g,
    `$1String @default("PENDING_VERIFICATION")`,
  );

  return text;
}

function dropEnumBlocks(text) {
  // Supprime tous les blocs enum { ... } peu importe leur nom
  return text.replace(/enum\s+\w+\s*\{[^}]*\}\s*/gs, "");
}

function jsonToString(text) {
  // Remplace le type Json par String (SQLite ne le supporte pas)
  return text.replace(/\bJson\b/g, "String");
}

function tidyBlankLines(text) {
  // Nettoyage des lignes vides multiples
  return text.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function buildSqliteSchema(pgSchemaRaw) {
  let out = pgSchemaRaw;

  // 1) Datasource → sqlite
  out = replaceDatasourceToSqlite(out);

  // 2) Conversions liées au provider sqlite
  out = stripNativeTypes(out); // @db.*
  out = replaceEnumsUsage(out); // UserRole/UserStatus → String + defaults
  out = dropEnumBlocks(out); // supprime les blocs enum
  out = jsonToString(out); // Json → String

  // 3) Optionnel: garder le generator tel quel (on ne change pas)
  // (Si tu as besoin de toucher aux binaryTargets, fais-le ici)

  // 4) Cleanup
  out = tidyBlankLines(out);

  return out;
}

function main() {
  const mode = process.argv[2] || "write";

  const pgSchema = read(srcPg);
  const sqliteSchema = buildSqliteSchema(pgSchema);

  if (mode === "print") {
    console.log(sqliteSchema);
    return;
  }

  write(dstSqlite, sqliteSchema);
  console.log(`✅ Schéma SQLite généré → ${path.relative(projectRoot, dstSqlite)}`);
}

main();
