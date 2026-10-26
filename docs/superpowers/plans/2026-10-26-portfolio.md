# Portfolio et CV de Matis Demore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'ancien site Lovable par un site Astro bilingue (FR/EN) qui sert de portfolio (8 projets, une page chacun) et de CV (pages imprimables et PDF), déployé sur GitHub Pages.

**Architecture:** Site statique Astro. Toutes les données (projets, parcours, compétences, profil) vivent dans `src/data/` avec des champs `fr`/`en` ; la logique pure (routes, parcours, e-mail, galerie, filtre, SEO) est dans `src/lib/` et testée avec Vitest ; les composants Astro ne font que l'affichage. Un peu de JavaScript côté visiteur (filtre, visionneuse, e-mail), le reste est du HTML. Un workflow GitHub Actions teste, construit, génère les PDF du CV et déploie.

**Tech Stack:** Astro, TypeScript strict, `@fontsource` (JetBrains Mono, IBM Plex Sans), `@astrojs/sitemap`, Vitest, Playwright + `@axe-core/playwright`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-26-portfolio-design.md`. Référence visuelle : `docs/superpowers/design/direction-a.dc.html` (maquette A : le balisage et les styles en ligne montrent l'apparence voulue ; la spec la remplace sur le contenu). Les sections « §N » ci-dessous renvoient à la spec.

## Global Constraints

- Astro dernière version stable à l'implémentation (vérifier le Node requis avec `npm view astro engines`), TypeScript en mode strict (`astro/tsconfigs/strict`), npm comme gestionnaire de paquets.
- `site: 'https://tonoplas909.github.io'`, pas de `base`, `build.format: 'directory'`, `trailingSlash: 'always'`.
- Routes : FR `/`, `/projets/<id>/`, `/cv/` ; EN `/en/`, `/en/projects/<id>/`, `/en/cv/` ; PDF `/Matis-Demore-CV.pdf` et `/Matis-Demore-CV-EN.pdf`. Pas de redirection automatique selon la langue du navigateur.
- Tout texte affiché a une version `fr` et une version `en`.
- Polices hébergées avec le site (`@fontsource`, sous-ensemble latin, `font-display: swap`). Aucune requête vers un tiers, aucun cookie, aucune statistique.
- Jamais publiés : numéro de téléphone, date de naissance, adresse personnelle, permis et véhicule. Le lieu affiché est « Sophia-Antipolis ».
- L'e-mail `matis.nico123@gmail.com` n'apparaît jamais en clair dans le HTML : deux morceaux assemblés par script, épelé sans JavaScript.
- Liens externes : `rel="noopener noreferrer"`. Plus aucune mention « Lovable ».
- Variables CSS (§7) : `--bg #0a0e14`, `--surface #0f151d`, `--surface-2 #111a24`, `--line #1f2b38`, `--line-strong #34475c`, `--text #e6edf3`, `--text-2 #b8c7d6`, `--muted #9fb0c0`, `--accent #6cb6ff`, `--accent-hover #a5d3ff`, `--ok #3ddc97`, `--code-kw #c792ea`, `--code-str #a5d6a7`, `--code-num #f2cc8f`.
- Accessibilité : contraste du texte d'au moins 4,5:1, focus visible, boutons de 48 px de haut et filtres de 44 px au minimum, animations coupées avec `prefers-reduced-motion`, aucun débordement horizontal à 320 px de large.
- Les PDF du CV ne sont jamais commités.
- Travail sur la branche `refonte-portfolio`. Ne jamais pousser ni fusionner sans demande explicite de Matis. Chaque message de commit se termine par la ligne `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Précision sur le parcours (§5.3) : une période en cours se représente par `fin: null` ; une entrée d'une seule année a `fin` absent ; une entrée sans période n'a pas de `debut`.

## Review Focus

Cas que la spec sous-entend sans qu'aucune tâche ne les teste de façon évidente ; chacun a son test dans la tâche indiquée.

1. Dossier d'images contenant des fichiers non pris en charge ou des extensions en majuscules (`.PNG`, `.txt`, `.DS_Store`) : ignorés sans erreur, tri naturel (2 avant 10). Tâche 6.
2. Projet sans démo (Volley Club, Cafet'MIAGE) ou sans capture : ni bouton « Jouer », ni lien cassé, ni galerie vide. Tâche 7.
3. Page 404 sous `/en/` : textes et lien d'accueil en anglais. Tâche 9.
4. Page projet aux deux extrémités de la liste : précédent du premier et suivant du dernier bouclent. Tâche 7.
5. JavaScript désactivé : les 8 projets restent visibles, l'e-mail s'affiche épelé, les vignettes de la galerie sont des liens vers l'image. Tâches 5, 6 et 7.

---

## Carte des fichiers

La structure est celle de la spec §4.2, avec ces précisions. Données : `src/data/types.ts` (types partagés), `projets.ts`, `parcours.ts`, `competences.ts`, `profil.ts`. Logique pure : `src/lib/routes.ts`, `parcours.ts`, `email.ts`, `hero.ts`, `filtre.ts`, `galerie.ts`, `projets.ts`, `seo.ts`. Scripts : `scripts/build-cv.mjs`, `scripts/check-dist.mjs` (+ `scripts/lib/check.mjs`), `scripts/capture-demo.mjs`, `scripts/build-og.mjs`. Les ancres de l'accueil sont `#projets`, `#parcours`, `#cv`, `#contact`.

### Task 1: Squelette Astro, outillage et suppression de l'ancien site

