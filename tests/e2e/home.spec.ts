import { expect, test } from '@playwright/test';
import { profil } from '../../src/data/profil';
import { projets } from '../../src/data/projets';
import { t } from '../../src/i18n/ui';
import { NOEUDS } from '../../src/lib/noyau';
import { sectionPath } from '../../src/lib/routes';
import { statut } from '../../src/lib/statut';

const ADRESSE = 'matis.nico123@gmail.com';
const NOEUDS_LARGES = '[data-scene="large"] a[data-noeud]';
const NOEUDS_COMPACTS = '[data-scene="compact"] a[data-noeud]';

/** Adresse attendue de chaque nœud : sa page de section, et le statut sur la page contact. */
function cible(lang: 'fr' | 'en', id: (typeof NOEUDS)[number]): string {
  return id === 'statut' ? `${sectionPath(lang, 'contact')}#statut` : sectionPath(lang, id);
}

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

  test('lit « Matis Demore » dans le titre h1', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText(profil.nom);
  });

  test('relie les six nœuds du noyau à leur page, dans l’ordre des sections', async ({ page }) => {
    for (const lang of ['fr', 'en'] as const) {
      await page.goto(lang === 'fr' ? '/' : '/en/');

      const noeuds = page.locator(NOEUDS_LARGES);
      await expect(noeuds).toHaveCount(NOEUDS.length);
      const ids = await noeuds.evaluateAll((liens) => liens.map((lien) => lien.getAttribute('data-noeud')));
      expect(ids).toEqual([...NOEUDS]);
      for (const id of NOEUDS) {
        await expect(page.locator(`[data-scene="large"] [data-noeud="${id}"]`), `${id} (${lang})`).toHaveAttribute(
          'href',
          cible(lang, id),
        );
      }
    }
  });

  test('calcule les textes des nœuds à partir des données : nombre de projets et statut', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-scene="large"] [data-noeud="projets"]')).toContainText(
      `${projets.length} projets`,
    );
    const etat = statut('fr');
    const noeudStatut = page.locator('[data-scene="large"] [data-noeud="statut"]');
    await expect(noeudStatut).toContainText(etat.titre);
    await expect(noeudStatut).toContainText(etat.court);
  });

  test('anime la scène : les nœuds bougent d’eux-mêmes', async ({ page }) => {
    await page.goto('/');
    const noeud = page.locator('[data-scene="large"] [data-noeud="projets"]');

    const avant = await noeud.evaluate((lien: HTMLElement) => lien.style.left);
    await expect.poll(() => noeud.evaluate((lien: HTMLElement) => lien.style.left), { timeout: 5000 }).not.toBe(avant);
  });

  test('plonge vers le nœud cliqué, puis ouvre la page de la section', async ({ page }) => {
    await page.goto('/');

    // Le nœud bouge sans cesse : Playwright refuserait de cliquer sur un élément « instable »,
    // on lui envoie donc directement le clic (bouton gauche, sans touche de modification)
    await page.locator('[data-scene="large"] [data-noeud="parcours"]').dispatchEvent('click', { button: 0 });
    // La plongée dure un peu moins d'une seconde : la scène grossit avant la navigation
    await expect
      .poll(() => page.locator('[data-scene="large"] [data-plateau]').evaluate((el: HTMLElement) => el.style.transform))
      .toMatch(/scale\(/);
    await expect(page).toHaveURL(sectionPath('fr', 'parcours'));
    await expect(page.locator('h1')).toHaveText(t('fr', 'parcours.titre'));
  });

  test('met la rotation en pause et la reprend', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: t('fr', 'noyau.pause') });

    await expect(bouton).toBeVisible();
    await bouton.click();
    const pause = page.getByRole('button', { name: t('fr', 'noyau.reprendre') });
    await expect(pause).toHaveAttribute('aria-pressed', 'true');

    // En pause, la scène ne bouge plus
    const noeud = page.locator('[data-scene="large"] [data-noeud="projets"]');
    const fige = await noeud.evaluate((lien: HTMLElement) => lien.style.left);
    await page.waitForTimeout(600);
    expect(await noeud.evaluate((lien: HTMLElement) => lien.style.left)).toBe(fige);

    await pause.click();
    await expect(page.getByRole('button', { name: t('fr', 'noyau.pause') })).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('accueil avec mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce' });

  test('démarre en pause, et un clic sur un nœud ouvre la section sans plongée', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: t('fr', 'noyau.reprendre') })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.locator('[data-scene="large"] [data-noeud="cv"]').click();
    await expect(page).toHaveURL(sectionPath('fr', 'cv'));
  });
});

test.describe('accueil sur téléphone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('montre la scène compacte et la liste des sections, sans la scène large', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-scene="large"]')).toBeHidden();
    await expect(page.locator(NOEUDS_COMPACTS)).toHaveCount(NOEUDS.length);
    const liste = page.getByRole('navigation', { name: t('fr', 'nav.label') }).filter({ has: page.locator('.ligne') });
    await expect(liste.getByRole('link')).toHaveCount(NOEUDS.length);
    for (const id of NOEUDS) {
      await expect(liste.locator(`a[href="${cible('fr', id)}"]`), id).toBeVisible();
    }
  });

  test('donne aux nœuds compacts un nom qui commence par leur numéro', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: `01 · ${t('fr', 'nav.projets')}`, exact: true })).toHaveAttribute(
      'href',
      sectionPath('fr', 'projets'),
    );
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

  test('rend la scène fixe, avec des nœuds qui restent des liens, et cache le bouton pause', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(NOEUDS_LARGES)).toHaveCount(NOEUDS.length);
    await expect(page.locator('[data-pause]')).toBeHidden();
    await page.locator('[data-scene="large"] [data-noeud="contact"]').click();
    await expect(page).toHaveURL(sectionPath('fr', 'contact'));
  });
});
