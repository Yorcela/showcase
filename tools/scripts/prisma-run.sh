#!/usr/bin/env sh
set -eu

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# --- 0) Charge .env (mêmes vars partout) ---
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  . "$PROJECT_ROOT/.env"
  set +a
fi

# --- util: docker dispo ? ---
have_docker() { command -v docker >/dev/null 2>&1; }

# --- 1) Détermine le provider ---
prov="$(printf '%s' "${DATABASE_PROVIDER:-}" | tr '[:upper:]' '[:lower:]')"
if [ -z "$prov" ] && [ -n "${DATABASE_URL:-}" ]; then
  case "$DATABASE_URL" in
    file:*)                      prov="sqlite" ;;
    postgres:*|postgresql:*)     prov="postgresql" ;;
    *)                           prov="sqlite" ;;
  esac
fi
[ -n "$prov" ] || prov="sqlite"
[ "$prov" = "postgres" ] && prov="postgresql"

# --- 2) Choix du schema (chemin HOST) ---
if [ "$prov" = "postgresql" ]; then
  HOST_SCHEMA="$PROJECT_ROOT/prisma/postgres/schema.postgres.prisma"
else
  HOST_SCHEMA="$PROJECT_ROOT/prisma/sqlite/schema.sqlite.prisma"
fi

# --- 2bis) Chemin conteneur équivalent ---
# Dans ton Dockerfile/compose, le repo est monté sur /app
CONTAINER_ROOT="/app"
CONTAINER_SCHEMA="$CONTAINER_ROOT${HOST_SCHEMA#"$PROJECT_ROOT"}"

# --- 3) Compose files selon NODE_ENV ---
NODE_ENV_EFFECTIVE="${NODE_ENV:-development}"
if [ "$NODE_ENV_EFFECTIVE" = "production" ]; then
  COMPOSE_FILES="-f $PROJECT_ROOT/docker-compose.yml -f $PROJECT_ROOT/docker-compose.prod.yml"
else
  COMPOSE_FILES="-f $PROJECT_ROOT/docker-compose.yml -f $PROJECT_ROOT/docker-compose.dev.yml"
fi

# --- 4) Si Postgres ---
if [ "$prov" = "postgresql" ]; then
  if have_docker; then
    # DB up (idempotent)
    env COMPOSE_PROFILES=postgres docker compose $COMPOSE_FILES up -d postgres || true

    # Exécute Prisma dans le réseau compose (chemin conteneur !)
    exec env COMPOSE_PROFILES=postgres \
      docker compose $COMPOSE_FILES run --rm -T \
        -e DATABASE_PROVIDER="$prov" \
        -e DATABASE_URL="${DATABASE_URL:-}" \
        backend pnpm prisma "$@" --schema="$CONTAINER_SCHEMA"
  else
    echo "⚠️  Docker indisponible, j'exécute Prisma en local. DB: ${DATABASE_URL:-<non définie>}."
    exec pnpm exec prisma "$@" --schema="$HOST_SCHEMA"
  fi
fi

# --- 5) SQLite : toujours local ---
exec pnpm exec prisma "$@" --schema="$HOST_SCHEMA"