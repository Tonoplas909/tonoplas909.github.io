import { expect, test, type Locator } from '@playwright/test';
import { competences } from '../../src/data/competences';
import { parcours } from '../../src/data/parcours';
import { profil } from '../../src/data/profil';
import type { Lang } from '../../src/data/types';
import { t } from '../../src/i18n/ui';
import { formatPeriode } from '../../src/lib/parcours';
import { projetParId } from '../../src/lib/projets';

const PAGES: { lang: Lang; chemin: string }[] = [
  { lang: 'fr', chemin: '/cv/' },
  { lang: 'en', chemin: '/en/cv/' },
];

// Les trois projets mis en avant sur le CV (spec §6.3)
const IDS_PROJETS_CV = ['cafet-miage', 'drift-club', 'rallye-club'];

const ADRESSE = 'matis.nico123@gmail.com';
const TELEPHONE = /(?:\+33|0)\s?[67](?:[\s.-]?\d{2}){4}/;
const DATE = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;

/** Canaux [r, g, b] d'une couleur `rgb(...)` ou `rgba(...)` calculée. */
function canaux(couleur: string): number[] {
  const correspondance = couleur.match(/rgba?\(([^)]+)\)/);
  expect(correspondance, `couleur illisible : ${couleur}`).not.toBeNull();
  return (correspondance as RegExpMatchArray)[1]
    .split(/[\s,/]+/)
    .slice(0, 3)
    .map(Number);
}

async function couleurTexte(element: Locator): Promise<number[]> {
  return canaux(await element.evaluate((noeud) => getComputedStyle(noeud).color));
}

