export type Lang = 'fr' | 'en';

export type Localise<T = string> = Record<Lang, T>;

export type Categorie = 'jeu' | 'asso';

export type TypeParcours = 'etudes' | 'emploi' | 'stage' | 'distinction' | 'asso';

export interface Projet {
  id: string;
  titre: string;
  categorie: Categorie;
  depot: string;
  resume: Localise;
  description: Localise<string[]>;
  points: Localise<string[]>;
  stack: string[];
  liens: { demo?: string; code: string };
  badge?: Localise;
  vedette?: boolean;
  legendes?: Record<string, Localise>;
}

export interface EntreeParcours {
  id: string;
  type: TypeParcours;
  titre: Localise;
  detail?: Localise;
  debut?: number;
  fin?: number | null;
}

export interface Profil {
  nom: string;
  intitule: Localise;
  formation: Localise;
  lieu: string;
  objectif: Localise;
  langues: Localise<string[]>;
  interets: Localise<string[]>;
  liens: { github: string; linkedin: string };
  email: { local: string; domain: string };
}
