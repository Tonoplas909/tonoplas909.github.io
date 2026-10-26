import type { Lang } from '../data/types';

export const ui: Record<Lang, Record<string, string>> = {
  fr: {
    'nav.projets': 'Projets',
    'nav.parcours': 'Parcours',
    'nav.cv': 'CV',
    'nav.contact': 'Contact',
    'lang.switch': 'Voir le site en anglais',
    'accueil.titre': 'Matis Demore · Développeur fullstack',
    'accueil.description':
      'Portfolio et CV de Matis Demore, développeur fullstack en M1 MIAGE (parcours NumRes) à Sophia-Antipolis : applications web et jeux 3D dans le navigateur.',
    'hero.statut': 'M1 MIAGE · parcours NumRes · Sophia-Antipolis',
    'hero.accroche':
      "Développeur fullstack. Je construis des applications web, de l'API à l'interface, et des jeux 3D qui tournent dans le navigateur.",
    'hero.voirProjets': 'Voir les projets',
    'hero.telechargerCv': 'Télécharger le CV (PDF)',
    'competences.titre': '// compétences',
    'projets.titre': 'Projets',
    'parcours.titre': 'Parcours',
    'cv.titre': 'Le CV, en une page',
    'cv.texte': 'Version française et anglaise, à jour avec ce site.',
    'cv.fr': 'CV en français (PDF)',
    'cv.en': 'CV in English (PDF)',
  },
  en: {
    'nav.projets': 'Projects',
    'nav.parcours': 'Background',
    'nav.cv': 'Résumé',
    'nav.contact': 'Contact',
    'lang.switch': 'View the site in French',
    'accueil.titre': 'Matis Demore · Full-stack developer',
    'accueil.description':
      "Portfolio and résumé of Matis Demore, full-stack developer in the first year of the MIAGE master's (NumRes track) in Sophia-Antipolis: web applications and 3D games in the browser.",
    'hero.statut': 'M1 MIAGE · NumRes track · Sophia-Antipolis',
    'hero.accroche':
      'Full-stack developer. I build web applications, from the API to the interface, and 3D games that run in the browser.',
    'hero.voirProjets': 'See the projects',
    'hero.telechargerCv': 'Download the résumé (PDF)',
    'competences.titre': '// skills',
    'projets.titre': 'Projects',
    'parcours.titre': 'Background',
    'cv.titre': 'My résumé, on one page',
    'cv.texte': 'French and English versions, kept up to date with this site.',
    'cv.fr': 'Résumé in French (PDF)',
    'cv.en': 'Résumé in English (PDF)',
  },
};

export function t(lang: Lang, key: string): string {
  const value = ui[lang][key];
  if (value === undefined) {
    throw new Error(`Clé de traduction manquante : « ${key} » (${lang})`);
  }
  return value;
}
