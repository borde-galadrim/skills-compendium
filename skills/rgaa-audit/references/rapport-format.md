# Format du rapport RGAA

Ce format est lu par des humains et par d'autres agents. Garder les
identifiants, les libellés de champs et les statuts exactement comme ci-dessous.

## Statuts

| Statut | Sens |
|--------|------|
| `C` | conforme, avec preuve |
| `NC` | non conforme, avec preuve et impact |
| `NA` | non applicable, avec raison |
| `NT` | non testé, avec raison |

Raisons possibles pour `NT` : `humain requis`, `outil indisponible`,
`hors périmètre composant`, `à confirmer`, `non exécuté`.

`outil indisponible` ne s'applique qu'aux critères `runtime`. Un critère
`statique` est toujours évaluable sur le HTML rendu ou le source.

## Confiance

Chaque `C` et chaque `NC` porte une confiance :

| Confiance | Sens |
|-----------|------|
| `mesuré` | constat outillé ou lecture directe du code (inventaire, mesure runtime, extrait de source) |
| `jugement agent` | verdict de l'agent sur preuve visible, selon [jugement-agent.md](jugement-agent.md) ; à valider par une personne |
| `humain` | constat fait par une personne pendant l'audit |

`NA` porte la preuve d'absence du déclencheur
([inventaire-applicabilite.md](inventaire-applicabilite.md)). `NT` n'a pas de
confiance.

## Calculs

- Total : C + NC + NA + NT = 106.
- Taux de conformité = C / (C + NC).
- Couverture = (C + NC + NA) / 106.
- Part en jugement agent = nombre de C et NC en `jugement agent`, affiché à
  côté du taux (« dont N verdicts en jugement agent, à valider »).

## Partie 1 — Markdown

### Front matter

```yaml
---
rgaa_version: "4.1.2"
skill_version: "<version de la skill>"
date: "AAAA-MM-JJ"
scope:
  url: "<url auditée ou vide>"
  files: ["chemin/du/fichier.html.erb"]
  mode: "page | composant"
  stack: "<rails | next | autre>"
commit: "<sha git ou vide>"
tools:
  runtime: "<Claude in Chrome | rgaa-runtime.mjs | Cursor browser | Codex browser/Playwright MCP | Playwright | Puppeteer | humain | aucun ; joindre par « + » si combinés>"
  inventaire: "<rgaa-runtime.mjs | navigateur piloté | manuel (HTML rendu + source)>"
  axe: "<version d'axe-core ou vide>"
  pages_comparees: ["<url2>", "<url3>"]
counts: { C: 0, NC: 0, NA: 0, NT: 0 }
confiance: { mesure: 0, jugement_agent: 0, humain: 0 }
taux_conformite: 0.00
couverture: 0.00
---
```

### Synthèse

Une phrase de contexte, puis le tableau par thème. Les totaux par thème
doivent correspondre aux totaux du front matter.

| Thème | C | NC | NA | NT |
|-------|---|----|----|----|
| 1. Images (9) | | | | |
| 2. Cadres (2) | | | | |
| 3. Couleurs (3) | | | | |
| 4. Multimédia (13) | | | | |
| 5. Tableaux (8) | | | | |
| 6. Liens (2) | | | | |
| 7. Scripts (5) | | | | |
| 8. Éléments obligatoires (10) | | | | |
| 9. Structuration (4) | | | | |
| 10. Présentation (14) | | | | |
| 11. Formulaires (13) | | | | |
| 12. Navigation (11) | | | | |
| 13. Consultation (12) | | | | |
| **Total (106)** | | | | |

### Non-conformités

Une entrée par problème, identifiant stable `NC-01`, `NC-02`… Trier par
priorité (Bloquant, puis Majeur, puis Mineur), puis par numéro de critère.
Les champs ci-dessous sont obligatoires, dans cet ordre :

