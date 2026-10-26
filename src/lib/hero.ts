import { competences } from '../data/competences';
import { profil } from '../data/profil';
import { projets } from '../data/projets';
import type { Lang } from '../data/types';

export interface LigneProfil {
  key: string;
  value: string | number | string[];
}

/** Lignes du bloc `profil.ts` du hero : calculées à partir des données, jamais écrites en dur. */
export function profilLines(lang: Lang): LigneProfil[] {
  return [
    { key: 'formation', value: profil.formation[lang] },
    { key: 'lieu', value: profil.lieu },
    { key: 'hobbies', value: profil.interets[lang] },
    { key: 'stack', value: competences.slice(0, 4) },
    { key: 'projets', value: projets.length },
  ];
}
