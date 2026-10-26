import { expect, test } from '@playwright/test';

const ORIGINE = 'http://localhost:4321';
const SITE = 'https://tonoplas909.github.io';

test.describe('accueil français (/)', () => {
  test('déclare la langue et les alternatives de langue', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('link[rel=alternate][hreflang=en]')).toHaveAttribute(
      'href',
      `${SITE}/en/`,
    );
    await expect(page.locator('link[rel=alternate][hreflang=fr]')).toHaveAttribute(
      'href',
      `${SITE}/`,
    );
    await expect(page.locator('link[rel=alternate][hreflang=x-default]')).toHaveAttribute(
      'href',
      `${SITE}/`,
    );
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `${SITE}/`);
  });

  test('porte les balises Open Graph et Twitter card avec une image absolue', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `${SITE}/og-default.png`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Matis Demore/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  });

  test('expose les données structurées Person sans e-mail', async ({ page }) => {
    await page.goto('/');

    const json = await page.locator('script[type="application/ld+json"]').textContent();
    expect(json).not.toBeNull();
    const donnees = JSON.parse(json ?? '{}');
    expect(donnees['@type']).toBe('Person');
    expect(donnees.name).toBe('Matis Demore');
    expect(donnees.sameAs).toEqual([
      'https://github.com/Tonoplas909',
      'https://www.linkedin.com/in/matis-demore-31609a267/',
    ]);
    expect(json).not.toMatch(/@gmail/);
  });

  test('affiche le logo, la navigation et le sélecteur de langue', async ({ page }) => {
    await page.goto('/');
    const entete = page.locator('header');

    await expect(entete.locator('a.logo')).toHaveAttribute('href', '/');
    await expect(entete.locator('a.logo')).toContainText('~/matis-demore');

    const ancres = await entete.locator('nav a.nav-lien').evaluateAll((liens) =>
      liens.map((lien) => lien.getAttribute('href')),
    );
    expect(ancres).toEqual(['#projets', '#parcours', '#cv', '#contact']);

    // Langue active : FR. Lien vers l'autre langue : EN, avec un nom accessible explicite.
    await expect(entete.locator('[aria-current="true"]')).toHaveText('FR');
    const versEn = entete.getByRole('link', { name: 'Voir le site en anglais' });
    await expect(versEn).toHaveText('EN');
    await expect(versEn).toHaveAttribute('href', '/en/');
  });

  test('affiche le pied de page avec GitHub, LinkedIn et l’ancre #contact', async ({ page }) => {
    await page.goto('/');
    const pied = page.locator('footer#contact');

    const github = pied.getByRole('link', { name: 'GitHub' });
    await expect(github).toHaveAttribute('href', 'https://github.com/Tonoplas909');
    await expect(github).toHaveAttribute('rel', /noopener/);
    await expect(github).toHaveAttribute('rel', /noreferrer/);

    const linkedin = pied.getByRole('link', { name: 'LinkedIn' });
    await expect(linkedin).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/matis-demore-31609a267/',
    );
    await expect(linkedin).toHaveAttribute('rel', /noopener/);
    await expect(linkedin).toHaveAttribute('rel', /noreferrer/);
  });

  test('offre des cibles tactiles d’au moins 44 px dans l’en-tête et le pied de page', async ({
    page,
  }) => {
    await page.goto('/');

    const tailles = await page
      .locator('header a, footer a')
      .evaluateAll((liens) =>
        liens.map((lien) => {
          const { width, height } = lien.getBoundingClientRect();
          return { nom: lien.textContent?.trim(), width, height };
        }),
      );
    expect(tailles.length).toBeGreaterThanOrEqual(8);
    for (const { nom, width, height } of tailles) {
      expect(height, `hauteur de « ${nom} »`).toBeGreaterThanOrEqual(44);
      expect(width, `largeur de « ${nom} »`).toBeGreaterThanOrEqual(44);
    }
  });

  test('montre un anneau de focus couleur accent au clavier', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const anneau = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return { couleur: style.outlineColor, style: style.outlineStyle, largeur: style.outlineWidth };
    });
    expect(anneau.style).toBe('solid');
    expect(anneau.largeur).toBe('2px');
    expect(anneau.couleur).toBe('rgb(108, 182, 255)');
  });

  test('ne contient aucun débordement horizontal à 320 px de large', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');

    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(debordement).toBeLessThanOrEqual(0);
  });

  test('ne fait aucune requête vers un tiers et sert les polices du site', async ({ page }) => {
    const urls: string[] = [];
    page.on('request', (requete) => urls.push(requete.url()));

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    expect(urls.length).toBeGreaterThan(0);
    const etrangeres = urls.filter((url) => !url.startsWith(`${ORIGINE}/`));
    expect(etrangeres).toEqual([]);
    expect(urls.some((url) => url.endsWith('.woff2'))).toBe(true);
  });
});

test.describe('accueil anglais (/en/)', () => {
  test('déclare la langue anglaise et pointe vers la version française', async ({ page }) => {
    await page.goto('/en/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel=alternate][hreflang=fr]')).toHaveAttribute(
      'href',
      `${SITE}/`,
    );
    const versFr = page.locator('header').getByRole('link', { name: 'View the site in French' });
    await expect(versFr).toHaveText('FR');
    await expect(versFr).toHaveAttribute('href', '/');
  });
});
