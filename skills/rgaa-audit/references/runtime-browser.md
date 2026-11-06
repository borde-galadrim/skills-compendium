# Procédure runtime navigateur

Cette procédure complète l'analyse statique de `rgaa-audit`. Elle doit être
exécutée par l'agent dès qu'une URL accessible et un moyen de piloter un
navigateur sont disponibles. Une capture d'une page inactive ne constitue
pas une preuve de conformité.

Cette page décrit les **capacités** à utiliser. Le tableau de correspondance
en fin de document indique, pour chaque harnais, l'outil qui les fournit.
C'est le seul fichier de la skill qui nomme des outils concrets.

## Choisir le moyen — détecter, ne pas supposer

Vérifier dans cet ordre, et consigner le moyen retenu dans le rapport
(`tools.runtime`) :

1. **Claude in Chrome** (Claude Code) : premier choix dès que ses outils
   sont présents. Ils sont souvent chargés à la demande : chercher
   « chrome » dans les outils différés avant de conclure qu'ils n'existent
   pas (voir le tableau de correspondance). L'extension pilote le Chrome de
   l'utilisateur, avec ses sessions : c'est le seul moyen fiable pour une
   page derrière une authentification. L'utiliser pour l'inventaire, le
   clavier, le focus visible, le titre, le contraste, les contenus au survol
   ou au focus, les messages de statut, l'ensemble de pages et les captures
   du jugement agent.
2. **Script runtime sans dépendance** (section suivante) : si `node --version`
   donne une version ≥ 22 et qu'un Chrome, Chromium, Edge ou Brave est
   installé. Avec Claude in Chrome, le lancer en complément pour les mesures
   que l'extension ne fournit pas : zoom 200 % et 320 px émulés exactement,
   orientation, espacement du texte, sans feuilles de style, mouvement
   réduit, écouteurs d'événements, axe-core. Sans Claude in Chrome, c'est le
   moyen le plus complet.
3. **Autre outil navigateur du harnais** : navigateur intégré de Cursor,
   Playwright MCP ou navigateur Codex. Chercher aussi dans les outils
   différés (« browser », « navigate »). Préférer ce moyen au script pour une
   page derrière une authentification.
4. **Playwright ou Puppeteer** déjà installé dans le projet.
5. Sinon, les critères `runtime` passent en `NT` avec la raison
   `outil indisponible`. Les critères `statique` restent évaluables sur le
   HTML rendu et le source (voir
   [inventaire-applicabilite.md](inventaire-applicabilite.md)).

Ne jamais installer Playwright, Puppeteer ou une autre dépendance dans le
projet. Utiliser un navigateur déjà présent sur la machine n'est pas une
installation.

Les moyens se combinent : l'outil navigateur (Claude in Chrome en priorité)
sert aux tests interactifs et aux vérifications visuelles (déplier un menu,
regarder un état d'erreur), le script runtime aux mesures par émulation. Le
script ne porte pas la session de l'utilisateur : pour une page
authentifiée, faire ces mesures dans l'outil navigateur (zoom par
JavaScript, signalé comme approximation) ou les noter `non exécuté`.

## Script runtime sans dépendance

```
node <skill>/scripts/rgaa-runtime.mjs <url> --out audits/runtime-AAAA-MM-JJ \
  [--compare <url2>,<url3>] [--chrome <chemin>] [--no-axe] [--max-tabs 150]
```

- Lance le navigateur en mode headless dans un profil temporaire, puis le
  ferme. N'écrit que dans le dossier `--out`.
- `--compare` : 2 ou 3 autres pages du site (liens du menu principal) pour
  les critères d'ensemble de pages (8.6, 11.3, 12.2, 12.4, 12.5).
- axe-core est téléchargé depuis un CDN et évalué dans la page ; il n'est
  pas ajouté au projet. Sans réseau, l'étape `axe` échoue seule et le reste
  continue. `--no-axe` la désactive.
