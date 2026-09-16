# Exemples de code accessibles — DSFR

> Exemples utilisant le **Système de Design de l'État (DSFR)**.
> Pour des exemples HTML/WCAG/ARIA sans DSFR → voir [examples-html.md](examples-html.md)
> Pour le comportement React (état, focus, tests) → voir [react-patterns.md](react-patterns.md)

---

## Règles DSFR spécifiques

### Icônes `fr-icon-*`
```html
<!-- Icône seule dans un bouton : label sur le bouton, aria-hidden sur l'icône -->
<button type="button" aria-label="Supprimer le fichier rapport.pdf">
  <span class="fr-icon-delete-line" aria-hidden="true"></span>
</button>

<!-- Icône + texte : aria-hidden suffit, le texte porte l'information -->
<button type="button">
  <span class="fr-icon-add-line" aria-hidden="true"></span>
  Ajouter un document
</button>
```

### Alertes — `role` uniquement, pas `aria-live`
```html
<!-- role="alert" implique aria-live="assertive" — ne pas combiner -->
<div class="fr-alert fr-alert--error" role="alert">
  <p class="fr-alert__title">Erreur de connexion</p>
</div>

<!-- role="status" implique aria-live="polite" — ne pas combiner -->
<div class="fr-alert fr-alert--success" role="status">
  <p class="fr-alert__title">Modifications enregistrées</p>
</div>
```

### Badges — texte explicite obligatoire
```html
<!-- ❌ Information transmise uniquement par la couleur -->
<span class="fr-badge fr-badge--success">✓</span>

<!-- ✅ Texte explicite (RGAA 3.1) -->
<span class="fr-badge fr-badge--success">Validée</span>
```

### Upload de fichiers
```html
<div class="fr-upload-group">
  <label class="fr-label" for="doc-upload">
    Justificatif
    <span class="fr-hint-text">PDF, DOC — 10 Mo max</span>
  </label>
  <input class="fr-upload" type="file" id="doc-upload" name="document"
         accept=".pdf,.doc,.docx"
         aria-describedby="doc-hint">
  <p id="doc-hint" class="fr-hint-text">
    Formats acceptés : PDF, DOC, DOCX. Taille maximale : 10 Mo.
  </p>
</div>
```

### Modale DSFR — ne pas réimplémenter le focus trap
Le DSFR gère le focus trap nativement via l'élément `<dialog>`. Ne pas ajouter un JS custom.
Ajouter uniquement `aria-labelledby` et `aria-modal="true"` (voir §Composants dynamiques → Modale).

---

## Liens

### Lien externe
Quand le lien redirige vers un site externe, il doit s'ouvrir dans une nouvelle fenêtre.

```html
<a href="https://example.com" target="_blank" rel="noopener external"
   title="Libellé lien - nouvelle fenêtre" class="fr-link">
  Libellé lien
</a>
```

**Pourquoi :**
- `target="_blank"` ouvre dans un nouvel onglet
- `title="... - nouvelle fenêtre"` prévient l'utilisateur au survol/focus
- `rel="noopener external"` : sécurité (empêche accès à `window.opener`) + sémantique

### Lien de téléchargement
```html
<!-- Fichier standard -->
<a download href="document.pdf" class="fr-link fr-link--download">
  Télécharger le document lorem ipsum
  <span class="fr-link__detail">PDF – 1,81 Mo</span>
</a>

<!-- Fichier en langue étrangère -->
<a hreflang="en" download href="report.pdf" class="fr-link fr-link--download">
  Télécharger le rapport
  <span class="fr-link__detail">PDF – 2,4 Mo - Anglais</span>
</a>

<!-- Détail auto-rempli en JS (DSFR) -->
<a download href="document.pdf" class="fr-link fr-link--download"
   data-fr-assess-file>
  Télécharger le document
  <span class="fr-link__detail"></span>
</a>
```

### Lien au fil du texte
Ne pas utiliser la classe `fr-link` dans les paragraphes de texte.

```html
<p>Consulter la <a href="/documentation">documentation complète</a> pour en savoir plus.</p>
```

### Groupe de liens
```html
<!-- Liste de liens (ensemble logique) -->
<ul class="fr-links-group">
  <li><a href="/mentions-legales" class="fr-link">Mentions légales</a></li>
  <li><a href="/accessibilite" class="fr-link">Accessibilité</a></li>
  <li><a href="/donnees-personnelles" class="fr-link">Données personnelles</a></li>
</ul>

<!-- Liens indépendants (pas de liste) -->
<div class="fr-links-group">
  <a href="/connexion" class="fr-link">Se connecter</a>
  <a href="/inscription" class="fr-link">S'inscrire</a>
</div>
```

