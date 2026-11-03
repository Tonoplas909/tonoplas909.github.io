// Géométrie de la scène de l'accueil (spec 2026-11-02 §3) : un icosaèdre en fil de fer, deux anneaux,
// une grille au sol et des nœuds placés en 3D, projetés en perspective sur un plan.
// Aucune dépendance : le serveur s'en sert pour le rendu initial, le navigateur pour l'animation,
// Vitest pour les tests. Les chemins renvoyés sont des attributs `d` de <path> SVG.

export type Vec3 = readonly [number, number, number];

/** Orientation de la scène, en radians : lacet (autour de la verticale) et tangage. */
export interface Orientation {
  yaw: number;
  pitch: number;
}

/** Cadre de rendu : taille du plan, centre du noyau, échelle des unités 3D en unités du plan. */
export interface Gabarit {
  largeur: number;
  hauteur: number;
  cx: number;
  cy: number;
  echelle: number;
  /** Les nœuds sont rapprochés du noyau d'autant (le gabarit compact manque de largeur). */
  echelleNoeuds: number;
}

export const GABARITS = {
  large: { largeur: 1200, hauteur: 760, cx: 600, cy: 350, echelle: 76, echelleNoeuds: 1 },
  compact: { largeur: 400, hauteur: 440, cx: 200, cy: 215, echelle: 44, echelleNoeuds: 0.9 },
  // Le noyau en arrière-plan des pages de section, en haut à droite
  fond: { largeur: 640, hauteur: 560, cx: 390, cy: 230, echelle: 60, echelleNoeuds: 0.95 },
} as const satisfies Record<string, Gabarit>;

export type NomGabarit = keyof typeof GABARITS;

/** Distance de la caméra : plus elle est courte, plus la perspective est forte. */
const DISTANCE = 8;
/** Rayon de la sphère sur laquelle les lignes des nœuds s'accrochent au noyau. */
const RAYON_ANCRAGE = 1.95;
/** Hauteur du sol, sous le noyau. */
const SOL_Y = 2.9;
/** Inclinaison de repos du noyau, pour qu'on le voie un peu par-dessus. */
const TANGAGE_NOYAU = -0.35;

// Icosaèdre régulier : 12 sommets, 20 faces, 30 arêtes
const PHI = (1 + Math.sqrt(5)) / 2;
const SOMMETS: Vec3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

interface Arete {
  a: number;
  b: number;
  faces: number[];
}

/** Les 30 arêtes, chacune avec les deux faces qui la bordent. */
export const ARETES: Arete[] = (() => {
  const parCle = new Map<string, Arete>();
  FACES.forEach((face, indexFace) => {
    for (let i = 0; i < 3; i++) {
      const a = Math.min(face[i], face[(i + 1) % 3]);
      const b = Math.max(face[i], face[(i + 1) % 3]);
      const cle = `${a}-${b}`;
      const arete = parCle.get(cle) ?? { a, b, faces: [] };
      arete.faces.push(indexFace);
      parCle.set(cle, arete);
    }
  });
  return [...parCle.values()];
})();

function rotY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function rotX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

/** Applique l'orientation : lacet puis tangage. */
export function orienter(v: Vec3, o: Orientation): Vec3 {
  return rotX(rotY(v, o.yaw), o.pitch);
}

/** Point projeté : coordonnées sur le plan et facteur de perspective `k` (plus grand devant). */
export interface Projete {
  x: number;
  y: number;
  k: number;
}

export function projeter(v: Vec3, g: Gabarit, echelle = g.echelle): Projete {
  const k = DISTANCE / (DISTANCE - v[2]);
  return { x: g.cx + echelle * v[0] * k, y: g.cy + echelle * v[1] * k, k };
}

