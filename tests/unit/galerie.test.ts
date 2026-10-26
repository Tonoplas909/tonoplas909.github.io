import { describe, expect, it } from 'vitest';
import { altCapture, selectionnerImages } from '../../src/lib/galerie';

const CHEMINS = [
  '/src/assets/projets/drift-club/10.png',
  '/src/assets/projets/drift-club/2.PNG',
  '/src/assets/projets/drift-club/notes.txt',
  '/src/assets/projets/drift-club/.DS_Store',
  '/src/assets/projets/tanks/01.png',
];

describe('selectionnerImages', () => {
  it('garde les images du projet, en tri naturel par nom de fichier', () => {
    expect(selectionnerImages(CHEMINS, 'drift-club')).toEqual([
      '/src/assets/projets/drift-club/2.PNG',
      '/src/assets/projets/drift-club/10.png',
    ]);
  });

  it('renvoie une liste vide pour un projet sans image', () => {
    expect(selectionnerImages(CHEMINS, 'volley-club')).toEqual([]);
  });

  it('accepte jpg, jpeg, png et webp sans tenir compte de la casse', () => {
    const chemins = ['a.jpg', 'b.JPEG', 'c.Png', 'd.webp', 'e.gif', 'f.svg', 'g.avif'].map(
      (nom) => `/src/assets/projets/marque/${nom}`
    );

    expect(selectionnerImages(chemins, 'marque').map((c) => c.split('/').pop())).toEqual([
      'a.jpg',
      'b.JPEG',
      'c.Png',
      'd.webp',
    ]);
  });

  it('ne confond pas deux projets dont l’identifiant commence pareil', () => {
    const chemins = [
      '/src/assets/projets/drift-club-2/1.png',
      '/src/assets/projets/drift-club/1.png',
    ];

    expect(selectionnerImages(chemins, 'drift-club')).toEqual([
      '/src/assets/projets/drift-club/1.png',
    ]);
  });

  it('ignore les fichiers cachés qui n’ont qu’une extension', () => {
    expect(selectionnerImages(['/src/assets/projets/tanks/.png'], 'tanks')).toEqual([]);
  });

  it('ne modifie pas la liste reçue', () => {
    const entree = [...CHEMINS];

    selectionnerImages(entree, 'drift-club');

    expect(entree).toEqual(CHEMINS);
  });
});

describe('altCapture', () => {
  it('donne « Capture d’écran N de <titre> » en français', () => {
    expect(altCapture('Drift Club', 2, 'fr')).toBe("Capture d'écran 2 de Drift Club");
  });

  it('donne « Screenshot N of <titre> » en anglais', () => {
    expect(altCapture('Drift Club', 2, 'en')).toBe('Screenshot 2 of Drift Club');
  });

  it('préfère la légende de la langue demandée si elle existe', () => {
    expect(altCapture('Drift Club', 2, 'fr', { fr: 'Menu', en: 'Menu' })).toBe('Menu');
    expect(altCapture('Drift Club', 2, 'en', { fr: 'Le menu', en: 'The menu' })).toBe('The menu');
  });

  it('revient au texte par défaut si la légende est vide', () => {
    expect(altCapture('Drift Club', 1, 'en', { fr: '', en: '  ' })).toBe(
      'Screenshot 1 of Drift Club'
    );
  });
});
