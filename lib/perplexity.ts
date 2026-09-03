import { SOURCES_TRANSMISSION, SOURCES_IA, SOURCES_BUSINESS, SOURCES_BTP_GENERAL_INSTITUTIONNELLES } from "./categories";
import type { ArticleBrut } from "./rss";

// Axe Transmission : construit a partir des sources fournies par Loic.
// TODO : remplacer par le texte exact du prompt Vercel une fois retrouve
// (cf. cahier des charges, section 3).
const PROMPT_AXE_TRANSMISSION = `
Recherche les actualites recentes (moins de 15 jours) sur la transmission,
cession et reprise d'entreprise en France, en priorite pour les TPE/PME du
secteur du BTP. Base-toi en priorite sur ces sources si elles ont publie
du contenu recent : ${SOURCES_TRANSMISSION.map((s) => s.nom).join(", ")}.
Sujets recherches : fiscalite de la transmission, dispositifs
d'accompagnement a la cession/reprise, cas concrets de transmission
d'entreprise BTP, conseils pour dirigeants seniors qui envisagent de ceder.
`.trim();

// Axe IA appliquee au BTP : construit a partir des 2 programmes de
// formation ADN Potentiel + sources trouvees par recherche (27/08).
// TODO : remplacer par le texte exact "AXE 2 - IA BTP" une fois retrouve.
const PROMPT_AXE_IA = `
Recherche les actualites recentes (moins de 15 jours) sur l'intelligence
artificielle appliquee au secteur du BTP en France. Sujets recherches :
outils IA pour le BTP (ChatGPT, Perplexity, Monica, Notion AI, Gamma,
Napkin...), prompt engineering pour les metiers du BTP, automatisation de
taches commerciales/administratives (appels d'offres, devis, comptes-rendus),
IA generative pour la conception, IA sur chantier (securite, vision par
ordinateur, robotique), etudes/chiffres sur l'adoption de l'IA dans le BTP.
Sources de reference : ${SOURCES_IA.map((s) => s.nom).join(", ")}.
`.trim();

// Axe Business : reconstitue a partir de la capture du prompt deja en
// production ("### BUSINESS" - opportunites d'affaires, prospection,
// acquisition clients) + sources trouvees par recherche (02/09).
// TODO : remplacer par le texte exact du prompt Vercel une fois retrouve.
const PROMPT_AXE_BUSINESS = `
Recherche les actualites et ressources recentes (moins de 15 jours) sur les
opportunites d'affaires et la prospection commerciale dans le secteur du
BTP en France. Sujets recherches : canaux d'acquisition pour decrocher des
prospects/leads, methodes de prospection pour artisans et entreprises du
BTP, bonnes pratiques pour trouver de nouveaux clients (particuliers ou
professionnels), bonnes pratiques pour se demarquer de la concurrence et
decrocher des marches.
Sources de reference : ${SOURCES_BUSINESS.map((s) => s.nom).join(", ")}.
`.trim();

// Axe BTP general - complement institutionnel ajoute le 04/09 a la demande
// de Loic (transcript "instructions vercel") pour elargir la collecte
// au-dela des 4 flux RSS de presse, avec des sources officielles/serieuses
// (INSEE, federations du batiment, observatoire de branche).
const PROMPT_AXE_BTP_GENERAL_INSTITUTIONNEL = `
Recherche les actualites et publications recentes (moins de 15 jours) sur la
conjoncture et l'actualite du secteur du BTP en France, en priorite des
sources officielles ou faisant autorite : statistiques et conjoncture INSEE,
communiques et analyses des federations professionnelles (FFB, CAPEB, FNTP),
chiffres de l'Observatoire des metiers du BTP. Sujets recherches :
conjoncture economique du secteur, reglementation, aides et dispositifs
publics pour les TPE/PME du BTP, donnees chiffrees sur l'activite du
batiment et des travaux publics.
Sources de reference : ${SOURCES_BTP_GENERAL_INSTITUTIONNELLES.map((s) => s.nom).join(", ")}.
`.trim();

async function rechercherPerplexity(prompt: string, source: string): Promise<ArticleBrut[]> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
          console.warn("PERPLEXITY_API_KEY absente - recherche Perplexity ignoree.");
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
                                            "Tu es un expert en veille. Reponds uniquement avec une liste JSON " +
                                            "d'articles trouves : [{\"titre\":\"...\",\"resume\":\"...\",\"lien\":\"...\",\"date\":\"...\"}]",
                  },
                  { role: "user", content: prompt },
                        ],
        }),
  });

  if (!res.ok) {
        console.error(`Perplexity API en echec (${res.status})`);
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
        console.error("Reponse Perplexity non parsable JSON.");
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

export async function rechercherBTPGeneralInstitutionnel(): Promise<ArticleBrut[]> {
    return rechercherPerplexity(PROMPT_AXE_BTP_GENERAL_INSTITUTIONNEL, "perplexity:btp_general_institutionnel");
}
