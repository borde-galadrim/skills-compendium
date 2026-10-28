---
name: rgaa-audit
description: |
  Audit RGAA 4.1.2 — parcourt les 106 critères, analyse statiquement le code,
  puis lance une passe runtime navigateur (clavier, zoom 200 %, focus visible,
  contraste, reflow). Produit un rapport avec un statut C / NC / NA / NT pour
  chaque critère, des NC détaillées et des corrections groupées.
  Invoquer avec le chemin du fichier : rgaa-audit app/views/foo.html.erb
  (slash `/rgaa-audit` dans Claude Code et Cursor ; citer la skill par son nom dans Codex).
  Fonctionne en mode page (route ou gabarit) ou composant (composant réutilisable).
  Suit le RGAA 4.1.2 : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
# `paths:` est reconnu par Claude Code uniquement ; les autres harnais l'ignorent.
paths:
  - "app/views/**/*.erb"
  - "app/components/**/*.erb"
  - "app/components/**/*.rb"
  - "app/**/page.tsx"
  - "src/**/*.tsx"
  - "src/**/*.jsx"
---

# Audit RGAA 4.1.2 (rgaa-audit)

## Comment utiliser cette skill

```
rgaa-audit app/views/users/show.html.erb
rgaa-audit app/components/ban_form_component.html.erb
rgaa-audit app/page.tsx
```

Dépendance : cette skill renvoie vers `../rgaa-dev/impacts.md`. Si `rgaa-dev`
n'est pas installée à côté, la table d'impacts est absente : continuer, et
raisonner par impact à partir des exemples de la skill.

Référentiel : [references/criteres-rgaa-4.1.2.md](references/criteres-rgaa-4.1.2.md)
liste les 106 critères. C'est la source de vérité de la grille du rapport.

---

## Phase 1 — Parcours des 106 critères

Parcourir **tous** les critères de
[references/criteres-rgaa-4.1.2.md](references/criteres-rgaa-4.1.2.md), dans
l'ordre. Ne pas se limiter aux thèmes qui ont un pattern de détection : un
critère sans pattern reçoit tout de même un statut.

### Détection du mode et du contexte

**Mode :**
- route ou gabarit de page (`app/views/`, `app/**/page.tsx`, `pages/`, ou URL
  rendue par un CMS) → **mode page** : les critères 8, 9, 10 et 12 sont évalués
  au niveau de la page ;
- composant réutilisable (`app/components/`, `components/`, `src/components/`)
  → **mode composant** : les critères de page sont listés dans « Limites du
  mode composant » du rapport, avec le statut `NT` et la raison
  `hors périmètre composant`.

Si le mode n'est pas clair, demander à l'humain avant de continuer.

**Contexte de la description (pour le rapport) :** inférer depuis le chemin
(`admin/` → interface admin, `instruction/` → interface instructeur,
`users/` → espace utilisateur). Sinon laisser vide.

### Pour chaque critère, un statut unique

| Statut | Sens | Preuve obligatoire |
|--------|------|--------------------|
| `C` | conforme | preuve (extrait de code, mesure, capture, liste de focus) |
| `NC` | non conforme | preuve + impact utilisateur concret |
| `NA` | non applicable | raison de non-applicabilité vérifiée sur le contenu |
| `NT` | non testé | raison : `humain requis`, `outil indisponible`, `hors périmètre composant`, `à confirmer`, `non exécuté` |

Règles :
- « à confirmer » est toujours `NT`, jamais `NC`.
- « non mesuré » est `NT`, jamais `NA`.
- Un critère de méthode `humain` dans le référentiel, sans pattern de
  détection, reçoit `NT` avec la raison `humain requis`, sauf si le code permet
  de trancher clairement.

### Règle de tri par impact _(à appliquer avant tout verdict)_

Le RGAA vérifie un défaut **restitué à l'utilisateur**. Avant de conclure,
raisonner par impact :

1. **Avant de conclure NC** — nommer l'impact concret : quel handicap, quel
   blocage, avec quel outil ? Si aucun impact réel n'existe, ce n'est pas une NC.
2. **Avant de conclure C** — avoir parcouru les tests du critère et vérifié
   qu'aucun pattern à risque n'est présent. Marquer C par défaut = faux négatif.
3. **Avant de conclure NA** — vérifier les conditions d'applicabilité du
   critère sur ce contenu, pas seulement qu'aucun élément n'a été trouvé.

Table des impacts par type de handicap : [../rgaa-dev/impacts.md](../rgaa-dev/impacts.md).

### Règles de détection particulières

**Règle NC 13.2 — nouvelle fenêtre :**
`target: '_blank'` avec `title` seul → NC 13.2. L'indication doit être dans le
contenu du lien (texte visible ou texte masqué visuellement).

