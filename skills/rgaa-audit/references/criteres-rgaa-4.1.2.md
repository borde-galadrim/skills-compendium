# RGAA 4.1.2 — liste des 106 critères

Source : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/ (RGAA 4.1.2), extraite le 2026-10-28.

Colonnes : **Niveau** (A / AA, `?` = non extrait de la page) · **Méthode** (`statique`, `runtime`, `statique+runtime`, `statique+humain`, `humain`) · **Référence de détection** (fichier:ligne dans `references/`, ou `à ajouter`, ou `aucun, jugement`).

Les questions sont reprises telles quelles de la page officielle. Les méthodes et références de détection sont des choix de cette skill, à valider.


## Thématique 1 — Images (9 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 1.1 | ? | Image porteuse d'information : alternative | statique | images-cadres-couleurs.md:7 | Chaque image porteuse d’information a-t-elle une alternative textuelle ? |
| 1.2 | ? | Image de décoration ignorée des AT | statique | images-cadres-couleurs.md:35 | Chaque image de décoration est-elle correctement ignorée par les technologies d’assistance ? |
| 1.3 | ? | Pertinence des alternatives | humain | aucun, jugement | Pour chaque image porteuse d’information ayant une alternative textuelle , cette alternative est-elle pertinente (hors cas particuliers) ? |
| 1.4 | ? | Alternative des CAPTCHA / image-test | humain | aucun, jugement | Pour chaque image utilisée comme CAPTCHA ou comme image-test , ayant une alternative textuelle , cette alternative permet-elle d’identifier la nature et la fonction de l’image ? |
| 1.5 | A | Solution alternative au CAPTCHA | humain | aucun, jugement | Pour chaque image utilisée comme CAPTCHA , une solution d’accès alternatif au contenu ou à la fonction du CAPTCHA est-elle présente ? |
| 1.6 | ? | Description détaillée si nécessaire | statique+humain | à ajouter | Chaque image porteuse d’information a-t-elle, si nécessaire, une description détaillée ? |
| 1.7 | ? | Pertinence de la description détaillée | humain | aucun, jugement | Pour chaque image porteuse d’information ayant une description détaillée , cette description est-elle pertinente ? |
| 1.8 | AA | Image texte remplacée par du texte stylé | statique | images-cadres-couleurs.md:68 | Chaque image texte porteuse d’information , en l’absence d’un mécanisme de remplacement , doit si possible être remplacée par du texte stylé . Cette règle est-elle respectée (hors cas particuliers) ? |
| 1.9 | ? | Légende reliée à l'image | statique | à ajouter (figcaption) | Chaque légende d’image est-elle, si nécessaire, correctement reliée à l’image correspondante ? |

## Thématique 2 — Cadres (2 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 2.1 | A | Chaque cadre a un titre | statique | images-cadres-couleurs.md:81 | Critère(s) de succès : |
| 2.2 | A | Pertinence du titre de cadre | humain | aucun, jugement | Pour chaque cadre ayant un titre de cadre , ce titre de cadre est-il pertinent ? |

## Thématique 3 — Couleurs (3 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 3.1 | A | Information non donnée uniquement par la couleur | statique+runtime | images-cadres-couleurs.md:102 | Dans chaque page web, l’ information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ? |
| 3.2 | AA | Contraste texte / fond | runtime | images-cadres-couleurs.md:134 ; runtime-browser.md (contraste) | Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé (hors cas particuliers) ? |
| 3.3 | AA | Contraste composants et graphiques | runtime | images-cadres-couleurs.md:134 ; runtime-browser.md (contraste) | Dans chaque page web, les couleurs utilisées dans les composants d’interface ou les éléments graphiques porteurs d’informations sont-elles suffisamment contrastées (hors cas particuliers) ? |

