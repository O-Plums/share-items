# Share Items

App Next.js mobile-first pour lister, faire voter et attribuer des objets de la maison (débarras, dons, ventes). Pas de compte : un prénom + un identifiant local, c'est tout.

Voir [MVP.md](./MVP.md) pour la spec complète.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma (SQLite en dev, PostgreSQL en prod)
- Vercel Blob (production) / stockage local (`public/uploads/`) en dev
- **Sharp** : toutes les images sont redimensionnées (max 512 px), converties en JPEG et compressées (≤ 500 Ko)
- Framer Motion (swipe + sheet)

## Démarrer en local

```bash
npm install
npx prisma db push
npm run dev
```

L'app tourne sur http://localhost:3000.

Le fichier SQLite est créé automatiquement dans `prisma/dev.db`. Les images uploadées vont dans `public/uploads/` (ignoré par git).

## Parcours

- `/` — landing
- `/dashboard` — mes listes (organisateur)
- `/dashboard/new` — créer une liste
- `/dashboard/[listId]` — onglets **Objets** / **Résultats** / **Lien**
- `/dashboard/[listId]/items/new` — wizard photo → pièce → type
- `/l/[slug]` — votant : **Swipe** · **📖 historique** · **Matchs**

## Règles métier (R1–R10)

Voir `MVP.md` §9. Résumé :

- 1 vote par objet par votant (upsert).
- 1 match par objet, posé par l'organisateur sur quelqu'un qui a voté **Oui**.
- Si le votant repasse en **Non**, son match est supprimé automatiquement.

## Déploiement Vercel

Guide pas à pas : **[DEPLOY.md](./DEPLOY.md)**

Résumé :

1. Créer une base **PostgreSQL** (Vercel Postgres, Neon ou Supabase).
2. Sur Vercel : `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`.
3. Importer le repo GitHub — le build exécute `prisma migrate deploy` automatiquement (`vercel.json`).

### Variables d'env

| Nom | Obligatoire | Usage |
|-----|-------------|-------|
| `DATABASE_URL` | Oui | Connexion PostgreSQL |
| `BLOB_READ_WRITE_TOKEN` | Prod | Vercel Blob pour les photos |

## Scripts

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de dev |
| `npm run build` | Build production (génère Prisma + Next) |
| `npm start` | Sert le build production |
| `npm run db:push` | Pousse le schéma vers la DB |
| `npm run db:studio` | Ouvre Prisma Studio |

## Structure

```
src/
  app/
    api/                # routes API (lists, items, votes, matches, upload)
    dashboard/          # organisateur
    l/[slug]/           # votant (swipe + historique + matchs)
    layout.tsx
    page.tsx            # landing
  components/
    EmojiGrid.tsx       # sélection emoji (sans clavier)
    EmojiBadge.tsx
    IdentityGate.tsx    # onboarding prénom
    ItemWizard.tsx      # photo → pièce → type
  lib/
    prisma.ts
    taxonomies.ts       # pièces + types (config unique)
    identity.ts         # hook localStorage
    client.ts           # fetch avec visitor id
    auth.ts             # contrôle visiteur côté API
    slug.ts             # nanoid 8 caractères
prisma/
  schema.prisma         # List, Item, Vote, Match
```
