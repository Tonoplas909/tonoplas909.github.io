import { describe, expect, it } from 'vitest';
import { t, ui } from '../../src/i18n/ui';

describe('textes de l’interface', () => {
  it('ont exactement les mêmes clés en français et en anglais', () => {
    expect(Object.keys(ui.fr).sort()).toEqual(Object.keys(ui.en).sort());
  });

  it('n’ont aucune valeur vide', () => {
    for (const lang of ['fr', 'en'] as const) {
      for (const [cle, valeur] of Object.entries(ui[lang])) {
        expect(valeur.trim(), `${lang} : ${cle}`).not.toBe('');
      }
    }
  });

  it('t() renvoie le texte de la langue demandée', () => {
    expect(t('fr', 'nav.projets')).toBeTypeOf('string');
    expect(t('fr', 'nav.projets')).not.toBe('');
    expect(t('en', 'nav.projets')).toBeTypeOf('string');
    expect(t('en', 'nav.projets')).not.toBe('');
  });

  it('t() lève une erreur pour une clé inexistante', () => {
    expect(() => t('fr', 'cle.inexistante')).toThrow();
  });
});
