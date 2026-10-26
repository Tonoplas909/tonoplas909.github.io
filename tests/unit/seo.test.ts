import { describe, expect, it } from 'vitest';
import { profil } from '../../src/data/profil';
import { SITE, alternates, personJsonLd } from '../../src/lib/seo';

describe('SITE', () => {
  it("est l'URL publique du site, sans barre finale", () => {
    expect(SITE).toBe('https://tonoplas909.github.io');
  });
});

describe('alternates', () => {
  const accueil = [
    { hreflang: 'fr', href: 'https://tonoplas909.github.io/' },
    { hreflang: 'en', href: 'https://tonoplas909.github.io/en/' },
    { hreflang: 'x-default', href: 'https://tonoplas909.github.io/' },
  ];

  it("donne les alternatives FR, EN et x-default d'une page projet française", () => {
    expect(alternates('/projets/drift-club/')).toEqual([
      { hreflang: 'fr', href: 'https://tonoplas909.github.io/projets/drift-club/' },
      { hreflang: 'en', href: 'https://tonoplas909.github.io/en/projects/drift-club/' },
      { hreflang: 'x-default', href: 'https://tonoplas909.github.io/projets/drift-club/' },
    ]);
  });

  it('renvoie les mêmes alternatives pour l’accueil, quelle que soit la langue de la page', () => {
    expect(alternates('/')).toEqual(accueil);
    expect(alternates('/en/')).toEqual(accueil);
  });

  it("donne les alternatives d'une page projet anglaise", () => {
    expect(alternates('/en/projects/drift-club/')).toEqual([
      { hreflang: 'fr', href: 'https://tonoplas909.github.io/projets/drift-club/' },
      { hreflang: 'en', href: 'https://tonoplas909.github.io/en/projects/drift-club/' },
      { hreflang: 'x-default', href: 'https://tonoplas909.github.io/projets/drift-club/' },
    ]);
  });
});

describe('personJsonLd', () => {
  const donnees = personJsonLd(profil);

  it('décrit une personne schema.org', () => {
    expect(donnees['@context']).toBe('https://schema.org');
    expect(donnees['@type']).toBe('Person');
    expect(donnees.name).toBe('Matis Demore');
  });

  it('liste GitHub et LinkedIn dans sameAs', () => {
    expect(donnees.sameAs).toEqual([profil.liens.github, profil.liens.linkedin]);
  });

  it("ne contient jamais l'adresse e-mail", () => {
    const json = JSON.stringify(donnees);
    expect(json).not.toMatch(/@gmail/);
    expect(json).not.toContain(profil.email.local);
  });
});
