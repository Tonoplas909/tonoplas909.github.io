// PDF du CV (spec §8.4) : node scripts/build-cv.mjs (ou npm run build:cv), après `npm run build`.
// Sert dist/ avec `astro preview`, imprime /cv/ et /en/cv/ avec Chromium (Playwright) et écrit
// dist/Matis-Demore-CV.pdf et dist/Matis-Demore-CV-EN.pdf. Les PDF ne sont jamais commités.
import { spawn } from 'node:child_process';
import { access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const ASTRO = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const PORT = 4322;
const ORIGINE = `http://localhost:${PORT}`;
const DELAI_SERVEUR_MS = 30_000;

const PDFS = [
  { chemin: '/cv/', fichier: 'Matis-Demore-CV.pdf' },
  { chemin: '/en/cv/', fichier: 'Matis-Demore-CV-EN.pdf' },
];

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function repond(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function attendreServeur(url, serveur) {
  const fin = Date.now() + DELAI_SERVEUR_MS;
  while (Date.now() < fin) {
    if (serveur.exitCode !== null) {
      throw new Error(`astro preview s'est arrêté (code ${serveur.exitCode}) avant de répondre`);
    }
    if (await repond(url)) return;
    await attendre(250);
  }
  throw new Error(`${url} ne répond pas après ${DELAI_SERVEUR_MS / 1000} s`);
}

async function main() {
  try {
    await access(`${DIST}index.html`);
  } catch {
    throw new Error('dist/ est absent ou vide : lancer `npm run build` avant `npm run build:cv`');
  }
  // Si le port est déjà pris, astro preview en choisirait un autre et on imprimerait un autre site.
  if (await repond(`${ORIGINE}/cv/`)) {
    throw new Error(`le port ${PORT} est déjà utilisé par un autre serveur`);
  }

  // Pas de `npx` ni de shell : le même Node lance directement le binaire d'Astro (Windows comme Linux).
  const serveur = spawn(process.execPath, [ASTRO, 'preview', '--port', String(PORT)], {
    cwd: RACINE,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let journal = '';
  serveur.stdout.on('data', (morceau) => (journal += morceau));
  serveur.stderr.on('data', (morceau) => (journal += morceau));

  let navigateur;
  try {
    try {
      await attendreServeur(`${ORIGINE}/cv/`, serveur);
    } catch (erreur) {
      throw new Error(`${erreur.message}\n${journal}`);
    }

    navigateur = await chromium.launch();
    const page = await navigateur.newPage();
    for (const { chemin, fichier } of PDFS) {
      await page.goto(`${ORIGINE}${chemin}`, { waitUntil: 'networkidle' });
      // Le lien e-mail est assemblé par JavaScript au chargement : le PDF doit contenir ce lien.
      await page.waitForSelector('a[data-email][href^="mailto:"]');
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: 'print' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
      await writeFile(`${DIST}${fichier}`, pdf);
      console.log(`${chemin} -> dist/${fichier} (${Math.round(pdf.length / 1024)} Ko)`);
    }
  } finally {
    await navigateur?.close();
    serveur.kill();
  }
}

main().catch((erreur) => {
  console.error(`Échec : ${erreur instanceof Error ? erreur.message : erreur}`);
  process.exitCode = 1;
});
