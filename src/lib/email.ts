// Ce fichier est chargé dans le navigateur (script du composant Contact) et au build :
// aucune importation à l'exécution, seulement `import type`.
import type { Lang } from '../data/types';

export interface EmailParts {
  local: string;
  domain: string;
}

const ARROBASE: Record<Lang, string> = { fr: 'arobase', en: 'at' };
const POINT: Record<Lang, string> = { fr: 'point', en: 'dot' };

/** Assemble l'adresse complète. À n'appeler que dans le navigateur, jamais au build. */
export function assembleEmail({ local, domain }: EmailParts): string {
  return `${local}@${domain}`;
}

/** Version épelée, affichée sans JavaScript : l'adresse complète n'apparaît pas dans le HTML. */
export function spellEmail({ local, domain }: EmailParts, lang: Lang): string {
  return `${local} (${ARROBASE[lang]}) ${domain.split('.').join(` (${POINT[lang]}) `)}`;
}