- Durée : 30 à 60 s par page (dont 12 s d'observation des carrousels).
- Si une étape échoue, elle apparaît dans `errors` ; ses critères restent
  `NT` (`non exécuté`), les autres étapes restent valables.

Le script écrit `runtime.json` et des captures (`desktop.png`,
`zoom-200.png`, `reflow-320.png`, `paysage.png`, `espacement-texte.png`,
`sans-css.png`, `focus-premier-arret.png`). **Regarder les captures** : elles
servent de preuve et alimentent le [jugement agent](jugement-agent.md).

### Clés de `runtime.json` → critères

| Clé | Critères | Lecture |
|-----|----------|---------|
| `inventory` | voir [inventaire-applicabilite.md](inventaire-applicabilite.md) | inventaire du DOM rendu |
| `title` | 8.5 | `document.title` |
| `axe.violations` | voir « axe-core » ci-dessous | indices à confirmer, pas des verdicts |
| `contrast` | 3.2 | `failures` sous le seuil ; `onBackgroundImage` : texte sur image, ratio non calculable → vérifier sur la capture |
| `uiContrast` | 3.3 | champs dont bordure et fond ont un contraste < 3:1 avec leur arrière-plan |
| `keyboard.stops` | 7.3, 12.8 | liste des arrêts Tab (preuve minimale) |
| `keyboard.focusOnHidden` | 10.8, 12.8 | focus sur un élément `aria-hidden`, invisible ou hors écran → NC |
| `keyboard.focusNotVisible` | 10.7 | aucun changement de style au focus → NC (confirmer sur `focus-premier-arret.png` en cas de doute) |
| `keyboard.reverseMatchesForward`, `upwardJumps` | 12.8 | ordre incohérent si Shift+Tab ne remonte pas le même chemin ou si le focus remonte brutalement dans la page |
| `keyboard.possibleTrap` | 12.9 | focus bloqué dans un sous-ensemble → NC après vérification |
| `zoom200` | 10.4 | `horizontalScroll` ou `clipped` non vide → NC ; voir aussi `inventory.document.viewportBlocksZoom` |
| `reflow320` | 10.11 | `horizontalScroll` avec `offenders` hors cas particuliers (carte, tableau de données, barre d'outils) → NC |
| `orientation` | 13.9 | `textRatio` très inférieur à 1 ou contenu masqué dans une orientation → NC |
| `textSpacing.newlyClipped` | 10.12 | texte tronqué seulement après l'espacement WCAG → NC |
| `noCss` + `sans-css.png` | 10.2, 10.3 | `inventory.structure.cssGeneratedContent` donne le contenu perdu ; la capture sert au jugement 10.3 |
| `hoverRules.withoutFocusEquivalent` | 10.13, 10.14, 12.11 | contenu affiché au survol sans équivalent `:focus`/`:focus-within` → vérifier au clavier, NC si inatteignable |
| `eventListeners` | 12.10, 13.10, 13.11, 13.12 | `keydown` sur `document`/`window` : lire le gestionnaire pour savoir s'il réagit à une touche seule ; `devicemotion` : 13.12 applicable ; `touchmove`/`pointerdown` sur un widget : 13.10/13.11 applicables |
| `motion.autoMovingCarousels` | 13.8 | carrousel qui défile seul : NC si `hasPauseControl` est faux et qu'aucun bouton pause n'apparaît sur la capture |
| `motion.animations.longOrInfinite` | 13.8 | animation de plus de 5 s ou infinie sans moyen de l'arrêter → NC |
| `motion.reducedMotion` | 13.8 | constat complémentaire : l'animation s'arrête-t-elle avec `prefers-reduced-motion` |
| `consistency` | 8.6, 11.3, 12.2, 12.4, 12.5 | position (`x`, `y`, `w`) et liens des `nav`/`header` d'une page à l'autre ; présence de la recherche et du plan du site ; étiquettes des champs |
| `console` | 7.1, 7.3 | erreurs JS pouvant casser le clavier ou les composants |

## axe-core — indices, pas verdicts

axe-core teste des règles WCAG. Ses résultats sont des **indices** à
confirmer dans le DOM ou le source, puis à rattacher au critère RGAA :

| Règle axe | Critère RGAA |
|-----------|--------------|
| `image-alt`, `input-image-alt`, `area-alt`, `role-img-alt`, `svg-img-alt`, `object-alt` | 1.1 |
| `presentation-role-conflict` | 1.2 |
| `frame-title`, `frame-title-unique` | 2.1, 2.2 |
| `color-contrast` | 3.2 |
| `audio-caption`, `video-caption` | 4.1, 4.3 |
| `no-autoplay-audio` | 4.10 |
| `th-has-data-cells`, `td-has-header`, `td-headers-attr`, `scope-attr-valid`, `table-duplicate-name` | 5.6, 5.7 |
| `link-name` | 6.2 |
| `identical-links-same-purpose`, `label-content-name-mismatch` | 6.1 |
| `aria-*` (rôles, attributs, valeurs, enfants et parents requis, noms des composants), `nested-interactive` | 7.1 |
| `scrollable-region-focusable` | 7.3 |
| `html-has-lang` | 8.3 |
| `html-lang-valid`, `html-xml-lang-mismatch` | 8.4 |
| `document-title` | 8.5 |
| `valid-lang` | 8.8 |
| `duplicate-id-aria` | 8.2 |
| `heading-order`, `empty-heading`, `page-has-heading-one` | 9.1 |
| `landmark-*`, `region` | 9.2, 12.6 |
| `list`, `listitem`, `definition-list`, `dlitem` | 9.3 |
| `meta-viewport`, `meta-viewport-large` | 10.4 |
| `link-in-text-block` | 10.6 |
| `aria-hidden-focus` | 10.8 |
| `label`, `select-name`, `form-field-multiple-labels`, `aria-input-field-name` | 11.1 |
| `button-name`, `input-button-name` | 11.9 (dans un formulaire), 7.1 sinon |
| `autocomplete-valid` | 11.13 |
| `bypass`, `skip-link` | 12.7 |
| `tabindex` | 12.8 |
| `meta-refresh` | 13.1 |
| `blink`, `marquee` | 13.8 |

Les règles WCAG 2.2 seules (`target-size`) ne correspondent à aucun critère
RGAA 4.1.2 : les ignorer. L'absence de violation axe ne prouve pas la
conformité ; elle ne suffit jamais à conclure `C`.

## URL et préparation

1. Confirmer un origin vivant : serveur de développement, preview ou staging.
2. Préférer une surface isolée en mode composant : showcase, Storybook ou
   preview dédiée.
3. Résoudre l'URL depuis la route du fichier audité ou depuis la page qui
   monte le composant.
4. Consulter la cartographie fournie par le projet dans `AGENTS.md` ou
   `references/runtime-urls.md`, si elle existe. Ne jamais inventer une URL.
5. En mode page, choisir 2 ou 3 pages de comparaison parmi les liens du menu
   principal pour les critères d'ensemble de pages.

Les sections suivantes décrivent chaque test pour un outil navigateur du
harnais. Avec Claude in Chrome, exécuter dans l'extension les tests listés
au point 1 ci-dessus ; les autres tests, le script runtime les exécute
déjà. Sans Claude in Chrome, ne refaire un test à la main que pour
confirmer un résultat ou si le script n'est pas utilisable.

## Capacités requises

| Capacité | Usage dans l'audit |
|----------|--------------------|
| Naviguer | Ouvrir l'URL, attendre le chargement |
| Lire l'arbre d'accessibilité ou le DOM | Obtenir références, rôles, noms accessibles |
| Appuyer sur une touche | Tab, Shift+Tab, Entrée, Espace, flèches, Échap |
| Évaluer du JavaScript | Inventaire, mesures du DOM, styles calculés, `document.title` |
| Capture d'écran | Preuve des états importants, jugement agent |
| Redimensionner ou zoomer | Passe 320 px, zoom 200 %, orientation |
| Lire la console | Erreurs JS pouvant bloquer le clavier ou le focus |

## Inventaire

Évaluer [../scripts/inventaire.js](../scripts/inventaire.js) dans la page
(capacité « Évaluer du JavaScript ») et conserver le JSON. Lecture :
[inventaire-applicabilite.md](inventaire-applicabilite.md).

## Clavier — critères 7.3, 12.8, 12.9 et 10.7

Pour chaque contrôle interactif trouvé dans la surface auditée, notamment :

- `a[href]`
- `button`
- `[tabindex]:not([tabindex="-1"])`
- `input`
- `[role="slider"]`
- boutons d'accordéon
- boutons précédent/suivant et pastilles de carrousel

Effectuer les étapes suivantes :

1. Placer le focus sur le premier élément focusable du composant.
2. Appuyer sur Tab jusqu'à ce que le focus sorte du composant.
3. Relever à chaque arrêt la balise, le texte ou `aria-label`, le rôle et
   l'état pertinent (`aria-expanded`, `aria-selected`, `disabled`, etc.).
4. Revenir avec Shift+Tab ; l'ordre doit être l'inverse de l'aller.
5. Utiliser Entrée et Espace sur les boutons, notamment les accordéons et la
   pagination.
6. Utiliser les flèches sur les carrousels et les sliders.
7. Utiliser Échap sur les widgets ouverts. Noter « non géré » si rien ne se
   passe ; ce constat n'est pas automatiquement une NC.
8. Capturer les états importants : accordéon ouvert, élément de carrousel
   suivant, pastille sélectionnée et contrôle focalisé.

Pour chaque élément de `inventory.scripts.clickableNonNative` : vérifier
qu'il est atteint par Tab et activable par Entrée ; sinon NC 7.3.

Déclarer une non-conformité si :

- un contrôle visible n'est jamais atteint au clavier ;
- le focus arrive sur du contenu `aria-hidden` ou dans un accordéon fermé ;
- une interaction repose uniquement sur un événement souris (`onClick` sur
  un `div`, `SwiperSlide` ou élément équivalent, `<div onclick>` en HTML natif)
  sans alternative clavier.

La preuve minimale est une liste des arrêts Tab et des défauts observés.

### Collecte des arrêts Tab (JavaScript portable)

Ce snippet s'exécute via la capacité « Évaluer du JavaScript ». Il est
utilisable entre deux appuis Tab, sans dépendre d'un outil particulier :

```js
// Renvoie une description de l'élément actuellement focalisé
(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'body';
  const name = el.getAttribute('aria-label') || el.innerText?.trim().slice(0, 60) || '';
  return {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role'),
    name,
    expanded: el.getAttribute('aria-expanded'),
    selected: el.getAttribute('aria-selected'),
    disabled: el.disabled ?? el.getAttribute('aria-disabled'),
    ariaHiddenAncestor: !!el.closest('[aria-hidden="true"]'),
  };
})();
```

Répéter : appui Tab, puis lecture de l'élément. S'arrêter quand le focus
revient sur `body` ou sort de la surface auditée.

## Zoom 200 % — critère 10.4

Le zoom navigateur à 200 % réduit de moitié la largeur CSS disponible et
fait recomposer la page. Par ordre de préférence :

1. Zoom navigateur réel à 200 % (si la capacité le propose).
2. Viewport CSS de 640 × 400 px à un DPR de 2 (équivalent exact du zoom
   200 % depuis une fenêtre de 1280 × 800) : c'est ce que fait le script
   runtime.
3. Approximation : `document.body.style.zoom = '2'`. Le rapport doit le
   signaler.

`Emulation.setPageScaleFactor` est un zoom de pincement : il ne recompose
pas la page et ne teste pas 10.4.

Mesurer le document :

```js
document.documentElement.scrollWidth >
  document.documentElement.clientWidth
```

Pour chaque conteneur de texte utilisant `overflow: hidden`, mesurer aussi :

```js
element.scrollHeight > element.clientHeight
```

Prendre une capture de la surface à 200 %. Vérifier aussi
`inventory.document.viewportBlocksZoom` (`user-scalable=no`,
`maximum-scale` < 2).

Déclarer une non-conformité si le document ou un composant produit un
défilement horizontal, ou si du texte est tronqué.

Une largeur de viewport de 320 px sans zoom est une vérification du critère
10.11, pas du critère 10.4.

## Focus visible — critère 10.7

À chaque arrêt Tab :

1. Capturer le contrôle focalisé.
2. Lire ses styles calculés :

```js
(() => {
  const s = getComputedStyle(document.activeElement);
  return {
    outlineStyle: s.outlineStyle,
    outlineWidth: s.outlineWidth,
    outlineColor: s.outlineColor,
    boxShadow: s.boxShadow,
  };
})();
```

3. Comparer avec les mêmes styles hors focus : aucun écart (contour, ombre,
   fond, couleur, bordure, soulignement) = focus invisible.
4. Vérifier que l'indicateur reste visible sur son arrière-plan, y compris
   sur une photo ou un overlay.

Déclarer une non-conformité si aucun contour ou changement visuel
compensatoire n'est présent, ou si le contraste de l'indicateur est
manifestement perdu.

## Titre de page — critère 8.5

En mode page, lire `document.title` dans la page auditée et consigner sa
valeur dans le rapport. Ne pas poser cette question à l'humain si l'agent
peut lire le document.

## Contraste — critères 3.2 et 3.3

Pour chaque élément portant du texte visible, lire la couleur du texte et la
couleur de fond effective, puis calculer le ratio WCAG (luminance relative).
Le fond effectif est la composition des fonds semi-transparents jusqu'au
premier fond opaque. Un texte posé sur une image de fond n'a pas de ratio
calculable : le vérifier sur la capture.

```js
(() => {
  const lum = (rgb) => {
    const c = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const parse = (str) => str.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (!/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
    }
    return 'rgb(255, 255, 255)';
  };
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const txt = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!txt) return;
    const cs = getComputedStyle(el);
    const a = lum(parse(cs.color)) + 0.05;
    const b = lum(parse(bgOf(el))) + 0.05;
    const ratio = Math.max(a, b) / Math.min(a, b);
    const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) out.push({ tag: el.tagName.toLowerCase(), text: el.innerText.trim().slice(0, 40), ratio: +ratio.toFixed(2) });
  });
  return out;
})();
```

Déclarer une non-conformité pour chaque élément sous le seuil (4,5:1 pour
le texte normal, 3:1 pour le grand texte). Les images de texte, les
éléments désactivés et les éléments purement décoratifs sont exclus (voir
`images-cadres-couleurs.md`). Pour le critère 3.3, relever aussi les
composants et éléments graphiques porteurs d'information (bordure de champ,
icône d'état) avec la même méthode et un seuil de 3:1.

## Espacement du texte — critère 10.12

Injecter les propriétés d'espacement WCAG (interligne 1,5 ; espacement des
lettres 0,12 em ; espacement des mots 0,16 em ; espacement des paragraphes
2 em), puis comparer les éléments tronqués **avant et après** l'injection :
seul un élément tronqué après coup compte.

```js
(() => {
  const style = document.createElement('style');
  style.id = 'rgaa-spacing-test';
  style.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
  document.head.appendChild(style);
  const clipped = [...document.querySelectorAll('body *')].filter(
    (el) => getComputedStyle(el).overflow === 'hidden' && el.scrollHeight > el.clientHeight
  ).length;
  style.remove();
  return { clipped };
})();
```

Retirer le style après la mesure. Déclarer une non-conformité si du texte
est tronqué ou masqué. Capturer le résultat.

## Sans feuilles de style — critères 10.2 et 10.3

Désactiver toutes les feuilles de style (`document.styleSheets[i].disabled =
true`) et retirer les attributs `style`, capturer la page, puis restaurer.

- 10.2 : un contenu porteur d'information qui disparaît (texte injecté par
  `::before`/`::after`, image CSS porteuse) → NC.
