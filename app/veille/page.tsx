"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";

type ArticleNotion = {
  id: string;
  properties: Record<string, any>;
};

function texte(prop: any, type: string) {
  if (!prop) return "";
  if (type === "title" || type === "rich_text") {
    return prop[type]?.map((t: any) => t.plain_text).join("") ?? "";
  }
  if (type === "select") return prop.select?.name ?? "";
  if (type === "number") return prop.number ?? "";
  if (type === "url") return prop.url ?? "";
  return "";
}

export default function VeillePage() {
  const [categorieActive, setCategorieActive] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleNotion[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enCoursGeneration, setEnCoursGeneration] = useState<string | null>(null);

  useEffect(() => {
    setChargement(true);
    const url = categorieActive ? `/api/veille?categorie=${categorieActive}` : "/api/veille";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setArticles(d.articles ?? []))
      .finally(() => setChargement(false));
  }, [categorieActive]);

  async function genererBrouillon(article: ArticleNotion) {
    setEnCoursGeneration(article.id);
    const p = article.properties;
    const payload = {
      article: {
        titre: texte(p.Titre, "title"),
        resume: texte(p.Resume, "rich_text"),
        lien: texte(p.Lien, "url"),
        categorie: texte(p.Categorie, "select"),
      },
    };
    await fetch("/api/posts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEnCoursGeneration(null);
    alert("Brouillon généré, à retrouver dans Notion (base Posts) pour validation.");
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Veille BTP</h1>
      <p style={{ color: "#666" }}>{articles.length} articles affichés</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button onClick={() => setCategorieActive(null)} style={bouton(categorieActive === null)}>
          Tous
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategorieActive(c.id)} style={bouton(categorieActive === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {chargement && <p>Chargement…</p>}
      {!chargement && articles.length === 0 && (
        <p>
          Aucun article. Vérifie que <code>NOTION_DB_ARTICLES</code> est configuré et que la veille a déjà tourné
          au moins une fois (<code>/api/veille/run</code>).
        </p>
      )}

      {articles.map((a) => {
        const p = a.properties;
        return (
          <div key={a.id} style={carte}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span style={badge}>{texte(p.Categorie, "select")}</span>
              <span style={badge}>{texte(p.Impact, "select")}</span>
              <span style={{ color: "#888", fontSize: 13 }}>{texte(p.Source, "rich_text")}</span>
            </div>
            <h3 style={{ margin: "4px 0" }}>{texte(p.Titre, "title")}</h3>
            <p style={{ color: "#333" }}>{texte(p.Resume, "rich_text")}</p>
            <p style={{ color: "#a05", fontSize: 13 }}>{texte(p.Opportunites, "rich_text")}</p>
            <button
              onClick={() => genererBrouillon(a)}
              disabled={enCoursGeneration === a.id}
              style={boutonAction}
            >
              {enCoursGeneration === a.id ? "Génération…" : "Générer un brouillon de post"}
            </button>
          </div>
        );
      })}
    </main>
  );
}

function bouton(actif: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #ddd",
    background: actif ? "#c1440e" : "#fff",
    color: actif ? "#fff" : "#333",
    cursor: "pointer",
  };
}

const carte: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};

const badge: React.CSSProperties = {
  fontSize: 12,
  padding: "2px 10px",
  borderRadius: 12,
  background: "#f2f2f2",
};

const boutonAction: React.CSSProperties = {
  marginTop: 8,
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  background: "#c1440e",
  color: "#fff",
  cursor: "pointer",
};