**Règle 8.5 — titre de page :**
Si le titre est défini dans le code (`set_title!`, `<title>`, `metadata.title`)
→ 8.5 C. Sinon, lire `document.title` pendant la passe runtime. Ne pas poser
la question à l'humain si l'agent peut accéder à la page.

**Règle 6.1 et 6.2 — intitulés de liens :** une NC est une seule entrée dans
le rapport, avec la liste de ses occurrences. Ne pas compter chaque occurrence
comme une NC distincte.

---

## Phase 2 — Passe runtime navigateur (agent, pas l'humain)

Après la Phase 1, exécuter les tests runtime du référentiel (clavier, zoom,
focus, contraste, reflow, espacement, contenus au survol, orientation, médias,
raccourcis, mouvement). Ne pas les poser à l'humain tant qu'un navigateur ou
un outil d'automatisation déjà disponible peut être utilisé.

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
4. Si aucun outil navigateur n'est disponible, les tests runtime passent en
   `NT` avec la raison `outil indisponible`, et l'humain est invité à les faire.

### Résoudre l'URL

- Page : route de l'application correspondant au fichier audité.
- Composant : showcase, Storybook ou preview dédiée ; sinon page réelle qui
  le monte.
- Consulter `AGENTS.md` ou `references/runtime-urls.md` si le projet fournit
  une cartographie d'URL ; ne jamais inventer une route.
- Confirmer un origin vivant avant de commencer.
- En mode page, lire `document.title`.

**Critère de fin :** chaque test runtime a une preuve (liste des arrêts Tab,
mesure d'overflow, valeur de `document.title`, ratio de contraste, capture) ou
une raison `NT` : navigateur indisponible, URL absente, authentification
impossible ou session sans accès navigateur.

---

## Phase 3 — Vérifications et format de sortie

### Règles de comptage

- Chaque critère reçoit exactement un statut. Total : **C + NC + NA + NT = 106**.
- **Taux de conformité** = C / (C + NC), sur les critères testés et applicables.
  C'est la formule du RGAA. Le recalculer depuis les comptages, sans arrondi
  intermédiaire.
- **Couverture** = (C + NC + NA) / 106. L'afficher séparément du taux.
- Une NC regroupe toutes ses occurrences dans une seule entrée.

### Contrôle avant écriture

Avant d'écrire le rapport, vérifier :
- C + NC + NA + NT = 106 ;
- les totaux par thème correspondent aux totaux globaux ;
- chaque C et chaque NC a une preuve ;
- chaque NT a une raison ;
- l'en-tête (taux, couverture, comptages) correspond au tableau.

En cas d'écart, corriger le rapport avant de l'écrire.

### Choix du format

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
- Écrire le rapport Markdown dans `audits/rgaa-YYYY-MM-DD.md` à la racine du
  projet (créer `audits/` si besoin ; suffixe `-2`, `-3`… si le fichier existe).
- Le format du rapport est décrit dans
  [references/rapport-format.md](references/rapport-format.md). Il est conçu
  pour être lu aussi par d'autres agents : front matter YAML, identifiants de
  NC stables, grille des 106 critères.
- Si un JSON est demandé, l'écrire dans `audits/rgaa-YYYY-MM-DD.json` selon la
  section « Export JSON » de `rapport-format.md`.
- Si le harnais permet de publier un artefact, publier le rapport sous forme de
  page ; sinon écrire un `audits/rgaa-YYYY-MM-DD.html` autonome.
- Afficher le chemin et une synthèse en moins de 10 lignes dans la conversation.

---

## Contraintes obligatoires du rapport

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
5. Ne pas compter une absence de test comme un `C` ou un `NA`.

---

## Relier les tests runtime aux critères

- contrôle non atteignable ou clavier inopérant → NC 7.3 (ou 12.8 / 12.9 selon le cas) ;
- focus invisible → NC 10.7 ;
- contenu tronqué ou overflow à 200 % → NC 10.4 ;
- overflow à 320 px → NC 10.11 ;
- texte tronqué avec espacement WCAG → NC 10.12 ;
- contraste insuffisant → NC 3.2 (texte) ou 3.3 (composants) ;
- contenu au survol non atteignable → NC 10.13 / 10.14 / 12.11 ;
- orientation bloquée → NC 13.9 ;
- son automatique sans contrôle → NC 4.10 ;
- titre de page absent ou non pertinent → NC 8.5 / 8.6.

Ces défauts ne doivent pas rester dans une section « à vérifier manuellement ».

## Limites du mode composant _(si applicable)_

Ces critères nécessitent la page complète. Leur statut est `NT` avec la raison
`hors périmètre composant` :
- 8.5 `<title>` unique par page
- 8.3 `<html lang="fr">`
- 9.1 hiérarchie h1 globale
- 12.7 lien d'évitement présent
- 12.2 menu à la même place
