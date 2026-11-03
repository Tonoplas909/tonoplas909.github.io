// Image de partage par défaut (Open Graph / Twitter card) : node scripts/build-og.mjs
// Rend une page HTML en ligne de 1200×630 dans le style « Noyau » du site avec Chromium (Playwright)
// et écrit public/og-default.png. Le noyau est dessiné avec les calculs de l'accueil (src/lib/noyau.ts),
// les polices viennent des paquets @fontsource installés (intégrées en base64) : ni police système ni
// réseau. À relancer (npm run build:og) si l'identité ou le nombre de projets change, puis à commiter le PNG.
import { mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
// Modules sans dépendance à l'exécution : Node les charge tels quels (retrait des types).
import { profil } from '../src/data/profil.ts';
import { projets } from '../src/data/projets.ts';
import { NOEUDS, calculerScene, grille } from '../src/lib/noyau.ts';

const LARGEUR = 1200;
const HAUTEUR = 630;
const SORTIE = fileURLToPath(new URL('../public/og-default.png', import.meta.url));

// Couleurs de src/styles/tokens.css
const C = {
  bg: '#06070b',
  surface: '#0b0f15',
  line: '#2a3540',
  text: '#eef3f6',
  text3: '#a9b6c2',
  muted: '#8b98a5',
  accent: '#7cf7ff',
  statut: '#ff7a3d',
};

const POLICES = [
  { famille: 'Syne', poids: 800, paquet: 'syne' },
  { famille: 'Geist Mono', poids: 400, paquet: 'geist-mono' },
  { famille: 'Geist Mono', poids: 500, paquet: 'geist-mono' },
];

async function fontFaces() {
  const regles = await Promise.all(
    POLICES.map(async ({ famille, poids, paquet }) => {
      const url = new URL(
        `../node_modules/@fontsource/${paquet}/files/${paquet}-latin-${poids}-normal.woff2`,
        import.meta.url,
      );
      const base64 = (await readFile(url)).toString('base64');
      return `@font-face { font-family: '${famille}'; font-weight: ${poids}; font-style: normal; src: url(data:font/woff2;base64,${base64}) format('woff2'); }`;
    }),
  );
  return regles.join('\n');
}

const echapper = (texte) =>
  String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const [prenom, ...reste] = profil.nom.split(' ');
const jouables = projets.filter((projet) => projet.categorie === 'jeu' && projet.liens.demo).length;

// Le noyau, vu un peu de côté, à droite de l'image
const gabarit = { largeur: 540, hauteur: HAUTEUR, cx: 300, cy: 290, echelle: 60, echelleNoeuds: 0.9 };
const scene = calculerScene(gabarit, { yaw: 0.3, pitch: 0.05 });
const sol = grille(gabarit);
const points = scene.noeuds
  .map((noeud) => {
    const couleur = noeud.id === 'statut' ? C.statut : C.accent;
    const rayon = (5 + noeud.profondeur * 6).toFixed(1);
    const numero = String(NOEUDS.indexOf(noeud.id) + 1).padStart(2, '0');
    const gauche = noeud.x < gabarit.cx;
    const x = noeud.x + (gauche ? -18 : 18);
    return `<circle cx="${noeud.x.toFixed(1)}" cy="${noeud.y.toFixed(1)}" r="${rayon}" fill="${couleur}" opacity="${(0.55 + noeud.profondeur * 0.45).toFixed(2)}"/>
<text x="${x.toFixed(1)}" y="${(noeud.y + 6).toFixed(1)}" text-anchor="${gauche ? 'end' : 'start'}" fill="${couleur}">${numero}</text>`;
  })
  .join('\n');

async function html() {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
${await fontFaces()}
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  position: relative;
  width: ${LARGEUR}px;
  height: ${HAUTEUR}px;
  overflow: hidden;
  background: ${C.bg};
  color: ${C.text};
  font-family: 'Geist Mono', monospace;
}
.scene { position: absolute; right: 0; top: 0; width: 540px; height: ${HAUTEUR}px; }
.scene text { font-family: 'Geist Mono', monospace; font-size: 18px; letter-spacing: 0.1em; }
.presentation {
  position: absolute;
  left: 72px;
  top: 0;
  bottom: 0;
  width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}
.surtitre { margin: 0; font-size: 18px; white-space: nowrap; letter-spacing: 0.16em; text-transform: uppercase; color: ${C.muted}; }
h1 {
  margin: 0;
  font-family: 'Syne', sans-serif;
  font-size: 88px;
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.02em;
}
.ligne { margin: 0; font-size: 26px; color: ${C.text3}; }
.ligne b { font-weight: 500; color: ${C.accent}; }
.url {
  position: absolute;
  left: 72px;
  bottom: 44px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 22px;
  font-weight: 500;
  color: ${C.muted};
}
.point { width: 12px; height: 12px; border-radius: 50%; background: ${C.accent}; box-shadow: 0 0 0 6px rgba(124, 247, 255, 0.18); }
</style>
</head>
<body>
<svg class="scene" viewBox="0 0 540 ${HAUTEUR}" aria-hidden="true">
  <defs>
    <linearGradient id="fondu" gradientUnits="userSpaceOnUse" x1="0" y1="400" x2="0" y2="${HAUTEUR}">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0.3"/>
    </linearGradient>
    <radialGradient id="halo" cx="${gabarit.cx}" cy="${gabarit.cy}" r="220" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path d="${sol}" fill="none" stroke="url(#fondu)" stroke-width="1"/>
  <circle cx="${gabarit.cx}" cy="${gabarit.cy}" r="220" fill="url(#halo)"/>
  <path d="${scene.anneaux.arriere}" fill="none" stroke="${C.accent}" stroke-opacity="0.18" stroke-dasharray="2 6"/>
  <path d="${scene.liens.arriere}" fill="none" stroke="${C.accent}" stroke-opacity="0.3"/>
  <path d="${scene.noyau.arriere}" fill="none" stroke="${C.accent}" stroke-opacity="0.22" stroke-dasharray="3 4"/>
  <path d="${scene.interieur.avant}" fill="none" stroke="${C.text}" stroke-opacity="0.32"/>
  <path d="${scene.noyau.avant}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linejoin="round"/>
  <path d="${scene.noyau.sommets}" fill="${C.accent}"/>
  <path d="${scene.anneaux.avant}" fill="none" stroke="${C.accent}" stroke-opacity="0.55" stroke-width="1.4"/>
  <path d="${scene.liens.avant}" fill="none" stroke="${C.accent}" stroke-opacity="0.75" stroke-width="1.4"/>
  <path d="${scene.liens.statut}" fill="none" stroke="${C.statut}" stroke-opacity="0.85" stroke-width="1.6"/>
  <path d="${scene.ancres}" fill="${C.bg}" stroke="${C.accent}" stroke-width="1.4"/>
  ${points}
</svg>
<div class="presentation">
  <p class="surtitre">${echapper(profil.intitule.fr)} · ${echapper(profil.lieu)}</p>
  <h1>${echapper(prenom)}<br>${echapper(reste.join(' '))}</h1>
  <p class="ligne">${projets.length} projets <b>·</b> ${jouables} jouables <b>·</b> M1 MIAGE</p>
</div>
<div class="url"><span class="point"></span>tonoplas909.github.io</div>
</body>
</html>`;
}

let navigateur;
try {
  navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  await page.setContent(await html(), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  // Une police absente se verrait à peine (repli sur une autre police) : on vérifie.
  const chargees = await page.evaluate(() =>
    ['800 88px "Syne"', '400 26px "Geist Mono"', '500 22px "Geist Mono"'].map((police) => document.fonts.check(police)),
  );
  if (chargees.includes(false)) {
    throw new Error('une police du site n’a pas pu être chargée depuis node_modules/@fontsource');
  }

  await mkdir(dirname(SORTIE), { recursive: true });
  await page.screenshot({ path: SORTIE, type: 'png' });
  console.log(SORTIE);
} catch (erreur) {
  console.error(`Échec : ${erreur instanceof Error ? erreur.message : erreur}`);
  process.exitCode = 1;
} finally {
  await navigateur?.close();
}
