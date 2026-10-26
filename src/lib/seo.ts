// Ce module ne dépend que de `routes.ts` : il reste testable sans Astro.
import type { Lang, Profil } from '../data/types';
import { equivalentPath } from './routes';

export const SITE = 'https://tonoplas909.github.io';

export interface Alternate {
  hreflang: 'fr' | 'en' | 'x-default';
  href: string;
}

// Les trois alternatives de langue d'une page : FR, EN et x-default (le français).
export function alternates(pathname: string): Alternate[] {
  const fr = `${SITE}${equivalentPath(pathname, 'fr')}`;
  const en = `${SITE}${equivalentPath(pathname, 'en')}`;
  return [
    { hreflang: 'fr', href: fr },
    { hreflang: 'en', href: en },
    { hreflang: 'x-default', href: fr },
  ];
}

// Données structurées Person. Volontairement sans e-mail ni aucune donnée privée.
export function personJsonLd(p: Profil, lang: Lang = 'fr'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.nom,
    jobTitle: p.intitule[lang],
    url: `${SITE}/`,
    sameAs: [p.liens.github, p.liens.linkedin],
  };
}
