// Aucune importation d'Astro : ce fichier reste importable depuis les tests Node.
import { projets } from '../data/projets';
import type { Projet } from '../data/types';

/** Les projets dont la stack contient exactement cette techno, dans l'ordre des données. */
export function projetsUtilisant(nom: string): Projet[] {
  return projets.filter((projet) => projet.stack.includes(nom));
}
