import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { projets } from '../../src/data/projets';
import { projectPath } from '../../src/lib/routes';
import { avecCaptures, sansCaptures } from './support/captures';

// Un projet sans galerie (en français) et un projet avec galerie (en anglais), si le dépôt en contient ;
// sinon le premier projet fait l'affaire.
const projetSimple = sansCaptures[0] ?? projets[0];
const projetGalerie = avecCaptures[0] ?? projets[0];

const PAGES = [
  '/',
  '/en/',
  projectPath('fr', projetSimple.id),
  projectPath('en', projetGalerie.id),
  '/cv/',
  '/en/cv/',
];

test.describe('accessibilité (axe, WCAG 2.0/2.1 A et AA)', () => {
  for (const chemin of PAGES) {
    test(`${chemin} : aucune violation grave ou critique`, async ({ page }, testInfo) => {
      await page.goto(chemin);

      const resultat = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();

      const bloquantes = resultat.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      // Les violations mineures ou modérées ne font pas échouer le test : on les consigne.
      const mineures = resultat.violations.filter(
        (violation) => violation.impact !== 'serious' && violation.impact !== 'critical',
      );
      if (mineures.length > 0) {
        await testInfo.attach('violations-mineures.json', {
          body: JSON.stringify(
            mineures.map(({ id, impact, help, nodes }) => ({
              id,
              impact,
              help,
              cibles: nodes.map((noeud) => noeud.target),
            })),
            null,
            2,
          ),
          contentType: 'application/json',
        });
        console.log(
          `[axe] ${chemin} : ${mineures.length} violation(s) mineure(s) ou modérée(s) : ` +
            mineures.map(({ id, impact }) => `${id} (${impact})`).join(', '),
        );
      }

      expect(
        bloquantes.map(({ id, impact, help, nodes }) => ({
          id,
          impact,
          help,
          cibles: nodes.map((noeud) => noeud.target),
        })),
        `violations graves ou critiques sur ${chemin}`,
      ).toEqual([]);
    });
  }
});

test.describe('navigation au clavier', () => {
  test('la première tabulation atteint un lien de l’en-tête', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const dansEntete = await page.evaluate(
      () => document.activeElement?.tagName === 'A' && document.activeElement.closest('header') !== null,
    );
    expect(dansEntete).toBe(true);
  });

  test('un lien de la navigation affiche un contour de focus visible au clavier', async ({ page }) => {
    await page.goto('/');

    // Logo (1), puis premier lien de la navigation (2).
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const actif = document.activeElement as HTMLElement;
      const style = getComputedStyle(actif);
      return {
        dansNav: actif.closest('nav') !== null,
        correspondFocusVisible: actif.matches(':focus-visible'),
        largeur: Number.parseFloat(style.outlineWidth),
        style: style.outlineStyle,
        couleur: style.outlineColor,
      };
    });

    expect(focus.dansNav).toBe(true);
    expect(focus.correspondFocusVisible).toBe(true);
    expect(focus.style).not.toBe('none');
    expect(focus.largeur).toBeGreaterThan(0);
    expect(focus.couleur).not.toBe('transparent');
    expect(focus.couleur).not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('mise en page étroite (320 px)', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const chemin of [
    '/cv/',
    '/en/cv/',
    projectPath('fr', projetGalerie.id),
    projectPath('en', projetSimple.id),
  ]) {
    test(`${chemin} : aucun débordement horizontal`, async ({ page }) => {
      await page.goto(chemin);

      const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(largeur).toBeLessThanOrEqual(320);
    });
  }
});
