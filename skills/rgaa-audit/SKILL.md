---
name: rgaa-audit
description: |
  Audit RGAA 4.1.2 — parcourt les 106 critères : inventaire du DOM rendu,
  applicabilité, analyse statique du code, passe runtime navigateur
  (clavier, zoom 200 %, focus visible, contraste, reflow, mouvement) et
  jugement agent sur preuve pour les critères de pertinence. Produit un
  rapport avec un statut C / NC / NA / NT et une confiance pour chaque
  critère, des NC détaillées et des corrections groupées. Sortie en
  Markdown, artefact (page publiée), JSON, ou corrections directes.
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
liste les 106 critères avec leur méthode. C'est la source de vérité de la
grille du rapport.

**Objectif de couverture :** l'agent évalue lui-même tout ce qui peut l'être.
Un `NT` n'est acceptable que pour un test réellement hors de portée (lecteur
d'écran, visionnage complet d'un média, page inaccessible). La section
« Reste à faire » du rapport ne doit contenir que ces tests-là.

---

## Phase 0 — Cadrage

**Mode :**
- route ou gabarit de page (`app/views/`, `app/**/page.tsx`, `pages/`, ou URL
  rendue par un CMS) → **mode page** : les critères 8, 9, 10 et 12 sont évalués
  au niveau de la page ;
- composant réutilisable (`app/components/`, `components/`, `src/components/`)
  → **mode composant** : les critères de page sont listés dans « Limites du
  mode composant » du rapport, avec le statut `NT` et la raison
  `hors périmètre composant`.

Si le mode n'est pas clair, demander à l'humain avant de continuer.

**URL :**
- Page : route de l'application correspondant au fichier audité.
- Composant : showcase, Storybook ou preview dédiée ; sinon page réelle qui
  le monte.
- Consulter `AGENTS.md` ou `references/runtime-urls.md` si le projet fournit
  une cartographie d'URL ; ne jamais inventer une route.
