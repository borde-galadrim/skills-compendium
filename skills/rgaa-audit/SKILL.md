---
name: rgaa-audit
description: |
  Audit RGAA 4.1.2 — analyse statique du code puis passe runtime navigateur
  (clavier, zoom 200%, focus visible). Produit un rapport C/NC/NA par thème,
  avec NC détaillées et corrections groupées.
  Invoquer avec le chemin du fichier : rgaa-audit app/views/foo.html.erb
  (slash `/rgaa-audit` dans Claude Code et Cursor ; citer la skill par son nom dans Codex).
  Fonctionne en mode page (app/views/) ou composant (app/components/).
  Suit le RGAA 4.1.2 : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
# `paths:` est reconnu par Claude Code uniquement ; les autres harnais l'ignorent.
paths:
  - "app/views/**/*.erb"
  - "app/components/**/*.erb"
  - "app/components/**/*.rb"
---

# Audit RGAA 4.1.2 (rgaa-audit)

## Comment utiliser cette skill

```
rgaa-audit app/views/users/show.html.erb
rgaa-audit app/components/ban_form_component.html.erb
```

Dépendance : cette skill renvoie vers `../rgaa-dev/impacts.md`. Si `rgaa-dev`
n'est pas installée à côté, la table d'impacts est absente : continuer, et
raisonner par impact à partir des exemples de la skill.

---

## Phase 1 — Analyse statique silencieuse

Lire le code et **détecter directement les NC** sans poser de questions, en appliquant les critères RGAA pertinents.

### Détection du mode et du contexte

**Mode :**
- `app/views/` → **mode page** (thèmes 8 et 12 actifs)
- `app/components/` → **mode composant** (thèmes 8 et 12 désactivés)

**Contexte de la description (pour le rapport) :**
Inférer depuis le chemin du fichier :
- `admin/` → `(interface admin)`
- `instruction/` → `(interface instructeur)`
- `components/` → `(composant)`
- `users/` → `(espace utilisateur)`
- Sinon → laisser vide

### Critères à analyser par thème

Consulter les fichiers de référence pour les patterns de détection, non-conformités type et corrections ERB/DSFR :

| Thèmes | Fichier de référence | Ce qu'on cherche |
|--------|----------------------|-----------------|
| 1–3 Images, Cadres, Couleurs | [references/images-cadres-couleurs.md](references/images-cadres-couleurs.md) | `<img>` sans `alt` ; SVG sans `aria-hidden` ; `<iframe>` sans `title` ; info par couleur seule |
| 4–7 Multimédia, Tableaux, Liens, Scripts | [references/multimedia-tableaux-liens-scripts.md](references/multimedia-tableaux-liens-scripts.md) | `<video>` sans `<track>` ; `<th>` sans `scope` ; liens ambigus ou vides ; `target="_blank"` sans indication AT ; `<div onclick>` |
| 8–10 Éléments obligatoires, Structure, Présentation | [references/structure-presentation.md](references/structure-presentation.md) | `set_title!` absent ; hiérarchie titres ; landmarks ; `outline: none` ; zoom 200% |
| 11 Formulaires | [references/formulaires.md](references/formulaires.md) | `<input>` sans label ; erreurs sans `aria-invalid` + `aria-describedby` ; champs obligatoires |
| 12–13 Navigation, Consultation | [references/navigation-consultation.md](references/navigation-consultation.md) | Liens d'évitement ; `aria-current="page"` ; nouvelle fenêtre ; PDF sans alternative |

**Règle NC 6 / 13 — nouvelle fenêtre :**
`target: '_blank'` avec `title` seul → NC 13.2. L'indication doit être dans le contenu du lien (texte visible ou `fr-sr-only`).

**Règle NC 8.5 — titre de page :**
Si `set_title!` est présent dans le code → critère 8.5 C.
Si absent en mode page → lire `document.title` pendant la passe runtime.
Ne pas poser la question si l'agent peut accéder à la page.

### Règle de tri par impact _(à appliquer avant tout verdict)_

Le RGAA vérifie un défaut **restitué à l'utilisateur**. Avant de conclure, raisonner par impact — pas par récitation de règle :

