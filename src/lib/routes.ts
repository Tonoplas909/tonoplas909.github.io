// Ce fichier est aussi chargé tel quel par un script Node (retrait natif des types) :
// aucune importation à l'exécution (seulement `import type`) et uniquement de la
// syntaxe TypeScript effaçable (pas d'enum, de propriété de paramètre ni de namespace).
import type { Lang } from '../data/types';

const PREFIXE_EN = 'en';
const SEGMENT_PROJET: Record<Lang, string> = { fr: 'projets', en: 'projects' };
const SEGMENT_CV = 'cv';

function chemin(lang: Lang, segments: string[]): string {
  const complet = lang === 'en' ? [PREFIXE_EN, ...segments] : segments;
  return complet.length === 0 ? '/' : `/${complet.join('/')}/`;
}

function segmentsDe(pathname: string): string[] {
  return pathname.split('/').filter((segment) => segment !== '');
}

export function langFromPath(pathname: string): Lang {
  return segmentsDe(pathname)[0] === PREFIXE_EN ? 'en' : 'fr';
}

export function homePath(lang: Lang): string {
  return chemin(lang, []);
}

export function projectPath(lang: Lang, id: string): string {
  return chemin(lang, [SEGMENT_PROJET[lang], id]);
}

export function cvPath(lang: Lang): string {
  return chemin(lang, [SEGMENT_CV]);
}

export function equivalentPath(pathname: string, target: Lang): string {
  const current = langFromPath(pathname);
  if (current === target) return pathname;

  const segments = segmentsDe(pathname);
  const reste = current === 'en' ? segments.slice(1) : segments;

  if (reste.length === 0) return homePath(target);
  if (reste.length === 1 && reste[0] === SEGMENT_CV) return cvPath(target);
  if (reste.length === 2 && reste[0] === SEGMENT_PROJET[current]) {
    return projectPath(target, reste[1]);
  }
  return homePath(target);
}
