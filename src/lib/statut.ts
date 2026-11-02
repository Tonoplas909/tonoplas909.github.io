// Aucune importation d'Astro : ce fichier reste importable depuis les tests Node.
import { profil } from '../data/profil';
import type { Lang } from '../data/types';
import { remplir, t } from '../i18n/ui';

export interface Statut {
  disponible: boolean;
  /** « Indisponible » ou « Disponible ». */
  titre: string;
  /** Une ligne, pour le nœud de l'accueil : « En alternance jusqu'en sept. 2028 ». */
  court: string;
  /** Une phrase complète, pour le parcours et le contact. */
  detail: string;
  /** « 09 · 2028 », ou undefined sans fin d'alternance connue. */
  echeance?: string;
}

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB' };

function mois(lang: Lang, annee: number, numero: number, format: 'long' | 'short'): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { month: format, year: 'numeric', timeZone: 'UTC' }).format(
    Date.UTC(annee, numero - 1, 1),
  );
}

/** Le statut affiché, calculé à partir de `profil.statut`. */
export function statut(lang: Lang, source = profil.statut): Statut {
  const fin = source.finAlternance;
  if (source.disponible || !fin) {
    const detail = source.disponible ? t(lang, 'statut.disponible.detail') : t(lang, 'statut.ouvert');
    return {
      disponible: source.disponible,
      titre: t(lang, source.disponible ? 'statut.disponible' : 'statut.indisponible'),
      court: detail,
      detail,
    };
  }
  return {
    disponible: false,
    titre: t(lang, 'statut.indisponible'),
    court: remplir(t(lang, 'statut.court'), { date: mois(lang, fin.annee, fin.mois, 'short') }),
    detail: remplir(t(lang, 'statut.detail'), { date: mois(lang, fin.annee, fin.mois, 'long') }),
    echeance: `${String(fin.mois).padStart(2, '0')} · ${fin.annee}`,
  };
}
