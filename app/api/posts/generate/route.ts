import { NextRequest, NextResponse } from "next/server";
import { genererPostLinkedIn, type ArticleQualifie } from "@/lib/openai";
import { sauvegarderBrouillon } from "@/lib/notion";

/**
 * Transforme un article en brouillon de post LinkedIn — équivalent du
 * bouton "Générer un brouillon de post" déjà présent dans Vercel pour
 * Transmission/BTP général. Le résultat reste en brouillon dans Notion :
 * pas de publication automatique (validation manuelle par Loïc).
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const article: ArticleQualifie = body.article;

  if (!article) {
    return NextResponse.json({ error: "Article manquant" }, { status: 400 });
  }

  const contenu = await genererPostLinkedIn(article);
  await sauvegarderBrouillon(article.lien, contenu, article.categorie);

  return NextResponse.json({ ok: true, brouillon: contenu });
}
