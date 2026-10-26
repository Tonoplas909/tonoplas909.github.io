import { expect, test, type Page } from '@playwright/test';

const IDS = [
  'cafet-miage',
  'drift-club',
  'rallye-club',
  'volley-club',
  'tanks',
  'moto-club',
  'pit-wall',
  'marque',
];

// Seul Pit Wall a une capture pour l'instant (src/assets/projets/pit-wall/01.png)
const VIGNETTE = '[data-galerie-lien]';
const DIALOGUE = 'dialog[data-galerie-dialog]';

async function imageChargee(page: Page, selecteur: string): Promise<boolean> {
  return page
    .locator(selecteur)
    .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
}

test.describe('pages projet', () => {
  for (const id of IDS) {
    test(`${id} : les pages FR et EN répondent 200 avec un h1 non vide`, async ({ page }) => {
      for (const chemin of [`/projets/${id}/`, `/en/projects/${id}/`]) {
        const reponse = await page.goto(chemin);

        expect(reponse?.status(), chemin).toBe(200);
        const titre = page.locator('h1');
        await expect(titre, chemin).toHaveCount(1);
        await expect(titre, chemin).not.toBeEmpty();
      }
    });
  }

  test('suit le plan de la page : retour, titre, badge, stack, boutons, description, points', async ({
    page,
  }) => {
    await page.goto('/projets/cafet-miage/');
    const article = page.locator('article');

    await expect(page).toHaveTitle("Cafet'MIAGE — Matis Demore");
    await expect(page.locator('meta[name=description]')).toHaveAttribute(
      'content',
      /Planning du staff/
    );
    const retour = article.locator('[data-projet-retour]');
    await expect(retour).toHaveText('← Projets');
    await expect(retour).toHaveAttribute('href', '/#projets');
    expect((await retour.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await expect(article.locator('h1')).toHaveText("Cafet'MIAGE");
    await expect(article.getByText('Projet réel · BDE MIAGE Nice')).toBeVisible();
    await expect(article.getByText('React · Vite · Supabase · JavaScript · SQL')).toBeVisible();
    await expect(article.getByRole('heading', { level: 2, name: 'Présentation' })).toBeVisible();
    await expect(article.getByRole('heading', { level: 2, name: 'Points clés' })).toBeVisible();
    expect(await article.locator('.points li').count()).toBeGreaterThan(0);
    expect(await article.locator('.texte p').count()).toBeGreaterThan(0);
  });

  test('en anglais, le lien de retour va à la section projets de l’accueil anglais', async ({
    page,
  }) => {
    await page.goto('/en/projects/drift-club/');

    const retour = page.locator('[data-projet-retour]');
    await expect(retour).toHaveText('← Projects');
    await expect(retour).toHaveAttribute('href', '/en/#projets');
    await expect(page.getByRole('heading', { level: 2, name: 'Key points' })).toBeVisible();
  });

  test('propose « Jouer » (jeu) ou « Voir le site » (asso) seulement avec une démo, en lien primaire sûr', async ({
    page,
  }) => {
    await page.goto('/projets/drift-club/');
    const jouer = page.locator('main').getByRole('link', { name: 'Jouer', exact: true });
    await expect(jouer).toHaveAttribute('href', 'https://tonoplas909.github.io/drift-club/');
    await expect(jouer).toHaveAttribute('rel', /noopener/);
    await expect(jouer).toHaveAttribute('rel', /noreferrer/);
    await expect(jouer).toHaveClass(/bouton--primaire/);
    const code = page.locator('main').getByRole('link', { name: 'Code', exact: true });
    await expect(code).toHaveClass(/bouton--secondaire/);
    await expect(code).toHaveAttribute('rel', /noopener/);
    await expect(code).toHaveAttribute('rel', /noreferrer/);

    await page.goto('/en/projects/pit-wall/');
    await expect(page.locator('main').getByRole('link', { name: 'Play', exact: true })).toHaveCount(1);
  });

  test('n’a ni « Jouer » ni « Voir le site » sur Volley Club et Cafet’MIAGE, mais un lien « Code »', async ({
    page,
  }) => {
    for (const id of ['volley-club', 'cafet-miage']) {
      await page.goto(`/projets/${id}/`);
      // Le lien du sélecteur de langue s'appelle « EN — Voir le site en anglais » : on ne regarde que le contenu de la page
      const principal = page.locator('main');

      await expect(principal.getByRole('link', { name: /Jouer|Voir le site/ }), id).toHaveCount(0);
      await expect(principal.getByRole('link', { name: 'Code', exact: true }), id).toHaveCount(1);
    }
  });

  test('n’a ni dialogue ni vignette sur Cafet’MIAGE et Volley Club (aucun cadre vide)', async ({
    page,
  }) => {
    for (const id of ['cafet-miage', 'volley-club']) {
      await page.goto(`/projets/${id}/`);

      await expect(page.locator('dialog'), id).toHaveCount(0);
      await expect(page.locator(VIGNETTE), id).toHaveCount(0);
      await expect(page.locator('main img'), id).toHaveCount(0);
      await expect(page.getByRole('heading', { name: "Captures d'écran" }), id).toHaveCount(0);
    }
  });

  test('relie chaque projet à son précédent et à son suivant, de façon circulaire', async ({
    page,
  }) => {
    await page.goto('/projets/cafet-miage/');
    const precedent = page.getByRole('link', { name: /Projet précédent/ });
    await expect(precedent).toHaveAttribute('href', '/projets/marque/');
    await expect(precedent).toContainText('MARQUE');
    await expect(page.getByRole('link', { name: /Projet suivant/ })).toHaveAttribute(
      'href',
      '/projets/drift-club/'
    );

    await page.goto('/projets/marque/');
    const suivant = page.getByRole('link', { name: /Projet suivant/ });
    await expect(suivant).toHaveAttribute('href', '/projets/cafet-miage/');
    await expect(suivant).toContainText("Cafet'MIAGE");

    await page.goto('/en/projects/cafet-miage/');
    await expect(page.getByRole('link', { name: /Previous project/ })).toHaveAttribute(
      'href',
      '/en/projects/marque/'
    );
    await expect(page.getByRole('link', { name: /Next project/ })).toHaveAttribute(
      'href',
      '/en/projects/drift-club/'
    );
  });

  test('offre le sélecteur de langue vers la page équivalente, dans les deux sens', async ({
    page,
  }) => {
    await page.goto('/en/projects/pit-wall/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.locator('header').getByRole('link', { name: 'FR — View the site in French', exact: true })
    ).toHaveAttribute('href', '/projets/pit-wall/');

    await page.goto('/projets/pit-wall/');
    await expect(
      page.locator('header').getByRole('link', { name: 'EN — Voir le site en anglais', exact: true })
    ).toHaveAttribute('href', '/en/projects/pit-wall/');
  });

  test('prend la première capture comme image de partage (URL absolue), sinon l’image par défaut', async ({
    page,
  }) => {
    await page.goto('/projets/pit-wall/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /^https:\/\/tonoplas909\.github\.io\/_astro\/01\..+\.jpe?g$/
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      /^https:\/\/tonoplas909\.github\.io\/_astro\/01\./
    );

    await page.goto('/projets/volley-club/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://tonoplas909.github.io/og-default.png'
    );
  });
});

test.describe('galerie et visionneuse avec JavaScript', () => {
  test('affiche la vignette de Pit Wall, chargée, avec un texte alternatif', async ({ page }) => {
    await page.goto('/projets/pit-wall/');

    await expect(page.locator(VIGNETTE)).toHaveCount(1);
    const image = page.locator(`${VIGNETTE} img`);
    await expect(image).toHaveAttribute('alt', "Capture d'écran 1 de Pit Wall");
    await expect(image).toBeVisible();
    await expect.poll(() => imageChargee(page, `${VIGNETTE} img`)).toBe(true);
    await expect(page.getByRole('heading', { level: 2, name: "Captures d'écran" })).toBeVisible();
    // Le dialogue est fermé : rien n'est affiché
    await expect(page.locator(DIALOGUE)).toBeHidden();
  });

  test('ouvre la visionneuse au clic sur la vignette, la ferme avec Échap et rend le focus à la vignette', async ({
    page,
  }) => {
    await page.goto('/projets/pit-wall/');
    const vignette = page.locator(VIGNETTE);
    const dialogue = page.locator(DIALOGUE);

    await vignette.click();

    await expect(dialogue).toBeVisible();
    await expect(page).toHaveURL(/\/projets\/pit-wall\/$/);
    await expect(dialogue).toHaveAccessibleName("Visionneuse de captures d'écran");
    const grande = dialogue.locator('img');
    await expect(grande).toHaveAttribute('alt', "Capture d'écran 1 de Pit Wall");
    await expect.poll(() => imageChargee(page, `${DIALOGUE} img`)).toBe(true);

    await page.keyboard.press('Escape');

    await expect(dialogue).toBeHidden();
    await expect(vignette).toBeFocused();
  });

  test('ferme la visionneuse avec le bouton « Fermer » (44 px au moins) puis la rouvre', async ({
    page,
  }) => {
    await page.goto('/projets/pit-wall/');
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).click();
    const fermer = dialogue.getByRole('button', { name: 'Fermer la visionneuse' });

    const boite = await fermer.boundingBox();
    expect(boite?.width).toBeGreaterThanOrEqual(44);
    expect(boite?.height).toBeGreaterThanOrEqual(44);
    await fermer.click();
    await expect(dialogue).toBeHidden();
    await expect(page.locator(VIGNETTE)).toBeFocused();

    await page.locator(VIGNETTE).click();
    await expect(dialogue).toBeVisible();
  });

  test('ferme la visionneuse d’un clic sur le fond, pas d’un clic sur l’image', async ({ page }) => {
    await page.goto('/projets/pit-wall/');
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).click();
    await expect(dialogue).toBeVisible();

    await dialogue.locator('img').click();
    await expect(dialogue).toBeVisible();

    await page.mouse.click(4, 4);
    await expect(dialogue).toBeHidden();
  });

  test('garde le focus dans la visionneuse : la page derrière n’est pas atteignable au clavier', async ({
    page,
  }) => {
    await page.goto('/projets/pit-wall/');
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).click();
    await expect(dialogue).toBeVisible();
    await expect(dialogue.getByRole('button', { name: 'Fermer la visionneuse' })).toBeFocused();

    // Avec un seul contrôle, Tab sort vers le navigateur (activeElement = body), jamais vers la page
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      const etat = await page.evaluate((selecteur) => {
        const actif = document.activeElement;
        return {
          dansDialogue: document.querySelector(selecteur)?.contains(actif) ?? false,
          corps: actif === document.body,
        };
      }, DIALOGUE);
      expect(etat.dansDialogue || etat.corps, `Tab n° ${i + 1}`).toBe(true);
    }
    await expect(page.locator(VIGNETTE)).not.toBeFocused();
  });

  test('ne fait rien aux flèches et n’affiche ni précédent, ni suivant, ni compteur avec une seule image', async ({
    page,
  }) => {
    await page.goto('/projets/pit-wall/');
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).click();

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');

    await expect(dialogue).toBeVisible();
    await expect(dialogue.getByRole('button', { name: /Capture (précédente|suivante)/ })).toHaveCount(0);
    await expect(dialogue.locator('[data-galerie-compteur]')).toHaveCount(0);
  });

  test('traduit la visionneuse en anglais', async ({ page }) => {
    await page.goto('/en/projects/pit-wall/');
    const dialogue = page.locator(DIALOGUE);

    await expect(page.locator(`${VIGNETTE} img`)).toHaveAttribute('alt', 'Screenshot 1 of Pit Wall');
    await page.locator(VIGNETTE).click();

    await expect(dialogue).toHaveAccessibleName('Screenshot viewer');
    await expect(dialogue.getByRole('button', { name: 'Close the viewer' })).toBeVisible();
  });
});

