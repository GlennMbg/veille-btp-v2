import { SOURCES_TRANSMISSION, SOURCES_IA, SOURCES_BUSINESS } from "./categories";
import type { ArticleBrut } from "./rss";

// Axe Transmission : construit à partir des sources fournies par Loïc.
// TODO : remplacer par le texte exact du prompt Vercel une fois retrouvé
// (cf. cahier des charges, section 3).
const PROMPT_AXE_TRANSMISSION = `
Recherche les actualités récentes (moins de 15 jours) sur la transmission,
cession et reprise d'entreprise en France, en priorité pour les TPE/PME du
secteur du BTP. Base-toi en priorité sur ces sources si elles ont publié
du contenu récent : ${SOURCES_TRANSMISSION.map((s) => s.nom).join(", ")}.
Sujets recherchés : fiscalité de la transmission, dispositifs
d'accompagnement à la cession/reprise, cas concrets de transmission
d'entreprise BTP, conseils pour dirigeants seniors qui envisagent de céder.
`.trim();

// Axe IA appliquée au BTP : construit à partir des 2 programmes de
// formation ADN Potentiel + sources trouvées par recherche (27/08).
// TODO : remplacer par le texte exact "AXE 2 — IA BTP" une fois retrouvé.
const PROMPT_AXE_IA = `
Recherche les actualités récentes (moins de 15 jours) sur l'intelligence
artificielle appliquée au secteur du BTP en France. Sujets recherchés :
outils IA pour le BTP (ChatGPT, Perplexity, Monica, Notion AI, Gamma,
Napkin...), prompt engineering pour les métiers du BTP, automatisation de
tâches commerciales/administratives (appels d'offres, devis, comptes-rendus),
IA générative pour la conception, IA sur chantier (sécurité, vision par
ordinateur, robotique), études/chiffres sur l'adoption de l'IA dans le BTP.
Sources de référence : ${SOURCES_IA.map((s) => s.nom).join(", ")}.
`.trim();

// Axe Business : reconstitué à partir de la capture du prompt déjà en
// production ("### BUSINESS" — opportunités d'affaires, prospection,
// acquisition clients) + sources trouvées par recherche (02/09).
// TODO : remplacer par le texte exact du prompt Vercel une fois retrouvé.
const PROMPT_AXE_BUSINESS = `
Recherche les actualités et ressources récentes (moins de 15 jours) sur les
opportunités d'affaires et la prospection commerciale dans le secteur du
BTP en France. Sujets recherchés : canaux d'acquisition pour décrocher des
prospects/leads, méthodes de prospection pour artisans et entreprises du
BTP, bonnes pratiques pour trouver de nouveaux clients (particuliers ou
professionnels), bonnes pratiques pour se démarquer de la concurrence et
décrocher des marchés.
Sources de référence : ${SOURCES_BUSINESS.map((s) => s.nom).join(", ")}.
`.trim();

async function rechercherPerplexity(prompt: string, source: string): Promise<ArticleBrut[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.warn("PERPLEXITY_API_KEY absente — recherche Perplexity ignorée.");
    return [];
  }

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en veille. Réponds uniquement avec une liste JSON " +
            "d'articles trouvés : [{\"titre\":\"...\",\"resume\":\"...\",\"lien\":\"...\",\"date\":\"...\"}]",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`Perplexity API en échec (${res.status})`);
    return [];
  }

  const data = await res.json();
  const contenu = data.choices?.[0]?.message?.content ?? "[]";

  try {
    const clean = contenu.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(clean);
    return (Array.isArray(parsed) ? parsed : []).map((a: any) => ({
      titre: a.titre ?? "",
      contenu: a.resume ?? "",
      description: a.resume ?? "",
      date: a.date ?? new Date().toISOString(),
      lien: a.lien ?? "",
      source,
    }));
  } catch {
    console.error("Réponse Perplexity non parsable JSON.");
    return [];
  }
}

export async function rechercherTransmission(): Promise<ArticleBrut[]> {
  return rechercherPerplexity(PROMPT_AXE_TRANSMISSION, "perplexity:transmission");
}

export async function rechercherIA(): Promise<ArticleBrut[]> {
  return rechercherPerplexity(PROMPT_AXE_IA, "perplexity:ia");
}

export async function rechercherBusiness(): Promise<ArticleBrut[]> {
  return rechercherPerplexity(PROMPT_AXE_BUSINESS, "perplexity:business");
}