```markdown
### NC-01 — 3.2 Contraste texte / fond

- **Critère :** 3.2
- **Priorité :** Bloquant | Majeur | Mineur
- **Responsable :** code | contenu CMS
- **Confiance :** mesuré | jugement agent | humain
- **Occurrences :**
  - `fichier.erb:26` ou sélecteur CSS, et URL si audit runtime
  - …
- **Preuve :** extrait de code, mesure (ratio, overflow, liste de focus) ou capture
- **Impact utilisateur :** quel handicap, quel blocage, avec quel outil
- **Correction :** extrait de code immédiatement applicable
- **Vérification :** comment confirmer la correction (un test précis)
```

La **Vérification** est propre à chaque NC : elle nomme le test qui
confirme la correction de ce défaut-là (« relancer le script runtime : la
clé `keyboard.focusNotVisible` est vide », « l'arbre d'accessibilité donne
au lien logo le nom "Accueil AvivA" », « la navigation par titres donne
h1 → h2 → h3 sans saut »). Une phrase générique recopiée d'une NC à l'autre
n'est pas acceptée.

### Grille complète des 106 critères

Une table par thème, avec une ligne par critère, dans l'ordre du référentiel
([criteres-rgaa-4.1.2.md](criteres-rgaa-4.1.2.md)). Aucune ligne n'est omise.

```markdown
#### Thème 1 — Images

| ID | Titre | Statut | Méthode | Confiance | Preuve ou raison | NC |
|----|-------|--------|---------|-----------|------------------|----|
| 1.1 | Image porteuse d'information : alternative | C | statique | mesuré | 47 `img`, 0 sans `alt` (inventaire) | |
| 1.3 | Pertinence des alternatives | NC | agent | jugement agent | 3 `alt` = nom de fichier (capture + inventaire) | NC-04 |
| 1.4 | Alternative des CAPTCHA | NA | agent | | aucun CAPTCHA (`consultation.captcha` = 0) | |
```

### Vérifications runtime

Une ligne par test runtime réellement exécuté, avec son critère.

| Critère | Test | Résultat | Source | Preuve |
|---------|------|----------|--------|--------|
| 7.3 | Parcours clavier | NC | Claude in Chrome | 12 arrêts Tab ; menu inaccessible au clavier |
| 10.4 | Zoom 200 % | C | rgaa-runtime.mjs | viewport 640 px DPR 2 : `scrollWidth` = `clientWidth`, aucun texte tronqué |
| 10.7 | Focus visible | NC | Playwright | `outline: none` sur 3 contrôles |
| 8.5 | Titre de page | C | Playwright | `document.title` = "…" |

Si un test n'a pas été exécuté, ne pas le lister ici : son critère reste `NT`
dans la grille, avec la raison.

Si une approximation a été utilisée (zoom par `style.zoom`, viewport réduit),
le noter sous le tableau.

### Reste à faire

Lister les `NT`, groupés par raison. C'est la section qui répond à « pourquoi
tous les critères ne sont pas évalués » et qui guide la prochaine passe.

```markdown
- **humain requis (N)** : 7.1, 4.13 — voir les protocoles ci-dessous
- **outil indisponible (N)** : 10.12, 10.13, … — relancer avec le script runtime ou un navigateur
- **hors périmètre composant (N)** : 8.5, 8.3, … — auditer la page complète
- **à confirmer (N)** : 8.2 — question précise à trancher
```

Puis, pour chaque critère `humain requis`, un **protocole** que la personne
peut suivre sans relire le RGAA :

```markdown
- **7.1 — restitution des composants** : NVDA + Firefox (ou VoiceOver +
  Safari). Ouvrir le menu principal avec Entrée : NVDA doit annoncer
  « bouton, réduit » puis « développé ». Parcourir le carrousel avec Tab :
  chaque diapositive annonce sa position (« 2 sur 5 »).
```