### Lien avec intitulé complété pour les lecteurs d'écran
```html
<!-- Quand l'intitulé visuel est ambigu -->
<a href="/habilitations/123">
  Consulter
  <span class="fr-sr-only"> l'habilitation API Particulier — DINUM</span>
</a>
```

---

## Boutons

### Bouton avec icône uniquement
```html
<button type="button" aria-label="Supprimer l'habilitation API Particulier">
  <svg aria-hidden="true" focusable="false">
    <use href="#fr-icon-delete-line"></use>
  </svg>
</button>
```

### Bouton toggle (expand/collapse)
```html
<button type="button" aria-expanded="false" aria-controls="details-id">
  Voir les détails
</button>
<div id="details-id" hidden>
  <p>Contenu des détails...</p>
</div>
```

```javascript
// JS pour synchroniser aria-expanded
button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true'
  button.setAttribute('aria-expanded', !expanded)
  content.hidden = expanded
})
```

---

## Formulaires

### Champ texte complet
```html
<div class="fr-input-group">
  <label class="fr-label" for="nom">
    Nom de famille
    <span class="fr-hint-text">Tel qu'il apparaît sur vos documents officiels</span>
  </label>
  <input class="fr-input" type="text" id="nom" name="nom"
         autocomplete="family-name"
         aria-required="true"
         aria-describedby="nom-error">
  <p id="nom-error" class="fr-error-text" role="alert" hidden>
    Veuillez saisir votre nom de famille.
  </p>
</div>
```

### Champ avec erreur visible
```html
<div class="fr-input-group fr-input-group--error">
  <label class="fr-label" for="email">Adresse e-mail</label>
  <input class="fr-input fr-input--error" type="email" id="email" name="email"
         aria-invalid="true"
         aria-describedby="email-error"
         value="adresse-invalide">
  <p id="email-error" class="fr-error-text" role="alert">
    Le format de l'adresse e-mail est invalide. Exemple : nom@domaine.fr
  </p>
</div>
```

### Champ avec succès
```html
<div class="fr-input-group fr-input-group--valid">
  <label class="fr-label" for="siret">Numéro SIRET</label>
  <input class="fr-input fr-input--valid" type="text" id="siret" name="siret"
         aria-describedby="siret-valid">
  <p id="siret-valid" class="fr-valid-text">
    Numéro SIRET valide — INSEE
  </p>
</div>
```

### Select accessible
```html
<div class="fr-select-group">
  <label class="fr-label" for="region">
    Région
    <span class="fr-hint-text">Sélectionnez votre région de rattachement</span>
  </label>
  <select class="fr-select" id="region" name="region" aria-required="true">
    <option value="" disabled selected>Sélectionner une option</option>
    <option value="idf">Île-de-France</option>
    <option value="ara">Auvergne-Rhône-Alpes</option>
  </select>
</div>
```

### Checkbox et radio
```html
<!-- Groupe de checkboxes -->
<fieldset class="fr-fieldset">
  <legend class="fr-fieldset__legend">
    Types de données demandées
    <span class="fr-hint-text">Cochez tout ce qui s'applique</span>
  </legend>
  <div class="fr-fieldset__content">
    <div class="fr-checkbox-group">
      <input type="checkbox" id="donnees-identite" name="donnees[]" value="identite">
      <label class="fr-label" for="donnees-identite">Identité</label>
    </div>
    <div class="fr-checkbox-group">
      <input type="checkbox" id="donnees-adresse" name="donnees[]" value="adresse">
      <label class="fr-label" for="donnees-adresse">Adresse</label>
    </div>
  </div>
</fieldset>

<!-- Groupe de boutons radio -->
<fieldset class="fr-fieldset">
  <legend class="fr-fieldset__legend">Fréquence d'appels</legend>
  <div class="fr-fieldset__content">
    <div class="fr-radio-group">
      <input type="radio" id="freq-faible" name="frequence" value="faible">
      <label class="fr-label" for="freq-faible">Moins de 100 appels/jour</label>
    </div>
    <div class="fr-radio-group">
      <input type="radio" id="freq-eleve" name="frequence" value="eleve">
      <label class="fr-label" for="freq-eleve">Plus de 100 appels/jour</label>
    </div>
  </div>
</fieldset>
```

---

