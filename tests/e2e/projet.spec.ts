import { expect, test, type Page } from '@playwright/test';
import { profil } from '../../src/data/profil';
import { projets } from '../../src/data/projets';
import type { Lang, Projet } from '../../src/data/types';
import { t } from '../../src/i18n/ui';
import { altCapture } from '../../src/lib/galerie';
import { projetParId } from '../../src/lib/projets';
import { homePath, projectPath } from '../../src/lib/routes';
import { avecCaptures, captures, sansCaptures } from './support/captures';
import { libelleDemo } from './support/liens';

const SITE = 'https://tonoplas909.github.io';
const VIGNETTE = '[data-galerie-lien]';
const DIALOGUE = 'dialog[data-galerie-dialog]';
const IMAGE_GRANDE = `${DIALOGUE} [data-galerie-image]`;
const COMPTEUR = `${DIALOGUE} [data-galerie-compteur]`;

// Les galeries sont testées sur le premier projet qui a des captures. Tant qu'aucune n'a été déposée dans
// src/assets/projets/, ces tests sont ignorés ; `projetGalerie` n'est alors qu'un projet de repli.
const projetGalerie: Projet = avecCaptures[0] ?? projets[0];
const aUneGalerie = avecCaptures.length > 0;
const nomsGalerie = captures(projetGalerie.id);

// Le premier projet qui a au moins deux captures : la navigation précédent/suivant n'existe qu'à partir de là.
const projetMulti: Projet = projets.find((projet) => captures(projet.id).length >= 2) ?? projetGalerie;
const nomsMulti = captures(projetMulti.id);
const aPlusieursCaptures = nomsMulti.length >= 2;

// Un projet qui a exactement une capture : ni compteur ni boutons dans sa visionneuse.
const projetUneCapture: Projet = projets.find((projet) => captures(projet.id).length === 1) ?? projetGalerie;
const aUneSeuleCapture = captures(projetUneCapture.id).length === 1;

/** Texte alternatif attendu de la capture n° `n` (à partir de 1) du projet, dans la langue donnée. */
function altAttendu(projet: Projet, n: number, lang: Lang): string {
  const nom = captures(projet.id)[n - 1];
  return altCapture(projet.titre, n, lang, projet.legendes?.[nom]);
}

/** Motif de l'URL de l'image de partage d'un projet qui a des captures : sa première capture, optimisée. */
function motifImagePartage(nomCapture: string): RegExp {
  const base = nomCapture.slice(0, nomCapture.lastIndexOf('.'));
  // Astro peut remplacer ou encoder les caractères spéciaux d'un nom de fichier : on ne compare que sa partie sûre
  const sure = /^[\w-]*/.exec(base)?.[0] ?? '';
  return new RegExp(`^https://tonoplas909\\.github\\.io/_astro/${sure}${sure === base ? '\\.' : ''}`);
}

async function imageChargee(page: Page, selecteur: string): Promise<boolean> {
  return page
    .locator(selecteur)
    .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
}

