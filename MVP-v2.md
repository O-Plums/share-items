# MVP v2 — Share Items · Inventaire & listes

Extension du [MVP v1](./MVP.md) : tu **photographies d’abord** dans ton **inventaire perso**, tu **classes** (pièce, type, tags perso), tu **répartis** dans des listes (à garder, à donner, à vendre), tu **partages** une liste, les autres **swipent**, tu **matches**. Tu peux **déplacer** un objet d’une liste à l’autre.

**Hérité de v1 (inchangé côté votant) :** swipe, historique 📖, matchs, Sharp (512 px, JPEG ≤ 500 Ko), PostgreSQL + Vercel Blob.

**Changement majeur v2 — deux identités :**

| Zone | Auth |
|------|------|
| **Dashboard** (inventaire, listes, résultats, match) | **Compte** — **Auth.js v5** · Google ou Apple (§3.3) |
| **Vote** (`/l/[slug]`, Tinder) | **Aucun compte** — prénom + `visitorId` en `localStorage` (comme v1) |

---

## 1. Vision & exemple bout en bout

| Étape | Qui | Action |
|-------|-----|--------|
| 0 | Toi | Connexion **Google** ou **Apple** → accès dashboard + inventaire sync sur ton compte. |
| 1 | Toi | 📸 Inventaire : photo du bureau, 🛏️ Chambre, tag perso « bureau Florian ». |
| 2 | Toi | 📸 Autre photo : lampe, 🛋️ Salon, tag « chambre Camille ». |
| 3 | Toi | Inventaire → sélectionne 8 objets → **Ajouter à** « À donner ». |
| 4 | Toi | Crée aussi « À garder » et « À vendre » ; répartis le reste. |
| 5 | Toi | Onglet **Lien** sur « À donner » → envoie `/l/abc123` à la famille. |
| 6 | Famille | Ouvre le lien **sans compte** → prénom → swipe, historique, comme en v1. |
| 7 | Toi | Résultats → **Matcher** ; plus tard tu **déplaces** un objet de « À donner » vers « À garder ». |

**Principes v2 :** compte pour organiser · vote sans friction · inventaire d’abord · listes = intentions · tags perso · un objet = une liste à la fois (déplaçable).

---

## 2. Glossaire v2 (ajouts)

