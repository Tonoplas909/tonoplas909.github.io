import { describe, expect, it } from 'vitest';
import {
  findForbidden,
  findForbiddenMatches,
  missingAlternates,
  pdfHasLink,
  pdfPageCount,
} from '../../scripts/lib/check.mjs';

describe('findForbidden', () => {
  it('repère un numéro de mobile français', () => {
    expect(findForbidden('<p>06 12 34 56 78</p>')).toContain('numéro de mobile');
  });

  it.each([
    ['06 12 34 56 78', '<p>06 12 34 56 78</p>'],
    ['06.12.34.56.78', '<p>06.12.34.56.78</p>'],
    ['06-12-34-56-78', '<p>06-12-34-56-78</p>'],
    ['0612345678', '<p>0612345678</p>'],
    ['07 12 34 56 78', '<p>07 12 34 56 78</p>'],
    ['+33 6 12 34 56 78', '<p>+33 6 12 34 56 78</p>'],
    ['+33612345678', '<p>+33612345678</p>'],
    ['numéro entouré de texte', '<p>Appelez le 06 12 34 56 78, merci.</p>'],
    ['numéro en début de ligne', '06 12 34 56 78'],
    ['numéro dans un lien tel:', '<a href="tel:+33612345678">'],
  ])('repère un numéro de mobile : %s', (_cas, html) => {
    expect(findForbidden(html)).toContain('numéro de mobile');
  });

  it.each([
    'Screenshot_20260612-143012',
    '2026-06-12-14-30-12',
    'Screenshot_2026-06-12-14-30-12',
  ])('ne prend pas le nom de fichier « %s » pour un numéro de mobile', (nom) => {
    expect(findForbidden(`<p>${nom}</p>`)).toEqual([]);
    expect(findForbidden(`${nom}.png`)).toEqual([]);
    expect(findForbidden(`<img src="/_astro/${nom}.Zx4kQ9.webp" alt="">`)).toEqual([]);
    expect(findForbidden(`<meta property="og:image" content="https://tonoplas909.github.io/_astro/${nom}.Zx4kQ9.jpg">`)).toEqual([]);
  });

  it('ne prend pas un nom de fichier horodaté, même complet, pour un numéro de mobile', () => {
    const html = '<img src="/_astro/Screenshot_2026-06-12-14-30-12.hash.webp" alt="">';
    expect(findForbidden(html)).toEqual([]);
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

describe('findForbiddenMatches', () => {
  it('donne le nom du motif et un extrait qui contient le texte trouvé', () => {
    const [trouve] = findForbiddenMatches('<p>Appelez le\n  06 12 34 56 78,\n  merci.</p>');

    expect(trouve.nom).toBe('numéro de mobile');
    expect(trouve.extrait).toContain('06 12 34 56 78');
    expect(trouve.extrait).toContain('Appelez');
    expect(trouve.extrait).not.toMatch(/\n/);
  });

  it('borne l’extrait, même au milieu d’une longue page', () => {
    const html = `${'a'.repeat(500)} Né le 01/02/2003 ${'b'.repeat(500)}`;
    const [trouve] = findForbiddenMatches(html);

    expect(trouve.nom).toBe('date');
    expect(trouve.extrait).toContain('01/02/2003');
    expect(trouve.extrait.length).toBeLessThan(120);
  });

  it('ne renvoie rien sur une page propre, et reste d’accord avec findForbidden', () => {
    expect(findForbiddenMatches('<h1>Matis Demore</h1>')).toEqual([]);
    const html = '<p>Lovable 06 12 34 56 78</p>';
    expect(findForbiddenMatches(html).map(({ nom }) => nom)).toEqual(findForbidden(html));
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
