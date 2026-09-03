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
 * Convertit en chaine un champ XML qui peut etre une string, un objet
 * { "#text": "..." } (CDATA/texte mixte avec attributs), ou absent -
 * evite les crashs en aval (ex: .slice() sur un objet) quand un flux RSS
 * mal forme renvoie une structure inattendue (bug trouve le 04/09 sur
 * batipole.com).
 */
function texte(valeur: any): string {
    if (valeur == null) return "";
    if (typeof valeur === "string") return valeur;
    if (typeof valeur === "number") return String(valeur);
    if (typeof valeur === "object") {
          if (typeof valeur["#text"] === "string") return valeur["#text"];
          if (typeof valeur["#text"] === "number") return String(valeur["#text"]);
    }
    return "";
}

/**
 * Recupere et parse un flux RSS. Reprend la logique des noeuds
 * "RSS Feed Read" du workflow n8n d'origine.
 */
export async function lireFluxRSS(url: string): Promise<ArticleBrut[]> {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
          console.error(`Flux RSS en echec (${res.status}) : ${url}`);
          return [];
    }
    const xml = await res.text();
    const data = parser.parse(xml);

  const items = data?.rss?.channel?.item ?? data?.feed?.entry ?? [];
    const liste = Array.isArray(items) ? items : [items];

  return liste
      .filter(Boolean)
      .map((item: any) => ({
              titre: texte(item.title),
              contenu: texte(item["content:encoded"]) || texte(item.description),
              description: texte(item.description),
              date: texte(item.pubDate) || texte(item.published) || new Date().toISOString(),
              lien: texte(item.link?.["@_href"]) || texte(item.link),
              source: url,
      }));
}

/**
 * Dedoublonnage par lien (repris du noeud "Dedoublonnage RSS" n8n).
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
