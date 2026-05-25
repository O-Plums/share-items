# Acquisition & tracking — Sort your life

Ops doc — comment générer les liens trackés, comment les lire dans `/admin`.

Tout passe par les **paramètres UTM** dans l'URL : ils sont capturés au premier landing (first-touch, TTL 30 jours), persistés en `localStorage`, puis envoyés sur `POST /api/attribution` au premier passage sur le dashboard après login.

---

## Convention de nommage `utm_*`

Pour que le dashboard admin reste lisible quand tu enchaînes 10 campagnes :

| Paramètre | Valeurs canoniques | Exemples |
|---|---|---|
| `utm_source` | la **plateforme** (lowercase, pas d'espace) | `meta`, `google`, `tiktok`, `reddit`, `linkedin`, `discord`, `direct`, `email` |
| `utm_medium` | le **type** de trafic | `cpc` (ads payantes), `organic`, `social`, `email`, `referral` |
| `utm_campaign` | le **slug** de la campagne | `demenagement-25`, `succession-frereetsoeur`, `producthunt-launch` |
| `utm_content` | (optionnel) variante creative | `videoA`, `videoB`, `staticV1` |
| `utm_term` | (optionnel) mot-clé / angle | `demenagement-couple`, `tri-cave` |

Règle : **lowercase + tirets**, jamais d'espaces, jamais d'accents. Le dashboard agrège exactement la chaîne brute.

---

## URLs prêtes à copier/coller

Pointent toutes vers la home (`/`). Ajoute `?tour=1` ou `?itemTour=1` uniquement pour les liens de QA interne.

### Meta Ads (Facebook / Instagram)

```text
https://sortyourlife.fr/?utm_source=meta&utm_medium=cpc&utm_campaign=demenagement-25
https://sortyourlife.fr/?utm_source=meta&utm_medium=cpc&utm_campaign=demenagement-25&utm_content=videoA
https://sortyourlife.fr/?utm_source=meta&utm_medium=cpc&utm_campaign=demenagement-25&utm_content=videoB
https://sortyourlife.fr/?utm_source=meta&utm_medium=cpc&utm_campaign=succession-fratrie
https://sortyourlife.fr/?utm_source=meta&utm_medium=cpc&utm_campaign=tri-marie-kondo
```

### Google Ads

```text
https://sortyourlife.fr/?utm_source=google&utm_medium=cpc&utm_campaign=demenagement-25
https://sortyourlife.fr/?utm_source=google&utm_medium=cpc&utm_campaign=succession-fratrie
```

> Sur Google Ads, le `gclid` est ajouté automatiquement à l'URL final si l'auto-tagging est activé — il est aussi capturé (champ `gclid` en DB).

### TikTok

```text
https://sortyourlife.fr/?utm_source=tiktok&utm_medium=cpc&utm_campaign=demenagement-25
https://sortyourlife.fr/?utm_source=tiktok&utm_medium=organic&utm_campaign=video-1
https://sortyourlife.fr/?utm_source=tiktok&utm_medium=organic&utm_campaign=video-2
```

### Reddit (post organique)

```text
https://sortyourlife.fr/?utm_source=reddit&utm_medium=organic&utm_campaign=r-france-1
https://sortyourlife.fr/?utm_source=reddit&utm_medium=organic&utm_campaign=r-paris-1
https://sortyourlife.fr/?utm_source=reddit&utm_medium=organic&utm_campaign=r-questions-france-1
```

### LinkedIn / X / Discord (organique perso)

```text
https://sortyourlife.fr/?utm_source=linkedin&utm_medium=social&utm_campaign=annonce-launch
https://sortyourlife.fr/?utm_source=x&utm_medium=social&utm_campaign=thread-launch
https://sortyourlife.fr/?utm_source=discord&utm_medium=referral&utm_campaign=communaute-x
```

### Email / newsletter

```text
https://sortyourlife.fr/?utm_source=email&utm_medium=email&utm_campaign=beta-invite
https://sortyourlife.fr/?utm_source=email&utm_medium=email&utm_campaign=newsletter-juin
```

### Product Hunt / Indie Hackers

```text
https://sortyourlife.fr/?utm_source=producthunt&utm_medium=referral&utm_campaign=launch
https://sortyourlife.fr/?utm_source=indiehackers&utm_medium=referral&utm_campaign=launch
```

---

## Que regarder dans `/admin`

Sélectionne la période (7 / 30 / 90 j ou custom), puis :

### 1. Funnel d'activation (cohorte)

Sur les utilisateurs **inscrits pendant la période** :

```
Inscriptions ──► A créé une liste ──► A reçu un vote ──► A obtenu un match
```

- **Taux Inscription → Liste créée** < 50 % = problème d'onboarding ou de motivation post-signup.
- **Taux Liste → Vote reçu** < 30 % = problème d'invitation / le user crée mais ne partage pas → revoir le ShareTab.
- **Taux Vote → Match** = ton vrai signal d'usage du produit jusqu'au résultat.

### 2. Sources d'acquisition

- **Top `utm_source`** = quelle plateforme te ramène le plus de comptes.
- **Top `utm_campaign`** = quel angle/message marche.
- **Top `referrer`** = trafic organique (Google, Reddit, t.co, etc.).
- **Couverture attribution** = % d'inscrits pour lesquels on a une source. Si < 50 %, beaucoup d'arrivées direct → préfixe tes liens partout.

### 3. Custom Events Vercel Analytics

Dashboard Vercel → projet → **Analytics → Custom Events**. Les 5 events trackés :

| Event | Quand | Props |
|---|---|---|
| `signup` | 1ère arrivée sur `/dashboard/*` après login | `source` |
| `list_created` | POST `/api/lists` réussi | `kind` |
| `invite_sent` | Copie lien ou `navigator.share` | `method` |
| `vote_cast` | POST `/api/votes` réussi (côté votant) | `value` |
| `match_reached` | POST `/api/matches` réussi (owner) | — |

Croisement utile : `signup` filtré par `source` = funnel pour comparer la qualité du trafic entre plateformes (Meta vs Reddit vs organique).

---

## QA — forcer les tutoriels

| URL | Effet |
|---|---|
| `https://sortyourlife.fr/dashboard/<listId>?tour=1` | Relance le tutoriel "première liste" |
| `https://sortyourlife.fr/dashboard/<listId>/items/new?itemTour=1` | Relance le tutoriel "ajout d'objet" |

Pour réinitialiser entièrement l'état tour dans la console DevTools :

```js
localStorage.removeItem("share-items-first-list-tour-done");
localStorage.removeItem("share-items-item-tour-done");
localStorage.removeItem("sortyourlife.signup-tracked");
localStorage.removeItem("sortyourlife.attribution-synced");
localStorage.removeItem("sortyourlife.attribution");
```

---

## Notes

- **First-touch wins** : si un user clique sur ton lien Meta puis revient via Google avant de s'inscrire, seul Meta sera enregistré (TTL 30 j).
- **Referrer interne ignoré** : si quelqu'un navigue `home → /login → dashboard`, on ne se compte pas comme referrer.
- **RGPD** : les UTM ne sont pas des données personnelles. La table `SignupAttribution` est liée à l'utilisateur — supprimée en cascade si le compte est supprimé.
