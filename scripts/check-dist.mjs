// Contrôles du site construit (spec §12.1, post-build) : node scripts/check-dist.mjs [dossier]
// Le dossier par défaut est dist/. Chaque anomalie est affichée sur stderr (avec le fichier en cause),
// puis le script sort avec le code 1 ; sans anomalie il affiche OK et sort avec le code 0.
// À lancer après `npm run build` et `npm run build:cv`.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findForbiddenMatches, missingAlternates, pdfHasLink, pdfPageCount } from './lib/check.mjs';

const DIST = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../dist/', import.meta.url));
const EMAIL = 'mailto:matis.nico123@gmail.com';
const PDF_TAILLE_MIN = 10 * 1024;
const PDFS = ['Matis-Demore-CV.pdf', 'Matis-Demore-CV-EN.pdf'];
// Pages qui doivent exister : sans elles, `missingAlternates` ne verrait rien à reprocher à un site vide.
const PAGES_REQUISES = ['/', '/en/', '/cv/', '/en/cv/'];

const anomalies = [];
const signaler = (fichier, message) => anomalies.push(`${fichier} : ${message}`);
const relatif = (fichier) => relative(DIST, fichier).split(sep).join('/');

async function fichiers(dossier) {
  const entrees = await readdir(dossier, { withFileTypes: true });
  const parDossier = await Promise.all(
    entrees.map((entree) =>
      entree.isDirectory() ? fichiers(join(dossier, entree.name)) : [join(dossier, entree.name)],
    ),
  );
  return parDossier.flat();
}

// dist/projets/x/index.html -> /projets/x/ ; dist/index.html -> / ; dist/404.html -> /404.html
function cheminDePage(fichier) {
  const chemin = `/${relatif(fichier)}`;
  return chemin.endsWith('/index.html') ? chemin.slice(0, -'index.html'.length) : chemin;
}

async function controlerPages() {
  const pages = {};
  const cibles = (await fichiers(DIST)).filter((fichier) => /[\\/](?:index|404)\.html$/.test(fichier));
  for (const fichier of cibles) {
    const html = await readFile(fichier, 'utf8');
    pages[cheminDePage(fichier)] = html;
    for (const { nom, extrait } of findForbiddenMatches(html)) {
      signaler(relatif(fichier), `motif interdit (${nom}) : « ${extrait} »`);
    }
  }
  for (const chemin of PAGES_REQUISES) {
    if (!(chemin in pages)) signaler(chemin, 'page absente du site construit');
  }
  for (const chemin of missingAlternates(pages)) {
    signaler(chemin, "la page équivalente dans l'autre langue est absente");
  }
}

async function controlerPdf(nom) {
  let octets;
  try {
    octets = await readFile(join(DIST, nom));
  } catch {
    signaler(nom, 'fichier absent (lancer npm run build:cv)');
    return;
  }
  if (octets.length <= PDF_TAILLE_MIN) {
    signaler(nom, `trop petit (${octets.length} octets, au moins ${PDF_TAILLE_MIN} attendus)`);
  }
  const pages = pdfPageCount(octets);
  if (pages !== 1) {
    signaler(nom, `${pages} page(s) au lieu d'une seule (réduire les marges ou les tailles dans print.css)`);
  }
  if (!pdfHasLink(octets, EMAIL)) {
    signaler(nom, `lien ${EMAIL} absent du PDF`);
  }
}

try {
  if (!(await stat(DIST)).isDirectory()) throw new Error('pas un dossier');
} catch {
  console.error(`${DIST} : dossier introuvable (lancer npm run build)`);
  process.exit(1);
}

await controlerPages();
for (const nom of PDFS) await controlerPdf(nom);

if (anomalies.length > 0) {
  for (const anomalie of anomalies) console.error(`ECHEC ${anomalie}`);
  console.error(`${anomalies.length} anomalie(s)`);
  process.exitCode = 1;
} else {
  console.log('OK');
}
