import { describe, expect, it } from 'vitest';
import { assembleEmail, spellEmail } from '../../src/lib/email';

const email = { local: 'matis.nico123', domain: 'gmail.com' };

describe('assembleEmail', () => {
  it('assemble la partie locale et le domaine', () => {
    expect(assembleEmail(email)).toBe('matis.nico123@gmail.com');
  });
});

describe('spellEmail', () => {
  it('épelle l’adresse en français', () => {
    expect(spellEmail(email, 'fr')).toBe('matis.nico123 (arobase) gmail (point) com');
  });

  it('épelle l’adresse en anglais', () => {
    expect(spellEmail(email, 'en')).toBe('matis.nico123 (at) gmail (dot) com');
  });

  it('ne contient jamais l’adresse complète', () => {
    for (const lang of ['fr', 'en'] as const) {
      expect(spellEmail(email, lang)).not.toContain(assembleEmail(email));
    }
  });
});
