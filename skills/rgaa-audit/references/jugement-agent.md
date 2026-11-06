# Jugement agent — critères de pertinence

Plusieurs critères RGAA demandent un jugement (« pertinent », « compréhensible »,
« cohérent »). L'agent peut trancher ces critères lui-même, à partir de
preuves qu'il a sous les yeux : capture d'écran, texte de la page, arbre
d'accessibilité, inventaire. Le résultat porte la confiance `jugement agent`
dans la grille, pour que la personne qui relit sache quoi valider.

## Règles

1. **Preuve visible obligatoire.** Un jugement s'appuie sur ce que l'agent a
   effectivement vu : l'image et son `alt`, le champ et son étiquette, la
   capture sans CSS. Sans cette preuve, le critère reste `NT`
   (`humain requis`).
2. **C ou NC, avec la règle appliquée.** Citer la règle de décision
   ci-dessous qui fonde le verdict (« alt = nom de fichier → NC 1.3 »).
3. **Doute = NT.** Si deux lectures raisonnables mènent à deux verdicts
   différents, mettre `NT` avec la raison `à confirmer`, et écrire la question
   précise à trancher.
4. **Pas de jugement sur un contenu non vu.** Contenus CMS non chargés,
   états non déclenchés (erreur de formulaire, modale), pages derrière une
   authentification : `NT`.
5. **Toutes les occurrences.** Un NC de pertinence liste toutes les
   occurrences fautives, pas un exemple.

## Règles de décision par critère

### 1.3 — Pertinence des alternatives d'image

Voir l'image (capture ou fichier) à côté de son nom accessible.
- **NC** : nom de fichier, mot générique seul (« image », « photo »,
  « logo », « visuel »), texte qui contredit l'image, texte de l'image
  non repris (image texte), image-lien dont l'alternative ne donne pas la
  destination ou la fonction.
- **C** : l'alternative transmet la même information ou fonction que l'image
  dans son contexte (logo-lien : « Accueil <marque> » ou nom de la marque).
- Une image décorative avec un `alt` non vide relève de 1.2, pas de 1.3.

### 1.4 — Alternative d'un CAPTCHA

Applicable seulement si un CAPTCHA existe. **C** si l'alternative dit la
nature et la fonction (« Code de sécurité à recopier »), sans donner la
réponse.

### 1.7 — Pertinence de la description détaillée

Comparer la description aux données visibles du graphique ou du schéma.
**NC** si une donnée porteuse (valeur, tendance, étape) manque.

### 2.2 — Pertinence du titre de cadre

**NC** : titre technique (« iframe », « frame1 »), vide de sens ou identique
pour des cadres différents. **C** : le titre dit le contenu du cadre. Un
cadre masqué (`display:none`, `aria-hidden`, taille 0) de suivi technique
(GTM) est hors champ de 2.2 si son titre existe.

### 5.2, 5.5 — Pertinence du résumé et du titre de tableau

**C** si le titre identifie les données du tableau (« Tarifs 2026 par
formule ») et si le résumé décrit sa structure.

### 7.2 — Pertinence de l'alternative à un script

**C** si l'alternative donne accès au même contenu et aux mêmes fonctions.

### 8.6 — Pertinence du titre de page

**C** si le titre identifie la page et le site, et diffère d'une page à
l'autre (comparer avec la passe multi-pages si elle a tourné). **NC** : titre
générique identique sur plusieurs pages, nom du site seul sur une page
interne, titre d'une autre page.

### 10.3 — Information compréhensible sans CSS

Lire la capture `sans-css` et l'ordre du DOM. **NC** si l'ordre de lecture
rend l'information incompréhensible (étiquette séparée de sa valeur,
étapes dans le désordre) ou si une information n'existait que par la mise en
forme (position, couleur, image CSS).

### 10.6 — Lien visible par rapport au texte

Sur la capture : un lien dans un paragraphe, distingué seulement par la
couleur avec un contraste de moins de 3:1 par rapport au texte voisin et
sans soulignement ni autre indice → **NC**.