## Navigation et structure

### Liens d'évitement
```html
<!-- Premier élément du <body> -->
<div class="fr-skiplinks">
  <nav class="fr-container" aria-label="Accès rapide">
    <ul class="fr-skiplinks__list">
      <li>
        <a class="fr-link fr-skiplinks__link" href="#content">
          Contenu
        </a>
      </li>
      <li>
        <a class="fr-link fr-skiplinks__link" href="#navigation">
          Menu
        </a>
      </li>
      <li>
        <a class="fr-link fr-skiplinks__link" href="#footer">
          Pied de page
        </a>
      </li>
    </ul>
  </nav>
</div>
```

### Pagination accessible
```html
<nav role="navigation" aria-label="Pagination">
  <ul class="fr-pagination__list">
    <li>
      <a class="fr-pagination__link fr-pagination__link--prev"
         href="/habilitations?page=1" aria-label="Page précédente">
        Page précédente
      </a>
    </li>
    <li>
      <a class="fr-pagination__link" href="/habilitations?page=1"
         aria-label="Page 1">1</a>
    </li>
    <li>
      <a class="fr-pagination__link" aria-current="page"
         href="/habilitations?page=2" aria-label="Page 2, page actuelle">2</a>
    </li>
    <li>
      <a class="fr-pagination__link" href="/habilitations?page=3"
         aria-label="Page 3">3</a>
    </li>
    <li>
      <a class="fr-pagination__link fr-pagination__link--next"
         href="/habilitations?page=3" aria-label="Page suivante">
        Page suivante
      </a>
    </li>
  </ul>
</nav>
```

---

## Composants dynamiques

### Notification / Toast
```html
<!-- role="status" implique aria-live="polite" — inutile de les combiner -->
<div role="status" aria-atomic="true">
  Vos modifications ont été sauvegardées.
</div>

<!-- role="alert" implique aria-live="assertive" — inutile de les combiner -->
<div role="alert" aria-atomic="true">
  Erreur : impossible de sauvegarder. Vérifiez votre connexion.
</div>
```

### Modale (Dialog)
```html
<dialog id="confirm-delete" aria-labelledby="dialog-title"
        aria-describedby="dialog-desc" aria-modal="true">
  <div class="fr-modal__body">
    <div class="fr-modal__header">
      <button class="fr-btn--close fr-btn" aria-controls="confirm-delete"
              title="Fermer la fenêtre modale">
        Fermer
      </button>
    </div>
    <div class="fr-modal__content">
      <h1 class="fr-modal__title" id="dialog-title">
        Supprimer l'habilitation
      </h1>
      <p id="dialog-desc">
        Cette action est irréversible. L'habilitation sera définitivement supprimée.
      </p>
    </div>
    <div class="fr-modal__footer">
      <button type="button" class="fr-btn fr-btn--secondary"
              aria-controls="confirm-delete">
        Annuler
      </button>
      <button type="button" class="fr-btn fr-btn--danger">
        Confirmer la suppression
      </button>
    </div>
  </div>
</dialog>
```

### Onglets
```html
<div class="fr-tabs">
  <ul class="fr-tabs__list" role="tablist" aria-label="Sections de l'habilitation">
    <li role="presentation">
      <button class="fr-tabs__tab" role="tab"
              aria-selected="true" aria-controls="panel-general" id="tab-general">
        Informations générales
      </button>
    </li>
    <li role="presentation">
      <button class="fr-tabs__tab" role="tab"
              aria-selected="false" aria-controls="panel-donnees" id="tab-donnees">
        Données demandées
      </button>
    </li>
  </ul>
  <div id="panel-general" class="fr-tabs__panel fr-tabs__panel--selected"
       role="tabpanel" aria-labelledby="tab-general">
    <!-- Contenu onglet 1 -->
  </div>
  <div id="panel-donnees" class="fr-tabs__panel"
       role="tabpanel" aria-labelledby="tab-donnees" hidden>
    <!-- Contenu onglet 2 -->
  </div>
</div>
```

### Accordéon
```html
<section class="fr-accordion">
  <h3 class="fr-accordion__title">
    <button class="fr-accordion__btn" aria-expanded="false"
            aria-controls="accordion-content-1">
      Cadre juridique
    </button>
  </h3>
  <div class="fr-collapse" id="accordion-content-1">
    <p>Contenu de l'accordéon...</p>
  </div>
</section>
```

---

## Tableaux

