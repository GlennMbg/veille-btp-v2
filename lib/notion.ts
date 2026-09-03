import { Client } from "@notionhq/client";
import type { ArticleQualifie } from "./openai";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// IDs des bases Notion - a creer et renseigner dans les variables
// d'environnement Vercel. Voir README.md > "Schema Notion".
const DB_ARTICLES = process.env.NOTION_DB_ARTICLES ?? "";
const DB_POSTS = process.env.NOTION_DB_POSTS ?? "";

const SEUIL_PERTINENCE = Number(process.env.SEUIL_PERTINENCE ?? 8);

/**
 * Ecrit un article qualifie dans la base Notion "Veille".
 * Reprend le role des noeuds "Creer dans Notion Transmission" /
 * "Creer dans Notion BTP General" du workflow d'origine, mais pour les
 * 3 categories dans une seule base (avec un champ Select "Categorie").
 */
export async function sauvegarderArticle(article: ArticleQualifie) {
    if (!DB_ARTICLES) {
          console.warn("NOTION_DB_ARTICLES absent - ecriture Notion ignoree.");
          return;
    }
    if (article.categorie === "NON_PERTINENT") return;

  await notion.pages.create({
        parent: { database_id: DB_ARTICLES },
        properties: {
                Titre: { title: [{ text: { content: String(article.titre ?? "").slice(0, 200) } }] },
                Categorie: { select: { name: article.categorie } },
                Impact: { select: { name: article.impact } },
                Score: { number: article.score },
                Resume: { rich_text: [{ text: { content: String(article.resume ?? "").slice(0, 2000) } }] },
                Opportunites: { rich_text: [{ text: { content: String(article.opportunites ?? "").slice(0, 2000) } }] },
                Lien: { url: article.lien || null },
                Source: { rich_text: [{ text: { content: article.source } }] },
                DateDetection: { date: { start: new Date().toISOString() } },
                Eligible: { checkbox: article.score >= SEUIL_PERTINENCE },
        },
  });
}

/**
 * Enregistre un post LinkedIn genere en brouillon (jamais publie
 * automatiquement - validation manuelle par Loic, cf. cahier des charges).
 */
export async function sauvegarderBrouillon(articleId: string, contenu: string, categorie: string) {
    if (!DB_POSTS) {
          console.warn("NOTION_DB_POSTS absent - ecriture Notion ignoree.");
          return;
    }
    await notion.pages.create({
          parent: { database_id: DB_POSTS },
          properties: {
                  Titre: { title: [{ text: { content: `Brouillon ${categorie} - ${new Date().toLocaleDateString("fr-FR")}` } }] },
                  Contenu: { rich_text: [{ text: { content: contenu.slice(0, 2000) } }] },
                  Statut: { select: { name: "Brouillon" } },
                  ArticleId: { rich_text: [{ text: { content: articleId } }] },
                  Categorie: { select: { name: categorie } },
          },
    });
}

/**
 * Liste les articles pour l'affichage dans l'onglet Veille, avec filtres
 * optionnels par categorie.
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