const f = (n: number): string => n.toFixed(1);
const segment = (p: Projete, q: Projete): string => `M${f(p.x)} ${f(p.y)}L${f(q.x)} ${f(q.y)}`;
export const cercle = (p: Projete, r: number): string =>
  `M${f(p.x - r)} ${f(p.y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export interface FilDeFer {
  avant: string;
  arriere: string;
  /** Petits disques sur les sommets tournés vers la caméra. */
  sommets: string;
}

/** Icosaèdre de rayon `taille` (en unités de l'échelle), arêtes cachées séparées des arêtes visibles. */
export function filDeFer(g: Gabarit, o: Orientation, taille = 1, rayonSommet = 2.6): FilDeFer {
  const tournes = SOMMETS.map((v) => orienter(v, o));
  // Une face est visible si sa normale extérieure pointe vers la caméra (z positif)
  const visibles = FACES.map(([ia, ib, ic]) => {
    const [a, b, c] = [tournes[ia], tournes[ib], tournes[ic]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const centre = [a[0] + b[0] + c[0], a[1] + b[1] + c[1], a[2] + b[2] + c[2]];
    const versExterieur = n[0] * centre[0] + n[1] * centre[1] + n[2] * centre[2] >= 0 ? 1 : -1;
    return n[2] * versExterieur > 0;
  });
  const projetes = tournes.map((v) => projeter(v, g, g.echelle * taille));

  let avant = '';
  let arriere = '';
  for (const arete of ARETES) {
    const trace = segment(projetes[arete.a], projetes[arete.b]);
    if (arete.faces.some((face) => visibles[face])) avant += trace;
    else arriere += trace;
  }
  let sommets = '';
  tournes.forEach((v, i) => {
    if (v[2] > 0.2) sommets += cercle(projetes[i], rayonSommet);
  });
  return { avant, arriere, sommets };
}

export interface Anneau {
  avant: string;
  arriere: string;
}

/** Cercle de rayon `rayon` incliné de `inclinaison`, décalé de `decalage` en lacet, coupé devant/derrière. */
export function anneau(g: Gabarit, o: Orientation, rayon: number, inclinaison: number, decalage: number): Anneau {
  const pas = 96;
  let avant = '';
  let arriere = '';
  let precedent: { p: Projete; z: number } | undefined;
  for (let i = 0; i <= pas; i++) {
    const angle = (i / pas) * Math.PI * 2;
    const v = orienter(rotX([Math.cos(angle) * rayon, 0, Math.sin(angle) * rayon], inclinaison), {
      yaw: o.yaw + decalage,
      pitch: o.pitch,
    });
    const courant = { p: projeter(v, g), z: v[2] };
    if (precedent) {
      const trace = segment(precedent.p, courant.p);
      if (precedent.z + courant.z > 0) avant += trace;
      else arriere += trace;
    }
    precedent = courant;
  }
  return { avant, arriere };
}

/** Grille du sol, fixe : des lignes vers le fond et des lignes en travers. */
export function grille(g: Gabarit): string {
  let trace = '';
  for (let x = -9.6; x <= 9.61; x += 1.6) {
    trace += segment(projeter([x, SOL_Y, -9], g), projeter([x, SOL_Y, 3.2], g));
  }
  for (const z of [-9, -6.5, -4.5, -2.8, -1.4, -0.2, 0.9, 1.9, 2.8]) {
    trace += segment(projeter([-14, SOL_Y, z], g), projeter([14, SOL_Y, z], g));
  }
  return trace;
}

/** Position au sol, sous le noyau : centre de l'ombre et pied du fil à plomb. */
export function ombre(g: Gabarit): Projete {
  return projeter([0, SOL_Y, 0], g);
}

/** Les nœuds de l'accueil : les cinq sections, puis le statut. */
export type NoeudId = 'projets' | 'parcours' | 'competences' | 'cv' | 'contact' | 'statut';

/** Position 3D de chaque nœud autour du noyau : devant, derrière, sur les côtés. */
export const POSITIONS: Record<NoeudId, Vec3> = {
  projets: [3.0, -1.3, 1.2],
  parcours: [-3.1, -1.0, -1.4],
  competences: [-2.4, 1.2, 1.9],
  cv: [2.2, 1.6, -2.4],
  contact: [-0.6, -2.3, -2.6],
  statut: [1.2, 2.0, 2.6],
};

export const NOEUDS: readonly NoeudId[] = ['projets', 'parcours', 'competences', 'cv', 'contact', 'statut'];

export interface PlacementNoeud {
  id: NoeudId;
  x: number;
  y: number;
  /** Profondeur après rotation : positive devant le noyau. */
  z: number;
  /** 0 au fond, 1 tout devant : pilote la taille, l'opacité et le halo. */
  profondeur: number;
  /** Point d'accroche de la ligne sur le noyau. */
  ancre: Projete;
}

export function placerNoeud(g: Gabarit, o: Orientation, id: NoeudId): PlacementNoeud {
  const v = orienter(POSITIONS[id], o);
  const p = projeter(v, g, g.echelle * g.echelleNoeuds);
  const longueur = Math.hypot(v[0], v[1], v[2]);
  const a: Vec3 = [
    (v[0] * RAYON_ANCRAGE) / longueur,
    (v[1] * RAYON_ANCRAGE) / longueur,
    (v[2] * RAYON_ANCRAGE) / longueur,
  ];
  const profondeur = Math.max(0, Math.min(1, (p.k - 0.72) / 0.85));
  return { id, x: p.x, y: p.y, z: v[2], profondeur, ancre: projeter(a, g) };
}

/** L'orientation qui amène un nœud droit devant la caméra, au centre de l'image. */
export function orientationVers(id: NoeudId): Orientation {
  const [x, y, z] = POSITIONS[id];
  return { yaw: Math.atan2(-x, z), pitch: Math.atan2(y, Math.hypot(x, z)) };
}

/** Tout ce qui bouge : à recalculer à chaque image de l'animation. */
export interface Scene {
  noyau: FilDeFer;
  interieur: FilDeFer;
  anneaux: Anneau;
  /** Lignes des nœuds, séparées : devant, derrière, et celle du statut (orange). */
  liens: { avant: string; arriere: string; statut: string };
  ancres: string;
  noeuds: PlacementNoeud[];
}

export function calculerScene(g: Gabarit, o: Orientation): Scene {
  const noyau = filDeFer(g, { yaw: o.yaw, pitch: TANGAGE_NOYAU + o.pitch }, 1, g.echelle / 32);
  // Le petit noyau intérieur tourne en sens inverse, plus vite : il donne du relief à l'ensemble
  const interieur = filDeFer(g, { yaw: -o.yaw * 1.8, pitch: 0.6 - o.pitch * 1.5 }, 0.42, 0);
  const premier = anneau(g, o, 2.55, 0.32, 0);
  const second = anneau(g, o, 3.05, -1.12, 0.8);
  const noeuds = NOEUDS.map((id) => placerNoeud(g, o, id));

  const liens = { avant: '', arriere: '', statut: '' };
  let ancres = '';
  for (const noeud of noeuds) {
    const trace = segment(noeud.ancre, { x: noeud.x, y: noeud.y, k: 1 });
    if (noeud.id === 'statut') liens.statut += trace;
    else if (noeud.z > 0) liens.avant += trace;
    else liens.arriere += trace;
    ancres += cercle(noeud.ancre, Math.round(g.echelle / 16) / 2);
  }

  return {
    noyau,
    interieur,
    anneaux: { avant: premier.avant + second.avant, arriere: premier.arriere + second.arriere },
    liens,
    ancres,
    noeuds,
  };
}

/** Balancement automatique, en radians, au temps `t` (secondes) : un aller-retour en une trentaine de secondes. */
export function balancement(t: number): number {
  return 0.5 * Math.sin(t * 0.22);
}

/** Points des nœuds (sans étiquette) : tous ceux qui ne sont pas mis en avant, puis le nœud mis en avant. */
export function pointsNoeuds(scene: Scene, enAvant?: NoeudId): { autres: string; enAvant: string } {
  let autres = '';
  let choisi = '';
  for (const noeud of scene.noeuds) {
    const trace = cercle({ x: noeud.x, y: noeud.y, k: 1 }, Math.round(6 + noeud.profondeur * 8) / 2);
    if (noeud.id === enAvant) choisi += cercle({ x: noeud.x, y: noeud.y, k: 1 }, 7);
    else autres += trace;
  }
  return { autres, enAvant: choisi };
}

/**
 * Ligne qui part du noyau vers le bas à gauche et sort du cadre : sur une page de section, elle relie
 * le noyau du fond au panneau de la page.
 */
export function liaisonVersPanneau(g: Gabarit): string {
  const direction: Vec3 = [-1, 0.55, 0.35];
  const longueur = Math.hypot(...direction);
  const ancre = projeter(
    [(direction[0] * RAYON_ANCRAGE) / longueur, (direction[1] * RAYON_ANCRAGE) / longueur, (direction[2] * RAYON_ANCRAGE) / longueur],
    g,
  );
  return `M${f(ancre.x)} ${f(ancre.y)}L${f(-g.largeur * 0.1)} ${f(g.hauteur * 0.9)}`;
}
