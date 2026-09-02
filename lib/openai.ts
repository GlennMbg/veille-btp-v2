import OpenAI from "openai";
import type { ArticleBrut } from "./rss";
import type { Categorie } from "./categories";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ArticleQualifie = ArticleBrut & {
  categorie: Categorie;
  impact: "FORT" | "MOYEN" | "FAIBLE";
  score: number;
  resume: string;
  opportunites: string;
};

// Prompt de qualification : 4 catégories (Transmission, BTP général, IA,
// Business). Repris et étendu du prompt "Agent 1: Qualification" du
// workflow n8n d'origine (qui ne connaissait que Transmission/BTP_GENERAL).
// La définition BUSINESS ci-dessous est reconstituée à partir de la capture
// du prompt déjà en production sur l'ancien Vercel (section "### BUSINESS"),
// pas d'une réponse écrite de Loïc — à ajuster si le texte exact diffère.
const SYSTEM_PROMPT = `
# CONTEXTE : ADN POTENTIEL

Tu es l'assistant stratégique d'ADN POTENTIEL, cabinet de formation, conseil
et coaching basé à Lille, spécialisé dans l'accompagnement des dirigeants de
TPE/PME du BTP, notamment sur la transmission d'entreprise. Certifié Qualiopi.

Tu vas recevoir une LISTE d'articles de veille. Pour CHAQUE article, tu dois
décider de la categorie parmi :

- TRANSMISSION
- BTP_GENERAL
- IA
- BUSINESS
- NON_PERTINENT

## 1. Catégorie TRANSMISSION
Articles sur : transmission/cession/reprise d'entreprise (TPE/PME), fiscalité
et financement liés à la transmission, problématiques de dirigeants seniors
qui envisagent de céder, cas concrets de cession, conseils sur la
transmission. Priorité sur BTP_GENERAL si l'article parle des deux à la fois.

## 2. Catégorie BTP_GENERAL
Articles sur : actualités du secteur BTP (réglementation, normes, sécurité,
matériaux, conjoncture), gestion/pilotage d'une entreprise du BTP, aides et
dispositifs pour TPE/PME du BTP, innovations utiles à un dirigeant de TPE BTP.

## 3. Catégorie IA
Articles sur : outils IA appliqués au BTP (ChatGPT, Perplexity, Monica,
Notion AI, Gamma, Napkin...), prompt engineering pour les métiers du BTP,
automatisation de tâches commerciales/administratives (appels d'offres,
devis, comptes-rendus), IA générative pour la conception, IA sur chantier
(sécurité, vision par ordinateur, robotique), études sur l'adoption de l'IA
dans le BTP.

## 4. Catégorie BUSINESS
Articles sur : opportunités d'affaires pour le BTP, canaux d'acquisition
pour décrocher des prospects/leads et contacts, prospection dans le BTP,
bonnes pratiques pour trouver de nouveaux clients (particuliers ou
professionnels), bonnes pratiques pour se démarquer de la concurrence et
décrocher des marchés. Si un article parle à la fois d'IA et de prospection
(ex : IA pour la prospection commerciale), privilégie IA.

## 5. Catégorie NON_PERTINENT
Si l'article ne concerne aucun des quatre sujets ci-dessus, ou s'il est trop
général/macro pour qu'un dirigeant de TPE BTP en tire une action concrète.

## TA MISSION
Pour CHAQUE article, renvoie un objet JSON avec :
1. id (copie l'id fourni)
2. categorie (TRANSMISSION, BTP_GENERAL, IA, BUSINESS, NON_PERTINENT)
3. impact (FORT, MOYEN, FAIBLE)
4. score (note /10 d'intérêt pour ADN POTENTIEL)
5. resume (1-3 phrases, en français)
6. opportunites (opportunité business pour ADN POTENTIEL, ou "Aucune")

Réponds UNIQUEMENT avec un tableau JSON brut, sans markdown, sans texte
avant ou après.
`.trim();

export async function qualifierArticles(
  articles: ArticleBrut[]
): Promise<ArticleQualifie[]> {
  if (articles.length === 0) return [];

  const batch = articles.map((a, id) => ({
    id,
    title: a.titre,
    content: a.contenu,
    description: a.description,
    date: a.date,
    link: a.lien,
  }));

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Voici la liste des articles à analyser :\n\n${JSON.stringify(batch)}` },
    ],
  });

  const contenu = completion.choices[0]?.message?.content ?? "[]";
  let analyses: any[] = [];
  try {
    const clean = contenu.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    analyses = JSON.parse(clean);
  } catch {
    console.error("Réponse de qualification non parsable JSON.");
  }

  return articles.map((original, i) => {
    const a = analyses.find((x) => x.id === i) ?? {};
    return {
      ...original,
      categorie: a.categorie ?? "NON_PERTINENT",
      impact: a.impact ?? "FAIBLE",
      score: a.score ?? 0,
      resume: a.resume ?? "",
      opportunites: a.opportunites ?? "Aucune",
    };
  });
}

// Prompt de génération de post LinkedIn — ton précisé par Loïc (27/08) :
// positionnement expert-conseil, pédagogique sans discours anxiogène,
// quelques tips concrets (leviers fiscaux/organisationnels) en teasing.
// TODO : remplacer par le texte exact du prompt Vercel une fois retrouvé.
const PROMPT_GENERATION = `
Tu es un copywriter expert pour ADN POTENTIEL, cabinet BTP à Lille,
spécialisé dans l'accompagnement des dirigeants de TPE/PME du BTP sur la
transmission d'entreprise. Certifié Qualiopi.

Génère un post LinkedIn percutant à partir de l'article ci-dessous.

Consignes de ton :
- Positionnement expert-conseil, aligné sur les posts BTP déjà publiés.
- Pédagogique, jamais anxiogène : faire comprendre qu'une transmission
  d'entreprise BTP se prépare en amont, sous peine de manque à gagner et de
  moins bonnes conditions de cession.
- Donner un ou deux tips concrets (leviers fiscaux, leviers organisationnels)
  pour amorcer la réflexion du lecteur, sans tout dévoiler — la mise en
  œuvre nécessite l'accompagnement d'un cabinet comme ADN Potentiel.
- Terminer par un appel à l'échange (commentaire, message, prise de contact).
`.trim();

export async function genererPostLinkedIn(article: ArticleQualifie): Promise<string> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: PROMPT_GENERATION },
      {
        role: "user",
        content: `Article :\nTitre : ${article.titre}\nRésumé : ${article.resume}\nLien : ${article.lien}\nCatégorie : ${article.categorie}`,
      },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}