## Thématique 4 — Multimédia (13 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 4.1 | A | Transcription ou audiodescription | humain | multimedia-tableaux-liens-scripts.md:9 | Chaque média temporel pré-enregistré a-t-il, si nécessaire, une transcription textuelle ou une audiodescription (hors cas particuliers) ? |
| 4.2 | A | Pertinence transcription / AD | humain | multimedia-tableaux-liens-scripts.md:9 | Pour chaque média temporel pré-enregistré ayant une transcription textuelle ou une audiodescription synchronisée, celles-ci sont-elles pertinentes (hors cas particuliers) ? |
| 4.3 | A | Sous-titres synchronisés | statique | à ajouter | Chaque média temporel synchronisé pré-enregistré a-t-il, si nécessaire, des sous-titres synchronisés (hors cas particuliers) ? |
| 4.4 | A | Pertinence des sous-titres | humain | aucun, jugement | Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés , ces sous-titres sont-ils pertinents ? |
| 4.5 | AA | Audiodescription synchronisée | statique | à ajouter | Chaque média temporel pré-enregistré a-t-il, si nécessaire, une audiodescription synchronisée (hors cas particuliers) ? |
| 4.6 | AA | Pertinence de l'audiodescription | humain | aucun, jugement | Pour chaque média temporel pré-enregistré ayant une audiodescription synchronisée, celle-ci est-elle pertinente ? |
| 4.7 | A | Média temporel clairement identifiable | humain | aucun, jugement | Chaque média temporel est-il clairement identifiable (hors cas particuliers) ? |
| 4.8 | A | Alternative des médias non temporels | statique | à ajouter | Chaque média non temporel a-t-il, si nécessaire, une alternative (hors cas particuliers) ? |
| 4.9 | A | Pertinence de l'alternative non temporelle | humain | aucun, jugement | Pour chaque média non temporel ayant une alternative, cette alternative est-elle pertinente ? |
| 4.10 | A | Son déclenché automatiquement contrôlable | runtime | à ajouter (runtime-browser.md) | Chaque son déclenché automatiquement est-il contrôlable par l’utilisateur ? |
| 4.11 | A | Média temporel contrôlable au clavier | runtime | multimedia-tableaux-liens-scripts.md:22 | La consultation de chaque média temporel est-elle, si nécessaire, contrôlable par le clavier et tout dispositif de pointage ? |
| 4.12 | A | Média non temporel contrôlable au clavier | runtime | à ajouter (runtime-browser.md) | La consultation de chaque média non temporel est-elle contrôlable par le clavier et tout dispositif de pointage ? |
| 4.13 | A | Média compatible avec les AT | humain | aucun, jugement | Chaque média temporel et non temporel est-il compatible avec les technologies d’assistance (hors cas particuliers) ? |

## Thématique 5 — Tableaux (8 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 5.1 | A | Résumé des tableaux complexes | humain | aucun, jugement | Chaque tableau de données complexe a-t-il un résumé ? |
| 5.2 | A | Pertinence du résumé | humain | aucun, jugement | Pour chaque tableau de données complexe ayant un résumé , celui-ci est-il pertinent ? |
| 5.3 | A | Tableau de mise en forme linéarisé | humain | aucun, jugement | Pour chaque tableau de mise en forme , le contenu linéarisé reste-t-il compréhensible ? |
| 5.4 | A | Titre associé au tableau de données | statique | à ajouter | Pour chaque tableau de données ayant un titre , le titre est-il correctement associé au tableau de données ? |
| 5.5 | A | Pertinence du titre de tableau | humain | aucun, jugement | Pour chaque tableau de données ayant un titre , celui-ci est-il pertinent ? |
| 5.6 | A | En-têtes de ligne et de colonne déclarés | statique | multimedia-tableaux-liens-scripts.md:44 (à vérifier) | Pour chaque tableau de données , chaque en-tête de colonne et chaque en-tête de ligne sont-ils correctement déclarés ? |
| 5.7 | ? | Association cellule / en-tête | statique | multimedia-tableaux-liens-scripts.md:44 (à vérifier) | Pour chaque tableau de données , la technique appropriée permettant d’associer chaque cellule avec ses en-têtes est-elle utilisée (hors cas particuliers) ? |
| 5.8 | A | Tableau de mise en forme sans éléments de données | statique | multimedia-tableaux-liens-scripts.md:82 (à vérifier) | Chaque tableau de mise en forme ne doit pas utiliser d’éléments propres aux tableaux de données . Cette règle est-elle respectée ? |

