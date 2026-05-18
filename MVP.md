# MVP — Share Items

Application Next.js sur **Vercel** (GitHub → déploiement auto). Tu listes des objets de la maison (photo + pièce + type en emojis), tu partages un lien, tes proches **swipent** (oui / non), tu **match** ceux qui les recevront. Pas de compte : **prénom** + `visitorId` en `localStorage`.

---

## 1. Vision & exemple bout en bout

| Étape | Qui | Action |
|-------|-----|--------|
| 1 | Organisateur | Crée « Débarras appart », ajoute un frigo (photo, 🍳 Cuisine, 📺 Électronique). |
| 2 | Organisateur | Copie le lien `/l/x7Kp2mQ9` et l’envoie à la famille. |
| 3 | Votant (Léa) | Swipe : **Oui** sur le frigo, **Non** sur le canapé. |
| 4 | Léa | Ouvre 📖 : revoit son historique, peut changer un oui en non. |
| 5 | Organisateur | Résultats → voit que Léa a dit Oui sur le frigo → **Matcher** Léa. |
| 6 | Léa | Onglet **Matchs** → le frigo s’affiche avec « C’est pour toi ». |

**Principes :** mobile-first · zéro clavier pour les métadonnées · zéro inscription · parcours simple.

---

## 2. Glossaire (ne pas confondre)

| Terme | Signification |
|-------|----------------|
| **Vote (Oui / Non)** | Choix du votant sur un objet (✓ ou ✗). Synonymes UI : like / pas like. |
| **Swipe** | Mode où le votant découvre les objets un par un et vote. |
| **Historique (📖)** | Liste de *tous* ses votes sur la liste ; modification oui ↔ non. |
| **Match** | Décision de l’**organisateur** : « cet objet est pour cette personne ». Ce n’est **pas** un mutual like Tinder. |
| **Matchs (onglet)** | Objets que l’organisateur a attribués **à moi**. |

---

## 3. Rôles

| Rôle | Accès | Identité |
|------|-------|----------|
| **Organisateur** | `/dashboard/*` — créer listes, objets, voir résultats, matcher | `creatorVisitorId` = son `visitorId` à la création |
| **Votant** | `/l/[slug]` — swipe, historique, matchs | `visitorId` + prénom en `localStorage` |

Un même `visitorId` peut être organisateur sur ses listes et votant sur celles des autres.

---

## 4. Périmètre MVP

### In scope (v1)

**Objets**
- Photo (caméra / galerie) → Vercel Blob.
- Métadonnées **emoji uniquement** : 1 pièce + 1 type (listes fixes).
- Libellé optionnel (seul clavier à la création d’objet).

**Organisateur (`/dashboard`)**
- CRUD listes & objets (wizard photo → pièce → type).
- Grille d’aperçu (vignette + emojis).
- Onglet **Résultats** : votes agrégés, liste des Oui par objet, bouton **Matcher**, annuler un match.
- Filtres par pièce / type (chips emoji).
- Copier le lien public.

**Votant (`/l/[slug]`)**
- Footer **Swipe** | **Matchs**.
- **Swipe** : cartes plein écran, Oui / Non, barre de progression.
- **📖 Historique** (haut droite) : tous ses votes, modification en un tap.
- **Matchs** : objets qui lui ont été attribués (« C’est pour toi »).

**Règles globales**
- 1 vote par objet et par votant (upsert).
- 1 match par objet (1 receveur).
- Match possible seulement si le votant a voté **Oui** sur cet objet.
- Si le votant repasse en **Non** → match annulé automatiquement.

**Technique**
- Next.js 15+, Prisma, PostgreSQL, déploiement Vercel.

### Out of scope (post-MVP)

- Comptes, email, OAuth.
- Multilingue (UI française uniquement en v1).
- PWA / hors ligne.
- Tags texte libres, plusieurs photos par objet, IA, retouche photo.
- Chat, commentaires, notifications (ex. « tu as été matché »).
- **Refus d’un match** par le votant (négociation hors app).
- Modération / anti-fraude avancée.

### Clavier autorisé

| Contexte | Clavier |
|----------|---------|
| Prénom | Oui |
| Titre de liste | Oui |
| Libellé objet (optionnel) | Oui |
| Pièce / type | **Non** |

---

## 5. Parcours utilisateur

### 5.1 Première visite (toute l’app)

