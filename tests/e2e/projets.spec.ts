import { expect, test } from '@playwright/test';
import { projets } from '../../src/data/projets';
import type { Lang } from '../../src/data/types';
import { t } from '../../src/i18n/ui';
import { formaterCompte } from '../../src/lib/filtre';
import { projectPath } from '../../src/lib/routes';
import { captures } from './support/captures';
import { libelleDemo } from './support/liens';

const CARTES = '[data-projet-id]';
const CARTES_VISIBLES = '[data-projet-id]:visible';

// Tout est calculé à partir des données : ajouter un projet ou une capture ne change aucune attente ici.
const jeux = projets.filter((projet) => projet.categorie === 'jeu');
const assos = projets.filter((projet) => projet.categorie === 'asso');
// Les vedettes en tête, puis le reste, chacun dans l'ordre des données
const ordreAccueil = [
  ...projets.filter((projet) => projet.vedette),
  ...projets.filter((projet) => !projet.vedette),
];

const carte = (id: string) => `[data-projet-id="${id}"]`;

/** Message de résultat du filtre, tel que le lit un lecteur d'écran : « 3 projets », « 1 project »... */
function compte(n: number, lang: Lang): string {
  return formaterCompte(n, lang, {
    one: t(lang, 'projets.compte.one'),
    other: t(lang, 'projets.compte.other'),
  });
}

test.describe('projets sur l’accueil avec JavaScript', () => {
  test('affiche une carte par projet', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(CARTES)).toHaveCount(projets.length);
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(projets.length);
  });

  test('filtre sur « Associatif » puis revient à « Tous »', async ({ page }) => {
    await page.goto('/');
    const associatif = page.getByRole('button', { name: 'Associatif' });
    const tous = page.getByRole('button', { name: 'Tous' });
    const statut = page.getByRole('status');

    await associatif.click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(assos.length);
    for (const projet of assos) await expect(page.locator(carte(projet.id)), projet.id).toBeVisible();
    for (const projet of jeux) await expect(page.locator(carte(projet.id)), projet.id).toBeHidden();
    await expect(associatif).toHaveAttribute('aria-pressed', 'true');
    await expect(tous).toHaveAttribute('aria-pressed', 'false');
    await expect(statut).toHaveText(compte(assos.length, 'fr'));

    await tous.click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(projets.length);
    await expect(tous).toHaveAttribute('aria-pressed', 'true');
    await expect(associatif).toHaveAttribute('aria-pressed', 'false');
    await expect(statut).toHaveText(compte(projets.length, 'fr'));
  });

  test('filtre sur « Jeux »', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Jeux' }).click();

    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(jeux.length);
    for (const projet of jeux) await expect(page.locator(carte(projet.id)), projet.id).toBeVisible();
    for (const projet of assos) await expect(page.locator(carte(projet.id)), projet.id).toBeHidden();
    await expect(page.getByRole('status')).toHaveText(compte(jeux.length, 'fr'));
  });

  test('filtre aussi la page anglaise, avec le singulier et le pluriel anglais', async ({ page }) => {
    await page.goto('/en/');
    const statut = page.getByRole('status');

    await page.getByRole('button', { name: 'Community' }).click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(assos.length);
    await expect(statut).toHaveText(compte(assos.length, 'en'));

    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(projets.length);
    await expect(statut).toHaveText(compte(projets.length, 'en'));
  });

  test('offre des boutons de filtre d’au moins 44 px de haut', async ({ page }) => {
    await page.goto('/');

    const hauteurs = await page
      .locator('button[data-filtre]')
      .evaluateAll((boutons) => boutons.map((bouton) => bouton.getBoundingClientRect().height));
    expect(hauteurs).toHaveLength(3);
    for (const hauteur of hauteurs) expect(hauteur).toBeGreaterThanOrEqual(44);
  });

  test('propose « Jouer » ou « Voir le site » seulement avec une démo, et toujours « Code », en liens externes sûrs', async ({
    page,
  }) => {
    for (const lang of ['fr', 'en'] as const) {
      await page.goto(lang === 'fr' ? '/' : '/en/');

      for (const projet of projets) {
        const cible = page.locator(carte(projet.id));
        const demo = cible.getByRole('link', { name: new RegExp(`^${libelleDemo(lang, projet)}`) });
        if (projet.liens.demo === undefined) {
          await expect(demo, `${projet.id} (${lang}) : pas de démo`).toHaveCount(0);
        } else {
          await expect(demo, `${projet.id} (${lang}) : démo`).toHaveCount(1);
          await expect(demo).toHaveAttribute('href', projet.liens.demo);
          await expect(demo).toHaveAttribute('rel', /noopener/);
          await expect(demo).toHaveAttribute('rel', /noreferrer/);
        }

        const code = cible.getByRole('link', { name: new RegExp(`^${t(lang, 'projets.code')}`) });
        await expect(code, `${projet.id} (${lang}) : code`).toHaveCount(1);
        await expect(code).toHaveAttribute('href', projet.liens.code);
        await expect(code).toHaveAttribute('rel', /noopener/);
        await expect(code).toHaveAttribute('rel', /noreferrer/);
      }
    }
  });

  test('mène chaque carte à la page du projet dans la langue courante', async ({ page }) => {
    for (const lang of ['fr', 'en'] as const) {
      await page.goto(lang === 'fr' ? '/' : '/en/');

      for (const projet of projets) {
        await expect(
          page.locator(`${carte(projet.id)} a.carte-lien`),
          `${projet.id} (${lang})`,
        ).toHaveAttribute('href', projectPath(lang, projet.id));
      }
    }
  });

  test('met les vedettes en tête, puis le reste dans l’ordre des données', async ({ page }) => {
    await page.goto('/');

    const ids = await page.locator(CARTES).evaluateAll((cartes) =>
      cartes.map((element) => element.getAttribute('data-projet-id')),
    );
    expect(ids).toEqual(ordreAccueil.map((projet) => projet.id));
  });

  test('affiche une vignette sur la carte de chaque projet qui a une capture, et aucune sur les autres', async ({
    page,
  }) => {
    await page.goto('/');

    for (const projet of projets) {
      const vignette = page.locator(`${carte(projet.id)} img`);

      if (captures(projet.id).length === 0) {
        // Une carte sans capture reste purement typographique : aucune image, donc aucune image cassée
        await expect(vignette, projet.id).toHaveCount(0);
        continue;
      }
      await expect(vignette, projet.id).toHaveCount(1);
      await vignette.scrollIntoViewIfNeeded();
      await expect
        .poll(() => vignette.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), {
          message: `la vignette de ${projet.id} est chargée`,
        })
        .toBe(true);
    }
  });
});

test.describe('projets sur l’accueil sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('affiche toutes les cartes et aucun bouton de filtre inutile', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(CARTES_VISIBLES)).toHaveCount(projets.length);
    await expect(page.locator('button[data-filtre]')).toHaveCount(3);
    await expect(page.locator('button[data-filtre]:visible')).toHaveCount(0);
  });
});

test.describe('projets sur l’accueil à 320 px de large', () => {
  for (const chemin of ['/', '/en/']) {
    test(`ne déborde pas horizontalement sur ${chemin}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(chemin);

      await expect(page.locator(CARTES_VISIBLES)).toHaveCount(projets.length);
      const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(largeur).toBeLessThanOrEqual(320);
    });
  }
});
