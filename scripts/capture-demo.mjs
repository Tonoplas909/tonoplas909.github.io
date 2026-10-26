// Capture d'écran d'une démo : node scripts/capture-demo.mjs <url> <fichier.png>
// Ouvre l'URL dans Chromium (Playwright) en 1280×720, attend 2 secondes, enregistre la capture.
// Exemple : node scripts/capture-demo.mjs https://tonoplas909.github.io/tanks/ src/assets/projets/tanks/01.png
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const [url, sortie] = process.argv.slice(2);

if (!url || !sortie || process.argv.length > 4) {
  console.error('Usage : node scripts/capture-demo.mjs <url> <fichier.png>');
  process.exit(1);
}

let adresse;
try {
  adresse = new URL(url);
} catch {
  console.error(`URL invalide : ${url}`);
  process.exit(1);
}
if (adresse.protocol !== 'http:' && adresse.protocol !== 'https:') {
  console.error(`URL invalide (http ou https attendu) : ${url}`);
  process.exit(1);
}

const fichier = resolve(sortie);
let navigateur;
try {
  navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 720 } });
  const reponse = await page.goto(adresse.href, { waitUntil: 'load', timeout: 30_000 });
  if (!reponse || !reponse.ok()) {
    throw new Error(`la page répond ${reponse ? reponse.status() : 'rien'}`);
  }
  await page.waitForTimeout(2000);
  // Le dossier n'est créé qu'une fois la page chargée : un échec ne laisse pas de dossier vide
  await mkdir(dirname(fichier), { recursive: true });
  await page.screenshot({ path: fichier, type: 'png' });
  console.log(fichier);
} catch (erreur) {
  console.error(`Échec de la capture de ${url} : ${erreur instanceof Error ? erreur.message : erreur}`);
  process.exitCode = 1;
} finally {
  await navigateur?.close();
}