1. **Avant de conclure NC** — nommer l'impact concret : *quel handicap, quel blocage, avec quel outil ?* Si aucun impact réel n'existe (élément purement décoratif, règle non applicable au cas), ce **n'est pas une NC** — classer C ou NA selon le cas, pas NC.
2. **Avant de conclure C** — ne pas se contenter de l'absence de défaut visible. Avoir parcouru les tests du critère et vérifié qu'aucun pattern à risque n'est présent. Marquer C par défaut = faux négatif.
3. **Avant de conclure NA** — vérifier que le critère ne s'applique vraiment pas à ce contenu (conditions d'applicabilité), pas seulement qu'on n'a rien trouvé.

Table des impacts par type de handicap : [../rgaa-dev/impacts.md](../rgaa-dev/impacts.md).

---

## Phase 2 — Passe runtime navigateur (agent, pas l'humain)

Après la Phase 1, **exécuter** les trois tests runtime. Ne pas les poser à
l'humain tant qu'un navigateur ou un outil d'automatisation déjà disponible
peut être utilisé.

Procédure détaillée :
[references/runtime-browser.md](references/runtime-browser.md)

### Choisir l'outil — détecter, ne pas supposer

1. Utiliser la première capacité de pilotage navigateur disponible dans la
   session : Claude in Chrome, navigateur intégré de Cursor, ou Playwright MCP
   / navigateur Codex. Le tableau de correspondance est dans
   [references/runtime-browser.md](references/runtime-browser.md).
2. Sinon, utiliser Playwright ou Puppeteer s'il est déjà installé ou configuré
   dans le projet.
3. Ne pas installer Playwright, Puppeteer ou une nouvelle dépendance
   automatiquement.
4. Si aucun outil navigateur n'est disponible, demander à l'humain
   d'effectuer les trois tests.

### Résoudre l'URL

- Page : route de l'application correspondant au fichier audité.
- Composant : showcase, Storybook ou preview dédiée ; sinon page réelle qui
  le monte.
- Consulter `AGENTS.md` ou `references/runtime-urls.md` si le projet fournit
  une cartographie d'URL spécifique ; ne jamais inventer une route.
- Confirmer un origin vivant avant de commencer.
- En mode page, lire `document.title`.
- Si aucune URL ou aucun serveur vivant n'est disponible : le noter, proposer
  le fallback Playwright/Puppeteer s'il existe, sinon demander les tests à
  l'humain et continuer le rapport.

**Critère de fin :** chaque test possède une preuve — liste des focus,
mesure d'overflow, valeur de `document.title` ou capture — ou une raison
d'échec outillée : navigateur indisponible, URL absente, authentification
impossible ou session sans accès navigateur (lecture seule).

Les résultats C/NC ne peuvent être cochés qu'avec une preuve. Sans preuve,
le résultat est `non exécuté`.

---

## Phase 3 — Choix du format de sortie

```
Audit terminé. Comment veux-tu le résultat ?

1. Rapport Markdown complet sauvegardé dans audits/
2. Corrections directes maintenant (on corrige dans les fichiers)
3. Les deux — rapport sauvegardé + corrections immédiates
```

Si l'agent dispose d'un outil de question structurée (QCM), l'utiliser pour
poser ce choix. Sinon, poser la question en texte simple, avec les trois
options numérotées.

Si l'option 1 ou 3 est choisie :
- Créer le dossier `audits/` à la racine du projet s'il n'existe pas
- Écrire le rapport dans `audits/rgaa-YYYY-MM-DD.md`
- Si un fichier du même nom existe déjà, ajouter un suffixe incrémental : `rgaa-2026-04-22-2.md`
- Afficher le chemin et une synthèse en moins de 10 lignes dans la conversation

---

## Contraintes obligatoires du rapport

Ces règles s'appliquent à tout le rapport.

### MUST

1. Toujours citer le critère RGAA relié à chaque NC ou recommandation.
2. Toujours proposer au moins un test de vérification par correction.
3. Toujours expliquer l'impact utilisateur (pas seulement l'impact technique).
4. Toujours privilégier une solution sémantique avant une surcouche ARIA.

### MUST NOT

1. Ne pas utiliser de `tabindex` positif (`tabindex="1+"`) sauf cas exceptionnel justifié.
2. Ne pas supprimer l'indicateur de focus sans alternative visible.
3. Ne pas s'appuyer uniquement sur la couleur pour transmettre une information.
4. Ne pas annoncer « conforme RGAA » sans preuves de tests.

---

## Structure du rapport Markdown (option 1 ou 3)