test.describe('pages projet', () => {
  for (const { id } of projets) {
    test(`${id} : les pages FR et EN répondent 200 avec un h1 non vide`, async ({ page }) => {
      for (const chemin of [projectPath('fr', id), projectPath('en', id)]) {
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
    // Les textes viennent des données : relire ou traduire un projet ne casse pas ce test
    const projet = projetParId('cafet-miage');
    await page.goto(projectPath('fr', projet.id));
    const article = page.locator('article');

    await expect(page).toHaveTitle(`${projet.titre} — ${profil.nom}`);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', projet.resume.fr);
    const retour = article.locator('[data-projet-retour]');
    await expect(retour).toHaveText(`← ${t('fr', 'projet.retour')}`);
    await expect(retour).toHaveAttribute('href', `${homePath('fr')}#projets`);
    expect((await retour.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await expect(article.locator('h1')).toHaveText(projet.titre);
    if (projet.badge) await expect(article.getByText(projet.badge.fr, { exact: true })).toBeVisible();
    await expect(article.getByText(projet.stack.join(' · '), { exact: true })).toBeVisible();
    await expect(
      article.getByRole('heading', { level: 2, name: t('fr', 'projet.presentation') }),
    ).toBeVisible();
    await expect(
      article.getByRole('heading', { level: 2, name: t('fr', 'projet.points') }),
    ).toBeVisible();
    expect(await article.locator('.points li').count()).toBe(projet.points.fr.length);
    expect(await article.locator('.texte p').count()).toBe(projet.description.fr.length);
  });

  test('en anglais, le lien de retour va à la section projets de l’accueil anglais', async ({
    page,
  }) => {
    await page.goto(projectPath('en', projets[0].id));

    const retour = page.locator('[data-projet-retour]');
    await expect(retour).toHaveText(`← ${t('en', 'projet.retour')}`);
    await expect(retour).toHaveAttribute('href', `${homePath('en')}#projets`);
    await expect(
      page.getByRole('heading', { level: 2, name: t('en', 'projet.points') }),
    ).toBeVisible();
  });

  test('propose « Jouer » ou « Voir le site » seulement avec une démo, en lien primaire sûr, et toujours « Code »', async ({
    page,
  }) => {
    for (const lang of ['fr', 'en'] as const) {
      for (const projet of projets) {
        await page.goto(projectPath(lang, projet.id));
        // Le lien du sélecteur de langue s'appelle « EN — Voir le site en anglais » : on ne regarde que le contenu de la page
        const principal = page.locator('main');
        const etiquette = `${projet.id} (${lang})`;

        const demo = principal.getByRole('link', { name: libelleDemo(lang, projet), exact: true });
        if (projet.liens.demo === undefined) {
          await expect(demo, `${etiquette} : pas de démo`).toHaveCount(0);
        } else {
          await expect(demo, `${etiquette} : démo`).toHaveCount(1);
          await expect(demo).toHaveAttribute('href', projet.liens.demo);
          await expect(demo).toHaveAttribute('rel', /noopener/);
          await expect(demo).toHaveAttribute('rel', /noreferrer/);
          await expect(demo).toHaveClass(/bouton--primaire/);
        }

        const code = principal.getByRole('link', { name: t(lang, 'projets.code'), exact: true });
        await expect(code, `${etiquette} : code`).toHaveCount(1);
        await expect(code).toHaveAttribute('href', projet.liens.code);
        await expect(code).toHaveClass(/bouton--secondaire/);
        await expect(code).toHaveAttribute('rel', /noopener/);
        await expect(code).toHaveAttribute('rel', /noreferrer/);
      }
    }
  });

  test('n’a ni dialogue, ni vignette, ni titre de galerie sur un projet sans capture (aucun cadre vide)', async ({
    page,
  }) => {
    test.skip(sansCaptures.length === 0, 'tous les projets ont au moins une capture');

    for (const { id } of sansCaptures) {
      await page.goto(projectPath('fr', id));

      await expect(page.locator('dialog'), id).toHaveCount(0);
      await expect(page.locator(VIGNETTE), id).toHaveCount(0);
      await expect(page.locator('main img'), id).toHaveCount(0);
      await expect(page.getByRole('heading', { name: t('fr', 'projet.galerie') }), id).toHaveCount(0);
    }
  });

  test('affiche autant de vignettes que de captures déposées pour chaque projet', async ({ page }) => {
    test.skip(!aUneGalerie, 'aucune capture dans src/assets/projets/');

    // Si une image acceptée par la sélection du site est ignorée par la page (casse de l'extension...), ça se voit ici
    for (const { id } of avecCaptures) {
      await page.goto(projectPath('fr', id));

      await expect(page.locator(VIGNETTE), id).toHaveCount(captures(id).length);
    }
  });

  test('relie chaque projet à son précédent et à son suivant, de façon circulaire', async ({
    page,
  }) => {
    for (const lang of ['fr', 'en'] as const) {
      for (const [index, projet] of projets.entries()) {
        const precedent = projets[(index - 1 + projets.length) % projets.length];
        const suivant = projets[(index + 1) % projets.length];
        await page.goto(projectPath(lang, projet.id));
        const etiquette = `${projet.id} (${lang})`;

        const lienPrecedent = page.getByRole('link', { name: t(lang, 'projet.precedent') });
        await expect(lienPrecedent, etiquette).toHaveAttribute('href', projectPath(lang, precedent.id));
        await expect(lienPrecedent, etiquette).toContainText(precedent.titre);
        const lienSuivant = page.getByRole('link', { name: t(lang, 'projet.suivant') });
        await expect(lienSuivant, etiquette).toHaveAttribute('href', projectPath(lang, suivant.id));
        await expect(lienSuivant, etiquette).toContainText(suivant.titre);
      }
    }
  });

  test('offre le sélecteur de langue vers la page équivalente, dans les deux sens', async ({
    page,
  }) => {
    const { id } = projets[0];

    await page.goto(projectPath('en', id));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.locator('header').getByRole('link', { name: 'FR — View the site in French', exact: true }),
    ).toHaveAttribute('href', projectPath('fr', id));

    await page.goto(projectPath('fr', id));
    await expect(
      page.locator('header').getByRole('link', { name: 'EN — Voir le site en anglais', exact: true }),
    ).toHaveAttribute('href', projectPath('en', id));
  });

  test('prend la première capture comme image de partage (URL absolue), sinon l’image par défaut', async ({
    page,
  }) => {
    for (const projet of projets) {
      await page.goto(projectPath('fr', projet.id));
      const og = page.locator('meta[property="og:image"]');
      const twitter = page.locator('meta[name="twitter:image"]');
      const [premiere] = captures(projet.id);

      if (premiere === undefined) {
        await expect(og, projet.id).toHaveAttribute('content', `${SITE}/og-default.png`);
        await expect(twitter, projet.id).toHaveAttribute('content', `${SITE}/og-default.png`);
      } else {
        await expect(og, projet.id).toHaveAttribute('content', motifImagePartage(premiere));
        await expect(og, projet.id).toHaveAttribute('content', /\.jpe?g$/);
        await expect(twitter, projet.id).toHaveAttribute('content', motifImagePartage(premiere));
      }
    }
  });
});

test.describe('galerie et visionneuse avec JavaScript', () => {
  test.skip(!aUneGalerie, 'aucune capture dans src/assets/projets/ : rien à afficher');

  test('affiche la vignette du premier projet illustré, chargée, avec un texte alternatif', async ({
    page,
  }) => {
    await page.goto(projectPath('fr', projetGalerie.id));

    await expect(page.locator(VIGNETTE)).toHaveCount(nomsGalerie.length);
    const image = page.locator(`${VIGNETTE} img`).first();
    await expect(image).toHaveAttribute('alt', altAttendu(projetGalerie, 1, 'fr'));
    await expect(image).toBeVisible();
    await expect.poll(() => imageChargee(page, `${VIGNETTE} img`)).toBe(true);
    await expect(
      page.getByRole('heading', { level: 2, name: t('fr', 'projet.galerie') }),
    ).toBeVisible();
    // Le dialogue est fermé : rien n'est affiché
    await expect(page.locator(DIALOGUE)).toBeHidden();
  });

  test('ouvre la visionneuse au clic sur la vignette, la ferme avec Échap et rend le focus à la vignette', async ({
    page,
  }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const vignette = page.locator(VIGNETTE).first();
    const dialogue = page.locator(DIALOGUE);

    await vignette.click();

    await expect(dialogue).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${projectPath('fr', projetGalerie.id)}$`));
    await expect(dialogue).toHaveAccessibleName("Visionneuse de captures d'écran");
    await expect(dialogue.locator('img')).toHaveAttribute('alt', altAttendu(projetGalerie, 1, 'fr'));
    await expect.poll(() => imageChargee(page, `${DIALOGUE} img`)).toBe(true);

    await page.keyboard.press('Escape');

    await expect(dialogue).toBeHidden();
    await expect(vignette).toBeFocused();
  });

  test('ferme la visionneuse avec le bouton « Fermer » (44 px au moins) puis la rouvre', async ({
    page,
  }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const dialogue = page.locator(DIALOGUE);
    const vignette = page.locator(VIGNETTE).first();
    await vignette.click();
    const fermer = dialogue.getByRole('button', { name: 'Fermer la visionneuse' });

    const boite = await fermer.boundingBox();
    expect(boite?.width).toBeGreaterThanOrEqual(44);
    expect(boite?.height).toBeGreaterThanOrEqual(44);
    await fermer.click();
    await expect(dialogue).toBeHidden();
    await expect(vignette).toBeFocused();

    await vignette.click();
    await expect(dialogue).toBeVisible();
  });

  test('ferme la visionneuse d’un clic sur le fond, pas d’un clic sur l’image', async ({ page }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).first().click();
    await expect(dialogue).toBeVisible();

    await dialogue.locator('img').click();
    await expect(dialogue).toBeVisible();

    await page.mouse.click(4, 4);
    await expect(dialogue).toBeHidden();
  });

  test('ne ferme pas la visionneuse quand un glissement commencé sur l’image finit sur le fond', async ({
    page,
  }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).first().click();
    await expect(dialogue).toBeVisible();
    const boite = await dialogue.locator('img').boundingBox();
    expect(boite).not.toBeNull();

    await page.mouse.move((boite?.x ?? 0) + (boite?.width ?? 0) / 2, (boite?.y ?? 0) + (boite?.height ?? 0) / 2);
    await page.mouse.down();
    await page.mouse.move(4, 4, { steps: 5 });
    await page.mouse.up();

    await expect(dialogue).toBeVisible();
  });

  test('ne ferme pas la visionneuse au second clic d’un double-clic', async ({ page }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).first().click();
    await expect(dialogue).toBeVisible();

    // Le second clic d'un double-clic sur une vignette tombe sur la visionneuse qui vient de s'ouvrir : un appui
    // et un clic de rang 2 (UIEvent.detail), sans le premier clic, qui a déjà servi à ouvrir
    await page.mouse.move(4, 4);
    await page.mouse.down({ clickCount: 2 });
    await page.mouse.up({ clickCount: 2 });

    await expect(dialogue).toBeVisible();

    // Un clic simple au même endroit ferme bien la visionneuse
    await page.mouse.click(4, 4);
    await expect(dialogue).toBeHidden();
  });

  test('garde le focus dans la visionneuse : la page derrière n’est pas atteignable au clavier', async ({
    page,
  }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).first().click();
    await expect(dialogue).toBeVisible();
    await expect(dialogue.getByRole('button', { name: 'Fermer la visionneuse' })).toBeFocused();

    // Tab reste dans le dialogue, ou sort vers le navigateur (activeElement = body), jamais vers la page
    for (let i = 0; i < 6; i++) {
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
    await expect(page.locator(VIGNETTE).first()).not.toBeFocused();
  });

  test('ne fait rien aux flèches et n’affiche ni précédent, ni suivant, ni compteur avec une seule image', async ({
    page,
  }) => {
    test.skip(!aUneSeuleCapture, 'aucun projet n’a exactement une capture');

    await page.goto(projectPath('fr', projetUneCapture.id));
    const dialogue = page.locator(DIALOGUE);
    await page.locator(VIGNETTE).click();

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');

    await expect(dialogue).toBeVisible();
    await expect(dialogue.getByRole('button', { name: /Capture (précédente|suivante)/ })).toHaveCount(0);
    await expect(dialogue.locator('[data-galerie-compteur]')).toHaveCount(0);
  });

  test('traduit la visionneuse en anglais', async ({ page }) => {
    await page.goto(projectPath('en', projetGalerie.id));
    const dialogue = page.locator(DIALOGUE);

    await expect(page.locator(`${VIGNETTE} img`).first()).toHaveAttribute(
      'alt',
      altAttendu(projetGalerie, 1, 'en'),
    );
    await page.locator(VIGNETTE).first().click();

    await expect(dialogue).toHaveAccessibleName('Screenshot viewer');
    await expect(dialogue.getByRole('button', { name: 'Close the viewer' })).toBeVisible();
  });
});

test.describe('visionneuse avec deux captures ou plus', () => {
  test.skip(
    !aPlusieursCaptures,
    'aucun projet n’a deux captures : ces tests tournent dès qu’un projet en a au moins deux',
  );

  const total = nomsMulti.length;
  const chemin = projectPath('fr', projetMulti.id);

  async function ouvrir(page: Page, numero: number): Promise<void> {
    await page.goto(chemin);
    await page.locator(VIGNETTE).nth(numero - 1).click();
    await expect(page.locator(DIALOGUE)).toBeVisible();
  }

  /** La visionneuse montre la capture n° `numero` : compteur, texte alternatif et fichier affiché. */
  async function attendreCapture(page: Page, numero: number): Promise<void> {
    await expect(page.locator(COMPTEUR)).toHaveText(`${numero} / ${total}`);
    await expect(page.locator(IMAGE_GRANDE)).toHaveAttribute('alt', altAttendu(projetMulti, numero, 'fr'));
    const lien = await page
      .locator(VIGNETTE)
      .nth(numero - 1)
      .evaluate((a: HTMLAnchorElement) => a.href);
    await expect(page.locator(IMAGE_GRANDE)).toHaveAttribute('src', lien);
  }

  const precedente = (page: Page) => page.locator(DIALOGUE).getByRole('button', { name: 'Capture précédente' });
  const suivante = (page: Page) => page.locator(DIALOGUE).getByRole('button', { name: 'Capture suivante' });

  test('affiche une vignette par capture', async ({ page }) => {
    await page.goto(chemin);

    await expect(page.locator(VIGNETTE)).toHaveCount(total);
  });

  test('ouvre la visionneuse sur la capture cliquée, avec son compteur et des boutons de 44 px', async ({
    page,
  }) => {
    await ouvrir(page, 2);

    await attendreCapture(page, 2);
    for (const bouton of [precedente(page), suivante(page)]) {
      await expect(bouton).toBeVisible();
      const boite = await bouton.boundingBox();
      expect(boite?.width).toBeGreaterThanOrEqual(44);
      expect(boite?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('passe à la capture suivante puis revient à la précédente avec les boutons', async ({ page }) => {
    await ouvrir(page, 1);
    await attendreCapture(page, 1);

    await suivante(page).click();
    await attendreCapture(page, 2);

    await precedente(page).click();
    await attendreCapture(page, 1);
  });

  test('boucle dans les deux sens : avant la première vient la dernière, après la dernière la première', async ({
    page,
  }) => {
    await ouvrir(page, 1);

    await precedente(page).click();
    await attendreCapture(page, total);

    await suivante(page).click();
    await attendreCapture(page, 1);
  });

  test('suit les flèches gauche et droite du clavier, en bouclant, même après un clic sur un bouton', async ({
    page,
  }) => {
    await ouvrir(page, 1);

    await page.keyboard.press('ArrowRight');
    await attendreCapture(page, 2);
    await page.keyboard.press('ArrowLeft');
    await attendreCapture(page, 1);
    await page.keyboard.press('ArrowLeft');
    await attendreCapture(page, total);
    await page.keyboard.press('ArrowRight');
    await attendreCapture(page, 1);

    // Le focus est sur un bouton après un clic : les flèches marchent toujours
    await suivante(page).click();
    await attendreCapture(page, 2);
    await page.keyboard.press('ArrowRight');
    await attendreCapture(page, total === 2 ? 1 : 3);

    // Une flèche avec un modificateur (Maj+flèche, Alt+flèche = retour du navigateur...) est laissée au navigateur
    const avant = await page.locator(COMPTEUR).textContent();
    await page.keyboard.press('Shift+ArrowRight');
    await expect(page.locator(COMPTEUR)).toHaveText(avant ?? '');
  });

  test('Échap ferme la visionneuse et rend le focus à la vignette qui l’a ouverte', async ({ page }) => {
    await ouvrir(page, 2);
    await page.keyboard.press('ArrowRight');

    await page.keyboard.press('Escape');

    await expect(page.locator(DIALOGUE)).toBeHidden();
    await expect(page.locator(VIGNETTE).nth(1)).toBeFocused();
  });
});

test.describe('galerie sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test.skip(!aUneGalerie, 'aucune capture dans src/assets/projets/ : rien à afficher');

  test('garde la vignette comme lien vers un fichier image', async ({ page }) => {
    await page.goto(projectPath('fr', projetGalerie.id));
    const liens = page.locator(VIGNETTE);

    await expect(liens).toHaveCount(nomsGalerie.length);
    await expect(liens.first().locator('img')).toBeVisible();
    await expect(page.locator(DIALOGUE)).toBeHidden();
    const href = await liens.first().getAttribute('href');
    expect(href).toMatch(/\.webp$/);
    const reponse = await page.request.get(href as string);
    expect(reponse.status()).toBe(200);
    expect(reponse.headers()['content-type']).toBe('image/webp');
  });

  test('ouvre l’image en grand en suivant le lien', async ({ page }) => {
    await page.goto(projectPath('fr', projetGalerie.id));

    await page.locator(VIGNETTE).first().click();

    await expect(page).toHaveURL(/\.webp$/);
  });
});

test.describe('pages projet à 320 px de large', () => {
  for (const { id } of projets) {
    test(`${id} ne déborde pas horizontalement, en FR et en EN`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });

      for (const chemin of [projectPath('fr', id), projectPath('en', id)]) {
        await page.goto(chemin);
        await expect(page.locator('h1')).toBeVisible();

        const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(largeur, chemin).toBeLessThanOrEqual(320);
      }
    });
  }

  test('la visionneuse ouverte ne déborde pas non plus', async ({ page }) => {
    test.skip(!aUneGalerie, 'aucune capture dans src/assets/projets/ : rien à afficher');

    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(projectPath('fr', projetGalerie.id));

    await page.locator(VIGNETTE).first().click();

    await expect(page.locator(DIALOGUE)).toBeVisible();
    const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(largeur).toBeLessThanOrEqual(320);
  });
});
