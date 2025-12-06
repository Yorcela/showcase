#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Vérification et création des fichiers d'environnement..."

# Liste des fichiers à vérifier
ENV_MAIN=".env"
EXAMPLE=".env.example"

# --- Vérification du .env principal ---
if [ ! -f "$ENV_MAIN" ]; then
  if [ -f "$EXAMPLE" ]; then
    cp "$EXAMPLE" "$ENV_MAIN"
    echo "🆕 Création de $ENV_MAIN à partir de $EXAMPLE"
  else
    echo "⚠️ Aucun $EXAMPLE trouvé, création d’un $ENV_MAIN vide."
    touch "$ENV_MAIN"
  fi
else
  echo "✅ $ENV_MAIN déjà présent."
fi

echo "🎉 Vérification terminée. Les fichiers d'environnement sont prêts."