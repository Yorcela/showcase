#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Nettoyage complet de l'environnement Codespace..."
echo -e "\n\n"

# --------------------------
# 1️⃣ Stopper les conteneurs Docker
# --------------------------
if command -v docker &> /dev/null; then
  echo "🧩 Arrêt et nettoyage Docker..."
  docker compose down -v --remove-orphans || true
  docker system prune -af || true
  docker volume prune -f || true
else
  echo "⚠️ Docker non installé ou non accessible."
fi
echo -e "\n\n"

# --------------------------
# 2️⃣ Supprimer node_modules, dist, cache, etc.
# --------------------------
echo "📦 Suppression des fichiers générés..."
rm -rf node_modules dist build coverage .turbo .next .angular .vercel
rm -rf prisma/migrations/.cache || true
rm -rf uploads/* || true
echo -e "\n\n"

# --------------------------
# 3️⃣ Nettoyer le cache des gestionnaires de paquets
# --------------------------
if command -v pnpm &> /dev/null; then
  echo "🗑️ Nettoyage du cache pnpm..."
  pnpm store prune >/dev/null 2>&1 || true
echo -e "\n\n"
fi

if command -v npm &> /dev/null; then
  echo "🗑️ Nettoyage du cache npm..."
  npm cache clean --force >/dev/null 2>&1 || true
  echo -e "\n\n"
fi

# --------------------------
# 4️⃣ Nettoyer les fichiers temporaires
# --------------------------
echo "🧽 Nettoyage des fichiers temporaires..."
rm -rf /tmp/* /home/node/.cache/* || true
echo -e "\n\n"

# --------------------------
# 5️⃣ Vérifier l'espace disque restant
# --------------------------
echo "💾 Espace disque restant :"
df -h /
echo -e "\n\n"

# --------------------------
# 6️⃣ Relancer le Codespace (optionnel)
# --------------------------
echo "✅ Nettoyage terminé."
echo "➡️ Tu peux relancer ton environnement avec :"
echo "pnpm run dev:up"