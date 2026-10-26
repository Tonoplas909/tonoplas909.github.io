# Portfolio et CV de Matis Demore : spécification de design

Date : 2026-10-26. Statut : validée par Matis le 2026-10-26, mise à jour avec ses réponses sur le parcours.

## 1. Objectif et public

Un site unique qui sert à la fois de **portfolio** (projets) et de **CV** (parcours, compétences), refait de zéro pour remplacer l'ancien site généré par Lovable.

- **Public principal** : des recruteurs, pour un premier CDI en développement (fullstack).
- **Public secondaire** : vitrine générale, pour toute personne qui tombe sur le site.
- **Langues** : français et anglais, avec un sélecteur de langue.
- **Hébergement** : GitHub Pages, à `https://tonoplas909.github.io/` (dépôt `Tonoplas909/tonoplas909.github.io`, public).

Critères de réussite :
- Un recruteur comprend en moins de 30 secondes qui est Matis, ce qu'il sait faire et où voir son travail.
- Chaque projet a sa page, avec une galerie de captures que Matis peut enrichir sans toucher au code.
- Le site et le CV (PDF) ne se contredisent jamais, car ils lisent les mêmes données.
- Aucune donnée personnelle sensible n'est publiée (voir section 10).

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Cible | Premier CDI + vitrine générale |
| Langues | FR (par défaut) et EN, sélecteur de langue |
| Direction visuelle | **A, « Terminal »** (maquette A du canvas « Portfolio et CV de Matis Demore ») |
| Design system | Aucun, identité propre |
| Stack | **Astro** statique, TypeScript, sans framework côté visiteur |
| Projets | 8 (voir section 5), une page par projet |
| Exclus | Compt'Touns, dreamcatcher, paralympics, forks (PowerToys, TP Angular), multimedia, dépôts privés |
| Contact public | E-mail `matis.nico123@gmail.com` (protégé), GitHub `https://github.com/Tonoplas909`, LinkedIn `https://www.linkedin.com/in/matis-demore-31609a267/`. **Pas de téléphone.** |
| Photo | Aucune, ni sur l'accueil ni sur le CV |
| Mesure d'audience | Aucune, pas de cookies |

La maquette A est la référence visuelle, mais cette spec la remplace sur le contenu : les 8 projets sont tous sur l'accueil, avec des dates de parcours corrigées.

## 3. Hors périmètre

