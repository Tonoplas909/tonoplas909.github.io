import { describe, expect, it } from 'vitest';
import { competences } from '../../src/data/competences';
import { projets } from '../../src/data/projets';
import { profilLines } from '../../src/lib/hero';

function ligne(lang: 'fr' | 'en', key: string) {
  const trouvee = profilLines(lang).find((l) => l.key === key);
  if (!trouvee) throw new Error(`Ligne introuvable : ${key}`);
  return trouvee;
}

describe('profilLines', () => {
  it.each(['fr', 'en'] as const)('donne les clés dans l’ordre en %s', (lang) => {
    expect(profilLines(lang).map((l) => l.key)).toEqual([
      'formation',
      'lieu',
      'stack',
      'projets',
      'cap',
    ]);
  });

  it('calcule le nombre de projets à partir des données', () => {
    expect(ligne('fr', 'projets').value).toBe(projets.length);
    expect(ligne('en', 'projets').value).toBe(projets.length);
  });

  it('prend les quatre premières compétences pour la stack', () => {
    expect(ligne('fr', 'stack').value).toEqual(competences.slice(0, 4));
    expect(ligne('en', 'stack').value).toEqual(competences.slice(0, 4));
  });

  it('traduit le cap', () => {
    expect(ligne('fr', 'cap').value).toBe('premier CDI');
    expect(ligne('en', 'cap').value).toBe('first permanent role');
  });
});
