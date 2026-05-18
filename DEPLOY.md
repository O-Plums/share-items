# Déploiement Vercel — Share Items

## 1. Base PostgreSQL

Choisis **une** option :

| Option | Lien |
|--------|------|
| **Vercel Postgres** | Projet Vercel → Storage → Create Database → Postgres |
| **Neon** (gratuit) | [neon.tech](https://neon.tech) → New Project |
| **Supabase** | [supabase.com](https://supabase.com) → New project → Settings → Database |

Récupère les URLs de connexion.

## 2. Variables d’environnement sur Vercel

Projet → **Settings** → **Environment Variables** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL Postgres (Vercel Storage → Postgres, ou Neon « connection string »). Si `migrate deploy` échoue avec Neon pooled, utilise l’URL **Direct connection**. |
| `BLOB_READ_WRITE_TOKEN` | Storage → Blob → Create → copier le token |

Coche **Production**, **Preview**, **Development**.

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
| `Can't reach database` | Vérifier `DATABASE_URL` / SSL (`?sslmode=require`) |
| `migrate deploy` échoue | Vérifier `DIRECT_URL` (connexion non poolée) |
| Images 404 en prod | Ajouter `BLOB_READ_WRITE_TOKEN` |
| Sharp / image | Déjà inclus ; pas d’action |