```
« Comment tu t’appelles ? » → visitorId (UUID) + displayName → localStorage
```

### 5.2 Organisateur

1. Nouvelle liste → titre.
2. Ajouter des objets (photo → pièce → type → enregistrer).
3. Copier le lien `/l/[slug]`.
4. **Résultats** : pour chaque objet, voir qui a dit Oui / Non → **Matcher** une personne qui a dit Oui.
5. Option : annuler un match et en attribuer un autre.

**Dashboard `[listId]`** — 3 zones : **Objets** · **Résultats** · **Lien** (copier).

### 5.3 Votant

1. Ouvre `/l/[slug]` → prénom si besoin.
2. **Swipe** (défaut) : vote sur les objets pas encore votés, dans l’ordre `sortOrder`.
3. **📖** : historique → changer un vote.
4. **Matchs** : voir ce qui m’est attribué (vide tant que l’organisateur n’a pas matché).

**Fin du swipe** : tous les objets votés → message « Tu as tout vu » ; Swipe / Historique / Matchs restent accessibles.

---

## 6. Création d’un objet (organisateur)

### Champs

| Champ | Obligatoire | Saisie |
|-------|-------------|--------|
| `imageUrl` | Oui | Caméra / galerie → upload |
| `room` | Oui | 1 emoji pièce |
| `category` | Oui | 1 emoji type |
| `label` | Non | Texte court optionnel |
| `sortOrder` | Auto | Ordre d’ajout |

Stockage : clés (`kitchen`, `electronics`) ; affichage : emoji + label.

### Taxonomies v1

**Pièce (1)** : 🍳 Cuisine · 🛋️ Salon · 🛏️ Chambre · 🚿 Salle de bain · 🧺 Buanderie · 🏚️ Cave / garage · 🌳 Extérieur · ❓ Autre

**Type (1)** : 📺 Électronique · 🪑 Mobilier · 🍽️ Vaisselle · 👕 Textile · 🧸 Déco · 🔧 Bricolage · 📦 Autre

### Wizard (3 écrans)

```
1. Photo      [ Prendre ] [ Galerie ]
2. Où ?       grille emoji pièce
3. Quoi ?     grille emoji type  →  [ Nom optionnel ]  [ Enregistrer ]
```

Pas de clavier aux étapes 2–3. Enregistrer actif seulement si photo + pièce + type OK.

---

## 7. Interface votant (`/l/[slug]`)

### Layout

```
┌────────────────────────┐
│ Titre liste        📖  │
│ ████████░░  5/12       │  ← 5 objets votés sur 12 au total
├────────────────────────┤
│   [ Swipe OU Matchs ]  │
├────────────────────────┤
│  ✕ Non  │  ✓ Oui       │  ← uniquement onglet Swipe
├────────────────────────┤
│ [●Swipe]  [ Matchs (2)]│
└────────────────────────┘
```

| Zone | Comportement |
|------|----------------|
| **Barre de progression** | `objets votés par moi / total objets de la liste` (pas l’index de la carte). |
| **Swipe** | Affiche le **prochain objet non voté** par moi (ordre `sortOrder`). Boutons Oui / Non → upsert vote → objet suivant. |
| **📖 Historique** | Sheet : vignette + label + ✓/✗. **Tap ligne** = bascule Oui ↔ Non (API upsert). Ne change pas la file Swipe en cours. |
| **Matchs** | Grille lecture seule des objets où un `Match` me concerne. Badge « C’est pour toi ». Vide : « L’organisateur validera bientôt ». |
| **Footer** | Swipe ↔ Matchs. Badge `Matchs (n)` si *n* > 0. |

**Historique — option** : bouton « Effacer tous mes votes » (confirmation) → supprime mes votes sur cette liste ; supprime aussi **mes** matchs sur les objets concernés.

### Onglet Swipe — fin de file

- Plus d’objet non voté → écran « Tu as tout vu » + lien vers 📖 ou Matchs.
- Objets déjà votés : modifiables uniquement via 📖 (pas re-swipe obligatoire).

---

## 8. Résultats & matchs (organisateur)

### Par objet

```
Frigo — 4 oui · 1 non
  ✓ Léa      [ Matcher ]
  ✓ Paul     matché → Paul    [ Annuler ]
  ✓ Marie    [ Matcher ]      ← désactivé si un match existe déjà
  ✗ Jean
```

