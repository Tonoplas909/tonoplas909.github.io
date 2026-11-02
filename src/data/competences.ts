import type { GroupeCompetences } from './types';

// La liste du CV et de la page Compétences, dans cet ordre.
export const competences: string[] = [
  'Python',
  'Vue.js',
  'Angular',
  'TypeScript',
  'React',
  'Java',
  'SQL',
  'Supabase',
  'Three.js',
];

// Page Compétences : chaque compétence ci-dessus, plus quelques technos des projets, rangées par groupe.
// Les projets qui utilisent une techno sont retrouvés dans leur `stack` (lib/competences.ts) ; `contextes`
// ne sert qu'aux alternances, qui ne sont pas des projets du site. Rien n'est inventé : Java n'a pas de
// contexte connu, il n'en affiche donc aucun.
export const groupesCompetences: GroupeCompetences[] = [
  {
    id: 'back',
    items: [{ nom: 'Python', contextes: ['QITI', 'HIMYDATA'] }, { nom: 'Java' }, { nom: 'SQL' }],
  },
  {
    id: 'front',
    items: [
      { nom: 'Vue.js', contextes: ['HIMYDATA'] },
      { nom: 'Angular', contextes: ['HIMYDATA'] },
      { nom: 'React' },
      { nom: 'TypeScript' },
    ],
  },
  {
    id: 'donnees',
    items: [{ nom: 'Supabase' }, { nom: 'localStorage' }],
  },
  {
    id: 'temps-reel',
    items: [{ nom: 'Three.js' }, { nom: 'Web Audio' }, { nom: 'WebRTC' }, { nom: 'Canvas 2D' }],
  },
];
