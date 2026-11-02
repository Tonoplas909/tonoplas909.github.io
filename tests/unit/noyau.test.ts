import { describe, expect, it } from 'vitest';
import {
  ARETES,
  GABARITS,
  NOEUDS,
  POSITIONS,
  balancement,
  calculerScene,
  filDeFer,
  orienter,
  orientationVers,
  placerNoeud,
  projeter,
} from '../../src/lib/noyau';
import { SECTIONS } from '../../src/lib/routes';

/** Nombre de segments d'un chemin SVG fait de `M x y L x y` successifs. */
const segments = (d: string) => (d.match(/M/g) ?? []).length;

describe('icosaèdre', () => {
  it('a 30 arêtes, chacune bordée par deux faces', () => {
    expect(ARETES).toHaveLength(30);
    for (const arete of ARETES) expect(arete.faces).toHaveLength(2);
  });

  it('range chaque arête une fois, devant ou derrière, quelle que soit l’orientation', () => {
    for (const yaw of [-1.2, -0.4, 0, 0.3, 1.1]) {
      for (const pitch of [-0.5, 0, 0.4]) {
        const { avant, arriere } = filDeFer(GABARITS.large, { yaw, pitch });
        expect(segments(avant) + segments(arriere)).toBe(30);
        // Un solide convexe montre toujours au moins la moitié de ses arêtes, et en cache quelques-unes
        expect(segments(avant)).toBeGreaterThanOrEqual(15);
        expect(segments(arriere)).toBeGreaterThan(0);
      }
    }
  });
});

describe('projection', () => {
  it('grossit ce qui est devant et rapetisse ce qui est derrière', () => {
    const devant = projeter([1, 0, 2], GABARITS.large);
    const derriere = projeter([1, 0, -2], GABARITS.large);
    expect(devant.k).toBeGreaterThan(1);
    expect(derriere.k).toBeLessThan(1);
    expect(devant.x - GABARITS.large.cx).toBeGreaterThan(derriere.x - GABARITS.large.cx);
  });
});

describe('nœuds', () => {
  it('existent pour chaque section, plus le statut', () => {
    expect(NOEUDS).toEqual([...SECTIONS, 'statut']);
    expect(calculerScene(GABARITS.large, { yaw: 0, pitch: 0 }).noeuds.map((n) => n.id)).toEqual(NOEUDS);
  });

  it('sont répartis devant et derrière le noyau', () => {
    const z = NOEUDS.map((id) => POSITIONS[id][2]);
    expect(z.some((valeur) => valeur > 0)).toBe(true);
    expect(z.some((valeur) => valeur < 0)).toBe(true);
  });

  it.each(NOEUDS)('orientationVers(%s) amène le nœud droit devant, au centre', (id) => {
    const v = orienter(POSITIONS[id], orientationVers(id));
    expect(v[0]).toBeCloseTo(0, 6);
    expect(v[1]).toBeCloseTo(0, 6);
    expect(v[2]).toBeGreaterThan(0);
  });

  it('a une profondeur entre 0 et 1, plus grande devant', () => {
    for (const id of NOEUDS) {
      const { profondeur } = placerNoeud(GABARITS.large, { yaw: 0, pitch: 0 }, id);
      expect(profondeur).toBeGreaterThanOrEqual(0);
      expect(profondeur).toBeLessThanOrEqual(1);
    }
    const devant = placerNoeud(GABARITS.large, orientationVers('cv'), 'cv');
    const auRepos = placerNoeud(GABARITS.large, { yaw: 0, pitch: 0 }, 'cv');
    expect(devant.profondeur).toBeGreaterThan(auRepos.profondeur);
  });

  it.each(['large', 'compact'] as const)(
    'restent dans le cadre %s pendant le balancement et le suivi du curseur',
    (nom) => {
      const g = GABARITS[nom];
      for (let yaw = -0.6; yaw <= 0.6; yaw += 0.1) {
        for (const pitch of [-0.35, 0, 0.35]) {
          for (const noeud of calculerScene(g, { yaw, pitch }).noeuds) {
            expect(noeud.x, `${noeud.id} x (yaw ${yaw.toFixed(1)})`).toBeGreaterThan(0);
            expect(noeud.x, `${noeud.id} x (yaw ${yaw.toFixed(1)})`).toBeLessThan(g.largeur);
            expect(noeud.y, `${noeud.id} y (pitch ${pitch})`).toBeGreaterThan(0);
            expect(noeud.y, `${noeud.id} y (pitch ${pitch})`).toBeLessThan(g.hauteur);
          }
        }
      }
    },
  );
});

describe('scène', () => {
  it('relie chaque nœud au noyau : cinq lignes cyan et une ligne orange pour le statut', () => {
    const { liens } = calculerScene(GABARITS.large, { yaw: 0.2, pitch: 0 });
    expect(segments(liens.avant) + segments(liens.arriere)).toBe(5);
    expect(segments(liens.statut)).toBe(1);
  });

  it('balance entre -0,5 et 0,5 radian', () => {
    for (let t = 0; t < 60; t += 0.5) {
      expect(Math.abs(balancement(t))).toBeLessThanOrEqual(0.5);
    }
    expect(balancement(0)).toBe(0);
  });
});