- 10.3 : lire la capture et juger l'ordre de lecture (voir
  [jugement-agent.md](jugement-agent.md)).

## Contenus au survol ou au focus — critères 10.13, 10.14 et 12.11

1. Repérer les contenus qui apparaissent au survol ou au focus (infobulles,
   menus déroulants, `:hover` ou `:focus-within` en CSS). Le script runtime
   liste les règles `:hover` qui révèlent un contenu sans équivalent
   `:focus`.
2. Pour chacun, vérifier qu'il apparaît aussi à la prise de focus au clavier.
3. Vérifier qu'il peut être fermé avec Échap sans déplacer le focus, et qu'il
   reste visible tant que le pointeur ou le focus est sur le déclencheur ou sur
   le contenu (10.13).
4. Vérifier que le contenu apparaissant par CSS seul (`:hover`, `:focus`) est
   atteignable au clavier (10.14 et 12.11).

Si la page n'a aucun contenu de ce type (aucune règle révélatrice, aucun
`aria-expanded`, aucune infobulle), ces critères sont `NA` avec cette preuve.

Déclarer une non-conformité si le contenu n'est pas atteignable au clavier,
ne peut pas être fermé, ou disparaît dès que le pointeur se déplace sur lui.

## Reflow 320 px — critère 10.11