## Thématique 6 — Liens (2 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 6.1 | ? | Lien explicite | statique+humain | multimedia-tableaux-liens-scripts.md:98 | Chaque lien est-il explicite (hors cas particuliers) ? |
| 6.2 | A | Chaque lien a un intitulé | statique+runtime | multimedia-tableaux-liens-scripts.md:132 | Dans chaque page web, chaque lien a-t-il un intitulé ? |

## Thématique 7 — Scripts (5 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 7.1 | A | Script compatible avec les AT | statique+runtime | multimedia-tableaux-liens-scripts.md:167 (à vérifier) | Chaque script est-il, si nécessaire, compatible avec les technologies d’assistance ? |
| 7.2 | A | Pertinence de l'alternative au script | humain | aucun, jugement | Pour chaque script ayant une alternative , cette alternative est-elle pertinente ? |
| 7.3 | A | Script contrôlable au clavier et au pointeur | runtime | multimedia-tableaux-liens-scripts.md:167, :190 | Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage (hors cas particuliers) ? |
| 7.4 | A | Changement de contexte signalé par un script | statique+humain | à ajouter | Pour chaque script qui initie un changement de contexte , l’utilisateur est-il averti ou en a-t-il le contrôle ? |
| 7.5 | AA | Messages de statut restitués | runtime | multimedia-tableaux-liens-scripts.md:223 (à vérifier) | Dans chaque page web, les messages de statut sont-ils correctement restitués par les technologies d’assistance ? |

## Thématique 8 — Éléments obligatoires (10 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 8.1 | A | Type de document défini | statique | à ajouter | Chaque page web est-elle définie par un type de document ? |
| 8.2 | A | Code source valide | statique | à ajouter (validateur) | Pour chaque page web, le code source généré est-il valide selon le type de document spécifié ? |
| 8.3 | A | Langue par défaut présente | statique | structure-presentation.md:9 (à vérifier) | Dans chaque page web, la langue par défaut est-elle présente ? |
| 8.4 | A | Code de langue pertinent | statique+humain | structure-presentation.md:9 (à vérifier) | Pour chaque page web ayant une langue par défaut , le code de langue est-il pertinent ? |
| 8.5 | A | Titre de page présent | statique+runtime | structure-presentation.md:33 | Chaque page web a-t-elle un titre de page ? |
| 8.6 | A | Titre de page pertinent | humain | structure-presentation.md:33 | Pour chaque page web ayant un titre de page , ce titre est-il pertinent ? |
| 8.7 | AA | Changement de langue indiqué | statique | structure-presentation.md:9 | Dans chaque page web, chaque changement de langue est-il indiqué dans le code source (hors cas particuliers) ? |
| 8.8 | AA | Code de langue du changement valide | statique | à ajouter | Dans chaque page web, le code de langue de chaque changement de langue est-il valide et pertinent ? |
| 8.9 | A | Balises non utilisées à des fins de présentation | statique | à ajouter | Dans chaque page web, les balises ne doivent pas être utilisées uniquement à des fins de présentation . Cette règle est-elle respectée ? |
| 8.10 | A | Changements du sens de lecture signalés | humain | aucun, jugement | Dans chaque page web, les changements du sens de lecture sont-ils signalés ? |

