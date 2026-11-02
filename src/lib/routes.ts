// Ce fichier est aussi chargé tel quel par un script Node (retrait natif des types) :
// aucune importation à l'exécution (seulement `import type`) et uniquement de la
// syntaxe TypeScript effaçable (pas d'enum, de propriété de paramètre ni de namespace).
import type { Lang } from '../data/types';

const PREFIXE_EN = 'en';

/** Les pages de section, dans l'ordre de la navigation (et des nœuds du noyau). */
export type SectionId = 'projets' | 'parcours' | 'competences' | 'cv' | 'contact';

export const SECTIONS: readonly SectionId[] = ['projets', 'parcours', 'competences', 'cv', 'contact'];

// Segment d'URL de chaque section, par langue
const SEGMENTS: Record<SectionId, Record<Lang, string>> = {
  projets: { fr: 'projets', en: 'projects' },
  parcours: { fr: 'parcours', en: 'background' },
  competences: { fr: 'competences', en: 'skills' },
  cv: { fr: 'cv', en: 'cv' },
  contact: { fr: 'contact', en: 'contact' },
};

function chemin(lang: Lang, segments: string[]): string {
  const complet = lang === 'en' ? [PREFIXE_EN, ...segments] : segments;
  return complet.length === 0 ? '/' : `/${complet.join('/')}/`;
}

function segmentsDe(pathname: string): string[] {
  return pathname.split('/').filter((segment) => segment !== '');
}

/** La section dont `segment` est le segment d'URL dans la langue donnée, ou undefined. */
function sectionDuSegment(segment: string | undefined, lang: Lang): SectionId | undefined {
  return SECTIONS.find((section) => SEGMENTS[section][lang] === segment);
}

export function langFromPath(pathname: string): Lang {
  return segmentsDe(pathname)[0] === PREFIXE_EN ? 'en' : 'fr';
}

export function homePath(lang: Lang): string {
  return chemin(lang, []);
}

export function sectionPath(lang: Lang, section: SectionId): string {
  return chemin(lang, [SEGMENTS[section][lang]]);
}

export function projectPath(lang: Lang, id: string): string {
  return chemin(lang, [SEGMENTS.projets[lang], id]);
}

export function cvPath(lang: Lang): string {
  return sectionPath(lang, 'cv');
}

/** Numéro affiché d'une section : « 01 » pour les projets, « 05 » pour le contact. */
export function numeroSection(section: SectionId): string {
  return String(SECTIONS.indexOf(section) + 1).padStart(2, '0');
}

/** La section suivante dans l'ordre de la navigation, ou undefined après la dernière. */
export function sectionSuivante(section: SectionId): SectionId | undefined {
  return SECTIONS[SECTIONS.indexOf(section) + 1];
}

/**
 * La section à laquelle appartient une page : la section elle-même, ou « projets » pour une fiche
 * projet. Undefined pour l'accueil et toute page inconnue.
 */
export function sectionFromPath(pathname: string): SectionId | undefined {
  const lang = langFromPath(pathname);
  const segments = segmentsDe(pathname);
  const reste = lang === 'en' ? segments.slice(1) : segments;
  if (reste.length === 1) return sectionDuSegment(reste[0], lang);
  if (reste.length === 2 && reste[0] === SEGMENTS.projets[lang]) return 'projets';
  return undefined;
}

export function equivalentPath(pathname: string, target: Lang): string {
  const current = langFromPath(pathname);
  if (current === target) return pathname;

  const segments = segmentsDe(pathname);
  const reste = current === 'en' ? segments.slice(1) : segments;

  if (reste.length === 0) return homePath(target);
  if (reste.length === 1) {
    const section = sectionDuSegment(reste[0], current);
    if (section) return sectionPath(target, section);
  }
  if (reste.length === 2 && reste[0] === SEGMENTS.projets[current]) {
    return projectPath(target, reste[1]);
  }
  return homePath(target);
}
