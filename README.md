# Portfolio de Matis Demore

Portfolio et CV bilingues (français et anglais) de Matis Demore, développeur fullstack :
<https://tonoplas909.github.io/>. Site statique construit avec [Astro](https://astro.build),
sans cookie, sans statistiques et sans requête vers un tiers (polices hébergées).

- `/` et `/en/` : accueil (présentation, compétences, projets avec filtre, parcours, contact)
- `/projets/<id>/` et `/en/projects/<id>/` : une page par projet, avec galerie de captures
- `/cv/` et `/en/cv/` : le CV, imprimable ; ses PDF sont générés au déploiement

## Installer et lancer

Node 22.23.4 ou plus récent (le workflow utilise Node 24).

```sh
npm ci            # installe les dépendances
npm run dev       # serveur local sur http://localhost:4321
npm run build     # construit le site dans dist/
npm run preview   # sert dist/ en local
```

## Tests et contrôles

```sh
npm run check     # astro check : types TypeScript et templates
npm test          # tests unitaires (Vitest)
npm run test:e2e  # tests de bout en bout (Playwright) : construit et sert le site, accessibilité (axe) incluse
```

La première fois, `npx playwright install chromium` installe le navigateur utilisé par les tests
et par la génération des PDF. Après un `npm run build`, `node scripts/check-dist.mjs` vérifie que
chaque page a son pendant `hreflang` et que les deux PDF existent.

## Ajouter un projet

Ajouter une entrée dans le tableau de `src/data/projets.ts` : son `id` (utilisé dans l'URL),
son `titre`, sa `categorie` (`jeu` ou `asso`), le nom de son dépôt, ses textes `resume`,
`description` et `points` **en français et en anglais**, sa `stack` et ses `liens` (`code`
obligatoire, `demo` facultatif). L'ordre du tableau est l'ordre d'affichage. Les cartes, les pages
FR et EN, le sitemap et la visionneuse suivent automatiquement. Les tests vérifient que les textes
FR et EN ne sont pas vides et que les ids sont uniques.

**Attention : les tests figent volontairement la liste actuelle des 8 projets** (7 jeux et 1
projet associatif, Cafet'MIAGE), telle que la définit la spec du site. Ajouter, retirer ou
réordonner un projet fait donc échouer `npm test` et `npm run test:e2e`, et comme le workflow de
déploiement lance les deux avant de publier, **un push sur `main` sans ces mises à jour bloque la
mise en ligne**. Mettre à jour les tests dans le même commit que `src/data/projets.ts` :

| Fichier | À adapter |
| --- | --- |
| `tests/unit/data.test.ts` | la liste des ids dans l'ordre d'affichage, le « 7 autres en jeu » (`toHaveLength(7)`), la liste des projets en vedette |
| `tests/unit/filtre.test.ts` | les comptes « tous » (8) et « jeu » (7), la liste des projets « asso » |
| `tests/unit/projets.test.ts` | les voisins précédent et suivant, y compris la boucle entre le dernier projet et le premier |
| `tests/unit/hero.test.ts` | le nombre de projets du bloc `profil.ts` (`toBe(8)`) |
| `tests/e2e/projets.spec.ts` | les comptes de cartes (8), le filtre « Jeux » (7), « 8 projets » et « 8 projects », la liste des ids dans l'ordre d'affichage |
| `tests/e2e/projet.spec.ts` | la liste `IDS` des projets, et les liens précédent et suivant des pages `cafet-miage` et `marque` |
| `tests/e2e/home.spec.ts` | le `projets: 8` du bloc `profil.ts` du héros |

Retirer ou renommer un projet touche aussi les tests qui s'appuient sur lui : `drift-club` (lien
« Jouer », et sitemap dans `tests/e2e/site.spec.ts`), `pit-wall` (la seule capture),
`cafet-miage` et `volley-club` (sans démo). Les trois projets du CV sont fixés dans
`src/components/CvPage.astro` (`cafet-miage`, `drift-club`, `rallye-club`) et dans la constante
`IDS_PROJETS_CV` de `tests/e2e/cv.spec.ts` : à modifier ensemble si l'un d'eux est retiré ou renommé.

## Ajouter des captures d'écran

Déposer les images (`.png`, `.jpg`, `.jpeg` ou `.webp`) dans `src/assets/projets/<id>/`, où
`<id>` est l'id du projet.

- Les captures sont affichées dans l'ordre alphabétique des noms de fichier (`01.png`, `02.png`, ...).
- La première sert de vignette sur la carte, de première image de la galerie et d'image de partage de la page.
- Une légende (facultative, utilisée comme texte alternatif) se donne dans le champ `legendes` du
  projet, indexé par nom de fichier : `legendes: { '01.png': { fr: '...', en: '...' } }`.
  Sans légende, un texte par défaut est généré.

Pour une capture automatique d'une démo en ligne (1280 × 720) :

```sh
node scripts/capture-demo.mjs https://tonoplas909.github.io/tanks/ src/assets/projets/tanks/01.png
```

## Régénérer les PDF du CV et l'image de partage

Les PDF ne sont jamais commités : ils sont générés à chaque déploiement. Pour les produire en local,
dans `dist/` :

```sh
npm run build && npm run build:cv
```

L'image de partage par défaut (`public/og-default.png`, 1200 × 630) se régénère avec
`npm run build:og`, puis se commite.

## Où modifier le contenu

Tout le contenu vient de `src/data/` :

| Fichier | Contenu |
| --- | --- |
| `profil.ts` | nom, intitulé, formation, langues, centres d'intérêt, liens, e-mail |
| `projets.ts` | les projets, avec leurs textes FR et EN |
| `parcours.ts` | formation, expériences et distinctions |
| `competences.ts` | la liste des compétences |

Les textes de l'interface (navigation, libellés, pages d'erreur) sont dans `src/i18n/ui.ts`, avec
chaque clé en français et en anglais.

## Déploiement

Chaque push sur `main` lance le workflow `.github/workflows/deploy.yml` : installation,
`astro check`, tests unitaires, build, tests e2e, génération des PDF, contrôle de `dist/`, puis
mise en ligne sur GitHub Pages. Une étape qui échoue bloque la mise en ligne.

**Un seul réglage manuel, à faire une fois** : dans les réglages du dépôt sur GitHub,
*Pages → Source → GitHub Actions*.
