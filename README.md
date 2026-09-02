# Veille BTP v2 — ADN Potentiel

Reconstruction de la veille BTP (Transmission + BTP général + IA + Business) en
app Next.js déployée sur Vercel, stockage Notion, posts LinkedIn en brouillon.

**État actuel : les 4 catégories sont actives.** La définition de Business
(dans `lib/openai.ts`, `lib/categories.ts`, `lib/perplexity.ts`) est
reconstituée à partir de la capture du prompt déjà en production sur
l'ancien Vercel (section "### BUSINESS"), pas d'une réponse écrite de
Loïc — à relire et ajuster si le texte exact diffère.

## Ce qui est fait

- Collecte : 7 flux RSS (BTP général, repris de l'ancien n8n) + recherche
  Perplexity pour Transmission, IA et Business
- Qualification GPT-4o-mini : catégorie, score /10, impact, résumé, opportunités
- Stockage Notion (base Articles + base Posts)
- Génération de brouillon de post LinkedIn par article (bouton dans l'UI),
  jamais publié automatiquement
- Cron quotidien (`vercel.json`, 6h du matin)
- Page `/veille` (liste + filtres par catégorie) et `/parametres` (lecture seule)

## Ce qui manque pour que ça tourne réellement

1. ~~Clé API OpenAI~~ — reçue, dans `.env.local` (jamais commité)
2. ~~Clé API Perplexity~~ — reçue, dans `.env.local` (jamais commité)
3. **Un espace Notion avec 2 bases de données** (schéma ci-dessous) +
   un token d'intégration (`NOTION_TOKEN`) + les IDs des bases
   (`NOTION_DB_ARTICLES`, `NOTION_DB_POSTS`)
4. **Déploiement Vercel** : créer un nouveau projet sur le compte Vercel de
   Loïc (celui où est `diagnostic_adn`), connecté à un repo Git contenant ce
   dossier, avec les variables d'environnement de `.env.local` reportées dans
   Vercel > Settings > Environment Variables

Rôle de `GOOGLE_GEMINI_API_KEY` et `IMGBB_API_KEY` (reçues en même temps) pas
encore branché dans le code — à confirmer (génération/hébergement d'image
pour les posts ?) avant de les intégrer.

Sans les points 3 et 4, le code est complet mais ne peut pas s'exécuter en
conditions réelles.

## Schéma Notion à créer

### Base "Articles"
| Propriété | Type |
|---|---|
| Titre | Title |
| Categorie | Select (`TRANSMISSION`, `BTP_GENERAL`, `IA`, `BUSINESS`) |
| Impact | Select (`FORT`, `MOYEN`, `FAIBLE`) |
| Score | Number |
| Resume | Rich text |
| Opportunites | Rich text |
| Lien | URL |
| Source | Rich text |
| DateDetection | Date |
| Eligible | Checkbox |

### Base "Posts"
| Propriété | Type |
|---|---|
| Titre | Title |
| Contenu | Rich text |
| Statut | Select (`Brouillon`, `Validé`, `Publié`) |
| ArticleId | Rich text |
| Categorie | Select |

Partager les deux bases avec l'intégration Notion créée pour récupérer le token.

## Installation locale

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés
npm run dev
```

## Déploiement

1. Pousser ce dossier sur un repo GitHub (nouveau repo, sous le compte de Loïc
   ou transféré ensuite)
2. Sur vercel.com, connecter ce repo dans un nouveau projet (compte
   `loicchevallard-8990`)
3. Renseigner les variables d'environnement dans Vercel > Settings >
   Environment Variables
4. Le cron `/api/veille/run` se déclenche automatiquement chaque jour à 6h

## Ce qui reprend l'ancien système, ce qui change

- **Reprend** : logique des flux RSS BTP général, structure du prompt de
  qualification (catégorie/impact/score/résumé/opportunités), seuil de
  pertinence par défaut à 8/10
- **Change** : stockage centralisé en 2 bases Notion au lieu de 4 (une base
  "Articles" avec un champ Categorie plutôt qu'une base Notion par
  catégorie) — plus simple à filtrer et à faire évoluer si de nouvelles
  catégories arrivent ; génération de post toujours en brouillon, jamais
  publiée automatiquement
