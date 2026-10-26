import { describe, expect, it } from 'vitest';
import { projets } from '../../src/data/projets';
import { FILTRES, filtrerProjets, formaterCompte } from '../../src/lib/filtre';

describe('filtrerProjets', () => {
  it('« tous » renvoie tous les projets dans l’ordre d’origine', () => {
    const resultat = filtrerProjets(projets, 'tous');

    expect(resultat).toHaveLength(projets.length);
    expect(resultat.map((p) => p.id)).toEqual(projets.map((p) => p.id));
  });

  it('« tous » renvoie une nouvelle liste, sans toucher à l’originale', () => {
    const resultat = filtrerProjets(projets, 'tous');

    expect(resultat).not.toBe(projets);
  });

  it('« jeu » renvoie les jeux, dans l’ordre d’origine', () => {
    const resultat = filtrerProjets(projets, 'jeu');

    expect(resultat.map((p) => p.id)).toEqual(
      projets.filter((p) => p.categorie === 'jeu').map((p) => p.id),
    );
    expect(resultat.every((p) => p.categorie === 'jeu')).toBe(true);
  });

  it('« asso » renvoie les projets associatifs, dans l’ordre d’origine', () => {
    const resultat = filtrerProjets(projets, 'asso');

    expect(resultat.map((p) => p.id)).toEqual(
      projets.filter((p) => p.categorie === 'asso').map((p) => p.id),
    );
    expect(resultat.every((p) => p.categorie === 'asso')).toBe(true);
  });

  it('« jeu » et « asso » se partagent les projets sans en perdre ni en compter deux fois', () => {
    const jeux = filtrerProjets(projets, 'jeu');
    const assos = filtrerProjets(projets, 'asso');

    expect(jeux.length + assos.length).toBe(projets.length);
  });

  it('s’applique à de simples enregistrements { categorie } (cartes lues dans le DOM)', () => {
    const cartes = [
      { categorie: 'jeu' as const, id: 'a' },
      { categorie: 'asso' as const, id: 'b' },
      { categorie: 'jeu' as const, id: 'c' },
    ];

    expect(filtrerProjets(cartes, 'jeu').map((c) => c.id)).toEqual(['a', 'c']);
    expect(filtrerProjets(cartes, 'asso').map((c) => c.id)).toEqual(['b']);
  });
});

describe('FILTRES', () => {
  it('liste « tous », « jeu » et « asso » dans l’ordre des boutons', () => {
    expect(FILTRES).toEqual(['tous', 'jeu', 'asso']);
  });
});

describe('formaterCompte', () => {
  const modeles = {
    fr: { one: '{n} projet', other: '{n} projets' },
    en: { one: '{n} project', other: '{n} projects' },
  };

  it.each([
    ['fr', 1, '1 projet'],
    ['fr', 7, '7 projets'],
    ['fr', 8, '8 projets'],
    ['en', 1, '1 project'],
    ['en', 7, '7 projects'],
    ['en', 8, '8 projects'],
  ] as const)('en %s avec %i : « %s »', (lang, n, attendu) => {
    expect(formaterCompte(n, lang, modeles[lang])).toBe(attendu);
  });

  it('suit la règle de chaque langue pour zéro (singulier en français, pluriel en anglais)', () => {
    expect(formaterCompte(0, 'fr', modeles.fr)).toBe('0 projet');
    expect(formaterCompte(0, 'en', modeles.en)).toBe('0 projects');
  });
});
