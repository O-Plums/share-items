#!/usr/bin/env bash
set -euo pipefail

# Vercel Postgres (Storage) expose souvent POSTGRES_* sans DATABASE_URL.
# On mappe automatiquement pour Prisma.
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${POSTGRES_PRISMA_URL:-}" ]; then
    export DATABASE_URL="$POSTGRES_PRISMA_URL"
    echo "→ DATABASE_URL = POSTGRES_PRISMA_URL"
  elif [ -n "${POSTGRES_URL:-}" ]; then
    export DATABASE_URL="$POSTGRES_URL"
    echo "→ DATABASE_URL = POSTGRES_URL"
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo ""
  echo "❌ DATABASE_URL manquante sur Vercel."
  echo "   1. Storage → Postgres → Connect to Project"
  echo "   2. Ou Settings → Environment Variables → DATABASE_URL = ton URL Postgres"
  echo ""
  exit 1
fi

if ! [[ "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
  echo "❌ DATABASE_URL invalide (doit commencer par postgresql:// ou postgres://)"
  exit 1
fi

echo "→ prisma generate"
npx prisma generate

echo "→ prisma migrate deploy"
npx prisma migrate deploy

echo "→ next build"
npx next build
