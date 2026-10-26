import { expect, test } from '@playwright/test';

const SITE = 'https://tonoplas909.github.io';

test.describe('page 404 bilingue', () => {
  test('/nimportequoi/ répond 404 avec le texte français et un lien vers l’accueil /', async ({
    page,
  }) => {
    const reponse = await page.goto('/nimportequoi/');

    expect(reponse?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('main h1:visible')).toHaveText('Page introuvable');
    await expect(page.locator('main :text("Page not found"):visible')).toHaveCount(0);

    const accueil = page.locator('main a[href="/"]:visible');
    await expect(accueil).toHaveCount(1);
    await expect(accueil).toHaveText(/accueil/i);
    await expect(page.locator('main a[href="/en/"]:visible')).toHaveCount(0);
  });

  test('/en/nope/ répond 404 avec le texte anglais et un lien vers l’accueil /en/', async ({
    page,
  }) => {
    const reponse = await page.goto('/en/nope/');

    expect(reponse?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main h1:visible')).toHaveText('Page not found');
    await expect(page.locator('main :text("Page introuvable"):visible')).toHaveCount(0);

    const accueil = page.locator('main a[href="/en/"]:visible');
    await expect(accueil).toHaveCount(1);
    await expect(accueil).toHaveText(/home/i);
    await expect(page.locator('main a[href="/"]:visible')).toHaveCount(0);
  });

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('la version française reste visible, même sous /en/', async ({ page }) => {
      const reponse = await page.goto('/en/nope/');

      expect(reponse?.status()).toBe(404);
      await expect(page.locator('main h1:visible')).toHaveText('Page introuvable');
      await expect(page.locator('main a[href="/"]:visible')).toHaveCount(1);
    });
  });

  test('la réponse 404 est noindex, sans canonique ni hreflang', async ({ request }) => {
    const reponse = await request.get('/nimportequoi/');
    expect(reponse.status()).toBe(404);

    const html = await reponse.text();
    expect(html).toMatch(/<meta name="robots" content="noindex"\s*\/?>/);
    expect(html).not.toContain('rel="canonical"');
    // Pas de <link rel="alternate" hreflang="…"> (le lien « EN » de l'en-tête porte, lui, un hreflang d'ancre)
    expect(html).not.toMatch(/<link\b[^>]*\bhreflang=/);
  });
});

test.describe('robots, sitemap, favicon et image de partage', () => {
  test('/robots.txt autorise tout et annonce le sitemap', async ({ request }) => {
    const reponse = await request.get('/robots.txt');
    expect(reponse.status()).toBe(200);

    const texte = await reponse.text();
    expect(texte).toContain('User-agent: *');
    expect(texte).toContain('Allow: /');
    expect(texte).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  test('/sitemap-index.xml répond 200', async ({ request }) => {
    const reponse = await request.get('/sitemap-index.xml');
    expect(reponse.status()).toBe(200);
  });

  test('le sitemap relie les pages projet FR et EN et ignore /404/', async ({ request }) => {
    const reponse = await request.get('/sitemap-0.xml');
    expect(reponse.status()).toBe(200);
    const xml = await reponse.text();

    // Les alternatives de langue d'une entrée : { hreflang → href }
    const alternativesDe = (loc: string): Record<string, string> => {
      const bloc = xml.split('<url>').find((b) => b.includes(`<loc>${loc}</loc>`));
      expect(bloc, `entrée du sitemap pour ${loc}`).toBeDefined();
      const alternatives: Record<string, string> = {};
      for (const [balise] of (bloc as string).matchAll(/<xhtml:link\b[^>]*>/g)) {
        const hreflang = balise.match(/hreflang="([^"]+)"/)?.[1];
        const href = balise.match(/href="([^"]+)"/)?.[1];
        if (hreflang && href) alternatives[hreflang] = href;
      }
      return alternatives;
    };

    const fr = `${SITE}/projets/drift-club/`;
    const en = `${SITE}/en/projects/drift-club/`;
    expect(alternativesDe(fr)).toMatchObject({ fr, en });
    expect(alternativesDe(en)).toMatchObject({ fr, en });
    expect(alternativesDe(`${SITE}/`)).toMatchObject({ fr: `${SITE}/`, en: `${SITE}/en/` });

    expect(xml).not.toContain('/404/');
  });

  test('/favicon.svg répond 200 et l’accueil le déclare', async ({ page, request }) => {
    const reponse = await request.get('/favicon.svg');
    expect(reponse.status()).toBe(200);
    expect(reponse.headers()['content-type']).toContain('image/svg+xml');

    await page.goto('/');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/svg+xml');
  });

  test('/og-default.png répond 200 en image/png de 1200×630', async ({ request }) => {
    const reponse = await request.get('/og-default.png');
    expect(reponse.status()).toBe(200);
    expect(reponse.headers()['content-type']).toBe('image/png');

    // En-tête PNG : signature sur 8 octets, puis le bloc IHDR (largeur et hauteur, 4 octets chacune)
    const octets = await reponse.body();
    expect(octets.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(octets.readUInt32BE(16)).toBe(1200);
    expect(octets.readUInt32BE(20)).toBe(630);
  });
});