Redimensionner la surface à 320 px de large (capacité « Zoom / viewport »),
puis mesurer l'overflow horizontal du document comme pour le critère 10.4 :

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

Sans capacité de redimensionnement, noter « non exécuté » pour 10.11 ; ne pas
le déduire du test 10.4.

## Orientation — critère 13.9

Passer en paysage (par exemple 844 × 390) puis en portrait (390 × 844) si la
capacité le permet, et vérifier que le contenu reste consultable : pas de
contenu masqué ni de blocage de l'orientation. Sans capacité de
redimensionnement, noter « non exécuté ».

## Messages de statut — critère 7.5

Repérer les actions qui affichent un message sans déplacer le focus (ajout au
panier, inscription à la newsletter, filtre de résultats, erreur de
formulaire). Pour chacune : le message doit être dans une région
`role="status"`, `role="alert"` ou `aria-live` présente **avant** le message.
Déclencher l'action au navigateur quand elle n'a pas d'effet de bord, puis
lire la région. Si la page n'a aucun message de statut, 7.5 est `NA`.

## Ensemble de pages — critères 8.6, 11.3, 12.2, 12.4, 12.5

Ouvrir 2 ou 3 autres pages (liens du menu principal) et comparer :

- position et ordre des liens du menu et des barres de navigation (12.2) ;
- présence et emplacement du lien « plan du site » (12.4) et de la
  recherche (12.5) ;
