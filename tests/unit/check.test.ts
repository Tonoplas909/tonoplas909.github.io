import { describe, expect, it } from 'vitest';
import {
  findForbidden,
  missingAlternates,
  pdfHasLink,
  pdfPageCount,
} from '../../scripts/lib/check.mjs';

describe('findForbidden', () => {
  it('repère un numéro de mobile français', () => {
    expect(findForbidden('<p>06 12 34 56 78</p>')).toContain('numéro de mobile');
  });

  it('repère une date au format jj/mm/aaaa', () => {
    expect(findForbidden('Né le 01/02/2003')).toContain('date');
  });

  it('repère les mentions d’outils générateurs, sans tenir compte de la casse', () => {
    expect(findForbidden('Lovable Generated Project')).not.toEqual([]);
    expect(findForbidden('<meta name="author" content="GPTEngineer">')).not.toEqual([]);
  });

  it('repère l’adresse e-mail en clair, y compris dans un lien mailto', () => {
    expect(findForbidden('<a href="mailto:matis.nico123@gmail.com">')).not.toEqual([]);
  });

  it('ne signale rien sur une page propre', () => {
    expect(findForbidden('<h1>Matis Demore</h1>')).toEqual([]);
  });
});

describe('missingAlternates', () => {
  it('signale une page dont la page équivalente est absente', () => {
    expect(missingAlternates({ '/': '', '/en/': '', '/cv/': '' })).toEqual(['/cv/']);
  });

  it('ne signale rien quand chaque page a son pendant', () => {
    expect(missingAlternates({ '/': '', '/en/': '', '/cv/': '', '/en/cv/': '' })).toEqual([]);
  });

  it('associe les chemins de projet FR et EN', () => {
    expect(missingAlternates({ '/projets/x/': '', '/en/projects/x/': '' })).toEqual([]);
    expect(missingAlternates({ '/en/projects/x/': '' })).toEqual(['/en/projects/x/']);
  });

  it('ignore la page 404 et les PDF', () => {
    expect(
      missingAlternates({ '/': '', '/en/': '', '/404.html': '', '/Matis-Demore-CV.pdf': '' }),
    ).toEqual([]);
  });
});

// Extraits au format écrit par Chromium (PDF 1.4 : objets en clair, sans flux d'objets compressés)
const pdf = (...objets: string[]) => Buffer.from(`%PDF-1.4\n${objets.join('\n')}\n%%EOF`, 'latin1');
const racine = '1 0 obj\n<</Type /Pages\n/Count 1\n/Kids [2 0 R]>>\nendobj';
const feuille = (n: number) => `${n} 0 obj\n<</Type /Page\n/Parent 1 0 R\n/Contents 9 0 R>>\nendobj`;
const lien = (uri: string) =>
  `3 0 obj\n<</Type /Annot\n/Subtype /Link\n/A <</Type /Action\n/S /URI\n/URI (${uri})>>>>\nendobj`;

describe('pdfPageCount', () => {
  it('compte une page, sans confondre /Type /Page et /Type /Pages', () => {
    expect(pdfPageCount(pdf(racine, feuille(2)))).toBe(1);
  });

  it('compte plusieurs pages', () => {
    expect(pdfPageCount(pdf(racine, feuille(2), feuille(3)))).toBe(2);
  });

  it('renvoie 0 pour un fichier sans page', () => {
    expect(pdfPageCount(pdf(racine))).toBe(0);
    expect(pdfPageCount(Buffer.from('pas un PDF'))).toBe(0);
  });
});

describe('pdfHasLink', () => {
  it('reconnaît une annotation de lien vers l’URI donnée', () => {
    const mail = 'mailto:matis.nico123@gmail.com';
    expect(pdfHasLink(pdf(lien(mail)), mail)).toBe(true);
  });

  it('ne se contente ni d’un autre lien ni de l’adresse écrite en clair', () => {
    const mail = 'mailto:matis.nico123@gmail.com';
    expect(pdfHasLink(pdf(lien('https://github.com/Tonoplas909')), mail)).toBe(false);
    expect(pdfHasLink(pdf('matis.nico123@gmail.com'), mail)).toBe(false);
  });
});