**Files:**
- Delete: `assets/`, `lovable-uploads/`, `index.html`, `placeholder.svg`, `favicon.ico`, `robots.txt`
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/pages/index.astro` (page provisoire)

**Interfaces:**
- Produces : scripts npm `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run`), `test:e2e` (`playwright test`), `build:cv` (`node scripts/build-cv.mjs`). Les tests unitaires sont dans `tests/unit/*.test.ts`, les e2e dans `tests/e2e/*.spec.ts`.

- [ ] **Step 1:** `git switch -c refonte-portfolio`, puis `git rm -r assets lovable-uploads index.html placeholder.svg favicon.ico robots.txt`.
- [ ] **Step 2:** Créer `package.json` (`"type": "module"`) et installer : `astro`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `@fontsource/jetbrains-mono`, `@fontsource/ibm-plex-sans` ; en dev : `vitest`, `@playwright/test`, `@axe-core/playwright`. Puis `npx playwright install chromium`. Écrire les scripts npm listés ci-dessus.
- [ ] **Step 3:** `astro.config.mjs` avec exactement `site`, `trailingSlash: 'always'`, `build: { format: 'directory' }` et l'intégration sitemap ; `tsconfig.json` étend `astro/tsconfigs/strict` ; `.gitignore` : `node_modules`, `dist`, `.astro`, `test-results`, `playwright-report`.
- [ ] **Step 4:** `vitest.config.ts` (inclut `tests/unit/**/*.test.ts`). `playwright.config.ts` : `testDir: 'tests/e2e'`, projet Chromium, `use.baseURL: 'http://localhost:4321'`, `webServer: { command: 'npm run build && npm run preview -- --port 4321', url: 'http://localhost:4321', reuseExistingServer: !process.env.CI, timeout: 180000 }`.
- [ ] **Step 5:** `src/pages/index.astro` : une page minimale avec `<h1>Matis Demore</h1>`.
- [ ] **Step 6:** Vérifier. Run : `npm run check && npm run build`. Expected : sortie sans erreur et `dist/index.html` existe.
- [ ] **Step 7:** Commit : `git add -A && git commit -m "chore: squelette Astro, outillage de test, suppression de l'ancien site"`.

### Task 2: Types, textes de l'interface et routes (TDD)

**Files:**
- Create: `src/data/types.ts`, `src/i18n/ui.ts`, `src/lib/routes.ts`
- Test: `tests/unit/routes.test.ts`, `tests/unit/ui.test.ts`

**Interfaces:**
- Produces (`src/data/types.ts`) : `Lang = 'fr' | 'en'` ; `Localise<T = string> = Record<Lang, T>` ; `Categorie = 'jeu' | 'asso'` ; `TypeParcours = 'etudes' | 'emploi' | 'stage' | 'distinction' | 'asso'` ; `Projet` `{ id: string; titre: string; categorie: Categorie; depot: string; resume: Localise; description: Localise<string[]>; points: Localise<string[]>; stack: string[]; liens: { demo?: string; code: string }; badge?: Localise; vedette?: boolean; legendes?: Record<string, Localise> }` ; `EntreeParcours` `{ id: string; type: TypeParcours; titre: Localise; detail?: Localise; debut?: number; fin?: number | null }` ; `Profil` `{ nom: string; intitule: Localise; formation: Localise; lieu: string; objectif: Localise; langues: Localise<string[]>; interets: Localise<string[]>; liens: { github: string; linkedin: string }; email: { local: string; domain: string } }`.
- Produces (`src/i18n/ui.ts`) : `ui: Record<Lang, Record<string, string>>` et `t(lang: Lang, key: string): string` (lève une erreur si la clé manque). Clés initiales : `nav.projets`, `nav.parcours`, `nav.cv`, `nav.contact`, `lang.switch`. Les tâches suivantes ajoutent leurs clés.
- Produces (`src/lib/routes.ts`) : `langFromPath(pathname: string): Lang` ; `homePath(lang: Lang): string` ; `projectPath(lang: Lang, id: string): string` ; `cvPath(lang: Lang): string` ; `equivalentPath(pathname: string, target: Lang): string`.

- [ ] **Step 1:** Écrire `tests/unit/routes.test.ts` :
  - `langFromPath` : `'/'`, `'/projets/drift-club/'` et `'/entreprise/'` donnent `'fr'` (seul un segment `en` complet est un préfixe) ; `'/en/'` et `'/en/projects/drift-club/'` donnent `'en'`.
  - `homePath('fr') === '/'`, `homePath('en') === '/en/'`, `projectPath('fr','drift-club') === '/projets/drift-club/'`, `projectPath('en','drift-club') === '/en/projects/drift-club/'`, `cvPath('fr') === '/cv/'`, `cvPath('en') === '/en/cv/'`.
  - `equivalentPath('/projets/drift-club/','en') === '/en/projects/drift-club/'`, `equivalentPath('/en/projects/drift-club/','fr') === '/projets/drift-club/'`, `equivalentPath('/cv/','en') === '/en/cv/'`, `equivalentPath('/en/','fr') === '/'`, `equivalentPath('/','en') === '/en/'`.
  - Identité si la langue cible est la langue courante : `equivalentPath('/cv/','fr') === '/cv/'`.
  - Page inconnue : `equivalentPath('/nimportequoi/','en') === '/en/'` et `equivalentPath('/en/nope/','fr') === '/'`.
- [ ] **Step 2:** Écrire `tests/unit/ui.test.ts` : `Object.keys(ui.fr).sort()` égal `Object.keys(ui.en).sort()` ; aucune valeur vide ; `t('fr','nav.projets')` et `t('en','nav.projets')` sont des chaînes non vides ; `t('fr','cle.inexistante')` lève une erreur.
- [ ] **Step 3:** Run : `npx vitest run`. Expected : FAIL (modules absents).
- [ ] **Step 4:** Implémenter `types.ts`, `ui.ts` (valeurs FR et EN réelles pour les clés initiales) et `routes.ts` (aucune dépendance ; les segments `projets` et `projects` sont la seule correspondance de nom).
- [ ] **Step 5:** Run : `npx vitest run`. Expected : PASS.
- [ ] **Step 6:** Commit : `git add -A && git commit -m "feat: types, textes d'interface et routes FR/EN"`.

### Task 3: Données et logique du parcours (TDD)

**Files:**
- Create: `src/data/projets.ts`, `src/data/parcours.ts`, `src/data/competences.ts`, `src/data/profil.ts`, `src/lib/parcours.ts`
- Test: `tests/unit/data.test.ts`, `tests/unit/parcours.test.ts`

**Interfaces:**
- Consumes : les types de la tâche 2.
- Produces : `projets: Projet[]` (ordre de la spec §5.2) ; `parcours: EntreeParcours[]` ; `competences: string[]` ; `profil: Profil`.
- Produces (`src/lib/parcours.ts`) : `trierParcours(items: EntreeParcours[]): EntreeParcours[]` (début décroissant, puis fin décroissante avec `null` en premier et une `fin` absente comptée comme égale à `debut`, entrées sans `debut` en dernier, tri stable, ne modifie pas le tableau reçu) ; `formatPeriode(e: EntreeParcours, lang: Lang): string`.

- [ ] **Step 1:** Écrire `tests/unit/parcours.test.ts` :
  - `formatPeriode({debut:2026,fin:null,...},'fr') === '2026 → auj.'` et `'en'` donne `'2026 → present'` ; `{debut:2022,fin:2025}` donne `'2022 → 2025'` ; `{debut:2020}` donne `'2020'` ; sans `debut`, `'fr'` donne `'Vie associative'` et `'en'` donne `'Community'`.
  - `trierParcours(parcours).map(e => e.id)` égale exactement `['m1-miage','eng-it','flunch','himydata','but-info','qiti','intel-ia','bac','noeva','air-france','bde-miage']` ; l'ordre des entrées de départ n'est pas modifié (`parcours` reste identique avant et après).
- [ ] **Step 2:** Écrire `tests/unit/data.test.ts` :
  - `projets.map(p => p.id)` égale exactement `['cafet-miage','drift-club','rallye-club','volley-club','tanks','moto-club','pit-wall','marque']`.
  - Pour chaque projet : `titre` non vide ; `resume`, `description` et `points` non vides en `fr` et `en` ; `description[lang].length` entre 2 et 3 ; `points[lang].length >= 3` ; `stack.length >= 1` ; `liens.code` correspond à `^https://github\.com/Tonoplas909/[\w-]+$` ; `liens.demo`, s'il existe, correspond à `^https://tonoplas909\.github\.io/[\w-]+/$`.
  - `volley-club` et `cafet-miage` n'ont pas de `liens.demo` (§5.2 et §5.4). `cafet-miage` est de catégorie `asso` et porte un `badge` ; les 7 autres sont `jeu`. Seuls `cafet-miage` et `drift-club` ont `vedette: true`.
  - Chaque dossier de `src/assets/projets/` (s'il existe) porte l'id d'un projet.
  - `competences` égale `['Python','Vue.js','Angular','TypeScript','React','Java','SQL','Supabase','Three.js']`.
  - `profil.liens` égale `{ github: 'https://github.com/Tonoplas909', linkedin: 'https://www.linkedin.com/in/matis-demore-31609a267/' }` ; `profil.email` égale `{ local: 'matis.nico123', domain: 'gmail.com' }` ; `JSON.stringify(profil)` ne contient aucune clé `tel`, `phone` ni `naissance`, et ne correspond pas à `/(?:\+33|0)\s?[67](?:[\s.-]?\d{2}){4}/` (aucun numéro de mobile).
  - Les 11 entrées de `parcours` ont leurs `titre` FR et EN non vides ; `parcours.find(e => e.id === 'flunch')?.detail` est `undefined` (poste inconnu, rien n'est inventé) ; le `detail.fr` d'`eng-it` égale `'ESN à Sophia-Antipolis'`.
- [ ] **Step 3:** Run : `npx vitest run`. Expected : FAIL.
- [ ] **Step 4:** Implémenter `src/lib/parcours.ts`, `competences.ts`, `profil.ts` (valeurs de la spec §5.6 ; `objectif` : « premier CDI » / « first permanent role » ; `langues` : français, anglais ; `interets` : volleyball, auto et moto, jeux vidéo) et `parcours.ts` (les 11 entrées du tableau §5.3, avec les ids du test, `fin: null` pour les périodes en cours).
- [ ] **Step 4b:** Pour chaque dépôt de §5.2, lire le README et le `package.json` : `curl -s -H "Accept: application/vnd.github.raw" https://api.github.com/repos/Tonoplas909/<dépôt>/readme` et `curl -s https://raw.githubusercontent.com/Tonoplas909/<dépôt>/HEAD/package.json`. Écrire `projets.ts` : `resume` FR repris de la maquette, `description` (2 ou 3 paragraphes) et `points` (3 à 5) en FR et en EN, **uniquement avec des faits présents dans les README**, `stack` déduite des dépendances réelles (pas de la maquette). `depot` est le nom du dépôt ; `liens.code` est `https://github.com/Tonoplas909/<dépôt>` ; `liens.demo` est `https://tonoplas909.github.io/<dépôt>/` pour les projets qui en ont une.
- [ ] **Step 4c:** Vérifier chaque URL de démo : `curl -s -o /dev/null -w "%{http_code}" <url>`. Expected : `200`. Une démo qui répond autrement est retirée de `projets.ts` et signalée à Matis dans le compte rendu final.
- [ ] **Step 5:** Run : `npx vitest run && npm run check`. Expected : PASS.
- [ ] **Step 6:** Commit : `git add -A && git commit -m "feat: données du portfolio et logique de parcours"`.

### Task 4: Layout de base, styles, en-tête, pied de page et SEO (TDD)

**Files:**
- Create: `src/lib/seo.ts`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/styles/tokens.css`, `src/styles/global.css`
- Test: `tests/unit/seo.test.ts`, `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes : `equivalentPath`, `langFromPath` (tâche 2), `Profil`.
- Produces (`seo.ts`) : `SITE: string` (`'https://tonoplas909.github.io'`) ; `alternates(pathname: string): { hreflang: 'fr' | 'en' | 'x-default'; href: string }[]` ; `personJsonLd(p: Profil): Record<string, unknown>`.
- Produces (`Base.astro`) : props `{ lang: Lang; title: string; description: string; image?: string; noindex?: boolean }` ; la page courante est lue dans `Astro.url.pathname`.

- [ ] **Step 1:** Écrire `tests/unit/seo.test.ts` : `alternates('/projets/drift-club/')` égale `[{hreflang:'fr',href:'https://tonoplas909.github.io/projets/drift-club/'},{hreflang:'en',href:'https://tonoplas909.github.io/en/projects/drift-club/'},{hreflang:'x-default',href:'https://tonoplas909.github.io/projets/drift-club/'}]` ; `alternates('/en/')` renvoie les mêmes trois entrées pour `'/'` et `'/en/'` ; `personJsonLd(profil)` a `@type` égal `'Person'`, `name` égal `'Matis Demore'`, `sameAs` égal `[profil.liens.github, profil.liens.linkedin]`, et `JSON.stringify` du résultat ne contient pas `'@'` suivi de `gmail`.
- [ ] **Step 2:** Run : `npx vitest run tests/unit/seo.test.ts`. Expected : FAIL.
- [ ] **Step 3:** Implémenter `seo.ts`.
- [ ] **Step 4:** Écrire `tokens.css` (variables des contraintes globales), `global.css` (polices importées depuis `@fontsource` : JetBrains Mono 400, 500, 700 et IBM Plex Sans 400, 500, 600, sous-ensemble `latin` ; reset, conteneur de 1120 px avec 32 px de marge, anneau de focus visible en `--accent`, `@media (prefers-reduced-motion: reduce)`).
- [ ] **Step 5:** Écrire `Base.astro` : `<html lang>`, titre, description, URL canonique, liens `alternate` issus de `alternates`, Open Graph et Twitter card (image par défaut `/og-default.png` si `image` est absent), `<script type="application/ld+json">` avec `personJsonLd`, `<Header/>`, `<main><slot/></main>`, `<Footer/>`. `Header.astro` : logo `~/matis-demore_`, navigation (`#projets`, `#parcours`, `#cv`, `#contact`, préfixées par `homePath(lang)` hors de l'accueil), sélecteur FR/EN en liens vers `equivalentPath(Astro.url.pathname, autre langue)` avec `aria-current` sur la langue active. `Footer.astro` : GitHub, LinkedIn, e-mail (rendu par la tâche 5). Reproduire l'apparence de la maquette.
- [ ] **Step 6:** Écrire `tests/e2e/layout.spec.ts` : sur `/`, `html[lang="fr"]`, un lien `link[rel=alternate][hreflang=en]` vers `/en/` ; sur `/en/` (à créer en tâche 5, test marqué `test.fixme` jusque-là), `html[lang="en"]`. Pas de requête réseau externe : `page.on('request')` ne voit que des URL de `localhost:4321`.
- [ ] **Step 7:** Run : `npx vitest run && npm run check && npx playwright test tests/e2e/layout.spec.ts`. Expected : PASS.
- [ ] **Step 8:** Commit : `git add -A && git commit -m "feat: layout, styles, en-tête, pied de page et SEO"`.

### Task 5: Accueil, partie statique : hero, compétences, parcours, CV, contact (TDD)

**Files:**
- Create: `src/lib/email.ts`, `src/lib/hero.ts`, `src/components/{Hero,Competences,Parcours,BlocCv,Contact}.astro`, `src/pages/en/index.astro` ; Modify: `src/pages/index.astro`, `src/i18n/ui.ts`
- Test: `tests/unit/email.test.ts`, `tests/unit/hero.test.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes : `profil`, `competences`, `projets`, `parcours`, `trierParcours`, `formatPeriode`, `t`.
- Produces : `assembleEmail(e: { local: string; domain: string }): string` ; `spellEmail(e: { local: string; domain: string }, lang: Lang): string` ; `profilLines(lang: Lang): { key: string; value: string | number | string[] }[]` ; le composant `Contact.astro` rend un lien `<a data-email data-local data-domain>` contenant la version épelée, remplacé au chargement par `mailto:`.

- [ ] **Step 1:** Écrire `tests/unit/email.test.ts` : `assembleEmail({local:'matis.nico123',domain:'gmail.com'}) === 'matis.nico123@gmail.com'` ; `spellEmail(...,'fr') === 'matis.nico123 (arobase) gmail (point) com'` ; `spellEmail(...,'en') === 'matis.nico123 (at) gmail (dot) com'`.
- [ ] **Step 2:** Écrire `tests/unit/hero.test.ts` : `profilLines('fr')` donne les clés dans l'ordre `['formation','lieu','stack','projets','cap']` ; la ligne `projets` a pour valeur `projets.length` (soit `8`) ; la ligne `stack` égale `competences.slice(0, 4)` ; la ligne `cap` vaut `'premier CDI'` en FR et `'first permanent role'` en EN.
- [ ] **Step 3:** Run : `npx vitest run`. Expected : FAIL.
- [ ] **Step 4:** Implémenter `email.ts` et `hero.ts`.
- [ ] **Step 5:** Créer les composants (reproduire la maquette A) : `Hero` (point vert, ligne « M1 MIAGE · parcours NumRes · Sophia-Antipolis », `<h1>`, accroche, boutons Voir les projets et Télécharger le CV, bloc `profil.ts` généré par `profilLines`), `Competences`, `Parcours` (liste triée avec `formatPeriode`, type `stage` en compact sur une ligne, détail omis s'il est absent), `BlocCv` (deux boutons : `/Matis-Demore-CV.pdf` et `/Matis-Demore-CV-EN.pdf`), `Contact` (+ script d'assemblage de l'e-mail, aucune adresse en clair dans le HTML). Ajouter les clés de texte FR/EN nécessaires à `ui.ts`.
- [ ] **Step 6:** `src/pages/index.astro` (FR) et `src/pages/en/index.astro` (EN) composent : `Hero`, `Competences`, section `#projets` (vide pour l'instant, remplie en tâche 6), `Parcours`, `BlocCv`, `Contact`, avec `Base`. Retirer le `test.fixme` du test EN de la tâche 4.
- [ ] **Step 7:** Écrire `tests/e2e/home.spec.ts` : (a) sur `/`, le lien de contact a `href="mailto:matis.nico123@gmail.com"` ; (b) avec `test.use({ javaScriptEnabled: false })`, le texte `matis.nico123 (arobase) gmail (point) com` est visible et le HTML ne contient pas `matis.nico123@gmail.com` ; (c) cliquer le lien `EN` de l'en-tête mène à `/en/` et le lien `FR` ramène à `/` ; (d) le bloc `profil.ts` affiche `projets: 8`.
- [ ] **Step 8:** Run : `npx vitest run && npm run check && npx playwright test tests/e2e/home.spec.ts tests/e2e/layout.spec.ts`. Expected : PASS.
- [ ] **Step 9:** Commit : `git add -A && git commit -m "feat: accueil FR/EN, hero, compétences, parcours, CV et contact"`.

### Task 6: Projets sur l'accueil : cartes, filtre, vignettes (TDD)

**Files:**
- Create: `src/lib/filtre.ts`, `src/lib/galerie.ts`, `src/components/{CarteProjet,FiltreProjets}.astro` ; Modify: `src/pages/index.astro`, `src/pages/en/index.astro`, `src/i18n/ui.ts`
- Test: `tests/unit/filtre.test.ts`, `tests/unit/galerie.test.ts`, `tests/e2e/projets.spec.ts`

**Interfaces:**
- Consumes : `projets`, `Projet`, `projectPath`.
- Produces : `filtrerProjets(liste: Projet[], filtre: 'tous' | Categorie): Projet[]` ; `selectionnerImages(chemins: string[], id: string): string[]` (garde les chemins sous `/src/assets/projets/<id>/` dont l'extension est jpg, jpeg, png ou webp sans tenir compte de la casse, tri naturel par nom de fichier) ; `altCapture(titre: string, n: number, lang: Lang, legende?: Localise): string` (`n` commence à 1).

- [ ] **Step 1:** Écrire `tests/unit/filtre.test.ts` : `filtrerProjets(projets,'tous')` renvoie les 8 projets dans l'ordre d'origine ; `'jeu'` en renvoie 7 ; `'asso'` renvoie uniquement `cafet-miage`.
- [ ] **Step 2:** Écrire `tests/unit/galerie.test.ts` : avec `['/src/assets/projets/drift-club/10.png','/src/assets/projets/drift-club/2.PNG','/src/assets/projets/drift-club/notes.txt','/src/assets/projets/drift-club/.DS_Store','/src/assets/projets/tanks/01.png']` et `'drift-club'`, `selectionnerImages` renvoie `['/src/assets/projets/drift-club/2.PNG','/src/assets/projets/drift-club/10.png']` ; avec `'volley-club'` il renvoie `[]` ; `altCapture('Drift Club',2,'fr') === "Capture d'écran 2 de Drift Club"` ; `altCapture('Drift Club',2,'en') === 'Screenshot 2 of Drift Club'` ; avec une légende `{fr:'Menu',en:'Menu'}`, `altCapture` renvoie `'Menu'`.
- [ ] **Step 3:** Run : `npx vitest run`. Expected : FAIL.
- [ ] **Step 4:** Implémenter `filtre.ts` et `galerie.ts`.
- [ ] **Step 5:** `CarteProjet.astro` : prop `{ projet: Projet; lang: Lang; vignette?: ImageMetadata }`. La carte entière mène à `projectPath(lang, projet.id)` (lien étiré sur le titre) ; les liens Jouer/Voir le site (si `liens.demo`) et Code restent des liens séparés ; badge et indicateur « vedette » (carte large) selon la maquette ; vignette `astro:assets` en WebP si une image existe (via `import.meta.glob('/src/assets/projets/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}')` filtré par `selectionnerImages`, première image) ; survol et focus clavier : bordure `--accent`, zoom léger de la vignette, flèche décalée, sans animation sous `prefers-reduced-motion`.
- [ ] **Step 6:** `FiltreProjets.astro` : trois boutons Tous / Jeux / Associatif (44 px, `aria-pressed`), région `role="status"` annonçant le nombre de résultats (texte `ui`), script qui pose `hidden` sur les cartes dont `data-categorie` ne correspond pas, via `filtrerProjets`-équivalent en JavaScript côté client (la logique est partagée en important `filtre.ts`). Sans JavaScript, les boutons sont masqués (`hidden` retiré par le script) et toutes les cartes sont visibles. Brancher la section `#projets` des deux accueils : vedettes en tête puis le reste, dans l'ordre de `projets`.
- [ ] **Step 7:** Écrire `tests/e2e/projets.spec.ts` : (a) l'accueil affiche 8 cartes ; (b) clic sur « Associatif » : 1 carte visible, `aria-pressed="true"` sur ce bouton, le message de résultat contient « 1 » ; clic sur « Tous » : 8 cartes ; (c) `javaScriptEnabled: false` : 8 cartes visibles ; (d) à 320 px de large (`page.setViewportSize({width:320,height:800})`), `document.documentElement.scrollWidth <= 320` sur `/` et `/en/` ; (e) aucun lien « Jouer » ni « Voir le site » sur les cartes `volley-club` et `cafet-miage`.
- [ ] **Step 8:** Run : `npx vitest run && npm run check && npx playwright test tests/e2e/projets.spec.ts`. Expected : PASS.
- [ ] **Step 9:** Commit : `git add -A && git commit -m "feat: cartes de projets, filtre et vignettes"`.

### Task 7: Pages projet, galerie et visionneuse (TDD)

**Files:**
- Create: `src/lib/projets.ts`, `src/components/Galerie.astro`, `src/pages/projets/[id].astro`, `src/pages/en/projects/[id].astro`, `scripts/capture-demo.mjs`, `src/assets/projets/pit-wall/01.png` ; Modify: `src/i18n/ui.ts`
- Test: `tests/unit/projets.test.ts`, `tests/e2e/projet.spec.ts`

**Interfaces:**
- Consumes : `projets`, `selectionnerImages`, `altCapture`, `projectPath`, `Base`.
- Produces : `voisins(id: string): { prev: Projet; next: Projet }` (boucle sur l'ordre de `projets`, lève une erreur pour un id inconnu) ; `projetParId(id: string): Projet`.

- [ ] **Step 1:** Écrire `tests/unit/projets.test.ts` : `voisins('drift-club')` donne `prev.id === 'cafet-miage'` et `next.id === 'rallye-club'` ; `voisins('cafet-miage').prev.id === 'marque'` ; `voisins('marque').next.id === 'cafet-miage'` ; `voisins('inconnu')` lève une erreur ; `projetParId('tanks').titre === 'Tanks!'`.
- [ ] **Step 2:** Run : `npx vitest run tests/unit/projets.test.ts`. Expected : FAIL. Puis implémenter `src/lib/projets.ts`.
- [ ] **Step 3:** Écrire `scripts/capture-demo.mjs <url> <fichier.png>` : ouvre l'URL dans Chromium (Playwright) en 1280×720, attend 2 secondes, enregistre la capture. L'utiliser pour `https://tonoplas909.github.io/racing-incremental/` vers `src/assets/projets/pit-wall/01.png` (une vraie capture de départ, que Matis remplacera ; elle sert aussi à tester la visionneuse). Si la démo ne répond pas, utiliser `https://tonoplas909.github.io/tanks/` et déplacer la capture vers `src/assets/projets/tanks/01.png`, puis adapter le test e2e ci-dessous à ce projet.
- [ ] **Step 4:** Les deux pages `[id].astro` utilisent `getStaticPaths` sur `projets` et `Base`. Contenu (§6.2) : lien « ← Projets » vers `homePath(lang) + '#projets'`, titre, badge, stack, boutons Jouer/Voir le site (seulement si `liens.demo`) et Code, description, points clés, `Galerie`, liens projet précédent et suivant via `voisins`. Image de partage : la première capture si elle existe.
- [ ] **Step 5:** `Galerie.astro` : rien n'est rendu si le projet n'a aucune image. Sinon, vignettes `astro:assets` (WebP) dans l'ordre alphabétique, chacune un `<a href>` vers l'image en grand (c'est ce qui sert sans JavaScript), `alt` via `altCapture` ; un `<dialog>` avec image, boutons précédent et suivant et bouton fermer, `aria-label` traduits ; script : clic sur une vignette `showModal()` (focus piégé nativement), flèches gauche et droite naviguent, Échap ferme.
- [ ] **Step 6:** Écrire `tests/e2e/projet.spec.ts` : (a) pour chacun des 8 ids, `/projets/<id>/` et `/en/projects/<id>/` répondent 200 avec un `<h1>` non vide ; (b) `/projets/volley-club/` et `/projets/cafet-miage/` n'ont aucun lien « Jouer » ni « Voir le site », mais un lien « Code » ; (c) `/projets/cafet-miage/` et `/projets/volley-club/` n'ont ni `<dialog>` ni vignette ; (d) sur `/projets/pit-wall/` : clic sur la vignette ouvre le dialog visible, `Escape` le ferme ; (e) lien précédent de `/projets/cafet-miage/` pointe vers `/projets/marque/` et lien suivant de `/projets/marque/` vers `/projets/cafet-miage/` ; (f) `/en/projects/pit-wall/` a son sélecteur de langue vers `/projets/pit-wall/` ; (g) avec `javaScriptEnabled: false`, la vignette de `/projets/pit-wall/` est un lien dont le `href` mène à un fichier image.
- [ ] **Step 7:** Run : `npx vitest run && npm run check && npx playwright test tests/e2e/projet.spec.ts`. Expected : PASS.
- [ ] **Step 8:** Commit : `git add -A && git commit -m "feat: pages projet, galerie et visionneuse"`.

### Task 8: Pages CV imprimables (TDD)

**Files:**
- Create: `src/pages/cv.astro`, `src/pages/en/cv.astro`, `src/components/CvPage.astro`, `src/styles/print.css` ; Modify: `src/i18n/ui.ts`
- Test: `tests/e2e/cv.spec.ts`

**Interfaces:**
- Consumes : `profil`, `competences`, `parcours`, `trierParcours`, `formatPeriode`, `projets`.
- Produces : `CvPage.astro` (prop `{ lang: Lang }`), partagé par les deux routes.

- [ ] **Step 1:** Écrire `tests/e2e/cv.spec.ts` : (a) `/cv/` et `/en/cv/` répondent 200 et contiennent nom, intitulé, lien LinkedIn, lien GitHub, les 9 compétences, les 11 entrées de parcours, les stages et les trois projets `Cafet'MIAGE`, `Drift Club`, `Rallye Club` ; (b) leur HTML ne correspond pas à `/(?:\+33|0)\s?[67](?:[\s.-]?\d{2}){4}/` ni à `/\b\d{1,2}\/\d{1,2}\/\d{4}\b/` et ne contient pas `matis.nico123@gmail.com` en clair ; (c) après `page.emulateMedia({ media: 'print' })`, le fond du `body` est blanc (`rgb(255, 255, 255)`), le texte est sombre et l'en-tête de navigation est masqué ; (d) le contenu tient sur une page A4 (voir la vérification du nombre de pages en tâche 10).
- [ ] **Step 2:** Run : `npx playwright test tests/e2e/cv.spec.ts`. Expected : FAIL.
- [ ] **Step 3:** Implémenter `CvPage.astro` selon §6.3 (nom, intitulé, contact e-mail assemblé comme en tâche 5, GitHub, LinkedIn, profil en deux phrases, compétences, parcours, trois projets sur une ligne, langues, centres d'intérêt, aucune photo) et `print.css` (`@page { size: A4; margin: 14mm }`, texte `#0f1b2d` sur blanc, masque en-tête, pied de page et sélecteur, évite les coupures dans les entrées). Les routes `cv.astro` et `en/cv.astro` utilisent `Base` avec leur propre `<title>` et leur propre description.
- [ ] **Step 4:** Run : `npx playwright test tests/e2e/cv.spec.ts`. Expected : PASS.
- [ ] **Step 5:** Commit : `git add -A && git commit -m "feat: pages CV imprimables FR/EN"`.

### Task 9: 404, robots, sitemap, favicon et image de partage

**Files:**
- Create: `src/pages/404.astro`, `public/robots.txt`, `public/favicon.svg`, `scripts/build-og.mjs`, `public/og-default.png`
- Test: `tests/e2e/site.spec.ts`

**Interfaces:**
- Consumes : `langFromPath`, `homePath`, `t`, `Base`.

- [ ] **Step 1:** Écrire `tests/e2e/site.spec.ts` : (a) `/nimportequoi/` répond 404 avec un lien d'accueil vers `/` et le texte français ; (b) `/en/nope/` répond 404 avec le texte anglais et un lien d'accueil vers `/en/` ; (c) `/robots.txt` contient `Sitemap: https://tonoplas909.github.io/sitemap-index.xml` ; (d) `/sitemap-index.xml` répond 200 ; (e) `/og-default.png` répond 200 avec `content-type` `image/png`.
- [ ] **Step 2:** Run : `npx playwright test tests/e2e/site.spec.ts`. Expected : FAIL.
- [ ] **Step 3:** `404.astro` contient les deux versions (FR et EN) du texte et du lien d'accueil, avec `hidden` sur celle qui ne correspond pas ; un petit script lit `langFromPath(location.pathname)` et révèle la bonne ; sans JavaScript, la version française est visible. `robots.txt` : `User-agent: *`, `Allow: /`, ligne `Sitemap:` ci-dessus. `favicon.svg` : un `~_` simple aux couleurs `--bg` et `--accent`.
- [ ] **Step 4:** `scripts/build-og.mjs` rend en 1200×630 (Playwright, HTML en ligne, polices système en secours) une image dans le style terminal : fond `--bg`, nom « Matis Demore », ligne « Développeur fullstack · M1 MIAGE », accent `--accent` ; écrit `public/og-default.png`. L'exécuter une fois (`node scripts/build-og.mjs`) et commiter le PNG.
- [ ] **Step 5:** Run : `npx playwright test tests/e2e/site.spec.ts`. Expected : PASS.
- [ ] **Step 6:** Commit : `git add -A && git commit -m "feat: 404 bilingue, robots, sitemap, favicon et image de partage"`.

### Task 10: PDF du CV, contrôles de build et déploiement (TDD)

**Files:**
- Create: `scripts/lib/check.mjs`, `scripts/check-dist.mjs`, `scripts/build-cv.mjs`, `.github/workflows/deploy.yml`
- Test: `tests/unit/check.test.ts`

**Interfaces:**
- Produces (`scripts/lib/check.mjs`) : `findForbidden(html: string): string[]` (renvoie les motifs interdits trouvés parmi : numéro de mobile français `/(?:\+33|0)\s?[67](?:[\s.-]?\d{2}){4}/`, date `/\b\d{1,2}\/\d{1,2}\/\d{4}\b/`, `lovable` et `gptengineer` sans tenir compte de la casse, `matis.nico123@gmail.com`) ; `missingAlternates(pages: Record<string, string>): string[]` (pour chaque chemin FR ou EN, renvoie ceux dont la page équivalente n'est pas dans `pages`, hors 404 et PDF).
- Consumes : `dist/` produit par `npm run build`.

- [ ] **Step 1:** Écrire `tests/unit/check.test.ts` : `findForbidden('<p>06 12 34 56 78</p>')` contient le motif mobile ; `findForbidden('Né le 01/02/2003')` contient le motif date ; `findForbidden('Lovable Generated Project')` est non vide ; `findForbidden('<a href="mailto:matis.nico123@gmail.com">')` est non vide ; `findForbidden('<h1>Matis Demore</h1>')` renvoie `[]` ; `missingAlternates({'/':'', '/en/':'', '/cv/':''})` renvoie `['/cv/']` ; avec `'/en/cv/'` ajouté il renvoie `[]`.
- [ ] **Step 2:** Run : `npx vitest run tests/unit/check.test.ts`. Expected : FAIL. Puis implémenter `scripts/lib/check.mjs`.
- [ ] **Step 3:** `scripts/check-dist.mjs` : parcourt `dist/` ; pour chaque `index.html` et `404.html`, applique `findForbidden` (échec s'il renvoie quelque chose, en citant le fichier) ; applique `missingAlternates` ; vérifie que `dist/Matis-Demore-CV.pdf` et `dist/Matis-Demore-CV-EN.pdf` existent et font plus de 10 Ko ; vérifie que chacun contient exactement une page (nombre d'occurrences de `/Type /Page` non suivi de `s`) ; sort avec le code 1 à la première anomalie ; sinon affiche `OK` et sort avec le code 0.
- [ ] **Step 4:** `scripts/build-cv.mjs` : lance `astro preview --port 4322` sur `dist/`, attend que l'URL réponde, imprime `/cv/` et `/en/cv/` avec Playwright (`page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })`) vers `dist/Matis-Demore-CV.pdf` et `dist/Matis-Demore-CV-EN.pdf`, puis arrête le serveur.
- [ ] **Step 5:** Run : `npm run build && npm run build:cv && node scripts/check-dist.mjs`. Expected : sortie `OK`, code 0, les deux PDF présents. Si un PDF dépasse une page, réduire les marges ou les tailles dans `print.css` (tâche 8) jusqu'à ce que le contrôle passe.
- [ ] **Step 6:** `.github/workflows/deploy.yml` : déclenché sur `push` vers `main` et `workflow_dispatch` ; permissions `contents: read`, `pages: write`, `id-token: write` ; un job `build` (checkout, setup-node avec le Node requis par Astro, `npm ci`, `npx playwright install --with-deps chromium`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e`, `npm run build:cv`, `node scripts/check-dist.mjs`, `actions/upload-pages-artifact` sur `dist`) et un job `deploy` (`needs: build`, environnement `github-pages`, `actions/deploy-pages`). Versions majeures actuelles des actions officielles.
- [ ] **Step 7:** Run : `npx vitest run`. Expected : PASS. Commit : `git add -A && git commit -m "feat: PDF du CV, contrôles de build et workflow de déploiement"`.

### Task 11: Accessibilité, performance, documentation et vérification finale

**Files:**
- Create: `README.md`, `tests/e2e/a11y.spec.ts`

- [ ] **Step 1:** Écrire `tests/e2e/a11y.spec.ts` : avec `AxeBuilder`, aucune violation d'impact `serious` ou `critical` sur `/`, `/en/`, `/projets/drift-club/`, `/en/projects/pit-wall/`, `/cv/` et `/en/cv/` ; contrôle de l'ordre de tabulation : sur `/`, la première touche Tab atteint un lien de l'en-tête, et un lien de la navigation affiche un contour de focus visible.
- [ ] **Step 2:** Run : `npx playwright test tests/e2e/a11y.spec.ts`. Expected : PASS ; corriger les violations (contrastes, libellés) dans les composants concernés, puis relancer.
- [ ] **Step 3:** `README.md` court : installer (`npm ci`), lancer (`npm run dev`), ajouter un projet (une entrée dans `src/data/projets.ts`), ajouter des captures (déposer les images dans `src/assets/projets/<id>/`, `node scripts/capture-demo.mjs <url> <fichier>` pour une capture automatique), tests, régénérer les PDF, déploiement (réglage *Pages → Source → GitHub Actions*).
- [ ] **Step 4:** Mesurer Lighthouse sur l'accueil et une page projet : `npm run build && npm run preview -- --port 4321` puis `npx lighthouse http://localhost:4321/ --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --quiet --output=json`. Expected : 95 ou plus dans chaque catégorie. Si Chrome n'est pas disponible, le dire dans le compte rendu au lieu d'affirmer un score.
- [ ] **Step 5:** Vérification complète, avec la sortie à l'appui : `npm run check && npm test && npm run build && npm run test:e2e && npm run build:cv && node scripts/check-dist.mjs`. Expected : tout passe, code 0.
- [ ] **Step 6:** Commit : `git add -A && git commit -m "docs: README, contrôles d'accessibilité"`. Ne pas pousser.
- [ ] **Step 7:** Compte rendu final à Matis : résultats des commandes et des scores, démos retirées s'il y en a, et les points restants de la spec §14 (poste et missions chez Eng'IT et Flunch, orthographe d'Eng'IT, feu vert pour la démo de Cafet'MIAGE, captures, relecture des textes EN et des descriptions), plus l'étape manuelle *Pages → Source → GitHub Actions* avant la mise en ligne.
