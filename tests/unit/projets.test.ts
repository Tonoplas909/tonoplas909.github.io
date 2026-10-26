import { describe, expect, it } from 'vitest';
import { projets } from '../../src/data/projets';
import { projetParId, voisins } from '../../src/lib/projets';

describe('voisins', () => {
  it('donne le projet précédent et le suivant dans l’ordre des données', () => {
    const { prev, next } = voisins('drift-club');

    expect(prev.id).toBe('cafet-miage');
    expect(next.id).toBe('rallye-club');
  });

  it('boucle au début : le précédent du premier projet est le dernier', () => {
    expect(voisins('cafet-miage').prev.id).toBe('marque');
  });

  it('boucle à la fin : le suivant du dernier projet est le premier', () => {
    expect(voisins('marque').next.id).toBe('cafet-miage');
  });

  it('renvoie les projets eux-mêmes (pas des copies partielles)', () => {
    const { prev, next } = voisins('tanks');

    expect(prev).toBe(projetParId('volley-club'));
    expect(next).toBe(projetParId('moto-club'));
  });

  it('forme un cycle complet sur les 8 projets, dans les deux sens', () => {
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
    expect(projetParId('tanks').titre).toBe('Tanks!');
  });

  it('lève une erreur pour un id inconnu', () => {
    expect(() => projetParId('inconnu')).toThrow(/inconnu/);
  });
});
