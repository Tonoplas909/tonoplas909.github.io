import type { Lang } from '../data/types';

export const ui: Record<Lang, Record<string, string>> = {
  fr: {
    'nav.projets': 'Projets',
    'nav.parcours': 'Parcours',
    'nav.cv': 'CV',
    'nav.contact': 'Contact',
    'lang.switch': 'Voir le site en anglais',
  },
  en: {
    'nav.projets': 'Projects',
    'nav.parcours': 'Background',
    'nav.cv': 'Résumé',
    'nav.contact': 'Contact',
    'lang.switch': 'View the site in French',
  },
};

export function t(lang: Lang, key: string): string {
  const value = ui[lang][key];
  if (value === undefined) {
    throw new Error(`Clé de traduction manquante : « ${key} » (${lang})`);
  }
  return value;
}
