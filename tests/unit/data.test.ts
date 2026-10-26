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
  // Garde volontaire n° 1 : la liste des projets (ids et ordre d'affichage) est celle de la spec §5.2.
  // Tout le reste des tests se déduit des données et suit seul les ajouts de projet.
  it("respectent la liste et l'ordre d'affichage de la spec (§5.2)", () => {
    expect(
      projets.map((p) => p.id),
      'La liste des projets ne correspond plus à la spec §5.2. Si le changement est voulu (projet ajouté, ' +
        'retiré ou réordonné), mets à jour cette liste, et seulement elle : voir le README, « Ajouter un projet ».',
    ).toEqual([
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

  // Garde volontaire n° 2 : vie privée. Pour lier la démo, supprimer ce test.
  it("ne lie pas la démo de Cafet'MIAGE (spec §5.4)", () => {
    expect(
      trouver('cafet-miage').liens.demo,
      "Cafet'MIAGE n'a volontairement pas de lien vers sa démo (spec §5.4) : la démo publique peut afficher " +
        "les noms réels des membres du staff. Ne la lier qu'après confirmation de Matis ; " +
        'pour la lier, supprimer cette assertion.',
    ).toBeUndefined();
  });

  it('ont une catégorie connue (jeu ou asso), et un badge complet quand il y en a un', () => {
    for (const projet of projets) {
      expect(['jeu', 'asso'], projet.id).toContain(projet.categorie);
      if (projet.badge !== undefined) {
        for (const lang of LANGUES) {
          expect(projet.badge[lang].trim(), `${projet.id} (${lang})`).not.toBe('');
        }
      }
    }
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
  it('forment une liste non vide d’intitulés non vides et sans doublon', () => {
    expect(competences.length).toBeGreaterThan(0);
    for (const competence of competences) {
      expect(competence.trim(), competence).not.toBe('');
    }
    expect(new Set(competences).size).toBe(competences.length);
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
      expect(profil.langues[lang].length).toBeGreaterThan(0);
      expect(profil.interets[lang].length).toBeGreaterThan(0);
    }
  });
});

describe('parcours', () => {
  it('a des entrées aux identifiants uniques', () => {
    expect(parcours.length).toBeGreaterThan(0);
    expect(new Set(parcours.map((e) => e.id)).size).toBe(parcours.length);
  });

  it('a un titre non vide en FR et en EN pour chaque entrée', () => {
    for (const entree of parcours) {
      expect(entree.titre.fr.trim(), entree.id).not.toBe('');
      expect(entree.titre.en.trim(), entree.id).not.toBe('');
    }
  });

  it('a, quand une entrée a un détail, un détail non vide en FR et en EN', () => {
    for (const entree of parcours) {
      if (entree.detail === undefined) continue;
      expect(entree.detail.fr.trim(), `${entree.id} (fr)`).not.toBe('');
      expect(entree.detail.en.trim(), `${entree.id} (en)`).not.toBe('');
    }
  });
});
