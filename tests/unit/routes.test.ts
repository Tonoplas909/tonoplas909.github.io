import { describe, expect, it } from 'vitest';
import {
  cvPath,
  equivalentPath,
  homePath,
  langFromPath,
  projectPath,
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

  it('est l’identité quand la langue cible est la langue courante', () => {
    expect(equivalentPath('/cv/', 'fr')).toBe('/cv/');
  });

  it("renvoie l'accueil de la langue cible pour une page inconnue", () => {
    expect(equivalentPath('/nimportequoi/', 'en')).toBe('/en/');
    expect(equivalentPath('/en/nope/', 'fr')).toBe('/');
  });
});
