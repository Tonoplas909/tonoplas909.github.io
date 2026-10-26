// Captures d'écran de chaque projet, lues dans src/assets/projets/<id>/ avec la même sélection que le site
// (`selectionnerImages`) : les tests suivent donc les images que Matis dépose, sans liste à tenir à jour.
import { readdirSync } from 'node:fs';
import { projets } from '../../../src/data/projets';
import { selectionnerImages } from '../../../src/lib/galerie';

const RACINE = new URL('../../../src/assets/projets/', import.meta.url);

/** Noms de fichiers des captures du projet, dans l'ordre d'affichage (le premier sert de vignette). */
export function captures(id: string): string[] {
  let noms: string[];
  try {
    noms = readdirSync(new URL(`${id}/`, RACINE));
  } catch {
    return [];
  }
  return selectionnerImages(
    noms.map((nom) => `/src/assets/projets/${id}/${nom}`),
    id,
  ).map((chemin) => chemin.slice(chemin.lastIndexOf('/') + 1));
}

export const avecCaptures = projets.filter((projet) => captures(projet.id).length > 0);
export const sansCaptures = projets.filter((projet) => captures(projet.id).length === 0);
