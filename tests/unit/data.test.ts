import { existsSync, readdirSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { competences } from '../../src/data/competences';
import { parcours } from '../../src/data/parcours';
import { profil } from '../../src/data/profil';
import { projets } from '../../src/data/projets';
import type { Lang } from '../../src/data/types';

const LANGUES: Lang[] = ['fr', 'en'];

function trouver(id: string) {
  const projet = projets.find((p) => p.id === id);
  if (!projet) throw new Error(`Projet introuvable : ${id}`);
  return projet;
}

describe('projets', () => {
  it("respectent l'ordre d'affichage de la spec", () => {
    expect(projets.map((p) => p.id)).toEqual([
      'cafet-miage',
      'drift-club',
      'rallye-club',
      'volley-club',
      'tanks',
      'moto-club',
      'pit-wall',
      'marque',
    ]);
  });

  it('ont des identifiants uniques', () => {
    expect(new Set(projets.map((p) => p.id)).size).toBe(projets.length);
  });

  describe.each(projets.map((p) => [p.id, p] as const))('%s', (_id, projet) => {
    it('a un titre non vide', () => {
      expect(projet.titre.trim()).not.toBe('');
    });

    it.each(LANGUES)('a un résumé, une description et des points en %s', (lang) => {
      expect(projet.resume[lang].trim()).not.toBe('');
      expect(projet.description[lang].length).toBeGreaterThanOrEqual(2);
      expect(projet.description[lang].length).toBeLessThanOrEqual(3);
      for (const paragraphe of projet.description[lang]) {
        expect(paragraphe.trim()).not.toBe('');
      }
      expect(projet.points[lang].length).toBeGreaterThanOrEqual(3);
      for (const point of projet.points[lang]) {
        expect(point.trim()).not.toBe('');
      }
    });

    it('a une stack non vide', () => {
      expect(projet.stack.length).toBeGreaterThanOrEqual(1);
    });

    it('a des liens valides', () => {
      expect(projet.liens.code).toMatch(/^https:\/\/github\.com\/Tonoplas909\/[\w-]+$/);
      if (projet.liens.demo !== undefined) {
        expect(projet.liens.demo).toMatch(/^https:\/\/tonoplas909\.github\.io\/[\w-]+\/$/);
      }
    });

    it('a des liens construits à partir du nom du dépôt', () => {
      expect(projet.liens.code).toBe(`https://github.com/Tonoplas909/${projet.depot}`);
      if (projet.liens.demo !== undefined) {
        expect(projet.liens.demo).toBe(`https://tonoplas909.github.io/${projet.depot}/`);
      }
    });
  });

  it("n'ont pas de démo pour volley-club et cafet-miage (spec 5.2 et 5.4)", () => {
    expect(trouver('volley-club').liens.demo).toBeUndefined();
    expect(trouver('cafet-miage').liens.demo).toBeUndefined();
  });

  it('classent cafet-miage en asso avec un badge, et les 7 autres en jeu', () => {
    const cafet = trouver('cafet-miage');
    expect(cafet.categorie).toBe('asso');
    expect(cafet.badge).toBeDefined();
    expect(cafet.badge?.fr.trim()).not.toBe('');
    expect(cafet.badge?.en.trim()).not.toBe('');

    const autres = projets.filter((p) => p.id !== 'cafet-miage');
    expect(autres).toHaveLength(7);
    for (const projet of autres) {
      expect(projet.categorie).toBe('jeu');
    }
  });

  it('ne mettent en vedette que cafet-miage et drift-club', () => {
    expect(projets.filter((p) => p.vedette === true).map((p) => p.id)).toEqual([
      'cafet-miage',
      'drift-club',
    ]);
  });

  it("n'ont un dossier de captures que pour un projet existant", () => {
    const racine = new URL('../../src/assets/projets/', import.meta.url);
    if (!existsSync(racine)) return;
    const ids = projets.map((p) => p.id);
    const dossiers = readdirSync(racine).filter((nom) =>
      statSync(new URL(`${nom}/`, racine)).isDirectory(),
    );
    for (const dossier of dossiers) {
      expect(ids).toContain(dossier);
    }
  });
});

describe('competences', () => {
  it('suivent la liste de la spec', () => {
    expect(competences).toEqual([
      'Python',
      'Vue.js',
      'Angular',
      'TypeScript',
      'React',
      'Java',
      'SQL',
      'Supabase',
      'Three.js',
    ]);
  });
});

describe('profil', () => {
  it('porte les liens publics attendus', () => {
    expect(profil.liens).toEqual({
      github: 'https://github.com/Tonoplas909',
      linkedin: 'https://www.linkedin.com/in/matis-demore-31609a267/',
    });
  });

  it("stocke l'e-mail en deux morceaux", () => {
    expect(profil.email).toEqual({ local: 'matis.nico123', domain: 'gmail.com' });
  });

  it('ne contient aucune donnée personnelle sensible', () => {
    const json = JSON.stringify(profil);
    expect(json).not.toMatch(/"(?:tel|phone|naissance)"/);
    expect(json).not.toMatch(/(?:\+33|0)\s?[67](?:[\s.-]?\d{2}){4}/);
  });

  it('a un intitulé, une formation et un objectif dans les deux langues', () => {
    for (const lang of LANGUES) {
      expect(profil.intitule[lang].trim()).not.toBe('');
      expect(profil.formation[lang].trim()).not.toBe('');
      expect(profil.objectif[lang].trim()).not.toBe('');
      expect(profil.langues[lang].length).toBeGreaterThan(0);
      expect(profil.interets[lang].length).toBeGreaterThan(0);
    }
  });
});

describe('parcours', () => {
  it('compte 11 entrées aux identifiants uniques', () => {
    expect(parcours).toHaveLength(11);
    expect(new Set(parcours.map((e) => e.id)).size).toBe(11);
  });

  it('a un titre non vide en FR et en EN pour chaque entrée', () => {
    for (const entree of parcours) {
      expect(entree.titre.fr.trim(), entree.id).not.toBe('');
      expect(entree.titre.en.trim(), entree.id).not.toBe('');
    }
  });

  it("n'invente aucun détail pour Flunch (poste inconnu)", () => {
    expect(parcours.find((e) => e.id === 'flunch')?.detail).toBeUndefined();
  });

  it('décrit Eng-IT comme une ESN à Sophia-Antipolis', () => {
    expect(parcours.find((e) => e.id === 'eng-it')?.detail?.fr).toBe('ESN à Sophia-Antipolis');
  });
});