- titres de page distincts (8.6) ;
- étiquettes des champs de même fonction (11.3).

Sans pages de comparaison, ces critères restent `NT` (`non exécuté`) ; en
mode composant, `hors périmètre composant`.

## Médias et son automatique — critères 4.10, 4.11 et 4.12

Lire les médias présents dans la page, puis :

```js
[...document.querySelectorAll('audio, video')].map((m) => ({
  tag: m.tagName.toLowerCase(),
  autoplay: m.autoplay,
  muted: m.muted,
  controls: m.controls,
}));
```

Déclarer une non-conformité si un son démarre sans action de l'utilisateur
(`autoplay` sans `muted`) et que ses contrôles ne sont pas accessibles au
clavier (4.10). Pour 4.11 et 4.12, vérifier que les contrôles de lecture
(`controls` natifs ou composants) sont atteignables par Tab et activables par
Entrée ou Espace.

## Raccourcis clavier à une touche — critère 12.10

Lister les écouteurs `keydown`/`keypress` sur `document` et `window` (le
script runtime le fait par le protocole DevTools) et les attributs
`accesskey`. Lire chaque gestionnaire dans le source : réagit-il à une
touche seule (lettre, chiffre, ponctuation) sans modificateur ? S'il n'y en
a pas, noter `NA` avec la preuve « aucun raccourci à une touche ». S'il y en
a, vérifier qu'ils peuvent être désactivés, remappés ou ne sont actifs qu'au
focus du composant, sinon NC.