### Tableau complexe avec en-têtes multiples
```html
<table>
  <caption>
    Historique des demandes d'habilitation
    <span class="fr-hint-text">Triées par date de modification décroissante</span>
  </caption>
  <thead>
    <tr>
      <th scope="col">Intitulé</th>
      <th scope="col">API</th>
      <th scope="col">
        Statut
        <button aria-label="Trier par statut" aria-sort="none">↕</button>
      </th>
      <th scope="col">Dernière modification</th>
      <th scope="col"><span class="fr-sr-only">Actions</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Habilitation DINUM 2024</th>
      <td>API Particulier</td>
      <td>
        <span class="fr-badge fr-badge--success">Validée</span>
        <span class="fr-sr-only">Validée</span>
      </td>
      <td>
        <time datetime="2024-03-15">15 mars 2024</time>
      </td>
      <td>
        <a href="/habilitations/1" class="fr-link">
          Consulter
          <span class="fr-sr-only"> l'habilitation DINUM 2024</span>
        </a>
      </td>
    </tr>
  </tbody>
</table>
```

---

## Images et médias

### Image complexe avec description longue
```html
<!-- Graphique avec description détaillée -->
<figure>
  <img src="graphique-stats.png"
       alt="Graphique des habilitations par mois"
       aria-describedby="graphique-desc">
  <figcaption id="graphique-desc">
    En 2024, les habilitations ont augmenté de 45% entre janvier (120) et
    décembre (174), avec un pic en juin (198).
  </figcaption>
</figure>
```

### Vidéo accessible
```html
<video controls aria-label="Tutoriel de demande d'habilitation">
  <source src="tutoriel.mp4" type="video/mp4">
  <track kind="captions" src="captions-fr.vtt" srclang="fr"
         label="Sous-titres français" default>
  <track kind="descriptions" src="descriptions-fr.vtt" srclang="fr"
         label="Audiodescription">
  <p>
    Votre navigateur ne supporte pas la vidéo HTML5.
    <a href="tutoriel.mp4" download>Télécharger la vidéo</a>
  </p>
</video>
```

---

## Cas limites

### Composant tiers non accessible — stratégie de contournement
Quand un composant tiers n'expose pas les bonnes API ARIA, encapsuler avec un wrapper accessible.

```html
<!-- Composant tiers opaque (ex: datepicker JS) -->
<div class="date-picker-wrapper">
  <label for="date-accessible">Date de début</label>
  <!-- Champ natif visible et accessible en backup -->
  <input type="date" id="date-accessible" name="date_start"
         aria-describedby="date-hint">
  <p id="date-hint" class="fr-hint-text">Format : JJ/MM/AAAA</p>
  <!-- Composant tiers caché aux AT si non accessible -->
  <div aria-hidden="true" class="fancy-datepicker">...</div>
</div>
```

### Filtrage dynamique avec annonce du nombre de résultats
```html
<!-- Zone de recherche -->
<div role="search">
  <label for="search-input">Rechercher une habilitation</label>
  <input type="search" id="search-input"
         aria-controls="results-list"
         aria-describedby="results-count">
</div>

<!-- Annonce du nombre de résultats (mis à jour en JS) -->
<p id="results-count" role="status" aria-live="polite" aria-atomic="true">
  12 habilitations trouvées
</p>

<!-- Liste de résultats -->
<ul id="results-list">...</ul>
```

```javascript
// Mettre à jour après filtrage
function updateResults (count) {
  document.getElementById('results-count').textContent =
    `${count} habilitation${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''}`
}
```

### Chargement asynchrone (fetch / SPA)

```html
<!-- Indiquer le chargement -->
<div aria-live="polite" aria-busy="true" id="content-area">
  <p class="fr-sr-only">Chargement en cours…</p>
</div>

<!-- Une fois chargé -->
<div aria-live="polite" aria-busy="false" id="content-area">
  <!-- Nouveau contenu -->
</div>
```

```javascript
async function loadContent (url) {
  const area = document.getElementById('content-area')
  area.setAttribute('aria-busy', 'true')
  try {
    const html = await fetch(url).then((response) => response.text())
    area.innerHTML = html
  } finally {
    area.setAttribute('aria-busy', 'false')
  }
}
```

Implémentation React → [react-patterns.md](react-patterns.md) §Chargement asynchrone.

