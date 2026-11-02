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
  langues: Localise<string[]>;
  interets: Localise<string[]>;
  liens: { github: string; linkedin: string };
  email: { local: string; domain: string };
  /** Disponibilité affichée sur l'accueil, le parcours et le contact. */
  statut: { disponible: boolean; finAlternance?: { annee: number; mois: number } };
}

export type GroupeCompetencesId = 'back' | 'front' | 'donnees' | 'temps-reel';

export interface ItemCompetence {
  nom: string;
  /** Où la techno a servi hors des projets du site : noms d'entreprises du parcours. */
  contextes?: string[];
}

export interface GroupeCompetences {
  id: GroupeCompetencesId;
  items: ItemCompetence[];
}