## Mouvement — critères 13.8, 13.10, 13.11 et 13.12

- 13.8 : observer la page 6 s (carrousel qui défile seul, animation infinie,
  vidéo de fond). Chaque contenu en mouvement de plus de 5 s doit avoir un
  moyen de pause, d'arrêt ou de masquage. Émuler
  `prefers-reduced-motion: reduce` si possible et noter le résultat.
- 13.10, 13.11, 13.12 : écouteurs `touchmove`, `pointerdown`, `mousedown`,
  `devicemotion`, `deviceorientation` (script runtime) puis lecture du
  gestionnaire ; règles de décision dans [jugement-agent.md](jugement-agent.md).

Exemple Playwright :

```js
await page.emulateMedia({ reducedMotion: 'reduce' });
```

## Exemple de séquence (Playwright)

Exemple illustratif, à n'utiliser que si Playwright est déjà présent dans le
projet :

```js
await page.goto(url);
await page.keyboard.press('Tab');
const focused = await page.evaluate(() => document.activeElement?.outerHTML);
```

Pour le zoom, utiliser `page.setViewportSize({ width: 640, height: 400 })`
avec un contexte `deviceScaleFactor: 2`. Conserver les mesures, les captures
et la liste des arrêts Tab comme preuves.

## Tableau de correspondance capacité → outil

Seule cette section nomme des outils concrets. Les colonnes suivent l'ordre
de préférence. Si un outil listé n'est pas présent dans la session, passer à
la colonne suivante.