## Thématique 9 — Structuration de l'information (4 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 9.1 | A | Titres pour structurer l'information | statique | structure-presentation.md:55 | Dans chaque page web, l’information est-elle structurée par l’utilisation appropriée de titres ? |
| 9.2 | A | Structure du document cohérente | statique | structure-presentation.md:83 | Dans chaque page web, la structure du document est-elle cohérente (hors cas particuliers) ? |
| 9.3 | A | Listes correctement structurées | statique | structure-presentation.md:111 | Dans chaque page web, chaque liste est-elle correctement structurée ? |
| 9.4 | A | Citations correctement indiquées | statique | à ajouter | Dans chaque page web, chaque citation est-elle correctement indiquée ? |

## Thématique 10 — Présentation de l'information (14 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 10.1 | A | Feuilles de style utilisées pour la présentation | statique | à ajouter | Dans le site web, des feuilles de styles sont-elles utilisées pour contrôler la présentation de l’information ? |
| 10.2 | A | Contenu présent sans feuilles de style | runtime | structure-presentation.md:206 (à vérifier) | Dans chaque page web, le contenu visible porteur d’information reste-t-il présent lorsque les feuilles de styles sont désactivées ? |
| 10.3 | A | Information compréhensible sans feuilles de style | humain | aucun, jugement | Dans chaque page web, l’information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ? |
| 10.4 | AA | Lisibilité à 200 % de zoom | runtime | structure-presentation.md:175 ; runtime-browser.md (zoom) | Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu’à 200 %, au moins (hors cas particuliers) ? |
| 10.5 | AA | Couleurs de fond et de police bien déclarées | statique | à ajouter | Dans chaque page web, les déclarations CSS de couleurs de fond d’élément et de police sont-elles correctement utilisées ? |
| 10.6 | A | Lien non évident visible par rapport au texte | statique+humain | à ajouter | Dans chaque page web, chaque lien dont la nature n’est pas évidente est-il visible par rapport au texte environnant ? |
| 10.7 | A | Prise de focus visible | runtime | structure-presentation.md:151 ; runtime-browser.md (focus) | Dans chaque page web, pour chaque élément recevant le focus, la prise de focus est-elle visible ? |
| 10.8 | A | Contenus cachés ignorés des AT | statique | à ajouter | Pour chaque page web, les contenus cachés ont-ils vocation à être ignorés par les technologies d’assistance ? |
| 10.9 | A | Information non donnée par forme, taille ou position seule | humain | structure-presentation.md:228 | Dans chaque page web, l’information ne doit pas être donnée uniquement par la forme, taille ou position . Cette règle est-elle respectée ? |
| 10.10 | A | Idem, implémentation pertinente | humain | aucun, jugement | Dans chaque page web, l’information ne doit pas être donnée par la forme, taille ou position uniquement. Cette règle est-elle implémentée de façon pertinente ? |
| 10.11 | AA | Reflow à 320 px | runtime | structure-presentation.md:175 ; runtime-browser.md (320 px) | Pour chaque page web, les contenus peuvent-ils être présentés sans perte d’information ou de fonctionnalité et sans avoir recours soit à un défilement vertical pour une fenêtre ayant une hauteur de 256 px, soit à un défilement horizontal pour une fenêtre ayant une largeur de 320 px (hors cas particuliers) ? |
| 10.12 | AA | Espacement du texte redéfinissable | runtime | à ajouter (runtime-browser.md) | Dans chaque page web, les propriétés d’espacement du texte peuvent-elles être redéfinies par l’utilisateur sans perte de contenu ou de fonctionnalité (hors cas particuliers) ? |
| 10.13 | AA | Contenus au focus ou survol contrôlables | runtime | à ajouter (runtime-browser.md) | Dans chaque page web, les contenus additionnels apparaissant à la prise de focus ou au survol d’un composant d’interface sont-ils contrôlables par l’utilisateur (hors cas particuliers) ? |
| 10.14 | A | Contenus CSS-only atteignables au clavier | runtime | à ajouter (runtime-browser.md) | Dans chaque page web, les contenus additionnels apparaissant via les styles CSS uniquement peuvent-ils être rendus visibles au clavier et par tout dispositif de pointage ? |

