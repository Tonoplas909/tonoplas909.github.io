import { describe, expect, it } from 'vitest';
import {
  SECTIONS,
  cvPath,
  equivalentPath,
  homePath,
  langFromPath,
  numeroSection,
  projectPath,
  sectionFromPath,
  sectionPath,
  sectionSuivante,
} from '../../src/lib/routes';

describe('langFromPath', () => {
  it('reconnaît le français sans préfixe', () => {
    expect(langFromPath('/')).toBe('fr');
    expect(langFromPath('/projets/drift-club/')).toBe('fr');
  });

  it("ne prend que le segment complet « en » pour un préfixe", () => {
    expect(langFromPath('/entreprise/')).toBe('fr');
  });

  it('reconnaît l’anglais avec le préfixe /en', () => {
    expect(langFromPath('/en/')).toBe('en');
    expect(langFromPath('/en/projects/drift-club/')).toBe('en');
  });
});

describe('constructeurs de chemins', () => {
  it("accueil", () => {
    expect(homePath('fr')).toBe('/');
    expect(homePath('en')).toBe('/en/');
  });

  it('page projet', () => {
    expect(projectPath('fr', 'drift-club')).toBe('/projets/drift-club/');
    expect(projectPath('en', 'drift-club')).toBe('/en/projects/drift-club/');
  });

  it('CV imprimable', () => {
    expect(cvPath('fr')).toBe('/cv/');
    expect(cvPath('en')).toBe('/en/cv/');
  });

  it('pages de section, avec un segment traduit en anglais', () => {
    expect(SECTIONS.map((section) => sectionPath('fr', section))).toEqual([
      '/projets/',
      '/parcours/',
      '/competences/',
      '/cv/',
      '/contact/',
    ]);
    expect(SECTIONS.map((section) => sectionPath('en', section))).toEqual([
      '/en/projects/',
      '/en/background/',
      '/en/skills/',
      '/en/cv/',
      '/en/contact/',
    ]);
  });
});

describe('sections', () => {
  it('sont numérotées de 01 à 05 dans l’ordre de la navigation', () => {
    expect(SECTIONS.map(numeroSection)).toEqual(['01', '02', '03', '04', '05']);
  });

  it('s’enchaînent, la dernière n’ayant pas de suivante', () => {
    expect(sectionSuivante('projets')).toBe('parcours');
    expect(sectionSuivante('cv')).toBe('contact');
    expect(sectionSuivante('contact')).toBeUndefined();
  });

  it('se retrouvent à partir du chemin, fiche projet comprise', () => {
    expect(sectionFromPath('/parcours/')).toBe('parcours');
    expect(sectionFromPath('/en/skills/')).toBe('competences');
    expect(sectionFromPath('/projets/drift-club/')).toBe('projets');
    expect(sectionFromPath('/en/projects/drift-club/')).toBe('projets');
    expect(sectionFromPath('/')).toBeUndefined();
    expect(sectionFromPath('/en/')).toBeUndefined();
    expect(sectionFromPath('/nimportequoi/')).toBeUndefined();
    // Un segment d'une langue n'est pas reconnu dans l'autre
    expect(sectionFromPath('/en/parcours/')).toBeUndefined();
  });
});

describe('equivalentPath', () => {
  it('traduit une page projet dans les deux sens', () => {
    expect(equivalentPath('/projets/drift-club/', 'en')).toBe('/en/projects/drift-club/');
    expect(equivalentPath('/en/projects/drift-club/', 'fr')).toBe('/projets/drift-club/');
  });

  it('traduit le CV et l’accueil', () => {
    expect(equivalentPath('/cv/', 'en')).toBe('/en/cv/');
    expect(equivalentPath('/en/', 'fr')).toBe('/');
    expect(equivalentPath('/', 'en')).toBe('/en/');
  });

  it('traduit chaque page de section dans les deux sens', () => {
    for (const section of SECTIONS) {
      expect(equivalentPath(sectionPath('fr', section), 'en')).toBe(sectionPath('en', section));
      expect(equivalentPath(sectionPath('en', section), 'fr')).toBe(sectionPath('fr', section));
    }
  });

  it('est l’identité quand la langue cible est la langue courante', () => {
    expect(equivalentPath('/cv/', 'fr')).toBe('/cv/');
  });

  it("renvoie l'accueil de la langue cible pour une page inconnue", () => {
    expect(equivalentPath('/nimportequoi/', 'en')).toBe('/en/');
    expect(equivalentPath('/en/nope/', 'fr')).toBe('/');
  });
});
