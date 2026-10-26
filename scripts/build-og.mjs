// Image de partage par défaut (Open Graph / Twitter card) : node scripts/build-og.mjs
// Rend une page HTML en ligne de 1200×630 dans le style terminal du site avec Chromium (Playwright)
// et écrit public/og-default.png. Les polices viennent des paquets @fontsource installés (intégrées
// en base64) : ni police système ni réseau. À relancer (npm run build:og) si l'identité change,
// puis à commiter le PNG.
import { mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
// Modules de données sans dépendance à l'exécution : Node les charge tels quels (retrait des types).
import { competences } from '../src/data/competences.ts';
import { profil } from '../src/data/profil.ts';
import { projets } from '../src/data/projets.ts';

const LARGEUR = 1200;
const HAUTEUR = 630;
const SORTIE = fileURLToPath(new URL('../public/og-default.png', import.meta.url));

// Couleurs de src/styles/tokens.css
const C = {
  bg: '#0a0e14',
  surface: '#0f151d',
  line: '#1f2b38',
  text: '#e6edf3',
  text2: '#b8c7d6',
  muted: '#9fb0c0',
  accent: '#6cb6ff',
  ok: '#3ddc97',
  kw: '#c792ea',
  str: '#a5d6a7',
  num: '#f2cc8f',
};

const POLICES = [
  { famille: 'JetBrains Mono', poids: 500, paquet: 'jetbrains-mono' },
  { famille: 'JetBrains Mono', poids: 700, paquet: 'jetbrains-mono' },
  { famille: 'IBM Plex Sans', poids: 500, paquet: 'ibm-plex-sans' },
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

const chaine = (valeur) => `<span class="str">"${echapper(valeur)}"</span>`;
const [prenom, ...reste] = profil.nom.split(' ');

// Le motif `profil.ts` du hero, alimenté par les données du site
const lignesCode = [
  `<span class="kw">const</span> ${echapper(prenom.toLowerCase())} = {`,
  `  formation: ${chaine(profil.formation.fr)},`,
  `  lieu: ${chaine(profil.lieu)},`,
  `  stack: [${competences.slice(0, 2).map(chaine).join(', ')}, …],`,
  `  projets: <span class="num">${projets.length}</span>,`,
  `  cap: ${chaine(profil.objectif.fr)},`,
  '};',
];

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
  font-family: 'IBM Plex Sans', sans-serif;
}
.barre { position: absolute; inset: 0 0 auto 0; height: 6px; background: ${C.accent}; }
.contenu {
  display: flex;
  align-items: center;
  gap: 48px;
  height: 100%;
  padding: 0 72px 76px;
}
.presentation { flex: 1 1 auto; min-width: 0; }
.marque {
  margin: 0 0 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 30px;
  font-weight: 500;
}
.marque span { color: ${C.accent}; }
h1 {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 124px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}
.ligne {
  margin: 36px 0 0;
  font-size: 33px;
  font-weight: 500;
  color: ${C.text2};
  white-space: nowrap;
}
.ligne b { font-weight: 500; color: ${C.accent}; }
.fiche {
  flex: 0 0 456px;
  overflow: hidden;
  background: ${C.surface};
  border: 1px solid ${C.line};
  border-radius: 12px;
}
.fiche-nom {
  padding: 14px 24px;
  border-bottom: 1px solid ${C.line};
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: ${C.muted};
}
.code {
  margin: 0;
  padding: 20px 24px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 500;
  line-height: 36px;
  color: ${C.text2};
  white-space: pre;
}
.kw { color: ${C.kw}; }
.str { color: ${C.str}; }
.num { color: ${C.num}; }
.url {
  position: absolute;
  left: 72px;
  bottom: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 500;
  color: ${C.muted};
}
.point { width: 12px; height: 12px; border-radius: 50%; background: ${C.ok}; }
</style>
</head>
<body>
<div class="barre"></div>
<div class="contenu">
  <div class="presentation">
    <p class="marque">~/matis-demore<span>_</span></p>
    <h1>${echapper(prenom)}<br>${echapper(reste.join(' '))}</h1>
    <p class="ligne">${echapper(profil.intitule.fr)} <b>·</b> M1 MIAGE</p>
  </div>
  <div class="fiche">
    <div class="fiche-nom">profil.ts</div>
    <pre class="code">${lignesCode.join('\n')}</pre>
  </div>
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

  // Une police absente se verrait à peine (repli sur une autre à chasse fixe) : on vérifie.
  const chargees = await page.evaluate(() =>
    ['700 124px "JetBrains Mono"', '500 20px "JetBrains Mono"', '500 33px "IBM Plex Sans"'].map((police) =>
      document.fonts.check(police),
    ),
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
