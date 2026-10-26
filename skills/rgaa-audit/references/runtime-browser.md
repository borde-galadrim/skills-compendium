# Procédure runtime navigateur

Cette procédure complète l'analyse statique de `rgaa-audit`. Elle doit être
exécutée par l'agent dès qu'une URL accessible et un outil capable de piloter
un navigateur sont disponibles. Une capture d'une page inactive ne constitue
pas une preuve de conformité.

Cette page décrit les **capacités** à utiliser. Le tableau de correspondance
en fin de document indique, pour chaque harnais, l'outil qui les fournit.

## URL et préparation

1. Confirmer un origin vivant : serveur de développement, preview ou staging.
2. Préférer une surface isolée : showcase, Storybook ou preview dédiée, afin
   que l'en-tête et le chrome de l'application ne polluent pas l'ordre de
   tabulation.
3. Résoudre l'URL depuis la route du fichier audité ou depuis la page qui
   monte le composant.
4. Consulter la cartographie fournie par le projet dans `AGENTS.md` ou
   `references/runtime-urls.md`, si elle existe. Ne jamais inventer une URL.
5. Commencer sur desktop.
6. Ajouter une passe à 320 px uniquement si le critère 10.11 est dans le
   périmètre.
7. Si la page doit être testée sans animation, émuler
   `prefers-reduced-motion: reduce` lorsque la capacité le permet (voir
   tableau), et noter cette émulation dans le rapport.

## Capacités requises

| Capacité | Usage dans l'audit |
|----------|--------------------|
| Naviguer | Ouvrir l'URL, attendre le chargement |
| Lire l'arbre d'accessibilité ou le DOM | Obtenir références, rôles, noms accessibles |
| Appuyer sur une touche | Tab, Shift+Tab, Entrée, Espace, flèches, Échap |
| Évaluer du JavaScript | Mesurer le DOM, lire les styles calculés, `document.title` |
| Capture d'écran | Preuve des états importants |
| Redimensionner ou zoomer | Passe 320 px et zoom 200 % |
| Lire la console | Erreurs JS pouvant bloquer le clavier ou le focus |

## Clavier — critères 7.1 et 10.7

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

Utiliser un facteur de page réel de 2, et pas seulement une fenêtre plus
petite. Par ordre de préférence :

1. Zoom navigateur réel à 200 % (si la capacité le propose).
2. Session CDP : `Emulation.setPageScaleFactor({ pageScaleFactor: 2 })`.
3. Approximation : largeur de viewport équivalente à 640 px (1280 px / 2) à
   un DPR de 2, ou `document.body.style.zoom = '2'`. Ce mode est une
   approximation ; le rapport doit le signaler.

Mesurer le document :

```js
document.documentElement.scrollWidth >
  document.documentElement.clientWidth
```

Pour chaque conteneur de texte utilisant `overflow: hidden`, mesurer aussi :

```js
element.scrollHeight > element.clientHeight
```

Prendre une capture de la surface à 200 %.

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

3. Vérifier que l'indicateur reste visible sur son arrière-plan, y compris
   sur une photo ou un overlay.

Déclarer une non-conformité si aucun contour ou changement visuel
compensatoire n'est présent, ou si le contraste de l'indicateur est
manifestement perdu.

## Titre de page — critère 8.5

En mode page, lire `document.title` dans la page auditée et consigner sa
valeur dans le rapport. Ne pas poser cette question à l'humain si l'agent
peut lire le document.

## Mouvement réduit

Pour les composants animés (carrousels, transitions), si la capacité le
permet, émuler `prefers-reduced-motion: reduce` et vérifier que l'animation
est désactivée ou remplacée. Sans cette capacité, noter « non vérifié » pour
ce point.

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

Pour le zoom, utiliser une session CDP et `Emulation.setPageScaleFactor`.
Conserver les mesures, les captures et la liste des arrêts Tab comme preuves.

## Tableau de correspondance capacité → outil

Seule cette section nomme des outils concrets. Si un outil listé n'est pas
présent dans la session, passer à la ligne suivante.

| Capacité | Claude in Chrome | Cursor browser | Codex / Playwright MCP | Playwright ou Puppeteer (script) |
|----------|------------------|----------------|------------------------|----------------------------------|
| Naviguer | `mcp__claude-in-chrome__navigate` (après `tabs_create_mcp`) | `browser_navigate` | `browser_navigate` | `page.goto` / `page.goto` |
| Lire l'arbre / références | `mcp__claude-in-chrome__read_page` | `browser_snapshot` | `browser_snapshot` | `page.accessibility.snapshot()` / `page.accessibility.snapshot()` |
| Appuyer sur une touche | `mcp__claude-in-chrome__computer` (action clavier) | `browser_press_key` | `browser_press_key` | `page.keyboard.press` / `page.keyboard.press` |
| Évaluer du JavaScript | `mcp__claude-in-chrome__javascript_tool` | outil d'évaluation JavaScript si exposé, sinon non disponible | `browser_evaluate` | `page.evaluate` |
| Capture d'écran | `mcp__claude-in-chrome__computer` (capture) | `browser_take_screenshot` | `browser_take_screenshot` | `page.screenshot` |
| Zoom / viewport | JavaScript (approximation) ; zoom réel non confirmé | JavaScript (approximation) | `browser_resize` + JavaScript | `page.setViewportSize` ; CDP `Emulation.setPageScaleFactor` |
| Console | `mcp__claude-in-chrome__read_console_messages` | outil console si exposé, sinon non disponible | outil console si exposé, sinon non disponible | `page.on('console')` |
| Mouvement réduit | non disponible sans JavaScript ; noter « non vérifié » | non disponible | non disponible | `page.emulateMedia({ reducedMotion: 'reduce' })` |

Notes :

- Claude in Chrome : charger les outils en une seule recherche ToolSearch
  (`select:` avec la liste complète). Travailler dans un nouvel onglet créé
  avec `mcp__claude-in-chrome__tabs_create_mcp`, obtenir les identifiants
  avec `mcp__claude-in-chrome__tabs_context_mcp`, et fermer l'onglet créé à la
  fin. Éviter les actions qui déclenchent une boîte de dialogue bloquante
  (`alert`, `confirm`, `prompt`) ; si elle apparaît, la signaler à
  l'humain. Les noms exacts sont ceux du skill `anthropic-skills:chrome-browser`.
- Playwright ou Puppeteer : n'utiliser que s'ils sont déjà installés ou
  configurés dans le projet. Ne pas installer de dépendance automatiquement.
- Une cellule sans outil correspondant doit être marquée « non disponible »
  plutôt que remplacée par un outil inventé.

## Fallback humain

Si aucun outil navigateur n'est disponible, ou si les tests directs
échouent après deux ou trois tentatives :

1. vérifier si Playwright ou Puppeteer est déjà disponible dans le projet ;
2. s'il est disponible, proposer de l'utiliser sans installation ;
3. sinon demander à l'humain d'effectuer les trois tests ;
4. si l'humain ne peut pas les effectuer, marquer chaque test
   `non exécuté` et indiquer la raison.

Le fallback humain est également applicable si :

- la session est en lecture seule ou sans accès navigateur ;
- aucune URL ou aucun serveur vivant n'est disponible ;
- l'application est derrière une authentification que l'agent ne peut pas
  franchir.

La source exacte doit être consignée dans le rapport :
`Codex browser/Playwright MCP`, `Cursor browser`, `Claude in Chrome`,
`Playwright`, `Puppeteer` ou `humain`.

Limites : cette procédure ne remplace pas un test avec lecteur d'écran.
`style.zoom` ne remplace pas complètement le zoom navigateur réel.
