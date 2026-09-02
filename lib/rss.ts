import { XMLParser } from "fast-xml-parser";

export type ArticleBrut = {
  titre: string;
  contenu: string;
  description: string;
  date: string;
  lien: string;
  source: string;
};

const parser = new XMLParser({ ignoreAttributes: false });

/**
 * Récupère et parse un flux RSS. Reprend la logique des noeuds
 * "RSS Feed Read" du workflow n8n d'origine.
 */
export async function lireFluxRSS(url: string): Promise<ArticleBrut[]> {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    console.error(`Flux RSS en échec (${res.status}) : ${url}`);
    return [];
  }
  const xml = await res.text();
  const data = parser.parse(xml);

  const items = data?.rss?.channel?.item ?? data?.feed?.entry ?? [];
  const liste = Array.isArray(items) ? items : [items];

  return liste
    .filter(Boolean)
    .map((item: any) => ({
      titre: item.title?.["#text"] ?? item.title ?? "",
      contenu: item["content:encoded"] ?? item.description ?? "",
      description: item.description ?? "",
      date: item.pubDate ?? item.published ?? new Date().toISOString(),
      lien: item.link?.["@_href"] ?? item.link ?? "",
      source: url,
    }));
}

/**
 * Dédoublonnage par lien (repris du noeud "Dédoublonnage RSS" n8n).
 */
export function dedoublonner(articles: ArticleBrut[]): ArticleBrut[] {
  const vus = new Set<string>();
  return articles.filter((a) => {
    const cle = a.lien || a.titre;
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });
}
