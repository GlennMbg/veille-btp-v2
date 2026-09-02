import { NextRequest, NextResponse } from "next/server";
import { lireFluxRSS, dedoublonner } from "@/lib/rss";
import { rechercherTransmission, rechercherIA, rechercherBusiness } from "@/lib/perplexity";
import { qualifierArticles } from "@/lib/openai";
import { sauvegarderArticle } from "@/lib/notion";
import { RSS_SOURCES_BTP_GENERAL } from "@/lib/categories";

export const maxDuration = 300; // le pipeline peut être long (RSS + Perplexity + OpenAI)

/**
 * Point d'entrée quotidien de la veille — remplace le déclencheur "toutes
 * les 12h" du workflow n8n (fréquence confirmée par Loïc : quotidienne).
 * Déclenché par Vercel Cron, voir vercel.json.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron envoie un header d'auth quand CRON_SECRET est configuré.
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 1. Collecte : flux RSS (BTP général) + recherche Perplexity (Transmission, IA, Business)
  const rss = (await Promise.all(RSS_SOURCES_BTP_GENERAL.map(lireFluxRSS))).flat();
  const [transmission, ia, business] = await Promise.all([
    rechercherTransmission(),
    rechercherIA(),
    rechercherBusiness(),
  ]);

  const articlesBruts = dedoublonner([...rss, ...transmission, ...ia, ...business]);

  // 2. Qualification (catégorie, score, impact, résumé) — par lots de 20
  // pour rester dans des tailles de prompt raisonnables.
  const TAILLE_LOT = 20;
  const lots = [];
  for (let i = 0; i < articlesBruts.length; i += TAILLE_LOT) {
    lots.push(articlesBruts.slice(i, i + TAILLE_LOT));
  }

  let total = 0;
  for (const lot of lots) {
    const qualifies = await qualifierArticles(lot);
    for (const article of qualifies) {
      await sauvegarderArticle(article);
      if (article.categorie !== "NON_PERTINENT") total++;
    }
  }

  return NextResponse.json({
    ok: true,
    articles_collectes: articlesBruts.length,
    articles_pertinents: total,
  });
}
