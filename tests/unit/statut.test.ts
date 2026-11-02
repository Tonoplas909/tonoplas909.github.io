import { describe, expect, it } from 'vitest';
import { remplir } from '../../src/i18n/ui';
import { statut } from '../../src/lib/statut';

describe('remplir', () => {
  it('remplace les variables connues et laisse les autres', () => {
    expect(remplir('{n} projets, dont {j} jouables', { n: 8, j: 6 })).toBe('8 projets, dont 6 jouables');
    expect(remplir('{n} et {inconnue}', { n: 1 })).toBe('1 et {inconnue}');
  });
});

describe('statut', () => {
  const enAlternance = { disponible: false, finAlternance: { annee: 2028, mois: 9 } };

  it('annonce l’indisponibilité avec la fin de l’alternance, en français', () => {
    const s = statut('fr', enAlternance);
    expect(s.disponible).toBe(false);
    expect(s.titre).toBe('Indisponible');
    expect(s.court).toBe("En alternance jusqu'en sept. 2028");
    expect(s.detail).toBe("En alternance chez Eng'IT, en M1 MIAGE, jusqu'en septembre 2028.");
    expect(s.echeance).toBe('09 · 2028');
  });

  it('fait de même en anglais', () => {
    const s = statut('en', enAlternance);
    expect(s.titre).toBe('Unavailable');
    expect(s.court).toBe('Work-study until Sept 2028');
    expect(s.detail).toContain('September 2028');
  });

  it('annonce la disponibilité sans échéance', () => {
    const s = statut('fr', { disponible: true });
    expect(s.titre).toBe('Disponible');
    expect(s.echeance).toBeUndefined();
  });
});
