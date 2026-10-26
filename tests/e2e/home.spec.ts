import { expect, test } from '@playwright/test';

const ADRESSE = 'matis.nico123@gmail.com';

test.describe('accueil avec JavaScript', () => {
  test('assemble le lien mailto: du contact au chargement', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer a[data-email]')).toHaveAttribute('href', `mailto:${ADRESSE}`);
  });

  test('passe de FR à EN et revient à FR avec les liens de l’en-tête', async ({ page }) => {
    await page.goto('/');
    const entete = page.locator('header');

    await entete.getByRole('link', { name: 'Voir le site en anglais' }).click();
    await expect(page).toHaveURL('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await entete.getByRole('link', { name: 'View the site in French' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('affiche le nombre de projets dans le bloc profil.ts', async ({ page }) => {
    await page.goto('/');

    const bloc = page.getByRole('figure', { name: 'profil.ts' });
    await expect(bloc).toContainText('projets: 8');
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