Blog, mode clair/sombre commutable (le site est sombre, seules les pages CV s'impriment en clair), formulaire de contact, CMS, statistiques de visite, redirection automatique selon la langue du navigateur, jeux intégrés en `iframe`, réécriture de l'historique git.

## 4. Architecture

### 4.1 Stack

Astro (dernière version stable à l'implémentation), TypeScript en mode strict. Polices hébergées avec le site via `@fontsource` (JetBrains Mono, IBM Plex Sans, sous-ensemble latin). Images via `astro:assets`. `@astrojs/sitemap`. Tests : Vitest et Playwright, avec `@axe-core/playwright`. Configuration : `site: 'https://tonoplas909.github.io'`, pas de `base`, `build.format: 'directory'`, `trailingSlash: 'always'`.

### 4.2 Structure du dépôt

```
src/
  pages/
    index.astro                  accueil FR
    projets/[id].astro           page projet FR
    cv.astro                     CV imprimable FR
    en/index.astro               accueil EN
    en/projects/[id].astro       page projet EN
    en/cv.astro                  CV imprimable EN
    404.astro
  layouts/Base.astro             head, SEO, hreflang, sélecteur FR/EN
  components/                    Header, Hero, Competences, FiltreProjets, CarteProjet,
                                 Galerie, Parcours, BlocCv, Contact, Footer
  data/                          projets.ts, parcours.ts, competences.ts, profil.ts
  i18n/ui.ts                     textes de l'interface (fr, en) + helper de routes FR↔EN
  lib/                           email.ts (assemblage), routes.ts (page équivalente)
  assets/projets/<id>/           captures déposées par Matis
  styles/                        tokens.css, global.css, print.css
public/                          favicon, image de partage par défaut, robots.txt
scripts/build-cv.mjs             génération des PDF (Playwright)
tests/                           unit/ (Vitest), e2e/ (Playwright)
.github/workflows/deploy.yml
```

### 4.3 Routes

| Page | FR | EN |
|---|---|---|
| Accueil | `/` | `/en/` |
| Projet | `/projets/<id>/` | `/en/projects/<id>/` |
| CV imprimable | `/cv/` | `/en/cv/` |
| PDF du CV | `/Matis-Demore-CV.pdf` | `/Matis-Demore-CV-EN.pdf` |

Le sélecteur de langue est un lien vers la page équivalente (calculée par `lib/routes.ts`). Pas de redirection automatique.

## 5. Données et contenu

Tout texte affiché a une version `fr` et une version `en`. Le contenu est dans `src/data/` et alimente l'accueil, les pages projet et les pages CV.

### 5.1 Projet

`id`, `titre`, `categorie` (`jeu` | `asso`), `resume` (court, pour la carte), `description` (2 à 3 paragraphes, pour la page), `points` (liste de points clés), `stack` (liste), `liens.demo` (facultatif), `liens.code`, `badge` (facultatif), `vedette` (booléen), `legendes` (facultatif : légende et texte alternatif par nom de fichier d'image).

Les résumés FR sont ceux de la maquette. Les descriptions et points clés sont rédigés à partir des README des dépôts, puis relus par Matis. Les textes EN sont rédigés à l'implémentation et relus par Matis.

### 5.2 Les 8 projets (dans l'ordre d'affichage)

| id | Titre | Catégorie | Dépôt | Démo |
|---|---|---|---|---|
| `cafet-miage` | Cafet'MIAGE (vedette, badge « Projet réel · BDE MIAGE Nice ») | asso | `cafeteria-manager` | **voir 5.4** |
| `drift-club` | Drift Club (vedette) | jeu | `drift-club` | oui |
| `rallye-club` | Rallye Club | jeu | `rallye-club` | oui |
| `volley-club` | Volley Club | jeu | `volley-club` | non (lien Code seul) |
| `tanks` | Tanks! | jeu | `tanks` | oui |
| `moto-club` | Moto Club | jeu | `moto-club` | oui |
| `pit-wall` | Pit Wall | jeu | `racing-incremental` | oui |
| `marque` | MARQUE | jeu | `car-collection` | oui |

- URL de démo : `https://tonoplas909.github.io/<dépôt>/`. URL de code : `https://github.com/Tonoplas909/<dépôt>`.
- Chaque `stack` est vérifiée à l'implémentation dans le `package.json` ou le README du dépôt, sans rien inventer. Les stacks de la maquette (par exemple « Three.js » pour Drift Club) sont des hypothèses à confirmer.
- À l'implémentation, chaque URL de démo est vérifiée (réponse 200). Une démo qui ne répond pas est retirée du site et signalée à Matis.

### 5.3 Parcours

| Période | Type | Intitulé | Lieu / détail |
|---|---|---|---|
| 2026 → auj. | études | M1 MIAGE, parcours NumRes, en alternance | Sophia-Antipolis |
| 2026 → auj. | emploi | Alternance, Eng'IT | ESN à Sophia-Antipolis |
| 2025 → 2026 | emploi | Flunch | |
| 2023 → 2025 | emploi | Alternance, développeur fullstack, HIMYDATA | Python et frontend (Vue.js, Angular) |
| 2022 → 2025 | études | BUT Informatique en alternance | IUT Nice Sophia Antipolis, campus Polytech |
| 2022 → 2023 | emploi | Alternance, développeur back-end Python, QITI | Équipe DevOps, méthode Scrum |
| 2022 | distinction | Concours IA for Youth, Intel | Classé deuxième en équipe |
| 2021 → 2022 | études | Baccalauréat général, mention bien | Lycée Simone Veil, spécialités mathématiques et NSI |
| 2020 | stage | Stage de seconde, NOEVA | 1 semaine, intégrateur informatique |
| 2019 | stage | Stage de troisième, Air France | 1 semaine, data center et DSI |
| sans période | asso | Membre du BDE MIAGE Nice | Auteur de Cafet'MIAGE |

- Types : `etudes`, `emploi`, `stage`, `distinction`, `asso`.
- Une fin de période absente s'affiche « auj. » (FR) ou « present » (EN).
- Tri : début décroissant, puis fin décroissante (une période en cours passe avant les autres), les entrées sans période en dernier. Sur l'accueil, les entrées de type `stage` s'affichent en compact, sur une ligne.
- Pour Flunch et Eng'IT, l'intitulé du poste et les missions ne sont pas encore connus : le site affiche l'entreprise seule et un détail vide tant que Matis ne les a pas fournis (section 14).

### 5.4 Cafet'MIAGE : lien vers la démo

Le README du dépôt indique que l'accès aux données est ouvert à la clé anonyme Supabase. La démo publique pourrait donc afficher le planning réel du staff (noms de personnes) à tout visiteur. **Par défaut, la fiche Cafet'MIAGE n'a que le lien Code, sans démo**, jusqu'à ce que Matis confirme que la démo ne montre pas de données personnelles (ou qu'elle est protégée).

### 5.5 Compétences

Python, Vue.js, Angular, TypeScript, React, Java, SQL, Supabase, Three.js.

### 5.6 Profil

`profil.ts` : nom, intitulé (« Développeur fullstack »), formation (« M1 MIAGE · NumRes »), lieu (« Sophia-Antipolis »), objectif (« premier CDI »), langues (français, anglais), centres d'intérêt (volleyball, auto et moto, jeux vidéo), liens (GitHub `https://github.com/Tonoplas909`, LinkedIn `https://www.linkedin.com/in/matis-demore-31609a267/`), e-mail en deux morceaux (voir 8.2). Le bloc `profil.ts` du hero est **calculé** à partir des données : le nombre de projets et la stack ne sont jamais écrits en dur.

## 6. Pages

### 6.1 Accueil (`/`, `/en/`)

Une page, dans cet ordre : en-tête (logo `~/matis-demore_`, navigation, sélecteur FR/EN), hero (statut, nom, accroche, deux boutons, bloc `profil.ts`), compétences, projets (filtre Tous / Jeux / Associatif, les 8 cartes), parcours, bloc CV (boutons PDF FR et EN), pied de page avec contact.

Les cartes en vedette (Cafet'MIAGE, Drift Club) sont larges. Les autres sont en trois par ligne, puis en une colonne sur téléphone.

### 6.2 Page projet (`/projets/<id>/`, `/en/projects/<id>/`)

Lien « ← Projets », titre, badge, stack, boutons Jouer ou Voir le site et Code, description, points clés, galerie, liens vers le projet précédent et le suivant (dans l'ordre d'affichage, de façon circulaire).

### 6.3 Page CV (`/cv/`, `/en/cv/`)

Une page A4 : nom, intitulé, contact (e-mail, GitHub, LinkedIn), profil en deux phrases, compétences, parcours (emploi, études, stages, distinction, vie associative), trois projets en une ligne (Cafet'MIAGE, Drift Club, Rallye Club), langues, centres d'intérêt. Pas de photo. La feuille de style `print.css` passe le texte en sombre sur fond blanc, masque la navigation et force une mise en page d'une page.

### 6.4 404

Dans le style du site, avec un lien vers l'accueil de la langue courante (déduite du préfixe d'URL).

## 7. Système visuel (direction A)

Fichier `styles/tokens.css`, variables CSS.

| Rôle | Valeur |
|---|---|
| Fond | `#0a0e14` |
| Surface | `#0f151d`, `#111a24` |
| Traits | `#1f2b38`, `#34475c` |
| Texte | `#e6edf3` (principal), `#b8c7d6` (secondaire), `#9fb0c0` (discret) |
| Accent | `#6cb6ff` (survol `#a5d3ff`) |
| Point « disponible » | `#3ddc97` |
| Code | `#c792ea`, `#a5d6a7`, `#f2cc8f` |

- Polices : JetBrains Mono pour titres, navigation et étiquettes ; IBM Plex Sans pour le texte.
- Conteneur : 1120 px de large maximum, 32 px de marge latérale. Mise en page en flex avec retour à la ligne, pour que tout s'empile sur téléphone.
- Boutons : 48 px de haut minimum. Filtres : 44 px.
- Cartes : fond surface, bordure 1 px, rayon 10 px. Au survol et au focus clavier : bordure accent, légère mise à l'échelle de la vignette, décalage de la flèche. Ces animations sont coupées avec `prefers-reduced-motion`.

## 8. Comportements

### 8.1 Filtre des projets

Sans JavaScript, les 8 projets restent affichés. Avec JavaScript, les cartes se masquent avec l'attribut `hidden`, les boutons portent `aria-pressed`, et une région `aria-live` annonce le nombre de résultats. L'état n'est pas conservé entre deux visites.

### 8.2 E-mail protégé

`profil.ts` stocke l'adresse en deux morceaux (partie locale, domaine). `lib/email.ts` les assemble en lien `mailto:` au chargement. Sans JavaScript, l'adresse s'affiche épelée : « matis.nico123 (arobase) gmail (point) com » (FR), « (at) » et « (dot) » en EN. Cette protection arrête les robots simples, pas ceux qui exécutent du JavaScript.

### 8.3 Galerie et visionneuse

Matis dépose ses images dans `src/assets/projets/<id>/`. Elles apparaissent sur la page du projet dans l'ordre alphabétique des noms de fichiers. Astro les redimensionne et les convertit en WebP. La première image sert de vignette sur la carte. Un clic ouvre une visionneuse en `<dialog>` natif (flèches et Échap au clavier, focus piégé). Sans JavaScript, chaque vignette est un lien vers l'image en grand.

- Texte alternatif : la légende de `legendes` si elle existe, sinon « Capture d'écran N de <titre> ».
- Un projet sans image n'a ni galerie sur sa page, ni vignette sur sa carte. Aucun cadre vide ni image cassée.

### 8.4 PDF du CV

À chaque déploiement, `scripts/build-cv.mjs` imprime `/cv/` et `/en/cv/` avec Playwright (Chromium) et écrit `Matis-Demore-CV.pdf` et `Matis-Demore-CV-EN.pdf` dans `dist/`. Les PDF ne sont jamais commités. Le script a une commande locale `npm run build:cv`.

## 9. SEO et partage

- Sur chaque page : `<title>`, description, URL canonique, `<html lang>`, `hreflang` FR/EN et `x-default`, Open Graph et Twitter card.
- Image de partage : celle du projet (sa première capture) sur une page projet, sinon une image par défaut de 1200×630 dans le style terminal, générée une fois à l'implémentation et rangée dans `public/`.
- Données structurées `Person` (nom, intitulé, URL, `sameAs` : GitHub et LinkedIn), sans e-mail.
- `@astrojs/sitemap` avec les alternatives de langue, et `robots.txt` pointant vers le sitemap.
- Plus aucune balise ni mention « Lovable ».

## 10. Confidentialité

- **Jamais publiés** : numéro de téléphone, date de naissance, adresse personnelle, permis et véhicule. Le lieu affiché est « Sophia-Antipolis » (lieu d'études).
- Aucune requête vers un tiers : polices hébergées, pas de statistiques, pas de cookies, donc pas de bandeau de consentement.
- Les liens externes portent `rel="noopener noreferrer"`.
- L'e-mail est public mais protégé (8.2).
- L'ancienne image du CV (téléphone et date de naissance) n'est plus servie après le déploiement, mais reste dans l'historique git du dépôt public. Réécrire l'historique est hors périmètre sauf demande explicite de Matis.

## 11. Performance et accessibilité

- Objectif Lighthouse : 95 ou plus en performance, accessibilité, bonnes pratiques et SEO, sur l'accueil et une page projet, mesuré à la fin de l'implémentation.
- JavaScript uniquement pour le filtre, la visionneuse et l'e-mail. Polices avec `font-display: swap`.
- Contraste du texte d'au moins 4,5:1, anneau de focus visible, cibles tactiles d'au moins 44 px, balises sémantiques (`<nav>`, `<main>`, `<article>`, `<button>`, `<a>`), `aria-label` sur les liens icône, ordre de tabulation logique.

## 12. Tests et déploiement

### 12.1 Tests

- **Vitest** :
  - chaque projet a ses textes FR et EN non vides ;
  - catégories et URL valides ;
  - les ids sont uniques, et chaque dossier de `src/assets/projets/` porte l'id d'un projet existant ;
  - chaque clé de `i18n/ui.ts` existe en FR et en EN ;
  - la page équivalente FR↔EN est correcte (accueil, projet, CV) ;
  - l'assemblage de l'e-mail est correct, et la version épelée aussi.
- **Playwright** : filtre, changement de langue vers la page équivalente, ouverture et fermeture de la visionneuse (Échap), lien e-mail, et contrôle axe sur l'accueil, une page projet et `/cv/` (zéro violation grave ou critique).
- **Post-build** : un script vérifie que chaque page a son pendant `hreflang` et que les deux PDF existent.

### 12.2 Workflow GitHub Actions

Déclenché à chaque push sur `main` : installation, `astro check`, tests Vitest, build, e2e Playwright, génération des PDF, puis déploiement avec `actions/deploy-pages`. Un échec à n'importe quelle étape bloque la mise en ligne.

**Prérequis manuel (Matis)** : dans les réglages du dépôt, *Pages → Source → GitHub Actions*. L'ancien site reste en ligne tant que ce n'est pas fait.

## 13. Migration

Suppression de l'ancien contenu servi : `assets/`, `lovable-uploads/`, `index.html`, `placeholder.svg`, `favicon.ico`. Ajout de `.gitignore` (`node_modules`, `dist`, `.astro`) et d'un `README.md` court (installer, lancer, ajouter un projet, ajouter des captures, déployer).

## 14. Informations à fournir avant la mise en ligne

Elles n'empêchent pas de construire le site : je mets en place la structure et un contenu provisoire clairement signalé, et Matis complète.

1. L'intitulé du poste et les missions chez Eng'IT, ainsi que l'orthographe exacte du nom de l'entreprise (écrit « Eng'IT » dans cette spec).
2. L'intitulé du poste chez Flunch et ses dates exactes (2025 → 2026 par défaut), si Matis veut les détailler.
3. Le feu vert pour la démo de Cafet'MIAGE (section 5.4).
4. Les captures d'écran de chaque projet (facultatif, elles s'ajoutent à tout moment).
5. La relecture des textes EN et des descriptions de projets.

Déjà tranchés : le parcours de 2025 à 2026 (Flunch, puis alternance chez Eng'IT en M1), tous les stages conservés, pas de photo, URL LinkedIn fournie.