| Capacité | Claude in Chrome | Script `rgaa-runtime.mjs` | Cursor browser | Codex / Playwright MCP | Playwright ou Puppeteer (script) |
|----------|------------------|---------------------------|----------------|------------------------|----------------------------------|
| Naviguer | `mcp__claude-in-chrome__navigate` (après `tabs_create_mcp`) | intégré | `browser_navigate` | `browser_navigate` | `page.goto` |
| Lire l'arbre / références | `mcp__claude-in-chrome__read_page` ; texte : `get_page_text` | `inventory` | `browser_snapshot` | `browser_snapshot` | `page.accessibility.snapshot()` |
| Appuyer sur une touche | `mcp__claude-in-chrome__computer` (action clavier) | intégré (Tab, Shift+Tab) | `browser_press_key` | `browser_press_key` | `page.keyboard.press` |
| Évaluer du JavaScript | `mcp__claude-in-chrome__javascript_tool` | intégré | outil d'évaluation JavaScript si exposé, sinon non disponible | `browser_evaluate` | `page.evaluate` |
| Capture d'écran | `mcp__claude-in-chrome__computer` (capture) | PNG dans `--out` | `browser_take_screenshot` | `browser_take_screenshot` | `page.screenshot` |
| Zoom / viewport | `mcp__claude-in-chrome__resize_window` (fenêtre) ; zoom par JavaScript (approximation) | émulation exacte (640 px DPR 2, 320 px, paysage) | JavaScript (approximation) | `browser_resize` + JavaScript | `page.setViewportSize` + `deviceScaleFactor` |
| Console | `mcp__claude-in-chrome__read_console_messages` (filtre `pattern`) | `console` | outil console si exposé, sinon non disponible | outil console si exposé, sinon non disponible | `page.on('console')` |
| Mouvement réduit | non disponible ; script runtime, sinon noter « non vérifié » | `motion.reducedMotion` | non disponible | non disponible | `page.emulateMedia({ reducedMotion: 'reduce' })` |
| Écouteurs d'événements | non disponible ; script runtime, sinon lire le source | `eventListeners` | non disponible | non disponible | session CDP `DOMDebugger.getEventListeners` |
| Outils chargés à la demande | rechercher « chrome » dans les outils différés et charger tous les outils en une seule recherche (voir notes) | — | — | rechercher « browser » | — |

Notes :

- Claude in Chrome : charger les outils en une seule recherche d'outils
  différés : `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__resize_window,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__tabs_close_mcp`.
  Si seul un outil `enable__mcp__claude-in-chrome` est listé, l'appeler pour
  activer l'extension. Lire le skill `anthropic-skills:chrome-browser` avant
  le premier appel s'il est disponible : il fait foi sur les noms exacts.
  Appeler d'abord `mcp__claude-in-chrome__tabs_context_mcp`, travailler
  dans un nouvel onglet créé avec `mcp__claude-in-chrome__tabs_create_mcp`,
  et fermer l'onglet créé à la fin. Éviter les actions qui déclenchent une
  boîte de dialogue bloquante (`alert`, `confirm`, `prompt`) ; si elle
  apparaît, la signaler à l'humain. Après deux ou trois échecs d'un même
  appel, s'arrêter et demander à l'humain plutôt que réessayer.
- Script runtime : nécessite Node ≥ 22 (WebSocket et fetch natifs) et un
  navigateur Chromium installé. Chemin détecté automatiquement sur macOS,
  Linux et Windows ; sinon `--chrome` ou la variable `CHROME_PATH`.
- Playwright ou Puppeteer : n'utiliser que s'ils sont déjà installés ou
  configurés dans le projet. Ne pas installer de dépendance automatiquement.
- Une cellule sans outil correspondant doit être marquée « non disponible »
  plutôt que remplacée par un outil inventé.

## Fallback humain

Si aucun moyen n'est disponible, ou si les tests directs échouent après deux
ou trois tentatives :

1. sous Claude Code, proposer à l'humain de connecter Claude in Chrome
   (`/chrome`) si ce n'est pas fait ;
2. vérifier Node ≥ 22 et un navigateur Chromium pour le script runtime ;
3. vérifier si Playwright ou Puppeteer est déjà disponible dans le projet ;
4. sinon demander à l'humain de lancer le script runtime lui-même, ou
   d'effectuer les tests clavier, zoom et contraste ;
5. si l'humain ne peut pas les effectuer, marquer chaque test
   `non exécuté` et indiquer la raison.

Le fallback humain est également applicable si :

- la session est en lecture seule ou sans accès navigateur ;
- aucune URL ou aucun serveur vivant n'est disponible ;
- l'application est derrière une authentification que l'agent ne peut pas
  franchir.

La source exacte doit être consignée dans le rapport :
`Claude in Chrome`, `rgaa-runtime.mjs`, `Cursor browser`,
`Codex browser/Playwright MCP`, `Playwright`, `Puppeteer` ou `humain`
(plusieurs sources jointes par « + » si les moyens sont combinés).

Limites : cette procédure ne remplace pas un test avec lecteur d'écran.
`style.zoom` ne remplace pas complètement le zoom navigateur réel.
