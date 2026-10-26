// Réservé à Astro et Vite (`import.meta.glob`) : ce fichier n'est pas importable depuis un script Node.
// Les images sont déposées dans src/assets/projets/<id>/ ; tant qu'il n'y en a pas, la recherche ne renvoie rien.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { selectionnerImages } from './galerie';
import { SITE } from './seo';

// L'unique recherche d'images du site : les cartes, les galeries et les pages projet passent toutes par ici.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/projets/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true }
);

export interface Capture {
  src: ImageMetadata;
  /** Nom du fichier (clé de `legendes`), par exemple « 01.png ». */
  fichier: string;
}

/** Captures d'un projet avec leur nom de fichier, dans l'ordre naturel des noms. */
export function capturesDuProjet(id: string): Capture[] {
  return selectionnerImages(Object.keys(modules), id).map((chemin) => ({
    src: modules[chemin].default,
    fichier: chemin.slice(chemin.lastIndexOf('/') + 1),
  }));
}

/** Images d'un projet, dans l'ordre naturel des noms de fichiers. */
export function imagesDuProjet(id: string): ImageMetadata[] {
  return capturesDuProjet(id).map((capture) => capture.src);
}

/** URL absolue de l'image de partage d'un projet (sa première capture, optimisée), ou undefined s'il n'en a pas. */
export async function imagePartage(id: string): Promise<string | undefined> {
  const [premiere] = imagesDuProjet(id);
  if (!premiere) return undefined;
  // JPEG : les aperçus de liens (réseaux sociaux, messageries) lisent mal le WebP
  const optimisee = await getImage({ src: premiere, width: 1200, format: 'jpeg' });
  return new URL(optimisee.src, SITE).href;
}
