#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-main}"
REMOTE_NAME="${REMOTE_NAME:-openapi}"
PREFIX_PATH="tools/openapi"

# Vérifs
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Pas dans un repo git."; exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  echo "❌ Remote '$REMOTE_NAME' introuvable. Ajoute-le par ex. :"
  echo "   git remote add $REMOTE_NAME git@github.com:yorcela/yorcela-openapi.git"
  exit 1
fi

if [ ! -f "$PREFIX_PATH/openapi.v1.json" ]; then
  echo "❌ Fichier manquant: $PREFIX_PATH/openapi.v1.json"; exit 1
fi

echo "🚀 Publication via subtree: '$PREFIX_PATH' -> '$REMOTE_NAME/$TARGET_BRANCH'"

# Méthode robuste: split (indépendant de l'historique), puis push
SPLIT_SHA="$(git subtree split --prefix "$PREFIX_PATH")"
git push "$REMOTE_NAME" "$SPLIT_SHA:$TARGET_BRANCH" --force

echo "✅ OpenAPI publié sur '$REMOTE_NAME' ($TARGET_BRANCH)."