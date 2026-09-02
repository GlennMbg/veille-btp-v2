import { NextRequest, NextResponse } from "next/server";
import { listerArticles } from "@/lib/notion";

/** Liste les articles de veille pour l'onglet Veille, avec filtre catégorie optionnel. */
export async function GET(req: NextRequest) {
  const categorie = req.nextUrl.searchParams.get("categorie") ?? undefined;
  const articles = await listerArticles(categorie);
  return NextResponse.json({ articles });
}
