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

Ajouter une entrée dans le tableau de `src/data/projets.ts` : son `id` (utilisé dans l'URL et comme
nom du dossier de ses captures), son `titre`, sa `categorie` (`jeu` ou `asso`), le nom de son dépôt,
ses textes `resume`, `description` et `points` **en français et en anglais**, sa `stack` et ses
`liens` (`code` obligatoire, `demo` facultatif). L'ordre du tableau est l'ordre d'affichage (les
projets en `vedette` passent en tête sur l'accueil). Les cartes, les pages FR et EN, le sitemap, le
compteur du héros, la visionneuse et les tests suivent automatiquement. Les tests vérifient que les
textes FR et EN ne sont pas vides et que les ids sont uniques. Relancer ensuite `npm run build:og` et
commiter `public/og-default.png` : l'image de partage par défaut dessine le nombre de projets.

**Deux garde-fous volontaires seulement.** D'abord la liste ordonnée des 8 ids de
`tests/unit/data.test.ts` (spec §5.2) : elle échoue quand on ajoute, retire ou réordonne un projet,
avec un message qui renvoie ici ; la mettre à jour dans le même commit que `src/data/projets.ts`
est la seule modification de test à faire. Ensuite l'absence de lien `demo` pour Cafet'MIAGE, dans
le même fichier (la démo publique peut montrer des données personnelles, spec §5.4) : à supprimer
une fois la démo validée. Tout le reste est déduit des données ou du dossier des captures : comptes
de cartes, filtres, précédent et suivant, liens « Jouer » ou « Voir le site » (présents si et
seulement si `liens.demo` existe), vignettes et galeries. Comme le workflow de déploiement lance les
tests avant de publier, un garde-fou resté rouge bloque la mise en ligne.

Retirer ou renommer un projet touche aussi quelques tests qui le citent : `cafet-miage` dans
`tests/e2e/projet.spec.ts` (page lue depuis les données) et `drift-club` dans
`tests/e2e/site.spec.ts` (sitemap). Les trois projets du CV sont fixés dans
`src/components/CvPage.astro` (`cafet-miage`, `drift-club`, `rallye-club`) et dans la constante
`IDS_PROJETS_CV` de `tests/e2e/cv.spec.ts` : à modifier ensemble si l'un d'eux est retiré ou renommé.

## Ajouter des captures d'écran

Déposer les images dans `src/assets/projets/<id>/`, où `<id>` est l'id du projet. Extensions
acceptées : `.png`, `.jpg`, `.jpeg` et `.webp`, en minuscules ou en majuscules ; les autres fichiers
du dossier sont ignorés.

- Les captures sont affichées dans l'ordre naturel des noms de fichier (`2.png` avant `10.png`,
  `01.png`, `02.png`, ...).
- La première sert de vignette sur la carte, de première image de la galerie et d'image de partage de la page.
- Une légende (facultative, utilisée comme texte alternatif) se donne dans le champ `legendes` du
  projet, indexé par nom de fichier : `legendes: { '01.png': { fr: '...', en: '...' } }`.
  Sans légende, un texte par défaut est généré.
- Aucun test à modifier : les tests lisent le dossier et s'adaptent (vignettes, galerie, image de
  partage). Les tests de navigation précédent et suivant de la visionneuse tournent dès qu'un projet
  a au moins deux captures, et sont ignorés tant que ce n'est pas le cas.

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