```markdown
## Audit RGAA 4.1.2 — Rapport de conformité

**Date :** JJ/MM/AAAA
**Périmètre audité :** `chemin/du/fichier.html.erb` — description fonctionnelle (contexte) · Mode : page | composant
**Résultat global :** X% conforme sur les critères applicables
(N critères applicables — N conformes, N non conformes, N non applicables)

---

### Tableau de synthèse

| Thème | C | NC | NA |
|-------|---|----|----|
| 1. Images | | | |
| 2. Cadres | | | |
| 3. Couleurs | | | |
| 4. Multimédia | | | |
| 5. Tableaux | | | |
| 6. Liens | | | |
| 7. Scripts | | | |
| 8. Éléments obligatoires | | | |
| 9. Structuration | | | |
| 10. Présentation | | | |
| 11. Formulaires | | | |
| 12. Navigation | | | |
| 13. Consultation | | | |
| **Total** | | | |

---

### Non-conformités détectées

**[NC] X.Y — Intitulé du critère**
- **Élément concerné :** extrait de code ou `fichier:ligne` — ex : `link_to data_provider.link, data_provider.link, target: '_blank'` (ligne 26)
- **Problème :** explication du *pourquoi* c'est une violation — pas juste le *quoi*. Ex : « Le texte du lien EST l'URL brute. Une URL n'est pas un intitulé explicite : elle ne décrit pas la destination de façon compréhensible. L'attribut `title` ajoute le nom, mais le `title` n'est pas l'intitulé accessible quand du texte est présent. »
- **Impact utilisateur :** quel handicap est touché et quel blocage concret, avec quel outil — c'est ce qui justifie que ce soit bien une NC. Ex : « Cécité (lecteur d'écran) — le lien est restitué "h-t-t-p-s deux-points slash slash…" caractère par caractère, la destination est inintelligible. » Voir [../rgaa-dev/impacts.md](../rgaa-dev/impacts.md).
- **Correction :**
  ```erb
  exemple de correction ERB/DSFR immédiatement applicable
  ```
- **Priorité :** 🔴 Bloquant / 🟠 Majeur / 🟡 Mineur

---

### Correction groupée recommandée _(si plusieurs NC partagent le même élément source)_

Quand plusieurs NC portent sur le même bout de code, proposer une correction unique qui les résout toutes :

**NC X.Y + X.Z — résolution en une modification**

```erb
<%# Avant %>
<ancien code>

<%# Après %>
<nouveau code corrigeant les deux NC>
```

---

### Critères conformes

- **X.Y** — justification courte
- **X.Z** — justification courte

### Critères non applicables

- **X.Y–X.Z** — justification courte (ex : aucune image, pas de formulaire…)
- **X.Y** — critère de layout géré globalement

### Vérifications runtime

| Test | Résultat | Source | Preuve |
|------|----------|--------|--------|
| Clavier | C / NC / non exécuté | Claude in Chrome / Cursor browser / Codex browser/Playwright MCP / Playwright / Puppeteer / humain | N arrêts Tab, défauts observés |
| Zoom 200% | C / NC / non exécuté | Claude in Chrome / Cursor browser / Codex browser/Playwright MCP / Playwright / Puppeteer / humain | `scrollWidth`, mesures d'overflow, captures |
| Focus visible | C / NC / non exécuté | Claude in Chrome / Cursor browser / Codex browser/Playwright MCP / Playwright / Puppeteer / humain | N contrôles inspectés, captures, défauts |

En mode page, consigner également la valeur de `document.title` pour le
critère 8.5.

Limites : pas de lecteur d'écran ; `style.zoom` est une approximation du
zoom navigateur si aucun facteur CDP ou zoom Chrome réel n'a été utilisé.

Relier les résultats aux verdicts RGAA :

- défaut clavier → NC 7.1 ;
- contenu tronqué ou overflow à 200 % → NC 10.4 ;
- absence d'indicateur de focus → NC 10.7 ;
- largeur 320 px non adaptée → NC 10.11.

Ces défauts ne doivent pas rester uniquement dans une section « à vérifier
manuellement ».

### Limites du mode composant _(si applicable)_

Ces critères nécessitent la page complète pour être évalués :
- [8.5] `<title>` unique par page
- [8.3] `<html lang="fr">`
- [9.1] Hiérarchie h1 globale
- [12.1] Lien d'évitement présent
- [12.2] `aria-current="page"` dans le menu
```
