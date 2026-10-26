import type { Projet } from './types';

// Textes rédigés à partir des README et des package.json des dépôts : aucun fait ajouté.
// Ordre d'affichage de la spec §5.2. `stack` vient des dépendances réelles de chaque dépôt.
// Pas de `liens.demo` pour cafet-miage (§5.4, données personnelles possibles) ni pour volley-club (§5.2).
export const projets: Projet[] = [
  {
    id: 'cafet-miage',
    titre: "Cafet'MIAGE",
    categorie: 'asso',
    depot: 'cafeteria-manager',
    vedette: true,
    badge: {
      fr: 'Projet réel · BDE MIAGE Nice',
      en: 'Real project · BDE MIAGE Nice',
    },
    resume: {
      fr: "Planning du staff, gestion du stock et administration de la cafétéria du BDE MIAGE Nice. Déploiement automatique à chaque push.",
      en: "Staff scheduling, stock management and administration for the BDE MIAGE Nice cafeteria. Automatic deployment on every push.",
    },
    description: {
      fr: [
        "Cafet'MIAGE est l'application de gestion de la cafétéria du BDE MIAGE Nice, l'association des étudiants de la MIAGE. Elle réunit au même endroit le planning du staff, la gestion du stock et l'administration de la cafétéria. Matis en est l'auteur.",
        "Le front est écrit avec React et Vite, et les données sont stockées dans une base Supabase. Le schéma et les données de départ sont versionnés dans le dépôt sous forme de migrations SQL.",
        "Chaque push sur la branche principale déclenche un workflow GitHub Actions qui construit l'application et la publie sur GitHub Pages. La logique de synchronisation de calendrier (fonction Supabase calendar-sync) est couverte par un test automatisé.",
      ],
      en: [
        "Cafet'MIAGE is the management app for the BDE MIAGE Nice cafeteria, run by the MIAGE student association. It brings the staff schedule, stock management and cafeteria administration together in one place. Matis is its author.",
        "The front end is built with React and Vite, and the data lives in a Supabase database. The schema and the starting data are versioned in the repository as SQL migrations.",
        "Every push to the main branch triggers a GitHub Actions workflow that builds the app and publishes it to GitHub Pages. The calendar synchronisation logic (the calendar-sync Supabase function) is covered by an automated test.",
      ],
    },
    points: {
      fr: [
        "Planning du staff, stock et administration dans une seule application",
        "Front React et Vite, base de données Supabase",
        "Schéma et données de départ versionnés en migrations SQL",
        "Déploiement automatique à chaque push (GitHub Actions vers GitHub Pages)",
        "Logique de synchronisation de calendrier couverte par un test node --test",
      ],
      en: [
        "Staff schedule, stock and administration in a single app",
        "React and Vite front end, Supabase database",
        "Schema and starting data versioned as SQL migrations",
        "Automatic deployment on every push (GitHub Actions to GitHub Pages)",
        "Calendar synchronisation logic covered by a node --test test",
      ],
    },
    stack: ['React', 'Vite', 'Supabase', 'JavaScript', 'SQL'],
    liens: { code: 'https://github.com/Tonoplas909/cafeteria-manager' },
  },
  {
    id: 'drift-club',
    titre: 'Drift Club',
    categorie: 'jeu',
    depot: 'drift-club',
    vedette: true,
    resume: {
      fr: "Jeu de drift 3D dans le navigateur : 7 voitures, moteur sonore simulé physiquement, éditeur de niveaux et partage en ligne.",
      en: "A 3D drifting game in the browser: 7 cars, a physically simulated engine sound, a level editor and online sharing.",
    },
    description: {
      fr: [
        "Drift Club est un jeu de drift en 3D qui se joue dans le navigateur : on enchaîne les drifts sur des routes de montagne pour faire le plus de points avant la ligne d'arrivée. Un drift rapporte d'autant plus que l'angle et la vitesse sont grands, le combo monte jusqu'à ×5, et un choc contre le décor fait perdre le drift en cours. Trois modes de conduite (Arcade, Semi-arcade, Exigeant) et sept voitures, chacune avec sa propre physique.",
        "Le moteur sonore est simulé physiquement dans un AudioWorklet, d'après un générateur open source (licence MIT) lui-même tiré d'un article de recherche : chaque cylindre est un tube acoustique, et chaque voiture a son profil moteur. Le jeu propose aussi un éditeur de niveaux (partage par lien, par fichier .json ou publication en ligne), un mode Zen sur une route générée sans fin, et un garage avec des dizaines de livrées par voiture, à débloquer dans des caisses.",
        "Des comptes avec pseudo, adossés à Supabase, donnent accès à un classement par niveau. Comme la simulation est déterministe, le serveur rejoue chaque course à partir des commandes enregistrées pour vérifier les scores. Le projet est écrit en TypeScript avec Vite et Three.js, testé avec Vitest, et publié sur GitHub Pages après les tests à chaque push.",
      ],
      en: [
        "Drift Club is a 3D drifting game that runs in the browser: you chain drifts down mountain roads to score as many points as possible before the finish line. A drift is worth more the greater the angle and speed, the combo climbs up to x5, and hitting the scenery loses the drift in progress. There are three driving modes (Arcade, Semi-arcade, Demanding) and seven cars, each with its own physics.",
        "The engine sound is physically simulated in an AudioWorklet, based on an open-source generator (MIT licence) that is itself drawn from a research paper: each cylinder is an acoustic tube, and each car has its own engine profile. The game also offers a level editor (sharing by link, by .json file or by publishing online), a Zen mode on an endless generated road, and a garage with dozens of liveries per car, unlocked from crates.",
        "Accounts with a username, backed by Supabase, give access to a leaderboard for each level. Since the simulation is deterministic, the server replays each race from the recorded inputs to verify scores. The project is written in TypeScript with Vite and Three.js, tested with Vitest, and published to GitHub Pages after the tests pass on every push.",
      ],
    },
    points: {
      fr: [
        "Moteur sonore simulé physiquement dans un AudioWorklet, avec un profil par voiture",
        "7 voitures aux physiques distinctes et 3 modes de conduite",
        "Éditeur de niveaux avec partage par lien, fichier .json ou publication en ligne",
        "Mode Zen : une route sans fin générée au fil des kilomètres, sans jamais se recouper",
        "Classement en ligne dont les scores sont vérifiés par rejeu déterministe côté serveur",
      ],
      en: [
        "Physically simulated engine sound in an AudioWorklet, with one profile per car",
        "7 cars with distinct physics and 3 driving modes",
        "Level editor with sharing by link, .json file or online publishing",
        "Zen mode: an endless road generated as you drive, never crossing itself",
        "Online leaderboard with scores verified by deterministic replay on the server",
      ],
    },
    stack: ['TypeScript', 'Three.js', 'Vite', 'Supabase', 'Vitest', 'Web Audio'],
    liens: {
      demo: 'https://tonoplas909.github.io/drift-club/',
      code: 'https://github.com/Tonoplas909/drift-club',
    },
  },
  {
    id: 'rallye-club',
    titre: 'Rallye Club',
    categorie: 'jeu',
    depot: 'rallye-club',
    resume: {
      fr: "11 spéciales générées de façon procédurale, météo dynamique, notes de copilote lues à voix haute.",
      en: "11 procedurally generated stages, dynamic weather and co-driver pace notes read aloud.",
    },
    description: {
      fr: [
        "Rallye Club est un jeu de rallye 3D qui se joue dans le navigateur. Il reprend l'esprit et la personnalisation de Drift Club, mais ici on ne drifte pas : on court contre la montre. Les 11 spéciales (Vosges, Corse, Suède, Maroc, Monte-Carlo, Finlande, Kenya, Japon…) sont générées de façon procédurale, avec un tracé toujours identique pour une même spéciale, une météo dynamique (la pluie peut arriver en pleine spéciale) et des versions de nuit.",
        "La conduite repose sur une physique arcade : transferts de charge, cercle d'adhérence, adhérence propre à chaque surface et dégâts mécaniques qui changent vraiment la conduite. Les notes du copilote sont affichées et lues à voix haute en français, et les temps intermédiaires se comparent au record, avec un fantôme du meilleur passage et des médailles. Le mode carrière propose un championnat de 9 rallyes face à 9 pilotes IA, et le garage permet de personnaliser 9 voitures.",
        "Le code est en JavaScript (modules ES), avec Three.js fourni dans le dépôt et sans étape de compilation. La logique de jeu (physique, carrière, pneus et dégâts, fusion des sauvegardes) est séparée du rendu et testée sous Node, y compris un pilote automatique qui termine chaque spéciale avec chaque voiture. Des comptes en ligne Supabase sont codés mais désactivés pour l'instant : le jeu fonctionne entièrement hors ligne et enregistre la progression dans le navigateur.",
      ],
      en: [
        "Rallye Club is a 3D rally game that runs in the browser. It takes the spirit and the customisation of Drift Club, but here there is no drifting: you race against the clock. The 11 stages (Vosges, Corsica, Sweden, Morocco, Monte-Carlo, Finland, Kenya, Japan…) are procedurally generated, with the same layout every time for a given stage, dynamic weather (rain can start mid-stage) and night versions.",
        "Driving relies on arcade physics: weight transfer, a friction circle, grip specific to each surface, and mechanical damage that genuinely changes how the car handles. Co-driver pace notes are shown on screen and read aloud in French, and split times are compared to the record, with a ghost of the best run and medals. Career mode offers a championship of 9 rallies against 9 AI drivers, and the garage lets you customise 9 cars.",
        "The code is JavaScript (ES modules), with Three.js shipped in the repository and no build step. The game logic (physics, career, tyres and damage, save merging) is separate from rendering and tested under Node, including an autopilot that finishes every stage with every car. Online accounts with Supabase are coded but currently disabled: the game works fully offline and stores progress in the browser.",
      ],
    },
    points: {
      fr: [
        "11 spéciales générées de façon procédurale, au tracé identique pour une même spéciale",
        "Physique arcade : transferts de charge, cercle d'adhérence, adhérence propre à chaque surface, dégâts mécaniques",
        "Notes de copilote lues à voix haute, fantôme du meilleur passage et médailles",
        "Carrière : championnat de 9 rallyes face à 9 pilotes IA",
        "Logique de jeu testée sous Node, sans navigateur, avec un pilote automatique qui finit chaque spéciale",
      ],
      en: [
        "11 procedurally generated stages, with the same layout every time for a given stage",
        "Arcade physics: weight transfer, friction circle, per-surface grip, mechanical damage",
        "Co-driver notes read aloud, ghost of the best run and medals",
        "Career: a championship of 9 rallies against 9 AI drivers",
        "Game logic tested under Node, without a browser, with an autopilot that finishes every stage",
      ],
    },
    stack: ['JavaScript', 'Three.js', 'Web Audio'],
    liens: {
      demo: 'https://tonoplas909.github.io/rallye-club/',
      code: 'https://github.com/Tonoplas909/rallye-club',
    },
  },
  {
    id: 'volley-club',
    titre: 'Volley Club',
    categorie: 'jeu',
    depot: 'volley-club',
    resume: {
      fr: "Volley-ball 3D en 2 contre 2 face à l'IA, avec 3 niveaux de difficulté, au clavier ou à la manette.",
      en: "3D volleyball, 2 vs 2 against the AI, with 3 difficulty levels, on keyboard or gamepad.",
    },
    description: {
      fr: [
        "Volley Club est un jeu de volley-ball 3D qui se joue dans le navigateur. En 2 contre 2, on contrôle un personnage : il faut se placer au bon endroit, puis réceptionner, passer et attaquer au bon moment. La V1 est jouable : un match complet contre l'IA, avec trois niveaux de difficulté.",
        "Le jeu offre un vrai éventail de gestes : service, passe, attaque avec un saut qu'on charge en maintenant la touche, contre, feinte, frappe au sol et plongeon. Il se joue au clavier et à la souris ou à la manette, avec une caméra orientable, un mode pause et un mode debug avec ralenti.",
        "Le projet est écrit en TypeScript avec Vite, Three.js et Vitest. Le code sépare la simulation (balle, règles, IA), le rendu 3D et les entrées, et le dépôt documente sa conception : spécification de la V1, plan d'implémentation et journal d'avancement.",
      ],
      en: [
        "Volley Club is a 3D volleyball game that runs in the browser. In 2 vs 2, you control one player: you have to get into the right position, then receive, set and attack at the right moment. V1 is playable: a full match against the AI, with three difficulty levels.",
        "The game offers a real range of moves: serve, set, attack with a jump you charge by holding the button, block, feint, ground hit and dive. It plays on keyboard and mouse or on a gamepad, with an adjustable camera, a pause mode and a debug mode with slow motion.",
        "The project is written in TypeScript with Vite, Three.js and Vitest. The code separates the simulation (ball, rules, AI) from the 3D rendering and the inputs, and the repository documents its design: V1 specification, implementation plan and progress log.",
      ],
    },
    points: {
      fr: [
        "Match 2 contre 2 complet contre l'IA, avec 3 niveaux de difficulté",
        "Service, passe, attaque à saut chargé, contre, feinte, frappe au sol et plongeon",
        "Jouable au clavier et à la souris ou à la manette",
        "Code organisé en simulation, rendu et entrées, en TypeScript avec Three.js et Vitest",
        "Spécification, plan d'implémentation et journal d'avancement dans le dépôt",
      ],
      en: [
        "Full 2 vs 2 match against the AI, with 3 difficulty levels",
        "Serve, set, charged-jump attack, block, feint, ground hit and dive",
        "Playable on keyboard and mouse or on a gamepad",
        "Code organised into simulation, rendering and inputs, in TypeScript with Three.js and Vitest",
        "Specification, implementation plan and progress log kept in the repository",
      ],
    },
    stack: ['TypeScript', 'Three.js', 'Vite', 'Vitest'],
    liens: { code: 'https://github.com/Tonoplas909/volley-club' },
  },
  {
    id: 'tanks',
    titre: 'Tanks!',
    categorie: 'jeu',
    depot: 'tanks',
    resume: {
      fr: "Recréation du mini-jeu de Wii Play : 20 missions solo, coopération et versus en ligne jusqu'à 4 joueurs, en WebRTC.",
      en: "A recreation of the Wii Play mini-game: 20 solo missions, plus online co-op and versus for up to 4 players over WebRTC.",
    },
    description: {
      fr: [
        "Tanks! est une recréation, sous forme de projet de fan non officiel, du mini-jeu Tanks! de Wii Play. Il se joue dans le navigateur, en solo avec les 20 missions de la campagne contre les chars de l'ordinateur, ou en ligne jusqu'à 4 joueurs. Neuf types de chars ennemis aux comportements différents se succèdent : immobiles, à roquettes (dont certaines à double rebond), à mines, à rafales, invisibles ou très rapides.",
        "En ligne, deux modes sont proposés : la coopération (la campagne à plusieurs, avec des vies partagées) et le versus (chacun pour soi, premier à 5 manches gagnées). Un joueur crée une partie et donne un code de 5 lettres aux autres. La connexion se fait directement entre navigateurs en WebRTC, avec PeerJS, sans serveur de jeu.",
        "Le jeu occupe toute la fenêtre : l'arène s'élargit ou s'allonge selon la forme de l'écran, chaque mission restant centrée. En ligne, c'est la fenêtre de l'hôte qui fixe la taille de l'arène. Tout le jeu tient dans une seule page HTML statique.",
      ],
      en: [
        "Tanks! is an unofficial fan recreation of the Tanks! mini-game from Wii Play. It plays in the browser, solo through the 20 missions of the campaign against computer-controlled tanks, or online with up to 4 players. Nine kinds of enemy tanks with different behaviours appear in turn: stationary, rocket-firing (some with a double bounce), mine-laying, burst-firing, invisible or very fast.",
        "Online there are two modes: co-op (the campaign played together, with shared lives) and versus (every player for themselves, first to win 5 rounds). One player creates a game and gives a 5-letter code to the others. The connection goes directly between browsers over WebRTC, using PeerJS, with no game server.",
        "The game fills the whole window: the arena widens or lengthens to match the shape of the screen, with each mission staying centred. Online, the host's window sets the size of the arena. The whole game fits in a single static HTML page.",
      ],
    },
    points: {
      fr: [
        "20 missions solo contre 9 types de chars ennemis aux comportements différents",
        "Coopération en ligne (vies partagées) et versus (premier à 5 manches), jusqu'à 4 joueurs",
        "Multijoueur de navigateur à navigateur en WebRTC avec PeerJS, sans serveur de jeu",
        "Partie rejointe avec un simple code de 5 lettres",
        "Arène qui s'adapte à la forme de l'écran, avec plein écran",
      ],
      en: [
        "20 solo missions against 9 kinds of enemy tanks with different behaviours",
        "Online co-op (shared lives) and versus (first to 5 rounds), up to 4 players",
        "Browser-to-browser multiplayer over WebRTC with PeerJS, no game server",
        "Join a game with a simple 5-letter code",
        "Arena that adapts to the shape of the screen, with full-screen mode",
      ],
    },
    stack: ['HTML', 'JavaScript', 'PeerJS', 'WebRTC'],
    liens: {
      demo: 'https://tonoplas909.github.io/tanks/',
      code: 'https://github.com/Tonoplas909/tanks',
    },
  },
  {
    id: 'moto-club',
    titre: 'Moto Club',
    categorie: 'jeu',
    depot: 'moto-club',
    resume: {
      fr: "Jeu de wheelie en 3D low poly : dose les gaz et le frein arrière pour tenir la roue avant levée le plus loin possible.",
      en: "A low-poly 3D wheelie game: balance throttle and rear brake to hold the front wheel up as far as you can.",
    },
    description: {
      fr: [
        "Moto Club est un petit jeu de wheelie en 3D low poly, jouable dans le navigateur au clavier, à la souris ou au tactile. Il faut lever la roue avant, puis doser les gaz et le frein arrière pour tenir le wheelie le plus loin possible : plus l'angle monte, plus on marque, mais passé le point d'équilibre, c'est le looping.",
        "Le score se compte par mètre parcouru en wheelie, multiplié selon l'angle (de ×1 à ×4), avec un combo qui grimpe tant qu'on reste dans la zone Parfait ou au-delà. La physique du wheelie est modélisée comme un pendule inversé, avec un moteur à inertie, et la route est jalonnée de dos d'âne de plus en plus nombreux. Le record est sauvegardé dans le navigateur.",
        "Le jeu est écrit en JavaScript (modules ES), avec three.js chargé depuis un CDN et sans étape de compilation. Le décor low poly est généré par tronçons, le son du moteur est synthétisé en WebAudio, et la physique est testée sous Node. À chaque push sur la branche principale, un workflow lance les tests puis publie le jeu sur GitHub Pages.",
      ],
      en: [
        "Moto Club is a small low-poly 3D wheelie game that plays in the browser with keyboard, mouse or touch. You lift the front wheel, then balance throttle and rear brake to hold the wheelie as far as you can: the higher the angle, the more you score, but past the balance point it flips into a loop.",
        "The score counts per metre travelled on the wheelie, multiplied by the angle (from x1 to x4), with a combo that grows as long as you stay in the Perfect zone or beyond. The wheelie physics is modelled as an inverted pendulum, with an engine that has inertia, and the road is dotted with more and more speed bumps. The best score is saved in the browser.",
        "The game is written in JavaScript (ES modules), with three.js loaded from a CDN and no build step. The low-poly scenery is generated in sections, the engine sound is synthesised with WebAudio, and the physics is tested under Node. On every push to the main branch, a workflow runs the tests and then publishes the game to GitHub Pages.",
      ],
    },
    points: {
      fr: [
        "Physique du wheelie modélisée en pendule inversé, avec un moteur à inertie",
        "Score au mètre multiplié selon l'angle (×1 à ×4), avec un combo",
        "Décor low poly généré par tronçons, bosses de route générées de façon déterministe",
        "Son du moteur synthétisé en WebAudio",
        "Physique testée sous Node, publication automatique sur GitHub Pages après les tests",
      ],
      en: [
        "Wheelie physics modelled as an inverted pendulum, with an engine that has inertia",
        "Score per metre multiplied by the angle (x1 to x4), with a combo",
        "Low-poly scenery generated in sections, road bumps generated deterministically",
        "Engine sound synthesised with WebAudio",
        "Physics tested under Node, automatic publishing to GitHub Pages after the tests",
      ],
    },
    stack: ['JavaScript', 'Three.js', 'Web Audio'],
    liens: {
      demo: 'https://tonoplas909.github.io/moto-club/',
      code: 'https://github.com/Tonoplas909/moto-club',
    },
  },
  {
    id: 'pit-wall',
    titre: 'Pit Wall',
    categorie: 'jeu',
    depot: 'racing-incremental',
    resume: {
      fr: "Jeu incrémental de course en vue de dessus : tes voitures roulent seules et tu investis tes gains pour améliorer l'écurie.",
      en: "A top-down incremental racing game: your cars race on their own and you invest your winnings to improve the team.",
    },
    description: {
      fr: [
        "Pit Wall est un jeu incrémental de course en vue de dessus, dans le navigateur. On dirige une écurie : les voitures roulent seules contre cinq écuries rivales, et l'argent gagné sert à devenir plus rapide, à agrandir l'écurie (jusqu'à 4 voitures) et à débloquer de nouveaux circuits.",
        "Les courses s'enchaînent automatiquement : départ au feu, 3 tours, puis nouvelle course. L'argent vient de chaque tour, de chaque dépassement et de la place à l'arrivée, et un clic sur une voiture déclenche le nitro. Les améliorations portent sur le moteur, les pneus, les freins et le nitro, et les bonnes places rapportent de la réputation, qui débloque 5 circuits de plus en plus lucratifs.",
        "Le jeu n'a aucune dépendance et aucune étape de build : JavaScript vanilla (modules ES) et Canvas 2D. La progression est sauvegardée dans le navigateur (localStorage), sans serveur. Le code est découpé en modules (voiture, course, économie, sauvegarde, rendu) couverts par des tests Node.",
      ],
      en: [
        "Pit Wall is a top-down incremental racing game in the browser. You run a racing team: your cars race on their own against five rival teams, and the money you earn is spent on getting faster, growing the team (up to 4 cars) and unlocking new circuits.",
        "Races run back to back automatically: lights-out start, 3 laps, then a new race. Money comes from every lap, every overtake and your finishing position, and clicking a car triggers its nitro. Upgrades cover the engine, tyres, brakes and nitro, and good finishes earn reputation, which unlocks 5 increasingly lucrative circuits.",
        "The game has no dependencies and no build step: vanilla JavaScript (ES modules) and Canvas 2D. Progress is saved in the browser (localStorage), with no server. The code is split into modules (car, race, economy, saving, rendering) covered by Node tests.",
      ],
    },
    points: {
      fr: [
        "Courses automatiques de 3 tours contre 5 écuries rivales, nitro déclenché d'un clic",
        "Économie d'incrémental : améliorations du moteur, des pneus, des freins et du nitro, écurie jusqu'à 4 voitures",
        "5 circuits débloqués par la réputation",
        "Progression sauvegardée dans le navigateur (localStorage), sans serveur",
        "JavaScript vanilla et Canvas 2D, sans dépendance ni build, avec des tests Node",
      ],
      en: [
        "Automatic 3-lap races against 5 rival teams, nitro triggered with a click",
        "Incremental economy: engine, tyre, brake and nitro upgrades, a team of up to 4 cars",
        "5 circuits unlocked through reputation",
        "Progress saved in the browser (localStorage), no server",
        "Vanilla JavaScript and Canvas 2D, no dependencies or build, with Node tests",
      ],
    },
    stack: ['JavaScript', 'Canvas 2D', 'localStorage'],
    liens: {
      demo: 'https://tonoplas909.github.io/racing-incremental/',
      code: 'https://github.com/Tonoplas909/racing-incremental',
    },
  },
  {
    id: 'marque',
    titre: 'MARQUE',
    categorie: 'jeu',
    depot: 'car-collection',
    resume: {
      fr: "Jeu de collection de voitures réelles : packs, courses et marché. Application React et TypeScript adossée à Supabase.",
      en: "A real-car collection game: packs, races and a market. A React and TypeScript app backed by Supabase.",
    },
    description: {
      fr: [
        "MARQUE est un projet de jeu web de collection autour de voitures réelles, destiné aux passionnés d'automobile. La boucle de jeu visée par le cahier des charges : ouvrir des packs, courir de courtes courses en temps réel, acheter, vendre et échanger sur un marché, puis améliorer et exposer son garage. « MARQUE » est un nom provisoire.",
        "Le dépôt part d'un dossier de design détaillé : maquettes HTML haute fidélité de chaque écran (dossier design/) et un design system « Modernist » (police Archivo, aucun arrondi, traits épais). L'application, en React 19, TypeScript, Vite et React Router, contient un écran par partie du jeu : garage, packs, course, marché, classement, profil et accueil.",
        "Les règles du jeu (catalogue de voitures, ouverture de packs, course, économie) sont écrites en TypeScript dans un module testé avec Vitest, placé avec les fonctions Edge de Supabase. Le backend s'appuie sur Supabase : migrations SQL, fonctions Edge pour les packs et les courses, et tests de la base de données sur PGlite. Des scripts complètent le catalogue de voitures et génèrent les données de départ de la base.",
      ],
      en: [
        "MARQUE is a web collection game project built around real cars, aimed at car enthusiasts. The core loop set out in its specification: open packs, race short real-time races, buy, sell and swap on a market, then upgrade and show off your garage. \"MARQUE\" is a placeholder name.",
        "The repository starts from a detailed design handoff: high-fidelity HTML mock-ups of every screen (the design/ folder) and a \"Modernist\" design system (Archivo typeface, no rounded corners, thick rules). The app, built with React 19, TypeScript, Vite and React Router, contains one screen for each part of the game: garage, packs, race, market, leaderboard, profile and landing page.",
        "The game rules (car catalogue, pack opening, race, economy) are written in TypeScript in a module tested with Vitest, kept alongside the Supabase Edge Functions. The backend relies on Supabase: SQL migrations, Edge Functions for packs and races, and database tests on PGlite. Scripts extend the car catalogue and generate the database's starting data.",
      ],
    },
    points: {
      fr: [
        "Application React 19, TypeScript, Vite et React Router, avec un écran par partie du jeu",
        "Règles du jeu (catalogue, packs, course, économie) en TypeScript, testées avec Vitest",
        "Backend Supabase : migrations SQL et fonctions Edge pour les packs et les courses",
        "Tests de la base de données sur PGlite (script test:db)",
        "Maquettes HTML haute fidélité et design system « Modernist » à l'origine du projet",
      ],
      en: [
        "React 19, TypeScript, Vite and React Router app, with one screen for each part of the game",
        "Game rules (catalogue, packs, race, economy) in TypeScript, tested with Vitest",
        "Supabase backend: SQL migrations and Edge Functions for packs and races",
        "Database tested on PGlite (test:db script)",
        "High-fidelity HTML mock-ups and a \"Modernist\" design system as the project's starting point",
      ],
    },
    stack: ['React', 'TypeScript', 'Vite', 'React Router', 'Supabase'],
    liens: {
      demo: 'https://tonoplas909.github.io/car-collection/',
      code: 'https://github.com/Tonoplas909/car-collection',
    },
  },
];