test.describe('galerie sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('garde la vignette comme lien vers un fichier image', async ({ page }) => {
    await page.goto('/projets/pit-wall/');
    const lien = page.locator(VIGNETTE);

    await expect(lien).toHaveCount(1);
    await expect(lien.locator('img')).toBeVisible();
    await expect(page.locator(DIALOGUE)).toBeHidden();
    const href = await lien.getAttribute('href');
    expect(href).toMatch(/\.webp$/);
    const reponse = await page.request.get(href as string);
    expect(reponse.status()).toBe(200);
    expect(reponse.headers()['content-type']).toBe('image/webp');
  });

  test('ouvre l’image en grand en suivant le lien', async ({ page }) => {
    await page.goto('/projets/pit-wall/');

    await page.locator(VIGNETTE).click();

    await expect(page).toHaveURL(/\.webp$/);
  });
});

test.describe('pages projet à 320 px de large', () => {
  for (const id of IDS) {
    test(`${id} ne déborde pas horizontalement, en FR et en EN`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });

      for (const chemin of [`/projets/${id}/`, `/en/projects/${id}/`]) {
        await page.goto(chemin);
        await expect(page.locator('h1')).toBeVisible();

        const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(largeur, chemin).toBeLessThanOrEqual(320);
      }
    });
  }

  test('la visionneuse ouverte ne déborde pas non plus', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/projets/pit-wall/');

    await page.locator(VIGNETTE).click();

    await expect(page.locator(DIALOGUE)).toBeVisible();
    const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(largeur).toBeLessThanOrEqual(320);
  });
});