### Bouton de suppression dans une liste — context explicite
```html
<!-- Problème : "Supprimer" répété est ambigu pour les lecteurs d'écran -->
<ul>
  <li>
    Habilitation API Particulier
    <button type="button">Supprimer</button> <!-- ❌ ambigu -->
  </li>
  <li>
    Habilitation API Entreprise
    <button type="button">Supprimer</button> <!-- ❌ ambigu -->
  </li>
</ul>

<!-- Solution 1 : aria-label -->
<button type="button"
        aria-label="Supprimer l'habilitation API Particulier">
  Supprimer
</button>

<!-- Solution 2 : fr-sr-only (visible à l'écran + lecteur d'écran) -->
<button type="button">
  Supprimer
  <span class="fr-sr-only"> l'habilitation API Particulier</span>
</button>

<!-- Solution 3 : aria-describedby (intitulé + contexte séparés) -->
<li id="hab-1">
  <span id="hab-1-name">Habilitation API Particulier</span>
  <button type="button" aria-describedby="hab-1-name">Supprimer</button>
</li>
```

### Tableau avec actions par ligne — colonne « Actions »
```html
<table>
  <thead>
    <tr>
      <th scope="col">Intitulé</th>
      <th scope="col">
        <!-- « Actions » visible uniquement pour lecteurs d'écran -->
        <span class="fr-sr-only">Actions disponibles</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row" id="row-hab-1">API Particulier — DINUM</th>
      <td>
        <a href="/habilitations/1" aria-describedby="row-hab-1">Consulter</a>
        <button type="button" aria-describedby="row-hab-1">Modifier</button>
      </td>
    </tr>
  </tbody>
</table>
```

### État de chargement d'un bouton (submit)
```html
<!-- État initial -->
<button type="submit" id="submit-btn">
  Soumettre la demande
</button>

<!-- État chargement (en JS après clic) -->
<button type="submit" id="submit-btn"
        aria-disabled="true"
        aria-describedby="submit-status">
  <span class="fr-icon-refresh-line" aria-hidden="true"></span>
  Envoi en cours…
</button>
<span id="submit-status" class="fr-sr-only" role="status" aria-live="polite">
  Envoi de la demande en cours, veuillez patienter.
</span>
```

### Champ de recherche avec suggestions (autocomplete/combobox)
Pattern ARIA 1.2 : `role="combobox"` directement sur l'`<input>` (pas sur un div wrapper).

```html
<div>
  <label class="fr-label" for="search-org">Organisation</label>
  <input class="fr-input" type="text" id="search-org"
         role="combobox"
         aria-expanded="false"
         aria-autocomplete="list"
         aria-controls="suggestions-list"
         autocomplete="off">

  <ul id="suggestions-list"
      role="listbox"
      aria-label="Suggestions d'organisations"
      hidden>
  </ul>
</div>
```

```javascript
const input = document.getElementById('search-org')
const listbox = document.getElementById('suggestions-list')
let selectedIndex = -1

function options () {
  return [...listbox.querySelectorAll('[role="option"]')]
}

function open () {
  input.setAttribute('aria-expanded', 'true')
  listbox.hidden = false
}

function close () {
  input.setAttribute('aria-expanded', 'false')
  listbox.hidden = true
  selectedIndex = -1
  input.removeAttribute('aria-activedescendant')
}

input.addEventListener('input', async () => {
  const query = input.value.trim()
  if (query.length < 2) { close(); return }
  const results = await fetch(`/search?q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json' }
  }).then((response) => response.json())
  listbox.innerHTML = results.map((result, index) =>
    `<li role="option" id="opt-${index}" aria-selected="false">${result.label}</li>`
  ).join('')
  selectedIndex = -1
  open()
})

input.addEventListener('keydown', (event) => {
  const items = options()
  if (!items.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex = Math.max(selectedIndex - 1, 0)
  } else if (event.key === 'Enter' && selectedIndex >= 0) {
    event.preventDefault()
    input.value = items[selectedIndex].textContent.trim()
    close()
    return
  } else if (event.key === 'Escape') {
    close()
    return
  } else {
    return
  }
  items.forEach((item, index) => {
    item.setAttribute('aria-selected', index === selectedIndex)
  })
  input.setAttribute('aria-activedescendant', items[selectedIndex]?.id || '')
})
```

Implémentation React → [react-patterns.md](react-patterns.md) §Combobox.

### Erreurs de formulaire — récapitulatif en haut de page
```html
<!-- Après soumission avec erreurs -->
<div role="alert" aria-labelledby="error-summary-title" class="fr-alert fr-alert--error">
  <h2 id="error-summary-title" class="fr-alert__title">
    Erreur — 3 problèmes à corriger
  </h2>
  <ul>
    <li><a href="#nom">Le nom de famille est obligatoire</a></li>
    <li><a href="#email">L'adresse e-mail est invalide</a></li>
    <li><a href="#siret">Le numéro SIRET doit comporter 14 chiffres</a></li>
  </ul>
