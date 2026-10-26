// Aucune importation à l'exécution (seulement `import type`) : ce fichier sert au build
// (cartes et pages projet) comme au navigateur (visionneuse).
import type { Lang, Localise } from '../data/types';

const RACINE = '/src/assets/projets/';
const IMAGE = /.+\.(?:jpe?g|png|webp)$/i;

const ALT_PAR_DEFAUT: Record<Lang, (titre: string, n: number) => string> = {
  fr: (titre, n) => `Capture d'écran ${n} de ${titre}`,
  en: (titre, n) => `Screenshot ${n} of ${titre}`,
};

// Tri naturel : 2.png avant 10.png
const collateur = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function comparerNoms(a: string, b: string): number {
  // À égalité de casse près (a.png, A.png), l'ordre brut départage : le tri reste déterministe
  return collateur.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0);
}

/** Nom du fichier si le chemin est une image rangée directement dans le dossier du projet, sinon null. */
function nomImage(chemin: string, id: string): string | null {
  const prefixe = `${RACINE}${id}/`;
  if (!chemin.startsWith(prefixe)) return null;
  const nom = chemin.slice(prefixe.length);
  return !nom.includes('/') && IMAGE.test(nom) ? nom : null;
}

/**
 * Garde les images (jpg, jpeg, png, webp, casse indifférente) rangées directement
 * dans `/src/assets/projets/<id>/`, triées par nom de fichier en ordre naturel.
 */
export function selectionnerImages(chemins: string[], id: string): string[] {
  const images: { chemin: string; nom: string }[] = [];
  for (const chemin of chemins) {
    const nom = nomImage(chemin, id);
    if (nom !== null) images.push({ chemin, nom });
  }
  return images.sort((a, b) => comparerNoms(a.nom, b.nom)).map((image) => image.chemin);
}

/** Texte alternatif d'une capture : la légende si elle existe, sinon un texte par défaut. `n` commence à 1. */
export function altCapture(titre: string, n: number, lang: Lang, legende?: Localise): string {
  const texte = legende?.[lang]?.trim();
  return texte ? texte : ALT_PAR_DEFAUT[lang](titre, n);
}

/**
 * Index de l'image affichée après un déplacement de `pas` images (négatif pour reculer),
 * en bouclant : après la dernière on revient à la première et inversement. `n` est le nombre d'images.
 */
export function indexSuivant(courant: number, pas: number, n: number): number {
  if (n <= 1) return 0;
  return (((courant + pas) % n) + n) % n;
}