## Thématique 11 — Formulaires (13 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 11.1 | A | Chaque champ a une étiquette | statique | formulaires.md:5 | Chaque champ de formulaire a-t-il une étiquette ? |
| 11.2 | AA | Étiquette pertinente | humain | formulaires.md:5 | Chaque étiquette associée à un champ de formulaire est-elle pertinente (hors cas particuliers) ? |
| 11.3 | AA | Étiquettes identiques pour fonctions identiques | humain | aucun, jugement | Dans chaque formulaire , chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page ou dans un ensemble de pages est-elle cohérente ? |
| 11.4 | A | Étiquette accolée à son champ | statique | formulaires.md:43 (à vérifier) | Dans chaque formulaire , chaque étiquette de champ et son champ associé sont-ils accolés (hors cas particuliers) ? |
| 11.5 | A | Champs de même nature regroupés | statique | formulaires.md:5 (à vérifier) | Dans chaque formulaire , les champs de même nature sont-ils regroupés, si nécessaire ? |
| 11.6 | A | Regroupement avec légende | statique | formulaires.md:5 (à vérifier) | Dans chaque formulaire , chaque regroupement de champs de même nature a-t-il une légende ? |
| 11.7 | A | Légende pertinente | humain | aucun, jugement | Dans chaque formulaire , chaque légende associée à un regroupement de champs de même nature est-elle pertinente ? |
| 11.8 | A | Items de liste de choix regroupés | humain | aucun, jugement | Dans chaque formulaire , les items de même nature d’une liste de choix sont-ils regroupés de manière pertinente ? |
| 11.9 | A | Intitulé de bouton pertinent | humain | aucun, jugement | Dans chaque formulaire , l’intitulé de chaque bouton est-il pertinent (hors cas particuliers) ? |
| 11.10 | ? | Contrôle de saisie pertinent | statique+humain | formulaires.md:78 | Dans chaque formulaire , le contrôle de saisie est-il utilisé de manière pertinente (hors cas particuliers) ? |
| 11.11 | AA | Suggestions de correction des erreurs | humain | formulaires.md:43 (à vérifier) | Dans chaque formulaire , le contrôle de saisie est-il accompagné, si nécessaire, de suggestions facilitant la correction des erreurs de saisie ? |
| 11.12 | AA | Vérification avant validation des données sensibles | humain | aucun, jugement | Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou à un examen, ou dont la validation a des conséquences financières ou juridiques, les données saisies peuvent-elles être modifiées, mises à jour ou récupérées par l’utilisateur ? |
| 11.13 | AA | Finalité des champs (autocomplete) | statique | formulaires.md:101 | La finalité d’un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l’utilisateur ? |

## Thématique 12 — Navigation (11 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 12.1 | AA | Deux systèmes de navigation | humain | navigation-consultation.md:101 (checklist) | Chaque ensemble de pages dispose-t-il de deux systèmes de navigation différents, au moins (hors cas particuliers) ? |
| 12.2 | AA | Menu et navigation à la même place | runtime | à ajouter | Dans chaque ensemble de pages , le menu et les barres de navigation sont-ils toujours à la même place (hors cas particuliers) ? |
| 12.3 | AA | Plan du site pertinent | humain | aucun, jugement | La page « plan du site » est-elle pertinente ? |
| 12.4 | AA | Plan du site accessible de façon identique | statique+runtime | à ajouter | Dans chaque ensemble de pages , la page « plan du site » est-elle accessible à partir d’une fonctionnalité identique ? |
| 12.5 | AA | Moteur de recherche atteignable de façon identique | statique | à ajouter | Dans chaque ensemble de pages , le moteur de recherche est-il atteignable de manière identique ? |
| 12.6 | A | Zones de regroupement de contenus | statique | navigation-consultation.md:9 | Les zones de regroupement de contenus présentes dans plusieurs pages web (zones d’ en-tête , de navigation principale , de contenu principal , de pied de page et de moteur de recherche ) peuvent-elles être atteintes ou évitées ? |
| 12.7 | A | Lien d'évitement vers le contenu principal | statique | navigation-consultation.md:37 | Dans chaque page web, un lien d’évitement ou d’accès rapide à la zone de contenu principal est-il présent (hors cas particuliers) ? |
| 12.8 | A | Ordre de tabulation cohérent | runtime | runtime-browser.md (clavier) | Dans chaque page web, l’ ordre de tabulation est-il cohérent ? |
| 12.9 | A | Pas de piège au clavier | runtime | runtime-browser.md (clavier) | Dans chaque page web, la navigation ne doit pas contenir de piège au clavier. Cette règle est-elle respectée ? |
| 12.10 | A | Raccourcis à une seule touche contrôlables | runtime | à ajouter (runtime-browser.md) | Dans chaque page web, les raccourcis clavier n’utilisant qu’une seule touche (lettre minuscule ou majuscule, ponctuation, chiffre ou symbole) sont-ils contrôlables par l’utilisateur ? |
| 12.11 | A | Contenus au survol ou focus atteignables au clavier | runtime | à ajouter (runtime-browser.md) | Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l’activation d’un composant d’interface sont-ils si nécessaire atteignables au clavier ? |

