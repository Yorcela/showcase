#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { config } from "dotenv-flow";

const projectRoot = process.cwd();
config({ path: projectRoot });

const [, , mode, cmd, ...rest] = process.argv;

if (!["development", "production"].includes(mode) || !cmd) {
  console.error(
    "Usage: dc <development|production> <up|down|restart|logs|ps|exec> [args...]\n" +
    "Examples:\n" +
    "  pnpm dc development up\n" +
    "  pnpm dc development logs -f backend\n" +
    "  pnpm dc production restart\n" +
    "  pnpm dc production up --build\n"
  );
  process.exit(2);
}

const composeArgsBase =
  mode === "development"
    ? ["-f", "docker-compose.yml", "-f", "docker-compose.dev.yml"]
    : ["--env-file", ".env.production", "-f", "docker-compose.yml", "-f", "docker-compose.prod.yml"];

const defaultsByCmd = {
  up: ["-d", "--build", "--remove-orphans"],
  down: [],
  logs: [],
  ps: [],
  exec: [],
};

function runCompose(args) {
  const env = { ...process.env };

  if (env.DATABASE_PROVIDER?.toLowerCase() === "postgresql") {
    env.COMPOSE_PROFILES = "postgres";
  }

  const res = spawnSync("docker", ["compose", ...args], {
    cwd: projectRoot,
    stdio: "inherit",
    env,
    shell: false,
  });

  if (res.error) console.error(res.error);
  process.exit(res.status ?? 1);
}

if (cmd === "restart") {
  runCompose([...composeArgsBase, "down"]);
  runCompose([...composeArgsBase, "up", ...defaultsByCmd.up]);
} else {
  const defaults = defaultsByCmd[cmd] ?? [];
  const userHasFlags = rest.some((a) => a.startsWith("-"));
  const final = userHasFlags ? rest : [...defaults, ...rest];
  runCompose([...composeArgsBase, cmd, ...final]);
}
