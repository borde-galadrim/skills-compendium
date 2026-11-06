# Inventaire du DOM et applicabilité des critères

L'inventaire est la première étape de l'audit. Il fournit, en une passe, la
preuve de la plupart des critères `statique` et les déclencheurs
d'applicabilité qui permettent de conclure `NA` au lieu de `NT`.

## Obtenir l'inventaire

Par ordre de préférence :

1. **Navigateur piloté** (Claude in Chrome en priorité) : évaluer le
   contenu de [../scripts/inventaire.js](../scripts/inventaire.js) avec la
   capacité « Évaluer du JavaScript ». Le fichier est une expression
   autonome qui renvoie un objet JSON.
2. **Script runtime** : `node scripts/rgaa-runtime.mjs <url>` évalue
   l'inventaire dans la page et l'écrit dans `runtime.json` (clé
   `inventory`). Voir [runtime-browser.md](runtime-browser.md). Il ne porte
   pas la session de l'utilisateur.
3. **Sans navigateur** : appliquer la même liste de contrôle à la main sur le
   HTML rendu (récupéré par une requête HTTP) et sur le code source. Chaque
   clé ci-dessous correspond à une recherche simple (`<img` sans `alt`,
   `target="_blank"`, `<table`, `lang=`, etc.).

Le HTML rendu ou le code source suffit pour tous les critères de méthode
`statique`. **Un critère `statique` ne reçoit jamais `NT` avec la raison
`outil indisponible`** quand le HTML ou le source est lisible.

L'inventaire ne remplace pas la lecture du source : il localise le défaut
dans le DOM, le source donne le `fichier:ligne` de la correction.

## Correspondance clé → critères

