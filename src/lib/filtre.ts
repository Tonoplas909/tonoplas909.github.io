// Ce fichier est chargé dans le navigateur (script du filtre) et au build :
// aucune importation à l'exécution, seulement `import type`.
import type { Categorie, Lang } from '../data/types';

export type FiltreProjet = 'tous' | Categorie;

/** Les filtres, dans l'ordre des boutons. */
export const FILTRES: readonly FiltreProjet[] = ['tous', 'jeu', 'asso'];

/**
 * Garde les éléments de la catégorie demandée, dans l'ordre d'origine.
 * Générique : s'applique aux projets comme à de simples `{ categorie }` lus dans le DOM.
 */
export function filtrerProjets<T extends { categorie: Categorie }>(
  liste: T[],
  filtre: FiltreProjet
): T[] {
  if (filtre === 'tous') return [...liste];
  return liste.filter((element) => element.categorie === filtre);
}

export interface ModelesCompte {
  one: string;
  other: string;
}

/**
 * Message de résultat, avec la forme singulier/pluriel de la langue
 * (zéro est au singulier en français, au pluriel en anglais).
 * Les modèles contiennent `{n}`, remplacé par le nombre.
 */
export function formaterCompte(n: number, lang: Lang, modeles: ModelesCompte): string {
  const forme = new Intl.PluralRules(lang).select(n) === 'one' ? 'one' : 'other';
  return modeles[forme].replace('{n}', String(n));
}
