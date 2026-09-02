// Définitions des catégories de la veille — les 4 catégories sont actives.
// Business est reconstitué à partir de la capture du prompt déjà en
// production sur l'ancien Vercel (section "### BUSINESS" du prompt
// d'analyse d'articles) plutôt que d'une réponse écrite de Loïc — à
// confirmer/ajuster si besoin une fois le reste débloqué.

export type Categorie = "TRANSMISSION" | "BTP_GENERAL" | "IA" | "BUSINESS" | "NON_PERTINENT";

export const CATEGORIES: { id: Categorie; label: string; couleur: string }[] = [
  { id: "TRANSMISSION", label: "Transmission", couleur: "purple" },
  { id: "BTP_GENERAL", label: "BTP général", couleur: "blue" },
  { id: "IA", label: "IA", couleur: "green" },
  { id: "BUSINESS", label: "Business", couleur: "orange" },
];

// Flux RSS existants (repris tels quels du workflow n8n de l'ancien stagiaire)
export const RSS_SOURCES_BTP_GENERAL = [
  "https://batinews.fr/batinews.xml",
  "https://www.batiactu.com/accueil.rss",
  "https://www.infobatir.fr/feed/",
  "https://www.batipole.com/rss.xml",
  "https://www.batipole.com/communiques.xml",
  "https://www.batipole.com/articles.xml",
  "http://batipole.com/dossiers.xml",
];

// Sources dédiées Transmission — reçues de Loïc (screenshots Gemini du 27/08).
// Pas de flux RSS connu pour la plupart : à interroger via Perplexity en
// attendant (voir lib/perplexity.ts).
export const SOURCES_TRANSMISSION = [
  { nom: "FFB", url: "https://www.ffbatiment.fr" },
  { nom: "CAPEB", url: "https://www.capeb.fr" },
  { nom: "FNTP", url: "https://www.fntp.fr" },
  { nom: "Service Public - Entreprendre", url: "https://entreprendre.service-public.gouv.fr" },
  { nom: "Bpifrance Création", url: "https://bpifrance-creation.fr" },
  { nom: "Bourse de la Transmission (Bpifrance)", url: "https://reprise-entreprise.bpifrance.fr" },
  { nom: "CMA France", url: "https://www.artisanat.fr" },
  { nom: "CCI France", url: "https://www.cci.fr" },
  { nom: "Transentreprise.com", url: "https://www.transentreprise.com" },
];

// Sources dédiées IA appliquée au BTP — proposées par recherche web (27/08),
// à valider par Loïc.
export const SOURCES_IA = [
  { nom: "Le Moniteur - IA", url: "https://www.lemoniteur.fr/numerique/intelligence-artificielle/" },
  { nom: "Direction générale des Entreprises", url: "https://www.entreprises.gouv.fr/espace-entreprises/appels-a-projets-et-appels-a-manifestation-d-interet/promotion-des-outils" },
  { nom: "Observatoire des métiers du BTP (CNATP)", url: "https://www.cnatp.org/actualites-et-ressources/articles/l-intelligence-artificielle-dans-les-entreprises-du-btp-etude-de-l-observatoire-des-metiers-du-btp" },
  { nom: "Mediabat", url: "https://www.mediabat.com/intelligence-artificielle-dans-le-btp-ce-que-ca-change-vraiment-pour-les-artisans-et-les-pme-en-2026/" },
  { nom: "French Web", url: "https://www.frenchweb.fr/le-btp-face-a-lia-une-transition-prudente-mais-structuree/460514" },
  { nom: "Graneet", url: "https://www.graneet.com/fr/article/ia-btp-2026" },
  { nom: "Tensoria", url: "https://tensoria.fr/guide/ia-btp" },
  { nom: "Assurup", url: "https://www.assurup.com/blog/articles/btp-ia" },
  { nom: "Mister ConTech", url: "https://mistercontech.com/comparatif-ia-btp/" },
];

// Sources dédiées Business (opportunités d'affaires / prospection BTP) —
// proposées par recherche web (02/09), à valider par Loïc. Pas de flux RSS
// officiel identifié, interrogées via Perplexity.
export const SOURCES_BUSINESS = [
  { nom: "Obat — trouver des chantiers", url: "https://www.obat.fr/blog/trouver-chantiers-clients-batiment/" },
  { nom: "LeadActiv — prospection BTP", url: "https://www.leadactiv.fr/prospection-btp-travaux/" },
  { nom: "Habitatpresto Pro — plan de prospection", url: "https://www.habitatpresto.com/pro/conseils/pratiques/comment-etablir-plan-prospection" },
  { nom: "Easyfichiers — 8 méthodes de prospection BTP", url: "https://blog.easyfichiers.com/prospection-btp-trouver-clients/" },
];

// Seuil de pertinence par défaut (score /10 minimum pour générer un post).
// Vu dans les paramètres Vercel existants. Modifiable via l'onglet Paramètres.
export const SEUIL_PERTINENCE_DEFAUT = 8;