| Règle | Détail |
|-------|--------|
| Qui peut être matché ? | Votant avec vote **YES** sur cet objet. |
| Combien ? | **1 match max** par objet. |
| Bouton Matcher | Masqué / désactivé pour les Non ; désactivé pour les autres Oui si match déjà posé. |
| Annuler | Retire le match ; l’objet disparaît de l’onglet Matchs du receveur. |
| Réattribuer | Annuler → Matcher quelqu’un d’autre. |

Filtres chips (pièce / type) et tri (plus de Oui, ordre d’ajout, matchés en premier) sur la liste d’objets.

**Vue synthèse (option)** : bloc « Matchs confirmés » — objet → prénom du receveur.

---

## 9. Règles métier (référence unique)

| # | Règle |
|---|--------|
| R1 | Un votant = au plus **1 vote** par objet (`@@unique([itemId, visitorId])`). |
| R2 | Vote = **YES** ou **NO** uniquement. |
| R3 | Upsert : nouveau vote remplace l’ancien ; `displayName` mis à jour à chaque vote. |
| R4 | Un objet = au plus **1 match** (`Match.itemId` unique). |
| R5 | Création de match : réservée au **créateur** de la liste ; le votant cible doit avoir **YES** sur cet objet. |
| R6 | Si le votant matché passe son vote à **NO** (swipe ou 📖) → **suppression du match** sur cet objet. |
| R7 | Si le votant matché **efface tous ses votes** sur la liste → suppression de ses votes et des matchs où il était receveur sur ces objets. |
| R8 | Suppression d’un objet → votes + match en cascade. |
| R9 | Lien `/l/[slug]` : vote + historique + matchs votant ; **pas** les résultats globaux. |
| R10 | `/dashboard` : réservé au `creatorVisitorId` (vérifié à chaque appel API). |

---

## 10. Architecture & données

```
Next.js (App Router)
    → API Routes / Server Actions
        → PostgreSQL (Prisma)
        → Vercel Blob (images)
```

### Prisma

```prisma
model List {
  id                String   @id @default(cuid())
  slug              String   @unique
  title             String
  creatorVisitorId  String
  createdAt         DateTime @default(now())
  items             Item[]
}

model Item {
  id        String   @id @default(cuid())
  listId    String
  list      List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  imageUrl  String
  label     String?
  room      String
  category  String
  sortOrder Int
  votes     Vote[]
  match     Match?
}

model Vote {
  id          String    @id @default(cuid())
  itemId      String
  item        Item      @relation(fields: [itemId], references: [id], onDelete: Cascade)
  visitorId   String
  displayName String
  value       VoteValue
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([itemId, visitorId])
}

enum VoteValue {
  YES
  NO
}

model Match {
  id          String   @id @default(cuid())
  itemId      String   @unique
  item        Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  visitorId   String
  displayName String
  createdAt   DateTime @default(now())
}
```

`room` / `category` : clés validées contre `lib/taxonomies.ts` (400 si inconnues).

### API

| Méthode | Endpoint | Qui | Action |
|---------|----------|-----|--------|
| POST | `/api/upload` | Org. | Image → URL Blob |
| POST | `/api/lists` | Org. | Créer liste `{ title, creatorVisitorId }` |
| POST | `/api/lists/[id]/items` | Org. | Ajouter objet |
| PATCH | `/api/items/[id]` | Org. | Modifier objet |
| DELETE | `/api/items/[id]` | Org. | Supprimer objet (+ votes + match) |
| GET | `/api/lists/[slug]` | Public | Métadonnées liste + items (sans votes des autres) |
| GET | `/api/lists/[id]/results` | Org. | Votes détaillés + matchs + filtres `?room=&category=` |
| POST | `/api/votes` | Votant | Upsert `{ itemId, visitorId, displayName, value }` ; applique R6 |
| GET | `/api/lists/[slug]/my-votes` | Votant | `?visitorId=` — historique |
| GET | `/api/lists/[slug]/my-matches` | Votant | `?visitorId=` — objets matchés pour moi |
| POST | `/api/matches` | Org. | `{ itemId, visitorId, creatorVisitorId }` — vérifie R5 |
| DELETE | `/api/matches/[itemId]` | Org. | Annule match ; `creatorVisitorId` requis |
| DELETE | `/api/votes/session` | Votant | `{ listSlug, visitorId }` — tous mes votes sur la liste ; applique R7 |

