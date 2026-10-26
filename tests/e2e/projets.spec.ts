import { expect, test } from '@playwright/test';

const CARTES = '[data-projet-id]';
const CARTES_VISIBLES = '[data-projet-id]:visible';

test.describe('projets sur l’accueil avec JavaScript', () => {
  test('affiche les 8 cartes', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(CARTES)).toHaveCount(8);
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(8);
  });

  test('filtre sur « Associatif » puis revient à « Tous »', async ({ page }) => {
    await page.goto('/');
    const associatif = page.getByRole('button', { name: 'Associatif' });
    const tous = page.getByRole('button', { name: 'Tous' });
    const statut = page.getByRole('status');

    await associatif.click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(1);
    await expect(page.locator('[data-projet-id="cafet-miage"]')).toBeVisible();
    await expect(associatif).toHaveAttribute('aria-pressed', 'true');
    await expect(tous).toHaveAttribute('aria-pressed', 'false');
    await expect(statut).toContainText('1');
    await expect(statut).toHaveText('1 projet');

    await tous.click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(8);
    await expect(tous).toHaveAttribute('aria-pressed', 'true');
    await expect(associatif).toHaveAttribute('aria-pressed', 'false');
    await expect(statut).toHaveText('8 projets');
  });

  test('filtre sur « Jeux »', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Jeux' }).click();

    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(7);
    await expect(page.locator('[data-projet-id="cafet-miage"]')).toBeHidden();
    await expect(page.getByRole('status')).toHaveText('7 projets');
  });

  test('filtre aussi la page anglaise, avec le singulier et le pluriel anglais', async ({ page }) => {
    await page.goto('/en/');
    const statut = page.getByRole('status');

    await page.getByRole('button', { name: 'Community' }).click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(1);
    await expect(statut).toHaveText('1 project');

    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(8);
    await expect(statut).toHaveText('8 projects');
  });

  test('offre des boutons de filtre d’au moins 44 px de haut', async ({ page }) => {
    await page.goto('/');

    const hauteurs = await page
      .locator('button[data-filtre]')
      .evaluateAll((boutons) => boutons.map((bouton) => bouton.getBoundingClientRect().height));
    expect(hauteurs).toHaveLength(3);
    for (const hauteur of hauteurs) expect(hauteur).toBeGreaterThanOrEqual(44);
  });

  test('ne propose ni « Jouer » ni « Voir le site » sur Cafet’MIAGE et Volley Club, mais un lien « Code »', async ({
    page,
  }) => {
    await page.goto('/');

    for (const id of ['cafet-miage', 'volley-club']) {
      const carte = page.locator(`[data-projet-id="${id}"]`);
      await expect(carte.getByRole('link', { name: /Jouer|Voir le site/ })).toHaveCount(0);
      await expect(carte.getByRole('link', { name: /Code/ })).toHaveCount(1);
    }
  });

  test('propose « Jouer » et « Code » sur un jeu qui a une démo, avec des liens externes sûrs', async ({
    page,
  }) => {
    await page.goto('/');
    const carte = page.locator('[data-projet-id="drift-club"]');

    const jouer = carte.getByRole('link', { name: /Jouer/ });
    await expect(jouer).toHaveAttribute('href', 'https://tonoplas909.github.io/drift-club/');
    await expect(jouer).toHaveAttribute('rel', /noopener/);
    await expect(jouer).toHaveAttribute('rel', /noreferrer/);

    const code = carte.getByRole('link', { name: /Code/ });
    await expect(code).toHaveAttribute('href', 'https://github.com/Tonoplas909/drift-club');
    await expect(code).toHaveAttribute('rel', /noopener/);
    await expect(code).toHaveAttribute('rel', /noreferrer/);
  });

  test('mène chaque carte à la page du projet dans la langue courante', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('[data-projet-id="drift-club"] a.carte-lien')
    ).toHaveAttribute('href', '/projets/drift-club/');

    await page.goto('/en/');
    await expect(
      page.locator('[data-projet-id="drift-club"] a.carte-lien')
    ).toHaveAttribute('href', '/en/projects/drift-club/');
  });

  test('met les vedettes en tête, puis le reste dans l’ordre des données', async ({ page }) => {
    await page.goto('/');

    const ids = await page.locator(CARTES).evaluateAll((cartes) =>
      cartes.map((carte) => carte.getAttribute('data-projet-id'))
    );
    expect(ids).toEqual([
      'cafet-miage',
      'drift-club',
      'rallye-club',
      'volley-club',
      'tanks',
      'moto-club',
      'pit-wall',
      'marque',
    ]);
  });

  test('garde les cartes sans vignette purement typographiques (aucune image cassée)', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator(`${CARTES} img`)).toHaveCount(0);
  });
});

test.describe('projets sur l’accueil sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('affiche les 8 cartes et aucun bouton de filtre inutile', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(8);
    await expect(page.locator('button[data-filtre]')).toHaveCount(3);
    await expect(page.locator('button[data-filtre]:visible')).toHaveCount(0);
  });
});

test.describe('projets sur l’accueil à 320 px de large', () => {
  for (const chemin of ['/', '/en/']) {
    test(`ne déborde pas horizontalement sur ${chemin}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(chemin);

      await expect(page.locator(CARTES_VISIBLES)).toHaveCount(8);
      const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(largeur).toBeLessThanOrEqual(320);
    });
  }
});