| Terme | Signification |
|-------|----------------|
| **Inventaire** | Tous *mes* objets photographiés, avec ou sans liste assignée. |
| **Objet (non assigné)** | En inventaire, `listId = null` — pas encore dans une campagne de partage. |
| **Liste** | Conteneur partageable (slug, votes, matchs). Ex. « À donner », « À vendre ». |
| **Intention de liste** | Type optionnel : `keep` · `donate` · `sell` · `custom` (icône + couleur UI). |
| **Tag perso** | Libellé créé par l’utilisateur, réutilisable en chips (« chambre Camille », « bureau Florian »). |
| **Taxonomie fixe** | Pièce + type en emojis (v1) — toujours disponibles en raccourci. |
| **Déplacer** | Changer la liste d’un objet (`listId` A → B). |
| **Compte organisateur** | Utilisateur authentifié (Google / Apple) — propriétaire inventaire & listes. |
| **Auth.js / NextAuth** | Lib d’auth pour le **dashboard uniquement** — [Auth.js v5](https://authjs.dev) (`next-auth@5`), providers [Google](https://authjs.dev/getting-started/providers/google) + [Apple](https://authjs.dev/getting-started/providers/apple). |
| **Visiteur votant** | Identité légère v1 — **pas** de compte OAuth. |

Termes v1 inchangés côté vote : **Vote**, **Swipe**, **Historique**, **Match**, **Matchs (onglet)**.

---

## 3. Rôles & authentification

### 3.1 Organisateur (dashboard) — compte requis

| Élément | Détail |
|---------|--------|
| **Connexion** | **Google** ou **Sign in with Apple** uniquement en v2 (pas email/mot de passe). |
| **Session** | Cookie de session **Auth.js v5** (package `next-auth`, adapter Prisma). |
| **Données** | Inventaire, listes, tags liés à `userId` — **sync multi-appareil** (même compte = même inventaire). |
| **Routes protégées** | Tout `/dashboard/*` → redirect `/login` si non connecté. |

**Écran login (`/login`) :**

```
┌────────────────────────┐
│      Share Items       │
│  Organise ton débarras │
├────────────────────────┤
│ [ Continuer avec Google ] │
│ [ Continuer avec Apple  ] │
├────────────────────────┤
│ Tu votes sur un lien ?  │
│ Ouvre-le directement →  │  ← pas de compte
└────────────────────────┘
```

### 3.2 Votant (`/l/[slug]`) — sans compte (inchangé v1)

| Élément | Détail |
|---------|--------|
| **Auth** | **Aucune** OAuth, aucun email. |
| **Identité** | Modal « Comment tu t’appelles ? » → `visitorId` (UUID) + `displayName` en `localStorage`. |
| **Accès** | Lien public uniquement — pas d’accès au dashboard des autres. |
| **Objectif** | Friction minimale : ouvrir le lien et swiper en 10 secondes. |

**Séparation stricte :** un votant n’a **jamais** besoin de Google/Apple. Un organisateur utilise Google/Apple **uniquement** pour gérer son inventaire, pas pour voter (s’il vote sur une autre liste, il utilise le flux votant comme tout le monde).

### 3.3 Choix technique — Auth.js (NextAuth v5)

**Décision validée pour v2 :** [Auth.js](https://authjs.dev) via **`next-auth@5`** (successeur de [NextAuth.js](https://next-auth.js.org/providers/)). Pas de Clerk, Supabase Auth, ni email/mot de passe en v2.

| Critère | Pourquoi Auth.js |
|---------|------------------|
| Stack | Next.js 15 App Router natif (`auth()`, Route Handlers, middleware) |
| Providers v2 | **Google** + **Apple** — [liste des providers](https://next-auth.js.org/providers/) (doc v4) ; config v5 sur [authjs.dev](https://authjs.dev/getting-started/providers/overview) |
| Données | `@auth/prisma-adapter` — modèles `User`, `Account`, `Session` (§11) |
| Périmètre | **Dashboard seulement** — `/l/[slug]` et votes restent sur `visitorId` |

**Packages npm (V2-auth) :**

```bash
npm install next-auth@5 @auth/prisma-adapter
```

**Fichiers cibles :**

| Fichier | Rôle |
|---------|------|
| `src/auth.ts` | Config `NextAuth({ providers, adapter, callbacks })` + export `auth`, `signIn`, `signOut` |
| `src/app/api/auth/[...nextauth]/route.ts` | Handlers GET/POST OAuth |
| `src/middleware.ts` | Protège `/dashboard/:path*` → redirect `/login` |
| `src/app/login/page.tsx` | Boutons `signIn("google")` · `signIn("apple")` |
| `prisma/schema.prisma` | Modèles Auth.js + `@auth/prisma-adapter` |

**Providers configurés :**

```ts
// src/auth.ts (extrait)
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, Apple],
  session: { strategy: "database" }, // via Prisma Session
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id; // userId pour APIs dashboard
      return session;
    },
  },
});
```

**Flux OAuth :** `/login` → provider → `/api/auth/callback/:provider` → cookie session → `/dashboard/inventory`.

**Hors scope auth v2 :** Credentials, Email magic link, Facebook/Twitter, OAuth sur routes votant, compte obligatoire pour swiper.

**Note doc :** le site [next-auth.js.org](https://next-auth.js.org/providers/) documente surtout la **v4** ; pour l’implémentation, suivre [authjs.dev](https://authjs.dev/getting-started) (v5). L’écosystème rejoint [Better Auth](https://www.better-auth.com/) — sans impact sur le choix v2.

---

## 3bis. Rôles — accès

| Rôle | Auth | Accès |
|------|------|-------|
| **Organisateur** | Google / Apple | `/dashboard/*` — inventaire, listes, résultats, match |
| **Votant** | Prénom + `localStorage` | `/l/[slug]` — swipe, 📖, Matchs |

---

## 4. Périmètre v2

### In scope

**Authentification dashboard** (voir §3.3)
- **Auth.js v5** (`next-auth@5` + `@auth/prisma-adapter`) — choix validé, pas d’alternative tierce en v2.
- Providers : **Google** + **Apple** uniquement.
- Modèle `User` + `Account` + `Session` (schéma Prisma Auth.js).
- `src/auth.ts`, route `/api/auth/[...nextauth]`, middleware `/dashboard/*`.
- Page `/login` (2 boutons OAuth), déconnexion `signOut()`, avatar + prénom en header dashboard.
- APIs dashboard : `auth()` → `session.user.id` ; APIs vote : header `x-visitor-id` inchangé.
- Migration v1 : `creatorVisitorId` → `userId` à la première connexion (§11).

**Inventaire**
- Photographier un objet → stock inventaire (`listId` null).
- **Photo : deux actions distinctes** — **Prendre une photo** (caméra) **ou** **Choisir dans la galerie** ; demande des **autorisations téléphone** au moment du choix (voir §6).
- Métadonnées : photo + **1 pièce** (emoji) + **1 type** (emoji) + **tags perso** (0 à 3).
- Grille inventaire : vignettes, filtres (pièce, type, tag, assigné / non assigné).
- Édition / suppression d’un objet inventaire.
- **Multi-sélection** → « Ajouter à une liste » (une liste cible).

**Tags personnalisés**
- Création au premier usage (champ court, max 24 car.).
- Chips réutilisables (liste des tags du `userId`, max **30** tags).
- Affichage sur carte inventaire + listes + vote public.
- Pas de clavier obligatoire pour pièce/type ; clavier **autorisé** pour nouveau tag perso uniquement.

**Listes**
- CRUD listes avec **intention** optionnelle :
  - 🏠 **À garder** (`keep`)
  - 🎁 **À donner** (`donate`)
  - 💰 **À vendre** (`sell`)
  - 📋 **Autre** (`custom`) — titre libre
- Création rapide depuis templates (3 boutons + « Liste perso »).
- Un objet dans **au plus une liste** à la fois.

**Déplacement**
- Sur fiche objet ou menu contextuel : **Déplacer vers…** → choix liste.
- **Retirer de la liste** → retour inventaire (`listId = null`), votes + match supprimés sur cet objet pour cette liste.
- Historique optionnel : « Était dans À donner le … » (post-MVP si trop lourd).

**Partage & vote (v1 — sans compte)**
- Lien `/l/[slug]` par liste — **accessible sans login**.
- Swipe, 📖, Matchs — identité `visitorId` + prénom uniquement.
- Match organisateur — via session dashboard (compte), pas via le flux votant.

**Technique**
- Migration Prisma v2 (voir §11).
- Stack : Next.js 15, PostgreSQL, Blob, Sharp, **Auth.js v5** (`next-auth`, Google + Apple).

### Out of scope v2

- Un objet dans **plusieurs listes** en même temps.
- **Compte votant** (OAuth sur `/l/[slug]`).
- Email / mot de passe pour les organisateurs.
- Facebook, Twitter, autres providers OAuth.
- Partage de l’inventaire entier (seulement par liste).
- Modération des tags.
- Scan code-barres, IA reconnaissance objet.
- Notifications push « tu es matché ».
- Refus de match par le votant.
- i18n.

### Clavier autorisé (v2)

| Contexte | Clavier |
|----------|---------|
| Titre liste, nouveau tag perso, libellé objet | Oui |
| Prénom votant (`/l/[slug]`) | Oui |
| Pièce / type (emojis) | **Non** |

---

## 5. Parcours utilisateur

### 5.0 Connexion organisateur

```
/ ou /dashboard → non connecté → /login
  → signIn("google") | signIn("apple")   ← Auth.js
  → callback /api/auth/callback/…
  → session cookie → /dashboard/inventory
```

Déconnexion : menu profil → **Se déconnecter** (`signOut()`) → `/login`.

### 5.1 Inventaire — ajouter un objet

```
/dashboard/inventory → [ + Photographier ]
  → Étape photo :
      [ 📸 Prendre une photo ]     → caméra arrière (permission caméra si besoin)
      [ 🖼️ Choisir dans la galerie ] → photothèque (permission photos si besoin)
  → Pièce (grille emoji, 1 choix)
  → Type (grille emoji, 1 choix)
  → Tags perso (chips existants + [ + Nouveau tag ])
  → [ Nom optionnel ] → Enregistrer
```

- Les autorisations sont demandées **au tap** sur l’action concernée, pas à l’ouverture de l’app.
- Si l’utilisateur refuse : message clair + **Réessayer** + indication pour rouvrir les réglages du navigateur / du site (voir §6).
- L’objet apparaît dans **Inventaire** avec badge « Non assigné ».

Le même écran photo s’applique au wizard **inventaire**, au raccourci **« Ajouter à cette liste »** et à toute réédition de photo d’un objet.

### 5.2 Assigner à une liste

**Méthode A — depuis inventaire**
1. Mode sélection (cases ou long-press).
2. Choisir 1..n objets.
3. **Ajouter à…** → picker liste (ou créer liste).
4. Objets passent `listId = …`, visibles dans la liste.

**Méthode B — depuis une liste vide**
1. Liste « À donner » → **Ajouter depuis l’inventaire**.
2. Grille filtrable (non assignés seulement).
3. Tap pour ajouter.

### 5.3 Créer des listes par intention

```
/dashboard/lists → [ À garder ] [ À donner ] [ À vendre ] [ + Liste ]
```

- Tap template → liste pré-remplie (titre + `kind` + couleur).
- « Liste perso » → titre au clavier.

### 5.4 Partager & voter

**Organisateur (connecté)** : copie le lien depuis l’onglet **Lien**.

**Votant (sans compte)** :
1. Ouvre `/l/[slug]` sur mobile.
2. « Comment tu t’appelles ? » (pas de Google/Apple).
3. Swipe, 📖, Matchs — identique v1.

### 5.5 Déplacer entre listes

Sur objet dans liste « À donner » :

```
[ ⋮ ] → Déplacer vers… → picker (À garder, À vendre, …)
      → Retirer de la liste (→ inventaire)
```

**Règle votes :** déplacer vers une **autre** liste → **suppression des votes et du match** sur cet objet (nouvelle campagne sur la nouvelle liste).

### 5.6 Navigation dashboard v2

```
Bottom nav ou tabs :
  [ Inventaire ]  [ Listes ]  [ + Photo ]
```

Détail liste : **Objets** · **Résultats** · **Lien** (comme v1).

---

## 6. Photo — caméra, galerie & permissions mobile

Objectif : sur **téléphone** (Safari iOS, Chrome Android), l’organisateur choisit explicitement **caméra** ou **galerie** ; le système demande les autorisations nécessaires avant d’accéder à la source.

### 6.1 UI — étape 1 du wizard

| Bouton | Comportement attendu |
|--------|----------------------|
| **📸 Prendre une photo** | Ouvre la **caméra** (de préférence arrière : `capture="environment"`). |
| **🖼️ Choisir dans la galerie** | Ouvre le **sélecteur de photos** (photothèque / fichiers), **sans** attribut `capture`. |

- Deux `<input type="file" hidden>` distincts (un avec `capture`, un sans).
- `accept="image/jpeg,image/png,image/webp"` (aligné upload Sharp v1).
- Après sélection : aperçu + **[ Continuer ]** ; possibilité de **changer de photo** (réaffiche les deux boutons).
- **Desktop** : les deux boutons peuvent ouvrir le sélecteur de fichiers classique — comportement acceptable.

> **Écart v1 :** un seul bouton « Prendre / choisir » avec `capture` forcé ne suffit pas — v2 impose **deux entrées séparées**.

### 6.2 Permissions — quand et lesquelles

| Action utilisateur | Permission / dialogue système (mobile) |
|--------------------|------------------------------------------|
| Tap **Prendre une photo** | **Caméra** — dialogue natif iOS/Android au premier usage (via le navigateur). |
| Tap **Choisir dans la galerie** | **Photos / médiathèque** — accès bibliothèque ou « sélectionner des photos » (iOS peut proposer accès limité). |

Règles :

1. **Just-in-time** : aucune demande globale au chargement du dashboard ; uniquement au tap sur le bouton concerné.
2. **Indépendance** : refus caméra n’empêche pas la galerie (et inversement).
3. **Pas de compte requis** : les permissions sont **appareil / navigateur**, pas liées à Google/Apple login.

### 6.3 Refus ou indisponibilité

Afficher un encart sous les boutons (ex. fond `red-50`) :

- **Caméra refusée** : « L’accès à la caméra est refusé. Autorise la caméra pour ce site dans Réglages, puis réessaie. »
- **Galerie refusée** : « L’accès aux photos est refusé. Autorise l’accès aux photos pour ce site dans Réglages, puis réessaie. »

Actions :

- **[ Réessayer ]** — réaffiche le même bouton (nouveau tap → nouvelle demande si l’OS le permet).
- Lien texte **« Ouvrir les réglages »** :
  - **iOS** : Réglages → Safari (ou Chrome) → Caméra / Photos → autoriser pour le site.
  - **Android** : Paramètres → Applications → Navigateur → Autorisations → Appareil photo / Photos.

Si la caméra n’est pas disponible (simulateur, desktop sans webcam) : proposer uniquement la galerie sans erreur bloquante.

### 6.4 Implémentation technique (PWA web)

- Privilégier **`<input type="file">`** (compatibilité maximale avec upload existant `/api/upload`).
- `capture="environment"` **uniquement** sur l’input caméra ; **jamais** sur l’input galerie.
- Optionnel (post-MVP) : `navigator.mediaDevices.getUserMedia` pour preview live — **hors scope v2** si les deux inputs fichier couvrent le besoin.
- `navigator.permissions.query({ name: 'camera' })` : support partiel (surtout Chrome Android) — peut servir à **pré-afficher** un bandeau « Caméra bloquée » sans remplacer le dialogue système.

### 6.5 Règles métier photo (inchangées v1)

- Formats : JPEG, PNG, WebP.
- Traitement serveur : Sharp, max 512 px, JPEG ≤ 500 Ko, stockage Vercel Blob.
- Une photo par objet ; remplacement = nouvel upload + suppression logique de l’ancienne URL si applicable.

### 6.6 Critères UX (checklist dev)

- [ ] Deux boutons visibles dès l’étape photo.
- [ ] Tap caméra → dialogue permission caméra (device réel) puis prise de vue.
- [ ] Tap galerie → dialogue permission photos puis picker.
- [ ] Refus → message + Réessayer ; l’autre source reste utilisable.
- [ ] Test **iPhone Safari** + **Android Chrome** en conditions réelles (pas seulement simulateur).

---

## 7. Tags personnalisés — détail UX

### Création

- Tap **+ Tag** → champ « Ex. chambre Camille » (max 24 car.).
- Validation → chip ajouté à la sélection + sauvegardé dans `UserTag`.
- Tags affichés en chips scrollables horizontales (pas grille emoji).

### Réutilisation

- Prochains objets : tap sur chips existants (toggle multi, max 3).
- Gestion : **Inventaire → Mes tags** → renommer / supprimer (supprimer ne retire pas le tag des objets déjà tagués — affichage « tag supprimé » ou garder texte dénormalisé).

### Affichage

- Inventaire : sous la photo, `🛏️ Chambre · 🪑 Mobilier · bureau Florian`
- Vote public : mêmes badges sous la carte.

### Coexistence taxonomie fixe

| Couche | Exemple | Obligatoire |
|--------|---------|-------------|
| Pièce (emoji) | 🛏️ Chambre | Oui |
| Type (emoji) | 🪑 Mobilier | Oui |
| Tag perso | chambre Camille | Non (0–3) |

---

## 8. Listes & intentions

| `kind` | Label UI | Icône | Usage |
|--------|----------|-------|-------|
| `keep` | À garder | 🏠 | Je garde chez moi |
| `donate` | À donner | 🎁 | Famille, proches |
| `sell` | À vendre | 💰 | Leboncoin, etc. |
| `custom` | (titre libre) | 📋 | Autre cas |

Couleur de bandeau par `kind` sur carte liste (optionnel MVP v2).

---

## 9. Interface votant — sans compte (inchangé)

| Règle | Détail |
|-------|--------|
| **Pas de OAuth** | Aucun bouton Google/Apple sur `/l/[slug]`. |
| **IdentityGate v1** | Prénom + `visitorId` localStorage — conservé tel quel. |
| **Pas de lien compte** | Le votant n’a pas accès au dashboard organisateur. |

Fonctionnel : swipe, 📖, Matchs — identique v1.

Affichage enrichi si tags perso sur les cartes (badges supplémentaires).

**Pourquoi garder simple :** les proches ne veulent pas créer de compte pour dire oui/non à un canapé.

---

## 10. Règles métier v2 (référence)

| # | Règle |
|---|--------|
| R1–R10 | Règles v1 ([MVP.md](./MVP.md) §9) — votes, matchs, etc. |
| R11 | Inventaire / listes : propriété par `userId` (compte Google/Apple). |
| R12 | `listId` nullable : `null` = inventaire seulement. |
| R13 | Un objet non assigné n’apparaît pas sur `/l/[slug]`. |
| R14 | API dashboard : session obligatoire ; API vote : `visitorId` header uniquement. |
| R15 | Un utilisateur ne voit que **ses** listes et **son** inventaire. |
| R16 | Max **3 tags perso** par objet. |
| R17 | Max **30 tags** par `userId`. |
| R18 | **Déplacer** vers autre liste → supprimer votes + match sur cet objet. |
| R19 | **Retirer de la liste** → `listId = null` + supprimer votes + match. |
| R20 | Supprimer un objet → supprimer votes, match, liaisons tags. |
| R21 | Dupliquer photo entre listes : non — un objet, une liste. |
| R22 | Votes restent anonymes (`visitorId`), jamais liés au `User` organisateur. |

---

## 11. Architecture & données

### Modèle Prisma v2 (évolution)

```prisma
// ─── Auth organisateur (Auth.js) ───
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  lists         List[]
  items         Item[]
  tags          UserTag[]
  createdAt     DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── Métier ───
model List {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  kind        String   @default("custom")
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  items       Item[]

  @@index([userId])
}

model Item {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  listId    String?
  list      List?     @relation(fields: [listId], references: [id], onDelete: SetNull)
  imageUrl  String
  label     String?
  room      String
  category  String
  sortOrder Int       @default(0)
  createdAt DateTime  @default(now())
  votes     Vote[]
  match     Match?
  tags      ItemTag[]

  @@index([userId])
  @@index([listId, sortOrder])
}

model UserTag {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label     String
  createdAt DateTime @default(now())

  @@unique([userId, label])
  @@index([userId])
}

model ItemTag {
  itemId     String
  userTagId  String
  item       Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  userTag    UserTag  @relation(fields: [userTagId], references: [id], onDelete: Cascade)

  @@id([itemId, userTagId])
}

// Vote, Match — inchangés (v1, anonymes)
model Vote {
  // visitorId + displayName — PAS de userId
}
```

**Migration v1 → v2 :**
- Créer tables `User`, `Account`, `Session`.
- `List` : ajouter `userId` ; supprimer `creatorVisitorId` après migration.
  - À la **1ʳᵉ connexion OAuth** : rattacher les listes dont `creatorVisitorId` = `visitorId` encore présent en `localStorage` sur l’appareil (passé au callback ou endpoint post-login) → `userId` du `User` créé.
- `Item` : ajouter `userId` (propriétaire) ; rendre `listId` **nullable** (`null` = inventaire).
  - Objets v1 existants : conserver leur `listId` ; `userId` = propriétaire de la liste parente.
  - Nouveaux objets inventaire : `listId = null`, `userId` = session.
- Nouvelles tables `UserTag`, `ItemTag` ; champ `List.kind`.
- **Votes / Matchs** : schéma inchangé (restent sur `visitorId`, pas de `userId`).

### Auth technique (Auth.js v5)

| Couche | Choix v2 |
|--------|----------|
| Lib | **`next-auth@5`** ([Auth.js](https://authjs.dev)) |
| Providers | [Google](https://authjs.dev/getting-started/providers/google) · [Apple](https://authjs.dev/getting-started/providers/apple) |
| Adapter | [`@auth/prisma-adapter`](https://authjs.dev/getting-started/adapters/prisma) |
| Session | `strategy: "database"` (table `Session`) |
| Middleware | `middleware.ts` — `matcher: ["/dashboard/:path*"]` |
| API dashboard | `const session = await auth()` → `session?.user?.id` |
| API vote / slug public | Header `x-visitor-id` + `requireVisitor()` (inchangé v1) |
| Route handlers auth | `export const { GET, POST } = handlers` dans `/api/auth/[...nextauth]/route.ts` |

**Références :** [Getting started](https://authjs.dev/getting-started) · [Providers overview](https://authjs.dev/getting-started/providers/overview) · [Prisma adapter](https://authjs.dev/getting-started/adapters/prisma) · [Deployment](https://authjs.dev/getting-started/deployment).

### Variables d’environnement (auth)

| Variable | Usage |
|----------|--------|
| `AUTH_SECRET` | Secret JWT/session (`openssl rand -base64 32`) |
| `AUTH_URL` | URL canonique prod (ex. `https://share-items.vercel.app`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com/) → OAuth 2.0 |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | [Apple Developer](https://developer.apple.com/) → Sign in with Apple (Team ID, Key ID, `.p8`) |

Redirect URIs à enregistrer chez Google/Apple :  
`https://<domaine>/api/auth/callback/google` · `https://<domaine>/api/auth/callback/apple`  
(+ `http://localhost:3000/...` en dev).

### Routes écran v2

| Route | Auth | Rôle |
|-------|------|------|
| `/login` | Public | Google + Apple |
| `/dashboard` | **Session** | Redirige vers `/dashboard/inventory` |
| `/dashboard/inventory` | **Session** | Grille inventaire + filtres + sélection |
| `/dashboard/inventory/new` | **Session** | Wizard photo + tags perso |
| `/dashboard/inventory/[itemId]/edit` | **Session** | Édition objet |
| `/dashboard/lists` | **Session** | Mes listes (par intention) |
| `/dashboard/lists/new` | **Session** | Nouvelle liste (template ou perso) |
| `/dashboard/[listId]` | **Session** | Détail liste + déplacer |
| `/l/[slug]` | **Public** | Vote — prénom + `visitorId` uniquement |
| `/api/auth/*` | Public | Callbacks OAuth Auth.js |

### API v2 (ajouts)

| Méthode | Endpoint | Action |
|---------|----------|--------|
| GET | `/api/inventory` | Objets du créateur (`?assigned=true/false`, filtres) |
| POST | `/api/inventory/items` | Créer objet inventaire (`listId` null) |
| POST | `/api/inventory/assign` | `{ itemIds[], listId }` |
| POST | `/api/inventory/unassign` | `{ itemIds[] }` |
| POST | `/api/inventory/move` | `{ itemId, listId }` — déplace + reset votes |
| GET | `/api/tags` | Tags du créateur |
| POST | `/api/tags` | Créer tag `{ label }` |
| DELETE | `/api/tags/[id]` | Supprimer tag favori |
| PATCH | `/api/lists/[id]` | Modifier titre, `kind` |

Routes v1 conservées : votes, matchs, upload, slug public — **sans session**, `x-visitor-id` pour votant.

Routes dashboard : **session obligatoire** (remplace `x-visitor-id` + `creatorVisitorId`).

---

## 12. Wireframes (mobile)

### Wizard — étape photo

```
┌────────────────────────┐
│ Une photo de l’objet   │
│                        │
│ [ 📸 Prendre une photo ]│
│ [ 🖼️ Choisir galerie   ]│
│                        │
│ (aperçu si déjà choisi)│
│ [ Continuer → ]        │
└────────────────────────┘
```

### Inventaire

```
┌────────────────────────┐
│ Inventaire        [ + ]│
│ [Tous][Non assignés]   │
│ 🍳 🛏️ Camille  …       │  ← filtres chips
├────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐   │
│ │img │ │img │ │img │   │
│ └────┘ └────┘ └────┘   │
│  ··· grille ···        │
├────────────────────────┤
│ [ Inventaire ] [Listes]│
└────────────────────────┘
```

### Sélection → assigner

```
3 objets sélectionnés
[ Annuler ]  [ Ajouter à une liste → ]
```

### Détail liste — menu objet

```
[ Déplacer vers… ]
[ Retirer de la liste ]
[ Modifier ]
[ Supprimer ]
```

---

## 13. Critères d’acceptation v2

1. Je me connecte avec **Google** (Auth.js) → j’accède à mon inventaire sur un 2ᵉ téléphone avec le même compte.
2. Je me connecte avec **Apple** sur iPhone → même inventaire synchronisé.
3. **Déconnexion** → `/dashboard` redirige vers `/login` ; je ne vois plus les données d’un autre compte.
4. Ma famille ouvre `/l/xxx` **sans** Google/Apple — juste un prénom — et swipe.
5. Je photographie 5 objets dans l’inventaire sans les assigner à une liste.
6. Sur iPhone ou Android : **Prendre une photo** ouvre la caméra (après acceptation de la permission caméra si demandée).
7. **Choisir dans la galerie** ouvre la photothèque (après acceptation de l’accès photos si demandé).
8. Si je refuse la caméra, je peux quand même ajouter une photo via la galerie ; un message m’explique comment réactiver la caméra plus tard.
9. Je filtre « Non assignés », j’en sélectionne 3, je les mets dans « À donner ».
10. Je crée le tag « bureau Florian », je le réutilise sur un 2ᵉ objet.
11. Je déplace un objet de « À donner » vers « À garder » ; les anciens votes disparaissent.
12. Un objet non assigné n’apparaît pas sur le lien public.
13. Templates À garder / À donner / À vendre créent des listes en 1 tap.
14. `/dashboard` sans session → redirection `/login` ; `/l/[slug]` reste accessible sans OAuth.

---

## 14. Plan de livraison v2

| Phase | Jours indic. | Livrable |
|-------|----------------|----------|
| **V2-auth** | 3–4 | **Auth.js v5** (`next-auth`) · Google + Apple · Prisma adapter · `/login` · middleware · migration `userId` (§3.3, §11) |
| **V2a** | 4–5 | Inventaire CRUD · `listId` nullable · assign / unassign · **wizard photo 2 boutons + permissions** (§6) |
| **V2b** | 3–4 | Tags perso (UserTag, chips, filtres) |
| **V2c** | 2–3 | Listes `kind` + templates · UI déplacer |
| **V2d** | 2 | Polish · tests · doc |

**Total estimé :** ~15–18 jours (après v1 en prod).

**Ordre recommandé :** **V2-auth** en premier → V2a → V2b → V2c → V2d.

**Vote (`/l/[slug]`)** : ne pas toucher pendant V2-auth — conserver `IdentityGate` + `visitorId`.

---

## 15. Risques v2

| Risque | Mitigation |
|--------|------------|
| UX « inventaire vs liste » confuse | Onboarding 3 slides + badge « Non assigné » |
| Permissions caméra / photos refusées | Deux boutons séparés · messages + Réessayer · galerie toujours proposée si caméra KO |
| Comportement `capture` différent selon navigateur | Tests device réels iOS/Android · doc §6.4 |
| Trop de tags | Limite 30 + 3 par objet |
| Votes perdus au déplace | Confirmation « Les votes seront effacés » |
| Migration données v1 | Script : `creatorVisitorId` → `userId` à la connexion |
| OAuth Apple config (Auth.js) | [Provider Apple](https://authjs.dev/getting-started/providers/apple) · clés `.p8` · tester sur device réel |
| Confusion NextAuth v4 / Auth.js v5 | Implémenter depuis **authjs.dev** uniquement ; next-auth.js.org = référence providers |
| Confusion auth vote vs dash | UI : aucun bouton OAuth sur `/l/[slug]` |

---

## 16. Relation avec MVP v1

| v1 | v2 |
|----|-----|
| Pas de compte (organisateur = `visitorId`) | **Dashboard = Auth.js** (Google/Apple) ; **vote = toujours sans compte** |
| Objet créé dans la liste | Objet créé dans inventaire, puis assigné |
| Taxonomie emoji seule | Emoji + tags perso |
| Une liste = workflow complet | Inventaire → N listes → partage ciblé |
| — | Déplacer entre listes · sync multi-appareil |
| Photo : 1 bouton + `capture` forcé | **2 boutons** caméra / galerie · permissions mobile (§6) |

**v1 reste valide** comme sous-ensemble : créer liste + ajouter objet directement = assignation immédiate (raccourci conservé optionnel : « Ajouter et mettre dans cette liste »).

---

*MVP Share Items — v2.4 (Auth.js v5 / NextAuth · Google + Apple · vote anonyme · inventaire & listes · tags perso · kinds de liste · photo caméra/galerie + permissions mobile)*

---

## 17. État de livraison v2.4

### Livré

- **Auth.js v5 / NextAuth** (Google + Apple cond.) avec `PrismaAdapter`, session JWT, middleware `/dashboard/*`, page `/login`.
- **Migration v1 → v2** : `POST /api/auth/claim-lists` (déclenché par `ClaimVisitorListsTrigger`).
- **Inventaire perso** : modèle `Item.listId` nullable, `Item.userId`, page `/dashboard/inventory` avec :
  - filtres (assigné / non assigné / par pièce / par catégorie),
  - mode multi-sélection,
  - actions « ajouter à une liste », « retirer des listes », « supprimer ».
- **API inventaire** : `GET /api/inventory`, `POST /api/inventory/items`, `POST /api/inventory/assign`, `POST /api/inventory/unassign`, `POST /api/inventory/move`.
- **Tags perso** : modèles `UserTag` / `ItemTag`, API `GET/POST /api/tags`, `DELETE /api/tags/:id`, composant `TagPicker` dans le wizard, chips dans l’inventaire, sur les cartes liste et sur le swipe votant.
- **Kinds de liste** : `keep` / `donate` / `sell` / `custom`, page `/dashboard/lists` avec templates rapides, page `/dashboard/lists/new?kind=…`, badge kind + sélecteur sur la page détail.
- **Photo 2 boutons** : `📸 Prendre une photo` (`capture="environment"`) et `🖼️ Choisir dans la galerie`, message de refus de permission caméra / galerie, prévisualisation avant l’étape suivante.
- **Déplacer un objet** depuis le détail liste (`MoveDialog`) : reset des votes/match si la liste change.
- **Navigation dashboard** : bottom nav fixe `Inventaire / + Photo / Listes`, masquée dans les wizards.
- **Voter** : affichage des tags perso publics sur les cartes swipe (à côté de pièce/catégorie).
- **Routes legacy** : `/dashboard` et `/dashboard/new` redirigent vers `/dashboard/inventory` et `/dashboard/lists/new`.

### À surveiller / suite

- Suppression / renommage des tags depuis une page dédiée (pour l’instant : création seule via le wizard, `DELETE` existe côté API).
- Drag & drop pour réorganiser les objets d’une liste.
- Bouton « créer la liste depuis ma sélection » disponible côté inventaire (présent indirectement via `?from=inventory&items=…`).
- Tests E2E (Playwright) du flux : inventaire → assigner → vote → match.
