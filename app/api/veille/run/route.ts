import { NextRequest, NextResponse } from "next/server";
import { lireFluxRSS, dedoublonner } from "@/lib/rss";
import { rechercherTransmission, rechercherIA, rechercherBusiness, rechercherBTPGeneralInstitutionnel } from "@/lib/perplexity";
import { qualifierArticles } from "@/lib/openai";
import { sauvegarderArticle } from "@/lib/notion";
import { RSS_SOURCES_BTP_GENERAL } from "@/lib/categories";

export const maxDuration = 300; // le pipeline peut etre long (RSS + Perplexity + OpenAI)

/**
 * Point d'entree quotidien de la veille - remplace le declencheur "toutes
 * les 12h" du workflow n8n (frequence confirmee par Loic : quotidienne).
 * Declenche par Vercel Cron, voir vercel.json.
 */
export async function GET(req: NextRequest) {
    // Vercel Cron envoie un header d'auth quand CRON_SECRET est configure.
  const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

  // 1. Collecte : flux RSS (BTP general) + recherche Perplexity (Transmission,
  // IA, Business, et depuis le 04/09 un axe institutionnel BTP general
  // (INSEE, federations) demande par Loic pour elargir le volume d'articles).
  const rss = (await Promise.all(RSS_SOURCES_BTP_GENERAL.map(lireFluxRSS))).flat();
    const [transmission, ia, business, btpGeneralInstitutionnel] = await Promise.all([
          rechercherTransmission(),
          rechercherIA(),
          rechercherBusiness(),
          rechercherBTPGeneralInstitutionnel(),
        ]);

  const articlesBruts = dedoublonner([...rss, ...transmission, ...ia, ...business, ...btpGeneralInstitutionnel]);

  // 2. Qualification (categorie, score, impact, resume) - par lots de 20
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
