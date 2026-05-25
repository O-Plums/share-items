# Déploiement Vercel — Sort your life

Domaine de production : **[sortyourlife.fr](https://sortyourlife.fr)**.

## 1. Base PostgreSQL

Choisis **une** option :

| Option | Lien |
|--------|------|
| **Vercel Postgres** | Projet Vercel → Storage → Create Database → Postgres |
| **Neon** (gratuit) | [neon.tech](https://neon.tech) → New Project |
| **Supabase** | [supabase.com](https://supabase.com) → New project → Settings → Database |

Récupère les URLs de connexion.

## 2. Base + variables sur Vercel

### Option A — Vercel Postgres (recommandé)

1. Projet → **Storage** → **Create Database** → **Postgres**
2. **Connect to Project** → coche Production (et Preview)
3. Vercel crée souvent `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, etc.

Le script `scripts/vercel-build.sh` utilise **automatiquement** `POSTGRES_PRISMA_URL` si `DATABASE_URL` est absente.

**Optionnel mais clair :** ajoute aussi manuellement :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Copie la valeur de `POSTGRES_PRISMA_URL` |

### Option B — Neon / Supabase

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL `postgresql://...?sslmode=require` |

### Images (obligatoire en prod)

Sans Blob, l’upload échoue sur Vercel (disque en lecture seule).

1. **Storage** → **Blob** → **Create Database / Store**
2. **Connect to Project** → Production + Preview
3. Vercel ajoute `BLOB_READ_WRITE_TOKEN` automatiquement

Sinon, ajoute manuellement :

| Variable | Valeur |
|----------|--------|
| `BLOB_READ_WRITE_TOKEN` | Token du store Blob |

Coche **Production**, **Preview**, **Development** pour chaque variable.

## 3. Importer le repo GitHub

1. [vercel.com/new](https://vercel.com/new)
2. Import **O-Plums/share-items**
3. Framework : **Next.js** (détecté auto)
4. Le `vercel.json` applique déjà : `prisma generate && prisma migrate deploy && next build`
5. **Deploy**

Au premier build, Prisma crée les tables (`List`, `Item`, `Vote`, `Match`).

## 4. Vérifier

- Ouvre l’URL Vercel → landing OK
- `/dashboard` → crée une liste
- Onglet **Lien** → partage `/l/[slug]`

## 5. Dev local avec Postgres

Copie `.env.example` → `.env` et remplis les URLs (Neon gratuit convient).

```bash
npm install
npx prisma migrate deploy   # ou db:migrate pour créer de nouvelles migrations
npm run dev
```

> **Note :** SQLite (`file:./dev.db`) n’est plus utilisé. Les anciennes données locales ne migrent pas automatiquement.

## Dépannage build Vercel

| Erreur | Solution |
|--------|----------|
| `Prisma schema validation` / `get-config wasm` | **`DATABASE_URL` absente** → Storage Postgres + Connect, ou copier `POSTGRES_PRISMA_URL` → `DATABASE_URL` |
| `Can't reach database` | Vérifier URL / SSL (`?sslmode=require`) |
| `migrate deploy` échoue (Neon pooled) | Utiliser l’URL **Direct connection** comme `DATABASE_URL` |
| Images 404 en prod | Ajouter `BLOB_READ_WRITE_TOKEN` |
| Sharp / image | Déjà inclus ; pas d’action |