| Clé de l'inventaire | Critères | Lecture |
|---------------------|----------|---------|
| `document.doctype` | 8.1 | absent → NC |
| `validity.*` | 8.2 | id dupliqués, références d'id cassées, interactifs imbriqués, enfants de liste invalides → NC 8.2 si le défaut a un impact (voir ci-dessous) |
| `document.lang`, `xmlLang` | 8.3, 8.4 | absent → NC 8.3 ; code invalide ou différent de la langue du texte → NC 8.4 |
| `document.title` | 8.5, 8.6 | vide → NC 8.5 ; pertinence : [jugement-agent.md](jugement-agent.md) |
| `language.langChanges`, `invalidLangCodes`, `englishWordSample` | 8.7, 8.8 | passages étrangers sans `lang` → NC 8.7 ; code invalide → NC 8.8 |
| `language.dirAttributes`, `rtlCharCount` | 8.10 | déclencheur d'applicabilité |
| `structure.presentationalTags`, `brRuns`, `presentationalAttrs` | 8.9, 10.1 | balise employée pour son rendu (`<b>` décoratif, `<br><br>` pour espacer, `<table>` de mise en page) → NC 8.9 ; attributs de présentation → NC 10.1 |
| `headings.*` | 9.1 | saut de niveau, absence de h1, titre vide, section sans titre → NC |
| `landmarks.*` | 9.2, 12.6, 12.7 | `header`/`nav`/`main`/`footer` absents → NC 9.2 / 12.6 ; `skipLinks` vide ou cible absente → NC 12.7 |
| `structure.lists`, `potentialFakeLists`, `validity.invalidListChildren` | 9.3 | suite d'items non balisée en liste → NC 9.3 (vérifier visuellement qu'il s'agit d'une liste) |
| `structure.quotes` | 9.4 | citation en `<p>` entre guillemets sans `<blockquote>`/`<q>` → NC 9.4 |
| `images.imgMissingAlt`, `svgUnlabelledNotHidden`, `inputImage`, `area`, `roleImg` | 1.1 | alternative absente sur image porteuse → NC |
| `images.img` (alt vide, `aria-hidden`), `svg` | 1.2 | image décorative restituée → NC |
| `images.img`, `imgSuspiciousAlt` | 1.3 | pertinence : [jugement-agent.md](jugement-agent.md) |
| `images.img[].describedby`, `roleImg`, `canvas` | 1.6, 1.7 | graphique, carte ou schéma porteur d'information sans description détaillée → NC 1.6 |
| `images.backgroundImagesWithoutText` | 1.1, 1.8, 10.2 | image CSS porteuse d'information → à vérifier sur la capture |
| `images.figures` | 1.9 | `figcaption` sans `role="figure"`/`aria-label` ou sans lien avec l'image → NC 1.9 |
| `frames` | 2.1, 2.2 | `title` absent → NC 2.1 |
| `media.*` | 4.x | déclencheur d'applicabilité |
| `tables` | 5.x | déclencheur ; `caption`, `th`, `scope`, `headers` pour 5.4 à 5.8 |
| `links.withoutName` | 6.2 | NC |
| `links.technicalOrGeneric`, `sameNameDifferentTarget`, `visibleNotInName` | 6.1 | NC si le contexte ne lève pas l'ambiguïté |
| `links.targetBlank` (`signalled: false`) | 13.2 | NC (règle 13.2 de `SKILL.md`) |
| `links.officeDocuments` | 13.3, 13.4 | déclencheur d'applicabilité |
| `buttons.withoutName` | 11.9, 7.1 | bouton sans intitulé → NC 11.9 (dans un formulaire) ou 7.1 |
| `forms.unlabelled`, `placeholderOnly` | 11.1 | NC |
| `forms.fields[].labelDistancePx`, `labelFar` | 11.4 | étiquette à plus de ~50 px ou non visible → vérifier sur la capture, NC si l'association visuelle est perdue |
| `forms.groups`, `ungroupedChoiceSets` | 11.5, 11.6 | boutons radio ou cases de même nature non groupés, ou sans légende → NC |
| `forms.selects` | 11.8 | déclencheur (liste de plus de ~10 options de natures différentes) |
| `forms.requiredNotSignalled`, `fields[].invalid`, `describedby` | 11.10, 11.11 | champ obligatoire non signalé → NC 11.10 |
| `forms.autocompleteMissing`, `autocompleteInvalid` | 11.13 | donnée personnelle sans `autocomplete` valide → NC |
| `forms.sensitive` | 11.12 | déclencheur d'applicabilité |
| `structure.hiddenFocusable` | 10.8 | élément focusable dans `aria-hidden` → NC 10.8 |
| `structure.srOnlyTexts` | 10.8 | textes masqués visuellement : vérifier qu'ils ont vocation à être lus |
| `structure.inlineColorHalfDeclared` | 10.5 | couleur de texte déclarée sans fond (ou l'inverse) en style en ligne → vérifier l'héritage, NC si le contraste dépend du fond par défaut |
| `structure.cssGeneratedContent` | 10.2 | texte porteur d'information injecté par `::before`/`::after` → NC 10.2 |
| `scripts.clickableNonNative`, `positiveTabindex` | 7.1, 7.3, 12.8 | `div` cliquable sans rôle ni clavier → NC 7.3 (confirmer au clavier) ; `tabindex` positif → NC 12.8 si l'ordre devient incohérent |
| `scripts.widgets` | 7.1, 7.3 | composants à tester au clavier et à vérifier en ARIA |
| `scripts.liveRegions` | 7.5 | messages de statut : présence d'une région `role="status"`/`aria-live` là où un message apparaît |
| `scripts.onchangeNavigation` | 7.4 | changement de contexte au `change` sans bouton → NC 7.4 |
| `scripts.accesskeys` | 12.10 | déclencheur (avec les écouteurs `keydown` du script runtime) |
| `scripts.autoplayCandidates` | 13.8 | déclencheur (avec la mesure `motion` du script runtime) |
| `landmarks.search`, `sitemapLinks`, `navs` | 12.1, 12.3, 12.4, 12.5 | voir [jugement-agent.md](jugement-agent.md) et la passe multi-pages |
| `consultation.captcha` | 1.4, 1.5 | déclencheur d'applicabilité |
| `consultation.metaRefresh`, `timeoutWords` | 13.1 | déclencheur d'applicabilité |
| `consultation.emojis`, `asciiArt` | 13.5, 13.6 | déclencheur d'applicabilité |
| `document.viewportBlocksZoom` | 10.4 | `user-scalable=no` ou `maximum-scale` < 2 → NC 10.4 |

**Règle 8.2 :** le RGAA demande un code valide ; sans validateur, relever
les défauts de validité qui ont un impact (id dupliqué référencé par un
`label` ou `aria-*`, interactifs imbriqués, liste invalide). Si aucun n'est
trouvé et qu'aucun validateur n'a tourné, 8.2 reste `NT` avec la raison
`à confirmer` et la preuve partielle. Un validateur déjà installé (`vnu`)
peut être utilisé ; un validateur en ligne reçoit le HTML de la page :
demander l'accord de l'humain avant de l'envoyer.

## Applicabilité : déclencheurs

Un critère dont le déclencheur est **absent de l'inventaire** est `NA`, avec
la preuve « aucun <déclencheur> dans l'inventaire (compte = 0) ». Ce n'est
pas un `NT`. Si l'inventaire n'a pas pu être obtenu, chercher les mêmes
déclencheurs dans le HTML rendu et le source avant de conclure.

| Critères | Déclencheur (présence = applicable) | Où regarder |
|----------|-------------------------------------|-------------|
| 1.4, 1.5 | CAPTCHA ou image-test | `consultation.captcha` ; formulaires d'inscription ou de contact |
| 1.6, 1.7 | image porteuse d'une information complexe (graphique, schéma, carte, infographie) | `images.img`, `roleImg`, `canvas`, capture d'écran |
| 1.9 | image légendée (`figure` + `figcaption`, ou légende visuelle) | `images.figures` |
| 2.1, 2.2 | `iframe` ou `frame` | `frames` |
| 4.1 à 4.13 | `video`, `audio`, lecteur embarqué (YouTube, Vimeo…), `object`/`embed` média, GIF animé ou animation porteuse (médias non temporels : 4.8, 4.9, 4.12) | `media.*` |
| 4.10 | son lancé sans action | `media.video[].autoplay && !muted`, `media.audio[].autoplay` |
| 5.1 à 5.8 | `table`, `role="table"` ou `role="grid"` | `tables` ; 5.1/5.2 seulement pour un tableau complexe (en-têtes sur plusieurs niveaux), 5.3/5.8 seulement pour un tableau de mise en forme |
| 7.2 | script ayant une alternative (`noscript`, version sans JS) | source, `noscript` |
| 7.4 | script qui change de contexte (navigation au `change`, ouverture de fenêtre, déplacement du focus) | `scripts.onchangeNavigation`, source |
| 8.7, 8.8 | passage dans une autre langue que la langue de la page | `language.*`, lecture du texte (emprunts courants admis : « e-mail », « newsletter ») |
| 8.10 | texte dont le sens de lecture diffère (arabe, hébreu…) | `language.rtlCharCount`, `dirAttributes` |
| 11.x | au moins un champ de formulaire | `forms.fields.count` ; 11.5 à 11.8 seulement pour des champs de même nature ou des listes de choix |
| 11.12 | formulaire qui modifie ou supprime des données, à conséquence financière ou juridique, ou de type examen | `forms.sensitive`, intitulés de bouton |
| 12.3, 12.4 | page « plan du site » | `landmarks.sitemapLinks` (si le plan est un des deux systèmes de navigation retenus) |
| 12.5 | moteur de recherche | `landmarks.search` |
| 12.10 | raccourci à une seule touche | `eventListeners` du script runtime (`keydown` sur `document`/`window`), `scripts.accesskeys` ; lire le gestionnaire pour vérifier qu'il réagit à une touche seule |
| 13.1 | limite de temps (session, redirection, rafraîchissement, contenu qui change seul) | `consultation.metaRefresh`, `timeoutWords`, `setTimeout`/`setInterval` de redirection dans le source |
| 13.3, 13.4 | document bureautique en téléchargement | `links.officeDocuments` |
| 13.5, 13.6 | contenu cryptique (émoticône, art ASCII, abréviation codée) | `consultation.emojis`, `asciiArt` |
| 13.7 | flash ou changement brusque de luminosité | `media.*`, `motion` du script runtime, GIF animés |
| 13.8 | contenu en mouvement ou clignotant (carrousel automatique, animation de plus de 5 s, vidéo de fond) | `motion` du script runtime, `scripts.autoplayCandidates` |
| 13.10 | geste complexe (glisser, pincer, balayer, multi-doigt) | carrousel ou slider (`scripts.widgets`), écouteurs `touchmove`/`pointerdown` du script runtime |
| 13.11 | action déclenchée au pointeur sur un point unique | toute la page en a en général : applicable dès qu'un contrôle existe ; chercher des actions au `mousedown`/`pointerdown`/`touchstart` (écouteurs du script runtime, source) |
| 13.12 | fonctionnalité liée au mouvement de l'appareil | écouteurs `devicemotion`/`deviceorientation` |

Un déclencheur présent rend le critère **applicable** : il est alors évalué
(statique, runtime ou [jugement-agent.md](jugement-agent.md)), jamais
classé `NA`.