### 10.9, 10.10 — Information par la forme, la taille ou la position

Chercher dans le texte et la capture : « cliquez sur le bouton rond », « voir
à droite », état actif indiqué seulement par une forme ou une taille,
pastille de carrousel active sans `aria-current` ni texte. **NC** si une
information n'est transmise que par ce moyen.

### 11.2 — Pertinence des étiquettes

**NC** : étiquette qui ne dit pas quoi saisir (« Champ 1 », « Valeur »),
format attendu absent alors qu'il est contrôlé (date, téléphone), étiquette
qui contredit le type du champ. **C** : l'étiquette, seule, dit quoi saisir.

### 11.3 — Cohérence des étiquettes

Comparer les champs de même fonction sur la page (et sur les pages de la
passe multi-pages : clé `consistency[].formLabels`). **NC** si une même
fonction porte des étiquettes différentes (« E-mail » / « Courriel »).

### 11.7 — Pertinence des légendes de regroupement

**C** si la légende dit ce que le groupe demande (« Civilité »,
« Adresse de livraison »).

### 11.8 — Regroupement des items de liste de choix

Applicable aux `select` de plus de ~10 options de natures différentes.
**NC** si des items de natures différentes ne sont pas séparés par
`optgroup`.

### 11.9 — Pertinence des intitulés de bouton

**NC** : intitulé vide, générique sans contexte (« OK », « Valider » quand
plusieurs formulaires coexistent), ou qui ne dit pas l'action
(« Cliquez ici »). **C** : l'intitulé dit l'action (« S'inscrire à la
newsletter »).

### 11.11 — Suggestions de correction

Applicable seulement si le formulaire contrôle la saisie. Déclencher
l'erreur au navigateur (envoyer le formulaire vide ou un format faux) quand
c'est sans effet de bord ; sinon `NT`. **NC** si le message d'erreur ne dit
ni le format attendu ni un exemple.

### 12.1 — Deux systèmes de navigation

Compter parmi : menu de navigation, moteur de recherche, plan du site, fil
d'Ariane (comme système complémentaire). **C** si au moins deux sont
présents sur l'ensemble de pages. Une page de processus (tunnel, formulaire
en étapes) est un cas particulier : `NA` pour cette page.

### 12.3 — Pertinence du plan du site

Ouvrir la page « plan du site ». **C** si ses liens mènent aux sections
principales du site et fonctionnent. Sans accès à la page : `NT`.

### 13.4 — Version accessible équivalente

Applicable seulement si une version accessible existe. Comparer le contenu
des deux versions.

### 13.5, 13.6 — Contenu cryptique

Émoticône porteuse d'information (pas purement décorative) sans
`role="img"` + `aria-label` ni texte équivalent à côté → **NC 13.5**.
Alternative qui ne dit pas le sens → **NC 13.6**.

### 13.10 — Gestes complexes

Pour chaque carrousel, slider ou carte qui se manipule par glisser : **C**
s'il existe des boutons (précédent/suivant, +/−) qui donnent la même
fonction en un seul pointage.

### 13.11 — Annulation des actions au pointeur

**C** si les actions sont déclenchées au relâchement (`click`, `pointerup`)
ou réversibles. **NC** si une action non réversible part au `mousedown`,
`pointerdown` ou `touchstart` (lire le gestionnaire dans le source).

## Ce qui reste humain

- La compatibilité réelle avec un lecteur d'écran (partie de 7.1, 4.13) :
  l'agent vérifie le code ARIA, pas la restitution.
- La pertinence d'une transcription, de sous-titres ou d'une
  audiodescription (4.2, 4.4, 4.6) : demande de regarder le média en entier.
- La qualité d'une description détaillée longue d'un contenu complexe (1.7)
  quand le jugement dépend de la connaissance métier.
- Les flashs (13.7) sur une vidéo : l'agent ne peut pas mesurer le nombre
  de flashs par seconde.

Pour ces critères, la section « Reste à faire » du rapport donne un
protocole précis (voir [rapport-format.md](rapport-format.md)).
