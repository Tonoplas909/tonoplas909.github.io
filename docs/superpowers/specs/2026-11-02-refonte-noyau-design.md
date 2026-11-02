# Refonte « Noyau » : spécification de design

Date : 2026-11-02. Statut : direction validée par Matis sur le canevas Claude Design « Fiche technique,
Matis Demore » (accueil animé, pages de section, version mobile). Cette spec complète celle du
2026-10-26 : tout ce qu'elle ne change pas reste valable (données, bilinguisme, CV en PDF, galerie,
filtre, e-mail protégé, aucune donnée sensible, aucun cookie ni statistique, aucune requête vers un tiers).

## 1. Ce qui change

| Sujet | Avant (direction A, « Terminal ») | Après (« Noyau ») |
|---|---|---|
| Accueil | Une page longue : hero, compétences, projets, parcours, CV, contact | Un noyau 3D en fil de fer, entouré de 6 nœuds reliés par des lignes : un par section, plus le statut |
| Sections | Ancres de l'accueil (`#projets`…) | Une page par section |
| Couleurs | Fond `#0a0e14`, accent bleu `#6cb6ff` | Fond `#06070b`, accent cyan `#7cf7ff`, orange `#ff7a3d` pour le statut |
| Polices | JetBrains Mono, IBM Plex Sans | Syne (titres), Geist Mono (texte), hébergées avec le site via `@fontsource` |
| Statut | « M1 MIAGE · NumRes » | « Indisponible : en alternance jusqu'en septembre 2028 », tiré de `profil.ts` |

## 2. Routes

| Page | FR | EN |
|---|---|---|
| Accueil (noyau) | `/` | `/en/` |
| 01 Projets (liste filtrable) | `/projets/` | `/en/projects/` |
| Fiche projet | `/projets/<id>/` | `/en/projects/<id>/` |
| 02 Parcours | `/parcours/` | `/en/background/` |
| 03 Compétences | `/competences/` | `/en/skills/` |
| 04 CV (aperçu + PDF, imprimable) | `/cv/` | `/en/cv/` |
| 05 Contact et statut | `/contact/` | `/en/contact/` |

`lib/routes.ts` reste la seule source des chemins : `sectionPath()`, `equivalentPath()` et
`sectionFromPath()` couvrent ces pages, et le sitemap comme les balises hreflang en découlent.

## 3. Accueil : le noyau

- Un icosaèdre en fil de fer au centre, avec « MD » au milieu : les arêtes avant sont pleines, les arêtes
  arrière en pointillés pâles. Un second icosaèdre plus petit tourne à l'intérieur, deux anneaux en orbite,
  une grille au sol en perspective et l'ombre du noyau.
- Six nœuds placés en 3D (devant, derrière, sur les côtés), reliés au noyau par une ligne : 01 Projets,
  02 Parcours, 03 Compétences, 04 CV, 05 Contact, et le statut en orange. Un nœud du fond est plus petit
  et plus pâle, un nœud de devant plus gros, avec un halo. Chaque nœud est un vrai lien.
- Animation : l'ensemble (noyau, nœuds, anneaux) fait des allers-retours de rotation ; à la souris, il se
  tourne vers le curseur, avec un amorti, puis reprend son balancement quand la souris sort.
- Clic sur un nœud : l'objet pivote pour présenter le nœud, la caméra plonge vers lui, puis la page de la
  section s'ouvre et son contenu apparaît en glissant. Ctrl ou Cmd + clic et clic du milieu gardent le
  comportement normal du navigateur.
- Bouton pause. Avec `prefers-reduced-motion`, rien ne bouge et un clic ouvre la page directement.
  Sans JavaScript, la scène est rendue fixe côté serveur et les liens fonctionnent.
- Deux gabarits : large (ordinateur, étiquettes complètes) et compact (téléphone, numéros seuls, puis la
  liste des sections en grandes lignes à toucher).
- Les calculs de la scène sont dans `lib/noyau.ts`, sans dépendance : le serveur s'en sert pour le rendu
  initial, le navigateur pour l'animation, Vitest pour les tests.

## 4. Pages de section

En-tête commun : icône du noyau et fil d'Ariane (« MD / 01 · Projets »), navigation entre sections avec
la page courante marquée, sélecteur FR/EN. Chaque page commence par « ← Retour au noyau », un repère
(point, trait, « 01 · PROJETS »), un grand titre et une phrase d'introduction, et se termine par un lien
vers la section suivante.

- **Projets** : filtre Tous / Jeux / Associatif (inchangé), vedettes en grand, puis trois par ligne. Un
  projet sans capture montre son numéro en contour, jamais une image vide.
- **Fiche projet** : retour vers la liste, repère, titre, résumé, boutons Jouer (ou Voir le site) et Code,
  stack, description, points clés, galerie, précédent et suivant.
- **Parcours** : frise reliée par des nœuds (pleins pour ce qui est en cours, losange orange pour une
  distinction, stages en compact), type de chaque entrée, encadrés « En cours » et statut.
- **Compétences** : quatre groupes ; chaque techno indique où elle a servi (projets, calculés depuis les
  stacks, et alternances, indiquées dans les données). Langues et méthodes en bas.
- **CV** : boutons PDF FR et EN, puis le vrai CV en aperçu, sur fond papier. À l'impression, seule la
  feuille reste (le PDF est toujours généré depuis cette page et tient sur une page).
- **Contact** : e-mail (protégé comme avant), GitHub, LinkedIn, et l'encadré du statut avec l'échéance.
- **404** : « Nœud introuvable », une liaison rompue partant du noyau, retour au noyau (bilingue comme avant).

## 5. Accessibilité

Inchangé dans l'esprit : contraste AA, cibles de 44 px, focus visible couleur accent, un h1 par page,
navigation au clavier dans l'ordre des sections (l'ordre du DOM ne suit pas la profondeur), aucune
animation sous `prefers-reduced-motion`, axe sans violation grave sur chaque type de page.

## 6. Hors périmètre

Menu mobile repliable (la navigation passe sur deux lignes), visionneuse redessinée (elle prend les
nouvelles couleurs), nouvelles captures des projets.
