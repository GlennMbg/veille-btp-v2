import { CATEGORIES, RSS_SOURCES_BTP_GENERAL, SOURCES_TRANSMISSION, SOURCES_IA, SOURCES_BUSINESS, SOURCES_BTP_GENERAL_INSTITUTIONNELLES, SEUIL_PERTINENCE_DEFAUT } from "@/lib/categories";

// Page en lecture seule pour l'instant : les valeurs sont definies dans
// lib/categories.ts et les variables d'environnement, pas encore editables
// depuis l'interface (contrairement a l'ancienne version Vercel qui avait
// un vrai formulaire de parametres). A ajouter dans une iteration suivante
// si Loic en a besoin.
export default function ParametresPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Parametres</h1>

      <h2>Seuil de pertinence</h2>
      <p>{SEUIL_PERTINENCE_DEFAUT} / 10 (variable d'environnement SEUIL_PERTINENCE)</p>

      <h2>Categories actives</h2>
      <ul>
        {CATEGORIES.map((c) => (
          <li key={c.id}>{c.label}</li>
        ))}
      </ul>
      <p style={{ color: "#a05" }}>
        Business est reconstitue a partir du prompt deja en production sur l'ancien Vercel (pas d'une reponse
        ecrite de Loic) - a confirmer/ajuster si besoin.
      </p>

      <h2>Flux RSS (BTP general)</h2>
      <ul>
        {RSS_SOURCES_BTP_GENERAL.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h2>Sources Transmission</h2>
      <ul>
        {SOURCES_TRANSMISSION.map((s) => (
          <li key={s.url}>
            {s.nom} - {s.url}
          </li>
        ))}
      </ul>

      <h2>Sources IA</h2>
      <ul>
        {SOURCES_IA.map((s) => (
          <li key={s.url}>
            {s.nom} - {s.url}
          </li>
        ))}
      </ul>

      <h2>Sources Business</h2>
      <ul>
        {SOURCES_BUSINESS.map((s) => (
          <li key={s.url}>
            {s.nom} - {s.url}
          </li>
        ))}
      </ul>

      <h2>Sources institutionnelles BTP general (complement)</h2>
      <ul>
        {SOURCES_BTP_GENERAL_INSTITUTIONNELLES.map((s) => (
          <li key={s.url}>
            {s.nom} - {s.url}
          </li>
        ))}
      </ul>
    </main>
  );
}
