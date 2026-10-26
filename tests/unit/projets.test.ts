import { describe, expect, it } from 'vitest';
import { projets } from '../../src/data/projets';
import { projetParId, voisins } from '../../src/lib/projets';

describe('voisins', () => {
  const premier = projets[0];
  const dernier = projets[projets.length - 1];

  it('donne le projet précédent et le suivant dans l’ordre des données', () => {
    const { prev, next } = voisins(projets[1].id);

    expect(prev.id).toBe(projets[0].id);
    expect(next.id).toBe(projets[2].id);
  });

  it('boucle au début : le précédent du premier projet est le dernier', () => {
    expect(voisins(premier.id).prev.id).toBe(dernier.id);
  });

  it('boucle à la fin : le suivant du dernier projet est le premier', () => {
    expect(voisins(dernier.id).next.id).toBe(premier.id);
  });

  it('renvoie les projets eux-mêmes (pas des copies partielles)', () => {
    const { prev, next } = voisins(projets[1].id);

    expect(prev).toBe(projets[0]);
    expect(next).toBe(projets[2]);
  });

  it('forme un cycle complet sur tous les projets, dans les deux sens', () => {
    let id = projets[0].id;
    const aller: string[] = [];
    for (let i = 0; i < projets.length; i++) {
      aller.push(id);
      id = voisins(id).next.id;
    }
    expect(aller).toEqual(projets.map((projet) => projet.id));
    expect(id).toBe(projets[0].id);

    for (const projet of projets) {
      expect(voisins(voisins(projet.id).next.id).prev.id).toBe(projet.id);
    }
  });

  it('lève une erreur pour un id inconnu', () => {
    expect(() => voisins('inconnu')).toThrow(/inconnu/);
  });
});

describe('projetParId', () => {
  it('renvoie le projet demandé', () => {
    for (const projet of projets) {
      expect(projetParId(projet.id)).toBe(projet);
    }
  });

  it('lève une erreur pour un id inconnu', () => {
    expect(() => projetParId('inconnu')).toThrow(/inconnu/);
  });
});
