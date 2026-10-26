// Aucune importation d'Astro : ce fichier reste importable depuis les tests Node.
import { projets } from '../data/projets';
import type { Projet } from '../data/types';

/** Le projet portant cet identifiant ; lève une erreur s'il n'existe pas. */
export function projetParId(id: string): Projet {
  const projet = projets.find((candidat) => candidat.id === id);
  if (!projet) throw new Error(`Projet inconnu : « ${id} »`);
  return projet;
}

/** Projets précédent et suivant dans l'ordre de `projets`, de façon circulaire. */
export function voisins(id: string): { prev: Projet; next: Projet } {
  const index = projets.indexOf(projetParId(id));
  return {
    prev: projets[(index - 1 + projets.length) % projets.length],
    next: projets[(index + 1) % projets.length],
  };
}
