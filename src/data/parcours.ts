import type { EntreeParcours } from './types';

// Ordre de la spec §5.3 (déjà du plus récent au plus ancien). L'affichage passe par `trierParcours`.
// Flunch n'a pas de `detail` : l'intitulé du poste n'est pas connu, rien n'est inventé.
export const parcours: EntreeParcours[] = [
  {
    id: 'm1-miage',
    type: 'etudes',
    debut: 2026,
    fin: null,
    titre: {
      fr: 'M1 MIAGE, parcours NumRes, en alternance',
      en: 'M1 MIAGE (NumRes track), work-study programme',
    },
    detail: { fr: 'Sophia-Antipolis', en: 'Sophia-Antipolis' },
  },
  {
    id: 'eng-it',
    type: 'emploi',
    debut: 2026,
    fin: null,
    titre: { fr: "Alternance, Eng'IT", en: "Work-study placement, Eng'IT" },
    detail: { fr: 'ESN à Sophia-Antipolis', en: 'IT services company in Sophia-Antipolis' },
  },
  {
    id: 'flunch',
    type: 'emploi',
    debut: 2025,
    fin: 2026,
    titre: { fr: 'Flunch', en: 'Flunch' },
  },
  {
    id: 'himydata',
    type: 'emploi',
    debut: 2023,
    fin: 2025,
    titre: {
      fr: 'Alternance, développeur fullstack, HIMYDATA',
      en: 'Work-study placement, full-stack developer, HIMYDATA',
    },
    detail: {
      fr: 'Python et frontend (Vue.js, Angular)',
      en: 'Python and frontend (Vue.js, Angular)',
    },
  },
  {
    id: 'but-info',
    type: 'etudes',
    debut: 2022,
    fin: 2025,
    titre: {
      fr: 'BUT Informatique en alternance',
      en: 'BUT Computer Science (work-study programme)',
    },
    detail: {
      fr: 'IUT Nice Sophia Antipolis, campus Polytech',
      en: 'IUT Nice Sophia Antipolis, Polytech campus',
    },
  },
  {
    id: 'qiti',
    type: 'emploi',
    debut: 2022,
    fin: 2023,
    titre: {
      fr: 'Alternance, développeur back-end Python, QITI',
      en: 'Work-study placement, Python back-end developer, QITI',
    },
    detail: { fr: 'Équipe DevOps, méthode Scrum', en: 'DevOps team, Scrum method' },
  },
  {
    id: 'intel-ia',
    type: 'distinction',
    debut: 2022,
    titre: {
      fr: 'Concours IA for Youth, Intel',
      en: 'AI for Youth competition, Intel',
    },
    detail: { fr: 'Classé deuxième en équipe', en: 'Ranked second as a team' },
  },
  {
    id: 'bac',
    type: 'etudes',
    debut: 2021,
    fin: 2022,
    titre: {
      fr: 'Baccalauréat général, mention bien',
      en: 'General baccalaureate, with honours (mention bien)',
    },
    detail: {
      fr: 'Lycée Simone Veil, spécialités mathématiques et NSI',
      en: 'Lycée Simone Veil, specialising in mathematics and computer science (NSI)',
    },
  },
  {
    id: 'noeva',
    type: 'stage',
    debut: 2020,
    titre: { fr: 'Stage de seconde, NOEVA', en: 'Year 10 work placement, NOEVA' },
    detail: { fr: '1 semaine, intégrateur informatique', en: '1 week, IT integrator' },
  },
  {
    id: 'air-france',
    type: 'stage',
    debut: 2019,
    titre: { fr: 'Stage de troisième, Air France', en: 'Year 9 work placement, Air France' },
    detail: { fr: '1 semaine, data center et DSI', en: '1 week, data center and IT department' },
  },
  {
    id: 'bde-miage',
    type: 'asso',
    titre: { fr: 'Membre du BDE MIAGE Nice', en: 'Member of the BDE MIAGE Nice student union' },
    detail: { fr: "Auteur de Cafet'MIAGE", en: "Author of Cafet'MIAGE" },
  },
];