**IDs :** routes publiques par `slug` ; routes organisateur par `id` interne + `creatorVisitorId`.

---

## 11. Routes écran

| Route | Rôle |
|-------|------|
| `/` | Landing |
| `/dashboard` | Mes listes |
| `/dashboard/new` | Nouvelle liste |
| `/dashboard/[listId]` | Objets · Résultats · Lien |
| `/dashboard/[listId]/items/new` | Wizard objet |
| `/dashboard/[listId]/items/[itemId]/edit` | Édition objet |
| `/l/[slug]` | Swipe · 📖 · Matchs |

---

## 12. UX mobile

- Touch targets ≥ 48 px (emojis, boutons, 📖).
- Upload serveur via **Sharp** : redimensionnement max **512 px**, sortie **JPEG** uniquement, cible **≤ 500 Ko** (entrée max 10 Mo).
- `next/image` ; lazy load sur grille Matchs.
- Safe area : footer + boutons Oui/Non au-dessus de l’accueil iOS.
- Sheet 📖 : ≥ 50 % hauteur ; fermeture swipe down ou tap extérieur.
- `aria-label` sur chaque emoji de taxonomie.

---

## 13. Identité (`localStorage`)

**Clé :** `share-items-identity`

```json
{
  "visitorId": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "Léa"
}
```

**Limitation :** `localStorage` effacé → perte d’accès organisateur aux listes existantes. Mitigation : après création, message « Ajoute cette page aux favoris » + URL `/dashboard/[listId]`.

---

## 14. Déploiement

- GitHub → Vercel.
- Env : `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`.
- Max **50 objets / liste** (recommandé MVP).

### Checklist go-live

- [ ] Wizard photo + emojis (Safari iOS)
- [ ] Swipe + progression + historique 📖
- [ ] Footer Swipe / Matchs
- [ ] Matcher / annuler (organisateur)
- [ ] Annulation auto match si vote → Non
- [ ] Filtres emoji backoffice

---

## 15. Critères d’acceptation

1. Je crée un frigo (photo, 🍳, 📺) sans clavier pour les tags.
2. Léa swipe 5 objets, change un Oui en Non dans 📖.
3. Je matche Léa sur le frigo → elle le voit dans **Matchs**.
4. Léa repasse le frigo en Non dans 📖 → le match disparaît pour elle et dans mes résultats.
5. Je ne peux pas matcher quelqu’un qui a voté Non.
6. Je ne peux pas matcher deux personnes sur le même objet.
7. Footer utilisable à une main (375 px).

---

## 16. Plan de livraison

| Phase | Jours | Livrable |
|-------|-------|----------|
| **S1** | 2–3 | Next, Prisma, taxonomies, identité |
| **S2** | 3–4 | Upload, wizard objet, dashboard Objets + Lien |
| **S3** | 3–4 | `/l/[slug]` : Swipe, votes API, 📖, footer |
| **S4** | 2–3 | Résultats org. + API/UI match + onglet Matchs |
| **S5** | 1–2 | Filtres, polish, Vercel |

**Total :** ~14–16 jours.

---

## 17. Risques

| Risque | Mitigation |
|--------|------------|
| Photos lentes | Compression, Blob, `next/image` |
| Perte accès dashboard | Favori + URL directe |
| 2 personnes pour 1 objet | R4 + UI un seul Matcher actif |
| Match fantôme | R6 à chaque upsert vote → NO |
| Spam votes | Rate limit IP sur `POST /api/votes` |
| Confusion vote / match | Glossaire §2 + libellés UI clairs |

---

## 18. Évolutions — voir MVP v2

**Spécification complète :** [MVP-v2.md](./MVP-v2.md)

Résumé v2 :
- **Dashboard** : compte **Google** ou **Apple** (inventaire sync)
- **Vote** (`/l/[slug]`) : **sans compte** — prénom + `visitorId` (comme v1)
- **Inventaire perso** : photographier d’abord, assigner aux listes ensuite
- **Tags perso**, **listes par intention** (garder / donner / vendre), **déplacer** entre listes

Post-v2 : carrousel photos, notifications, QR code, export CSV.

---

*MVP Share Items — v1.4 (cohérence globale)*
