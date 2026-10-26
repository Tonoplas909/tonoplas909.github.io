import { describe, expect, it } from 'vitest';
import { parcours } from '../../src/data/parcours';
import type { EntreeParcours } from '../../src/data/types';
import { formatPeriode, trierParcours } from '../../src/lib/parcours';

function entree(partiel: Partial<EntreeParcours>): EntreeParcours {
  return {
    id: 'test',
    type: 'emploi',
    titre: { fr: 'Titre', en: 'Title' },
    ...partiel,
  };
}

describe('formatPeriode', () => {
  it('affiche « auj. » (FR) ou « present » (EN) pour une période en cours', () => {
    const enCours = entree({ debut: 2026, fin: null });
    expect(formatPeriode(enCours, 'fr')).toBe('2026 → auj.');
    expect(formatPeriode(enCours, 'en')).toBe('2026 → present');
  });

  it('affiche début et fin pour une période terminée', () => {
    const terminee = entree({ debut: 2022, fin: 2025 });
    expect(formatPeriode(terminee, 'fr')).toBe('2022 → 2025');
    expect(formatPeriode(terminee, 'en')).toBe('2022 → 2025');
  });

  it("n'affiche que l'année pour une période d'un an", () => {
    const uneAnnee = entree({ debut: 2020 });
    expect(formatPeriode(uneAnnee, 'fr')).toBe('2020');
    expect(formatPeriode(uneAnnee, 'en')).toBe('2020');
  });

  it('affiche une étiquette de vie associative sans début', () => {
    const sansPeriode = entree({ type: 'asso' });
    expect(formatPeriode(sansPeriode, 'fr')).toBe('Vie associative');
    expect(formatPeriode(sansPeriode, 'en')).toBe('Community');
  });
});

describe('trierParcours', () => {
  it('place les entrées datées avant les autres, par début décroissant, sans en perdre', () => {
    const tries = trierParcours(parcours);
    const premiereSansDebut = tries.findIndex((e) => e.debut === undefined);

    expect(tries.map((e) => e.id).sort()).toEqual(parcours.map((e) => e.id).sort());
    // Aucune entrée datée après la première entrée sans début
    if (premiereSansDebut !== -1) {
      expect(tries.slice(premiereSansDebut).every((e) => e.debut === undefined)).toBe(true);
    }
    const debuts = tries.flatMap((e) => (e.debut === undefined ? [] : [e.debut]));
    expect(debuts).toEqual([...debuts].sort((a, b) => b - a));
  });

  it("ne modifie pas le tableau reçu", () => {
    const idsAvant = parcours.map((e) => e.id);
    const copieAvant = structuredClone(parcours);
    trierParcours(parcours);
    expect(parcours.map((e) => e.id)).toEqual(idsAvant);
    expect(parcours).toEqual(copieAvant);
  });

  it('place une période en cours avant une période terminée de même début', () => {
    const items = [
      entree({ id: 'termine', debut: 2024, fin: 2025 }),
      entree({ id: 'en-cours', debut: 2024, fin: null }),
    ];
    expect(trierParcours(items).map((e) => e.id)).toEqual(['en-cours', 'termine']);
  });

  it('compte une fin absente comme égale au début', () => {
    const items = [
      entree({ id: 'annee', debut: 2024 }),
      entree({ id: 'longue', debut: 2024, fin: 2026 }),
      entree({ id: 'courte', debut: 2024, fin: 2024 }),
    ];
    expect(trierParcours(items).map((e) => e.id)).toEqual(['longue', 'annee', 'courte']);
  });

  it('place les entrées sans début en dernier, quel que soit leur rang de départ', () => {
    const items = [
      entree({ id: 'sans-periode' }),
      entree({ id: 'ancien', debut: 2019 }),
      entree({ id: 'recent', debut: 2026, fin: null }),
    ];
    expect(trierParcours(items).map((e) => e.id)).toEqual([
      'recent',
      'ancien',
      'sans-periode',
    ]);
  });

  it('est stable pour les entrées à périodes identiques', () => {
    const items = [
      entree({ id: 'a', debut: 2023, fin: 2024 }),
      entree({ id: 'b', debut: 2023, fin: 2024 }),
      entree({ id: 'c', debut: 2023, fin: 2024 }),
      entree({ id: 'x' }),
      entree({ id: 'y' }),
    ];
    expect(trierParcours(items).map((e) => e.id)).toEqual(['a', 'b', 'c', 'x', 'y']);
  });
});