for (const { lang, chemin } of PAGES) {
  test.describe(`CV ${lang.toUpperCase()} (${chemin})`, () => {
    test('répond 200 et affiche l’identité, les liens et la structure de titres', async ({ page }) => {
      const reponse = await page.goto(chemin);
      expect(reponse?.status()).toBe(200);

      const principal = page.locator('main');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);

      // Un seul h1 (le nom), les rubriques sont des h2, aucune photo
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1, name: profil.nom })).toBeVisible();
      await expect(principal.getByRole('heading', { level: 2 })).toHaveCount(6);
      await expect(principal.locator('img')).toHaveCount(0);

      await expect(principal.getByText(profil.intitule[lang], { exact: true })).toBeVisible();

      // Contact : e-mail assemblé par JavaScript, GitHub et LinkedIn avec rel sûr
      await expect(principal.locator('a[data-email]')).toHaveAttribute('href', `mailto:${ADRESSE}`);
      for (const lien of [profil.liens.github, profil.liens.linkedin]) {
        const ancre = principal.locator(`a[href="${lien}"]`);
        await expect(ancre).toBeVisible();
        await expect(ancre).toHaveAttribute('rel', /noopener/);
        await expect(ancre).toHaveAttribute('rel', /noreferrer/);
      }
    });

    test('affiche un profil en deux phrases', async ({ page }) => {
      await page.goto(chemin);

      const profilSection = page.getByRole('region', { name: t(lang, 'cvpage.profil'), exact: true });
      const texte = (await profilSection.locator('p').innerText()).trim();
      const phrases = texte.split(/(?<=[.!?])\s+/).filter((phrase) => phrase !== '');
      expect(phrases).toHaveLength(2);
    });

    test('affiche toutes les compétences', async ({ page }) => {
      await page.goto(chemin);

      const section = page.getByRole('region', { name: t(lang, 'cvpage.competences'), exact: true });
      // Un tableau attendu : autant d'éléments que de compétences, chacun avec son texte
      await expect(section.getByRole('listitem')).toHaveText(competences);
    });

    test('affiche toutes les entrées du parcours, stages compacts sur une ligne', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(chemin);

      const section = page.getByRole('region', { name: t(lang, 'parcours.titre'), exact: true });
      const lignes = section.getByRole('listitem');
      await expect(lignes).toHaveCount(parcours.length);

      for (const entree of parcours) {
        const periode = formatPeriode(entree, lang);
        const ligne = lignes.filter({ hasText: entree.titre[lang] });
        await expect(ligne, entree.titre[lang]).toHaveCount(1);
        await expect(ligne).toContainText(periode);
        if (entree.detail) {
          await expect(ligne).toContainText(entree.detail[lang]);
        } else if (entree.type !== 'stage') {
          // Pas de ligne de détail vide quand le détail est absent
          await expect(ligne).toHaveText(`${periode} ${entree.titre[lang]}`, { useInnerText: true });
        }

        if (entree.type === 'stage') {
          // Hauteur du contenu (sans le padding de la ligne) comparée à l'interligne
          const { hauteur, interligne } = await ligne.evaluate((noeud) => {
            const style = getComputedStyle(noeud);
            return {
              hauteur:
                noeud.getBoundingClientRect().height -
                parseFloat(style.paddingTop) -
                parseFloat(style.paddingBottom),
              interligne: parseFloat(style.lineHeight),
            };
          });
          expect(hauteur, `« ${entree.titre[lang]} » tient sur une ligne`).toBeLessThan(interligne * 1.6);
        }
      }
    });

    test('affiche les trois projets sur une ligne chacun, puis langues et centres d’intérêt', async ({
      page,
    }) => {
      await page.goto(chemin);

      const section = page.getByRole('region', { name: t(lang, 'projets.titre'), exact: true });
      await expect(section.getByRole('listitem')).toHaveCount(IDS_PROJETS_CV.length);
      for (const id of IDS_PROJETS_CV) {
        const projet = projetParId(id);
        await expect(section.getByRole('listitem').filter({ hasText: projet.titre })).toHaveText(
          `${projet.titre} — ${projet.stack.join(' · ')}`,
          { useInnerText: true },
        );
      }

      const langues = page.getByRole('region', { name: t(lang, 'cvpage.langues'), exact: true });
      await expect(langues).toContainText(profil.langues[lang].join(', '));
      const interets = page.getByRole('region', { name: t(lang, 'cvpage.interets'), exact: true });
      await expect(interets).toContainText(profil.interets[lang].join(', '));
    });

    test('a son propre titre et sa propre description', async ({ page }) => {
      await page.goto(chemin);

      await expect(page).toHaveTitle('CV — Matis Demore');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        t(lang, 'cvpage.description'),
      );
    });

    test('ne publie ni téléphone, ni date de naissance, ni e-mail en clair dans le HTML', async ({
      request,
    }) => {
      const reponse = await request.get(chemin);
      expect(reponse.status()).toBe(200);
      const html = await reponse.text();

      expect(html).not.toMatch(TELEPHONE);
      expect(html).not.toMatch(DATE);
      expect(html).not.toContain(ADRESSE);
    });

    test('reste sombre à l’écran, puis passe en clair sans en-tête ni pied de page à l’impression', async ({
      page,
    }) => {
      await page.goto(chemin);
      const entete = page.locator('body > header');
      const pied = page.locator('body > footer');
      const corps = page.locator('body');

      // À l'écran : thème sombre du site, avec son en-tête et son pied de page
      await expect(entete).toBeVisible();
      await expect(pied).toBeVisible();
      await expect(corps).toHaveCSS('background-color', 'rgb(10, 14, 20)');

      await page.emulateMedia({ media: 'print' });

      await expect(corps).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      // La racine aussi : sinon la marge de la page PDF est peinte avec le gris du thème sombre
      await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
      for (const element of [corps, page.locator('h1'), page.locator('main a[data-email]')]) {
        for (const canal of await couleurTexte(element)) {
          expect(canal).toBeLessThan(80);
        }
      }
      await expect(entete).toBeHidden();
      await expect(pied).toBeHidden();
    });
  });
}