## Thématique 13 — Consultation (12 critères)

| ID | Niveau | Titre court | Méthode | Référence de détection | Question officielle |
|----|--------|-------------|---------|------------------------|---------------------|
| 13.1 | A | Contrôle des limites de temps | humain | navigation-consultation.md:114 | Pour chaque page web, l’utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu (hors cas particuliers) ? |
| 13.2 | A | Pas d'ouverture de fenêtre sans action | statique | navigation-consultation.md:137 | Dans chaque page web, l’ouverture d’une nouvelle fenêtre ne doit pas être déclenchée sans action de l’utilisateur. Cette règle est-elle respectée ? |
| 13.3 | A | Documents bureautiques accessibles | humain | navigation-consultation.md:168 | Dans chaque page web, chaque document bureautique en téléchargement possède-t-il, si nécessaire, une version accessible (hors cas particuliers) ? |
| 13.4 | A | Version accessible équivalente | humain | navigation-consultation.md:168 | Pour chaque document bureautique ayant une version accessible , cette version offre-t-elle la même information ? |
| 13.5 | A | Contenu cryptique avec alternative | humain | aucun, jugement | Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) a-t-il une alternative ? |
| 13.6 | A | Pertinence de l'alternative cryptique | humain | aucun, jugement | Dans chaque page web, pour chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) ayant une alternative, cette alternative est-elle pertinente ? |
| 13.7 | A | Flashs et changements brusques | humain | aucun, jugement | Dans chaque page web, les changements brusques de luminosité ou les effets de flash sont-ils correctement utilisés ? |
| 13.8 | A | Contenu en mouvement contrôlable | runtime | navigation-consultation.md:182 | Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l’utilisateur ? |
| 13.9 | AA | Orientation de l'écran | runtime | à ajouter (runtime-browser.md) | Dans chaque page web, le contenu proposé est-il consultable quelle que soit l’orientation de l’écran (portrait ou paysage) (hors cas particuliers) ? |
| 13.10 | A | Gestes complexes avec alternative | humain | aucun, jugement | Dans chaque page web, les fonctionnalités utilisables ou disponibles au moyen d’un geste complexe peuvent-elles être également disponibles au moyen d’un geste simple (hors cas particuliers) ? |
| 13.11 | A | Annulation des actions au pointeur | humain | aucun, jugement | Dans chaque page web, les actions déclenchées au moyen d’un dispositif de pointage sur un point unique de l’écran peuvent-elles faire l’objet d’une annulation (hors cas particuliers) ? |
| 13.12 | A | Fonctions liées au mouvement de l'appareil | humain | aucun, jugement | Dans chaque page web, les fonctionnalités qui impliquent un mouvement de l’appareil ou vers l’appareil peuvent-elles être satisfaites de manière alternative (hors cas particuliers) ? |