Lister aussi les verdicts en `jugement agent` à valider en priorité (NC
d'abord).

### Mention de limites

Une ligne : pas de lecteur d'écran testé ; zoom réel ou approximé ;
authentification ou données de test éventuelles.

## Partie 2 — Artefact (page publiée)

Si le harnais permet de publier un artefact (page web hébergée et privée par
défaut), le rapport peut être publié sous forme de page interactive : taux et
couverture, répartition par thème, cartes de NC copiables en Markdown, grille
des 106 critères filtrable par statut, raison, confiance, thème et texte,
vérifications runtime, reste à faire et protocoles.

1. Copier [../assets/rapport-artefact.html](../assets/rapport-artefact.html)
   dans un dossier temporaire (ou `audits/` si l'humain veut garder le
   fichier).
2. Remplacer le `<title>` par « Audit RGAA <site ou page> » (2 à 4 mots).
3. Remplir uniquement le bloc `DONNÉES` : `META`, `RAW` (106 lignes,
   `id|titre|statut|méthode|confiance|preuve ou raison|NC|raison de
   non-test`), `NCS`, `RUNTIME`, `PROTOCOLS`. Ne pas modifier le gabarit.
   Les champs de `RAW` ne contiennent ni `|` ni accent grave.
4. Les données sont celles du Markdown : mêmes statuts, mêmes NC, mêmes
   comptages. La page recalcule taux et couverture depuis `RAW` : un écart
   avec le front matter signale une erreur de saisie.
5. Publier la page avec la capacité de publication d'artefact du harnais,
   puis donner le lien. Mettre à jour le même artefact (même fichier ou même
   URL) lors d'un nouvel audit de la même page.

Sans capacité de publication, écrire le même fichier en
`audits/rgaa-AAAA-MM-JJ.html` : il fonctionne ouvert localement.

Le rapport décrit le site d'un client : ne pas le partager publiquement
sans accord de l'humain.

## Partie 3 — Export JSON (optionnel)

Même contenu que le Markdown, en JSON, pour un traitement automatique.
Fichier `audits/rgaa-AAAA-MM-JJ.json`.

```json
{
  "rgaa_version": "4.1.2",
  "skill_version": "…",
  "date": "AAAA-MM-JJ",
  "scope": { "url": "", "files": [], "mode": "page", "stack": "next" },
  "commit": "",
  "tools": { "runtime": "rgaa-runtime.mjs", "inventaire": "rgaa-runtime.mjs", "axe": "4.10.2", "pages_comparees": [] },
  "counts": { "C": 0, "NC": 0, "NA": 0, "NT": 0 },
  "confiance": { "mesure": 0, "jugement_agent": 0, "humain": 0 },
  "taux_conformite": 0.0,
  "couverture": 0.0,
  "criteria": [
    {
      "id": "1.1",
      "level": "A",
      "title": "Image porteuse d'information : alternative",
      "status": "C",
      "method": "statique",
      "confidence": "mesuré",
      "evidence": "…",
      "reason": null,
      "nc_ref": null
    }
  ],
  "non_conformities": [
    {
      "id": "NC-01",
      "criterion": "3.2",
      "priority": "Bloquant",
      "owner": "code",
      "confidence": "mesuré",
      "occurrences": ["fichier.erb:26"],
      "evidence": "…",
      "impact": "…",
      "fix": "…",
      "verification": "…"
    }
  ]
}
```

Règles du JSON :
- `criteria` contient exactement 106 entrées, dans l'ordre du référentiel.
- `level` vaut `A`, `AA`, ou `?` si le niveau n'est pas connu.
- `reason` est renseigné pour `NT` et `NA`, et `null` sinon.
- `confidence` vaut `mesuré`, `jugement agent` ou `humain` pour `C` et `NC`,
  `null` sinon.
- `nc_ref` vaut l'identifiant `NC-xx` quand le statut est `NC`, sinon `null`.
- Le JSON doit être cohérent avec le Markdown : mêmes comptages, mêmes NC.
