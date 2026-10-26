import type { Lang, Projet } from '../../../src/data/types';
import { t } from '../../../src/i18n/ui';

/** Libellé du lien vers la démo : « Jouer » pour un jeu, « Voir le site » pour un projet associatif. */
export function libelleDemo(lang: Lang, projet: Projet): string {
  return t(lang, projet.categorie === 'jeu' ? 'projets.jouer' : 'projets.voirSite');
}
