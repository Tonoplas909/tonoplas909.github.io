import type { Profil } from './types';

// Aucune donnée personnelle sensible ici : ni téléphone, ni date de naissance, ni adresse.
export const profil: Profil = {
  nom: 'Matis Demore',
  intitule: { fr: 'Développeur fullstack', en: 'Full-stack developer' },
  formation: { fr: 'M1 MIAGE · NumRes', en: 'M1 MIAGE · NumRes' },
  lieu: 'Sophia-Antipolis',
  objectif: { fr: 'premier CDI', en: 'first permanent role' },
  langues: { fr: ['français', 'anglais'], en: ['French', 'English'] },
  interets: {
    fr: ['volleyball', 'auto et moto', 'jeux vidéo'],
    en: ['volleyball', 'cars and motorbikes', 'video games'],
  },
  liens: {
    github: 'https://github.com/Tonoplas909',
    linkedin: 'https://www.linkedin.com/in/matis-demore-31609a267/',
  },
  email: { local: 'matis.nico123', domain: 'gmail.com' },
};