- Confirmer un origin vivant avant de commencer.
- En mode page, choisir 2 ou 3 pages de comparaison parmi les liens du menu
  principal (critères d'ensemble de pages : 8.6, 11.3, 12.2, 12.4, 12.5).

**Moyen runtime — détecter, ne pas supposer :**
1. Sous Claude Code, Claude in Chrome dès qu'il est disponible : il pilote
   le navigateur de l'utilisateur, sessions comprises. Ses outils sont
   souvent chargés à la demande : **chercher dans les outils différés avant
   de conclure qu'aucun outil n'existe.** S'il n'est pas connecté, proposer
   à l'humain de le connecter.
2. Script runtime sans dépendance `scripts/rgaa-runtime.mjs`, si Node ≥ 22
   et un navigateur Chromium sont présents sur la machine. Avec Claude in
   Chrome, il complète les mesures par émulation que l'extension ne fournit
   pas.
3. Autre outil de pilotage navigateur du harnais (Cursor, Codex), lui aussi
   à chercher dans les outils différés.
4. Playwright ou Puppeteer déjà installé dans le projet.
5. Ne pas installer de dépendance dans le projet. Utiliser un navigateur
   déjà présent sur la machine n'est pas une installation.

Détails, commandes et correspondance capacité → outil :
[references/runtime-browser.md](references/runtime-browser.md).

**Contexte de la description (pour le rapport) :** inférer depuis le chemin
(`admin/` → interface admin, `instruction/` → interface instructeur,
`users/` → espace utilisateur). Sinon laisser vide.

---

## Phase 1 — Inventaire et applicabilité

1. **Obtenir l'inventaire du DOM rendu** : évaluer `scripts/inventaire.js`
   dans le navigateur piloté (Claude in Chrome en priorité) ou lancer le
   script runtime (clé `inventory` de `runtime.json`). Sans navigateur,
   appliquer la même liste de contrôle au HTML rendu (requête HTTP) et au
   source.
2. **Trancher l'applicabilité** de chaque critère avec la table des
   déclencheurs : sans déclencheur, le critère est `NA` avec la preuve
   « aucun <déclencheur> (compte = 0) ». Un déclencheur présent rend le
   critère applicable : il ne peut plus être `NA`.

Correspondance clé → critère et déclencheurs :
[references/inventaire-applicabilite.md](references/inventaire-applicabilite.md).

---

## Phase 2 — Évaluation des 106 critères

Parcourir **tous** les critères du référentiel, dans l'ordre. Chaque critère
applicable est évalué selon sa méthode :

| Méthode | Source de preuve | Référence |
|---------|------------------|-----------|
| `statique` | inventaire, HTML rendu, source | [inventaire-applicabilite.md](references/inventaire-applicabilite.md), fichiers de thème |
| `runtime` | navigateur piloté (Claude in Chrome en priorité) et script runtime | [runtime-browser.md](references/runtime-browser.md) |
| `agent` | capture, texte, arbre d'accessibilité | [jugement-agent.md](references/jugement-agent.md) |
| `humain` | personne, lecteur d'écran | protocole dans « Reste à faire » |

Fichiers de thème (patterns de détection et corrections) :
[images-cadres-couleurs.md](references/images-cadres-couleurs.md),
[multimedia-tableaux-liens-scripts.md](references/multimedia-tableaux-liens-scripts.md),
[structure-presentation.md](references/structure-presentation.md),
[formulaires.md](references/formulaires.md),
[navigation-consultation.md](references/navigation-consultation.md).

Le script runtime et l'inventaire donnent la position dans le DOM ; chercher
ensuite le `fichier:ligne` dans le source pour la correction.

### Pour chaque critère, un statut unique et une confiance

| Statut | Sens | Preuve obligatoire |
|--------|------|--------------------|
| `C` | conforme | preuve (extrait de code, mesure, capture, liste de focus) + confiance |
| `NC` | non conforme | preuve + impact utilisateur concret + confiance |
| `NA` | non applicable | absence du déclencheur, vérifiée sur l'inventaire ou le contenu |
| `NT` | non testé | raison : `humain requis`, `outil indisponible`, `hors périmètre composant`, `à confirmer`, `non exécuté` |

Confiance d'un `C` ou `NC` : `mesuré` (constat outillé ou lecture du code),
`jugement agent` (verdict sur preuve visible, à valider), `humain`.

Règles :
- **Un critère `statique` n'est jamais `NT` « outil indisponible »** : le
  HTML rendu ou le source suffit. « Outil indisponible » est réservé aux
  critères `runtime`.
- **Un critère `agent` est tranché par l'agent** dès qu'il a la preuve
  visible (capture, texte, arbre d'accessibilité), en suivant les règles de
  décision de [jugement-agent.md](references/jugement-agent.md). Il reste
  `NT` seulement si la preuve manque (`humain requis`) ou si le doute est
  réel (`à confirmer`, avec la question à trancher).
- « à confirmer » est toujours `NT`, jamais `NC`.
- « non mesuré » est `NT`, jamais `NA`.
- Un indice axe-core n'est pas un verdict : le confirmer dans le DOM ou le
  source avant de conclure. L'absence d'indice axe ne suffit pas à conclure
  `C`.

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

### Relier les tests runtime aux critères

- contrôle non atteignable ou clavier inopérant → NC 7.3 (ou 12.8 / 12.9 selon le cas) ;
- focus sur un contenu masqué ou `aria-hidden` → NC 10.8 / 12.8 ;
- focus invisible → NC 10.7 ;
- contenu tronqué ou overflow à 200 %, zoom bloqué par `meta viewport` → NC 10.4 ;
- overflow à 320 px → NC 10.11 ;
- texte tronqué avec espacement WCAG → NC 10.12 ;
- contenu perdu sans CSS → NC 10.2 ;
- contraste insuffisant → NC 3.2 (texte) ou 3.3 (composants) ;
- contenu au survol non atteignable → NC 10.13 / 10.14 / 12.11 ;
- carrousel ou animation de plus de 5 s sans pause → NC 13.8 ;
- orientation bloquée → NC 13.9 ;
- son automatique sans contrôle → NC 4.10 ;
- menu qui change de place d'une page à l'autre → NC 12.2 ;
- titre de page absent ou non pertinent → NC 8.5 / 8.6.

Ces défauts ne doivent pas rester dans une section « à vérifier manuellement ».

**Critère de fin de la Phase 2 :** chaque critère a un statut ; chaque test
runtime a une preuve (liste des arrêts Tab, mesure d'overflow, valeur de
`document.title`, ratio de contraste, capture) ou une raison `NT` :
navigateur indisponible, URL absente, authentification impossible ou
session sans accès navigateur.

---

## Phase 3 — Vérifications et format de sortie

### Règles de comptage

- Chaque critère reçoit exactement un statut. Total : **C + NC + NA + NT = 106**.
- **Taux de conformité** = C / (C + NC), sur les critères testés et applicables.
  C'est la formule du RGAA. Le recalculer depuis les comptages, sans arrondi
  intermédiaire.
- **Couverture** = (C + NC + NA) / 106. L'afficher séparément du taux.
- **Jugement agent** : nombre de C et NC en confiance `jugement agent`,
  affiché à côté du taux.
- Une NC regroupe toutes ses occurrences dans une seule entrée.

### Contrôle avant écriture

Avant d'écrire le rapport, vérifier :
- C + NC + NA + NT = 106 ;
- les totaux par thème correspondent aux totaux globaux ;
- chaque C et chaque NC a une preuve et une confiance ;
- chaque NA cite le déclencheur absent ;
- chaque NT a une raison, et aucun critère `statique` n'est NT
  « outil indisponible » ;
- chaque NC a une vérification propre à son défaut (pas de phrase générique
  recopiée) ;
- « Reste à faire » ne contient que des tests hors de portée de l'agent,
  chacun avec un protocole ;
- l'en-tête (taux, couverture, comptages) correspond au tableau.

En cas d'écart, corriger le rapport avant de l'écrire.

### Choix du format

```
Audit terminé. Comment veux-tu le résultat ?

1. Rapport Markdown complet sauvegardé dans audits/
2. Artefact : page interactive publiée (filtres, NC copiables)
3. Corrections directes maintenant (on corrige dans les fichiers)
4. Rapport Markdown + artefact + corrections immédiates
```

Si l'agent dispose d'un outil de question structurée (QCM), l'utiliser pour
poser ce choix. Sinon, poser la question en texte simple, avec les options
numérotées. Ne proposer l'option 2 que si le harnais permet de publier un
artefact ; sinon la remplacer par « Page HTML autonome dans audits/ ».

Rapport Markdown (options 1 et 4) :
- Écrire le rapport dans `audits/rgaa-YYYY-MM-DD.md` à la racine du projet
  (créer `audits/` si besoin ; suffixe `-2`, `-3`… si le fichier existe).
- Le format est décrit dans
  [references/rapport-format.md](references/rapport-format.md). Il est conçu
  pour être lu aussi par d'autres agents : front matter YAML, identifiants de
  NC stables, grille des 106 critères.
- Si un JSON est demandé, l'écrire dans `audits/rgaa-YYYY-MM-DD.json` selon la
  section « Export JSON » de `rapport-format.md`.

Artefact (options 2 et 4) :
- Remplir le gabarit [assets/rapport-artefact.html](assets/rapport-artefact.html)
  (bloc `DONNÉES` seulement) et le publier comme artefact, selon la section
  « Artefact » de `rapport-format.md`. Donner le lien.
- Sans capacité de publication : écrire le même fichier en
  `audits/rgaa-YYYY-MM-DD.html`.

Dans tous les cas, afficher le chemin ou le lien et une synthèse en moins de
10 lignes dans la conversation.

Les captures et le `runtime.json` du script runtime restent dans le dossier
`--out` (par défaut `audits/runtime-YYYY-MM-DD/`) : le rapport y renvoie
comme preuves.

---

## Contraintes obligatoires du rapport

### MUST

1. Toujours citer le critère RGAA relié à chaque NC ou recommandation.
2. Toujours proposer au moins un test de vérification par correction, propre
   au défaut.
3. Toujours expliquer l'impact utilisateur (pas seulement l'impact technique).
4. Toujours privilégier une solution sémantique avant une surcouche ARIA.
5. Toujours indiquer la confiance de chaque verdict.

### MUST NOT

1. Ne pas utiliser de `tabindex` positif (`tabindex="1+"`) sauf cas exceptionnel justifié.
2. Ne pas supprimer l'indicateur de focus sans alternative visible.
3. Ne pas s'appuyer uniquement sur la couleur pour transmettre une information.
4. Ne pas annoncer « conforme RGAA » sans preuves de tests.
5. Ne pas compter une absence de test comme un `C` ou un `NA`.
6. Ne pas présenter un verdict en `jugement agent` comme une mesure.

## Limites du mode composant _(si applicable)_

Ces critères nécessitent la page complète. Leur statut est `NT` avec la raison
`hors périmètre composant` :
- 8.5 `<title>` unique par page
- 8.3 `<html lang="fr">`
- 9.1 hiérarchie h1 globale
- 12.7 lien d'évitement présent
- 12.2 menu à la même place
