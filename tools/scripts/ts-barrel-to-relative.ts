/* eslint-disable no-console */
import * as path from "node:path";
import { Project } from "ts-morph";

// ✅ ts-node (CJS) → __dirname dispo
const projectRoot = path.resolve(__dirname, "../../");
const SRC = path.join(projectRoot, "src");

// Déclare les alias (comme dans tsconfig)
const ALIASES: Array<{
    prefix: string;
    root: string;
    withinSameSubfolder?: boolean;
}> = [
        { prefix: "@modules/", root: path.join(SRC, "modules"), withinSameSubfolder: true },
        { prefix: "@core/", root: path.join(SRC, "core") },
        { prefix: "@ports/", root: path.join(SRC, "core", "ports") },
        { prefix: "@infrastructure/", root: path.join(SRC, "infrastructure") },
        { prefix: "@sanitizers/", root: path.join(SRC, "shared", "modules", "sanitizer") },
        { prefix: "@pipes/", root: path.join(SRC, "shared", "pipes") },
        { prefix: "@utils/", root: path.join(SRC, "shared", "utils") },
        { prefix: "@validators/", root: path.join(SRC, "shared", "validators") },
        { prefix: "@apptypes/", root: path.join(SRC, "shared", "types") },
        { prefix: "@shared/", root: path.join(SRC, "shared") },
    ];

function toRelativeImport(fromFilePath: string, toAbsPath: string) {
    let rel = path.relative(path.dirname(fromFilePath), toAbsPath).split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    rel = rel.replace(/\/index\.ts$/i, "").replace(/\.ts$/i, "");
    return rel;
}

function matchAlias(spec: string) {
    return ALIASES.find((a) => spec.startsWith(a.prefix)) ?? null;
}

function resolveTargetAbs(aliasRoot: string, spec: string, prefix: string): string {
    const sub = spec.slice(prefix.length);
    return path.join(aliasRoot, sub);
}

function isInsideAliasRoot(fileAbs: string, aliasRoot: string) {
    const rootWithSep = path.join(aliasRoot, path.sep);
    return fileAbs.startsWith(rootWithSep);
}

function isInsideSameFirstLevelSubdir(
    fileAbs: string,
    aliasRoot: string,
    spec: string,
    prefix: string
) {
    const rest = spec.slice(prefix.length);
    const [moduleName] = rest.split("/");
    if (!moduleName) return false;
    const modRoot = path.join(aliasRoot, moduleName) + path.sep;
    return fileAbs.startsWith(modRoot);
}

async function run() {
    const project = new Project({
        tsConfigFilePath: path.join(projectRoot, "tsconfig.json"),
        skipAddingFilesFromTsConfig: false,
    });

    project.addSourceFilesAtPaths(path.join(SRC, "**/*.ts"));

    let changedCount = 0;
    const filesChanged: string[] = [];

    for (const sf of project.getSourceFiles()) {
        let fileChanged = false;
        const fileAbs = sf.getFilePath();

        for (const imp of sf.getImportDeclarations()) {
            const spec = imp.getModuleSpecifierValue();
            const alias = matchAlias(spec);
            if (!alias) continue;

            // Ne réécrit que si le fichier est dans la racine de l’alias
            if (alias.withinSameSubfolder) {
                if (!isInsideSameFirstLevelSubdir(fileAbs, alias.root, spec, alias.prefix)) continue;
            } else {
                if (!isInsideAliasRoot(fileAbs, alias.root)) continue;
            }

            let targetAbs = resolveTargetAbs(alias.root, spec, alias.prefix);
            // Si on vise un dossier, tente index.ts
            if (!path.extname(targetAbs)) {
                const idx = path.join(targetAbs, "index.ts");
                if (project.getSourceFile(idx)) targetAbs = idx;
            }

            const rel = toRelativeImport(fileAbs, targetAbs);
            if (rel !== spec) {
                imp.setModuleSpecifier(rel);
                fileChanged = true;
            }
        }

        if (fileChanged) {
            changedCount++;
            filesChanged.push(fileAbs);
        }
    }

    await project.save();
    console.log(`✅ Imports réécrits dans ${changedCount} fichier(s).`);
    if (filesChanged.length) {
        console.log(filesChanged.map((f) => " - " + path.relative(projectRoot, f)).join("\n"));
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});