</div>

<!-- Les liens pointent vers les champs en erreur -->
<div class="fr-input-group fr-input-group--error">
  <label class="fr-label" for="nom">Nom de famille</label>
  <input class="fr-input fr-input--error" type="text" id="nom"
         aria-invalid="true" aria-describedby="nom-error">
  <p id="nom-error" class="fr-error-text">Le nom de famille est obligatoire</p>
</div>
```

### Navigation : menu actif avec aria-current
```html
<nav aria-label="Navigation principale">
  <ul>
    <li>
      <a href="/habilitations" aria-current="page"
         class="fr-nav__link">
        Habilitations
      </a>
    </li>
    <li>
      <a href="/profil" class="fr-nav__link">Mon profil</a>
    </li>
  </ul>
</nav>

<!-- Sous-menu : aria-current="true" sur le parent si enfant actif -->
<nav aria-label="Navigation principale">
  <ul>
    <li>
      <button aria-expanded="true" aria-current="true">
        Habilitations
      </button>
      <ul>
        <li><a href="/habilitations" aria-current="page">Liste</a></li>
        <li><a href="/habilitations/new">Nouvelle demande</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Skeleton loading accessible
```html
<!-- Pendant le chargement -->
<div aria-busy="true" aria-label="Chargement de la liste des habilitations">
  <div class="skeleton-row" aria-hidden="true"></div>
  <div class="skeleton-row" aria-hidden="true"></div>
  <div class="skeleton-row" aria-hidden="true"></div>
</div>

<!-- Une fois chargé (remplace le skeleton) -->
<div aria-busy="false">
  <table>...</table>
</div>
```

---

## Stepper multi-étapes

### Barre de progression DSFR (`fr-stepper`)

```html
<div class="fr-stepper">
  <h2 class="fr-stepper__title">
    <span class="fr-stepper__state">Étape 2 sur 4</span>
    Identification
  </h2>
  <p class="fr-stepper__details">
    <span class="fr-text--bold">Étape suivante :</span> Documents
  </p>
  <div class="fr-stepper__steps"
       data-fr-current-step="2"
       data-fr-steps="4"
       role="progressbar"
       aria-valuenow="2"
       aria-valuemin="1"
       aria-valuemax="4"
       aria-label="Progression : étape 2 sur 4">
  </div>
</div>
```

### Focus management entre étapes

Quand le contenu d'une étape est remplacé (navigation SPA / fetch), le focus doit aller sur le titre `<h1>` ou `<h2>` de la nouvelle étape.

```html
<h1 id="step-title" tabindex="-1" class="fr-h4">
  Identification
</h1>
```

```javascript
document.getElementById('step-title')?.focus()
```

Implémentation React → [react-patterns.md](react-patterns.md) §Stepper.

---

## Tableau triable

### Pattern complet avec `aria-sort` et annonce live

`aria-sort` se place sur le `<th>`, pas sur le bouton. Valeurs : `ascending`, `descending`, `none`.

```html
<div role="status" aria-live="polite" aria-atomic="true" class="fr-sr-only" id="sort-announcement">
</div>

<table>
  <caption>Liste des demandes</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="none">
        <button type="button" aria-label="Trier par intitulé">Intitulé</button>
      </th>
      <th scope="col" aria-sort="descending">
        <button type="button" aria-label="Trier par date, ordre croissant">Date</button>
      </th>
      <th scope="col">Statut</th>
      <th scope="col"><span class="fr-sr-only">Actions</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">API Particulier</th>
      <td><time datetime="2024-01-15">15 janv. 2024</time></td>
      <td><span class="fr-badge fr-badge--success">Validée</span></td>
      <td>
        <a href="/habilitations/1">
          Consulter
          <span class="fr-sr-only"> API Particulier</span>
        </a>
      </td>
    </tr>
  </tbody>
</table>
```

```javascript
function announceSort (column, direction) {
  const label = direction === 'asc' ? 'croissant' : 'décroissant'
  document.getElementById('sort-announcement').textContent =
    `Liste triée par ${column}, ordre ${label}`
}
```

Implémentation React (`aria-sort` contrôlé, annonce live) → [react-patterns.md](react-patterns.md) §Tableau triable.