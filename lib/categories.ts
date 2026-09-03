// Definitions des categories de la veille - les 4 categories sont actives.
// Business est reconstitue a partir de la capture du prompt deja en
// production sur l'ancien Vercel (section "### BUSINESS" du prompt
// d'analyse d'articles) plutot que d'une reponse ecrite de Loic - a
// confirmer/ajuster si besoin une fois le reste debloque.

export type Categorie = "TRANSMISSION" | "BTP_GENERAL" | "IA" | "BUSINESS" | "NON_PERTINENT";

export const CATEGORIES: { id: Categorie; label: string; couleur: string }[] = [
  { id: "TRANSMISSION", label: "Transmission", couleur: "purple" },
  { id: "BTP_GENERAL", label: "BTP general", couleur: "blue" },
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

// Sources dediees Transmission - recues de Loic (screenshots Gemini du 27/08).
// Pas de flux RSS connu pour la plupart : a interroger via Perplexity en
// attendant (voir lib/perplexity.ts).
export const SOURCES_TRANSMISSION = [
  { nom: "FFB", url: "https://www.ffbatiment.fr" },
  { nom: "CAPEB", url: "https://www.capeb.fr" },
  { nom: "FNTP", url: "https://www.fntp.fr" },
  { nom: "Service Public - Entreprendre", url: "https://entreprendre.service-public.gouv.fr" },
  { nom: "Bpifrance Creation", url: "https://bpifrance-creation.fr" },
  { nom: "Bourse de la Transmission (Bpifrance)", url: "https://reprise-entreprise.bpifrance.fr" },
  { nom: "CMA France", url: "https://www.artisanat.fr" },
  { nom: "CCI France", url: "https://www.cci.fr" },
  { nom: "Transentreprise.com", url: "https://www.transentreprise.com" },
  ];

// Sources dediees IA appliquee au BTP - proposees par recherche web (27/08),
// a valider par Loic.
export const SOURCES_IA = [
  { nom: "Le Moniteur - IA", url: "https://www.lemoniteur.fr/numerique/intelligence-artificielle/" },
  { nom: "Direction generale des Entreprises", url: "https://www.entreprises.gouv.fr/espace-entreprises/appels-a-projets-et-appels-a-manifestation-d-interet/promotion-des-outils" },
  { nom: "Observatoire des metiers du BTP (CNATP)", url: "https://www.cnatp.org/actualites-et-ressources/articles/l-intelligence-artificielle-dans-les-entreprises-du-btp-etude-de-l-observatoire-des-metiers-du-btp" },
  { nom: "Mediabat", url: "https://www.mediabat.com/intelligence-artificielle-dans-le-btp-ce-que-ca-change-vraiment-pour-les-artisans-et-les-pme-en-2026/" },
  { nom: "French Web", url: "https://www.frenchweb.fr/le-btp-face-a-lia-une-transition-prudente-mais-structuree/460514" },
  { nom: "Graneet", url: "https://www.graneet.com/fr/article/ia-btp-2026" },
  { nom: "Tensoria", url: "https://tensoria.fr/guide/ia-btp" },
  { nom: "Assurup", url: "https://www.assurup.com/blog/articles/btp-ia" },
  { nom: "Mister ConTech", url: "https://mistercontech.com/comparatif-ia-btp/" },
  ];

// Sources dediees Business (opportunites d'affaires / prospection BTP) -
// proposees par recherche web (02/09), a valider par Loic. Pas de flux RSS
// officiel identifie, interrogees via Perplexity.
export const SOURCES_BUSINESS = [
  { nom: "Obat - trouver des chantiers", url: "https://www.obat.fr/blog/trouver-chantiers-clients-batiment/" },
  { nom: "LeadActiv - prospection BTP", url: "https://www.leadactiv.fr/prospection-btp-travaux/" },
  { nom: "Habitatpresto Pro - plan de prospection", url: "https://www.habitatpresto.com/pro/conseils/pratiques/comment-etablir-plan-prospection" },
  { nom: "Easyfichiers - 8 methodes de prospection BTP", url: "https://blog.easyfichiers.com/prospection-btp-trouver-clients/" },
    // Sources officielles/institutionnelles ajoutees le 04/09 a la demande de
    // Loic (transcript "instructions vercel") : etudes et reperes serieux sur
    // le developpement commercial et les marches du BTP, en plus des blogs
    // specialises ci-dessus.
  { nom: "Bpifrance Le Lab - tendances economiques et sectorielles PME/ETI", url: "https://lelab.bpifrance.fr/thematiques/tendances-economiques-et-sectorielles" },
  { nom: "CCI France - accompagnement developpement commercial", url: "https://www.cci.fr" },
  { nom: "CMA France - accompagnement artisanat", url: "https://www.artisanat.fr" },
  ];

// Sources institutionnelles/officielles complementaires pour BTP general -
// ajoutees le 04/09 a la demande de Loic pour elargir la collecte au-dela
// des 4 flux RSS de presse (INSEE, federations, observatoire de branche).
// Pas de flux RSS officiel identifie pour ces sources : interrogees via
// Perplexity, comme les autres axes.
export const SOURCES_BTP_GENERAL_INSTITUTIONNELLES = [
  { nom: "INSEE / SDES - statistiques et conjoncture BTP", url: "https://www.statistiques.developpement-durable.gouv.fr/les-entreprises-du-btp-0" },
  { nom: "FFB - conjoncture du batiment", url: "https://www.ffbatiment.fr/actualites-batiment" },
  { nom: "Observatoire des metiers du BTP - le BTP en chiffres", url: "https://www.metiers-btp.fr/btp-en-chiffres/" },
  ];

// Seuil de pertinence par defaut (score /10 minimum pour generer un post).
// Vu dans les parametres Vercel existants. Modifiable via l'onglet Parametres.
export const SEUIL_PERTINENCE_DEFAUT = 8;
