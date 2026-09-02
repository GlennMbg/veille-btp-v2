import { Client } from "@notionhq/client";
import type { ArticleQualifie } from "./openai";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// IDs des bases Notion — à créer et renseigner dans les variables
// d'environnement Vercel. Voir README.md > "Schéma Notion".
const DB_ARTICLES = process.env.NOTION_DB_ARTICLES ?? "";
const DB_POSTS = process.env.NOTION_DB_POSTS ?? "";

const SEUIL_PERTINENCE = Number(process.env.SEUIL_PERTINENCE ?? 8);

/**
 * Écrit un article qualifié dans la base Notion "Veille".
 * Reprend le rôle des noeuds "Créer dans Notion Transmission" /
 * "Créer dans Notion BTP Général" du workflow d'origine, mais pour les
 * 3 catégories dans une seule base (avec un champ Select "Catégorie").
 */
export async function sauvegarderArticle(article: ArticleQualifie) {
  if (!DB_ARTICLES) {
    console.warn("NOTION_DB_ARTICLES absent — écriture Notion ignorée.");
    return;
  }
  if (article.categorie === "NON_PERTINENT") return;

  await notion.pages.create({
    parent: { database_id: DB_ARTICLES },
    properties: {
      Titre: { title: [{ text: { content: article.titre.slice(0, 200) } }] },
      Categorie: { select: { name: article.categorie } },
      Impact: { select: { name: article.impact } },
      Score: { number: article.score },
      Resume: { rich_text: [{ text: { content: article.resume.slice(0, 2000) } }] },
      Opportunites: { rich_text: [{ text: { content: article.opportunites.slice(0, 2000) } }] },
      Lien: { url: article.lien || null },
      Source: { rich_text: [{ text: { content: article.source } }] },
      DateDetection: { date: { start: new Date().toISOString() } },
      // Un article au-dessus du seuil devient éligible à la génération de
      // post (voir app/api/posts/generate). En dessous, il est conservé
      // pour la veille mais n'apparaît pas comme "à publier".
      Eligible: { checkbox: article.score >= SEUIL_PERTINENCE },
    },
  });
}

/**
 * Enregistre un post LinkedIn généré en brouillon (jamais publié
 * automatiquement — validation manuelle par Loïc, cf. cahier des charges).
 */
export async function sauvegarderBrouillon(articleId: string, contenu: string, categorie: string) {
  if (!DB_POSTS) {
    console.warn("NOTION_DB_POSTS absent — écriture Notion ignorée.");
    return;
  }
  await notion.pages.create({
    parent: { database_id: DB_POSTS },
    properties: {
      Titre: { title: [{ text: { content: `Brouillon ${categorie} — ${new Date().toLocaleDateString("fr-FR")}` } }] },
      Contenu: { rich_text: [{ text: { content: contenu.slice(0, 2000) } }] },
      Statut: { select: { name: "Brouillon" } },
      ArticleId: { rich_text: [{ text: { content: articleId } }] },
      Categorie: { select: { name: categorie } },
    },
  });
}

/**
 * Liste les articles pour l'affichage dans l'onglet Veille, avec filtres
 * optionnels par catégorie.
 */
export async function listerArticles(categorie?: string) {
  if (!DB_ARTICLES) return [];

  const res = await notion.databases.query({
    database_id: DB_ARTICLES,
    filter: categorie ? { property: "Categorie", select: { equals: categorie } } : undefined,
    sorts: [{ property: "DateDetection", direction: "descending" }],
  });

  return res.results;
}
