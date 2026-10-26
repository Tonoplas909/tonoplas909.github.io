import { expect, test } from '@playwright/test';
import { profil } from '../../src/data/profil';
import { projets } from '../../src/data/projets';

const ADRESSE = 'matis.nico123@gmail.com';

test.describe('accueil avec JavaScript', () => {
  test('assemble le lien mailto: du contact au chargement', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer a[data-email]')).toHaveAttribute('href', `mailto:${ADRESSE}`);
  });

  test('passe de FR à EN et revient à FR avec les liens de l’en-tête', async ({ page }) => {
    await page.goto('/');
    const entete = page.locator('header');

    await entete.getByRole('link', { name: 'EN — Voir le site en anglais', exact: true }).click();
    await expect(page).toHaveURL('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await entete.getByRole('link', { name: 'FR — View the site in French', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('lit « Matis Demore » dans le titre h1, avec l’espace avant le retour à la ligne', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText(profil.nom);
  });

  test('affiche le nombre de projets dans le bloc profil.ts', async ({ page }) => {
    await page.goto('/');

    const bloc = page.getByRole('figure', { name: 'profil.ts' });
    await expect(bloc).toContainText(`projets: ${projets.length}`);
  });
});

test.describe('accueil sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('épelle l’adresse et ne la publie pas dans le HTML', async ({ page }) => {
    const reponse = await page.goto('/');
    expect(reponse).not.toBeNull();

    await expect(page.getByText('matis.nico123 (arobase) gmail (point) com')).toBeVisible();
    expect(await reponse!.text()).not.toContain(ADRESSE);
  });
});
