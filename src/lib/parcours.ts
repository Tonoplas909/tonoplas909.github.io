import type { EntreeParcours, Lang } from '../data/types';

const AUJOURDHUI: Record<Lang, string> = { fr: 'auj.', en: 'present' };
const SANS_PERIODE: Record<Lang, string> = { fr: 'Vie associative', en: 'Community' };

// Une fin absente vaut le début (période d'un an) ; `null` désigne une période en cours.
function finEffective(entree: EntreeParcours, debut: number): number {
  if (entree.fin === null) return Number.POSITIVE_INFINITY;
  return entree.fin ?? debut;
}

function comparer(a: EntreeParcours, b: EntreeParcours): number {
  if (a.debut === undefined && b.debut === undefined) return 0;
  if (a.debut === undefined) return 1;
  if (b.debut === undefined) return -1;
  if (a.debut !== b.debut) return b.debut - a.debut;
  const finA = finEffective(a, a.debut);
  const finB = finEffective(b, b.debut);
  if (finA === finB) return 0;
  return finA > finB ? -1 : 1;
}

/** Début décroissant, puis fin décroissante (période en cours d'abord), sans période en dernier. */
export function trierParcours(items: EntreeParcours[]): EntreeParcours[] {
  return [...items].sort(comparer);
}

export function formatPeriode(entree: EntreeParcours, lang: Lang): string {
  if (entree.debut === undefined) return SANS_PERIODE[lang];
  if (entree.fin === null) return `${entree.debut} → ${AUJOURDHUI[lang]}`;
  if (entree.fin === undefined) return `${entree.debut}`;
  return `${entree.debut} → ${entree.fin}`;
}
