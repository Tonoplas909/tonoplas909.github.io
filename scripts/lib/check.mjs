// Contrôles purs appliqués au site construit (voir scripts/check-dist.mjs) : aucun accès au disque ici,
// pour que Vitest puisse les tester directement.
// Les chemins de `src/lib/routes.ts` sont chargés tels quels par Node (retrait natif des types),
// d'où l'extension `.ts` explicite.
import { equivalentPath, langFromPath } from '../../src/lib/routes.ts';

// Ce qui ne doit jamais apparaître dans une page publiée (spec §9 et §10) : numéro de téléphone,
// date de naissance, traces de l'ancien site généré, adresse e-mail en clair.
const MOTIFS_INTERDITS = [
  { nom: 'numéro de mobile', motif: /(?:\+33|0)\s?[67](?:[\s.-]?\d{2}){4}/ },
  { nom: 'date', motif: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/ },
  { nom: 'lovable', motif: /lovable/i },
  { nom: 'gptengineer', motif: /gptengineer/i },
  { nom: 'adresse e-mail en clair', motif: /matis\.nico123@gmail\.com/i },
];

/** Noms des motifs interdits présents dans `html` (liste vide si la page est propre). */
export function findForbidden(html) {
  return MOTIFS_INTERDITS.filter(({ motif }) => motif.test(html)).map(({ nom }) => nom);
}

/**
 * Chemins de `pages` (clés du type `/cv/`, `/en/projects/x/`) dont la page de l'autre langue
 * n'existe pas. La 404 et les fichiers (PDF…) n'ont pas de pendant : ils sont ignorés.
 */
export function missingAlternates(pages) {
  const chemins = Object.keys(pages);
  return chemins
    .filter((chemin) => chemin.endsWith('/'))
    .filter((chemin) => {
      const autre = langFromPath(chemin) === 'fr' ? 'en' : 'fr';
      return !chemins.includes(equivalentPath(chemin, autre));
    });
}

// Analyse des PDF écrits par Chromium (Skia) : PDF 1.4, dont les objets (pages, annotations de lien)
// sont en clair ; seuls les flux de contenu et de polices sont compressés. Une version qui rangerait
// ces objets dans des flux compressés (PDF 1.5) ferait compter 0 page : le contrôle échouerait
// franchement au lieu de laisser passer un fichier non vérifié.
const enTexte = (pdf) => Buffer.from(pdf).toString('latin1');

/** Nombre de pages d'un PDF : occurrences de `/Type /Page` non suivies de `s` (qui serait `/Pages`). */
export function pdfPageCount(pdf) {
  return (enTexte(pdf).match(/\/Type\s*\/Page(?![A-Za-z])/g) ?? []).length;
}

/** Vrai si le PDF porte une annotation de lien dont l'URI est exactement `uri`. */
export function pdfHasLink(pdf, uri) {
  const echappe = uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`/URI\\s*\\(${echappe}\\)`).test(enTexte(pdf));
}
