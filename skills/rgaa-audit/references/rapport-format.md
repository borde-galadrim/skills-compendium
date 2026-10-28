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

## Calculs

- Total : C + NC + NA + NT = 106.
- Taux de conformité = C / (C + NC).
- Couverture = (C + NC + NA) / 106.

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
  runtime: "<Claude in Chrome | Cursor browser | Codex browser/Playwright MCP | Playwright | Puppeteer | humain | aucun>"
counts: { C: 0, NC: 0, NA: 0, NT: 0 }
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
- **Occurrences :**
  - `fichier.erb:26` ou sélecteur CSS, et URL si audit runtime
  - …
- **Preuve :** extrait de code, mesure (ratio, overflow, liste de focus) ou capture
- **Impact utilisateur :** quel handicap, quel blocage, avec quel outil
- **Correction :** extrait de code immédiatement applicable
- **Vérification :** comment confirmer la correction (un test précis)
```

### Grille complète des 106 critères

Une table par thème, avec une ligne par critère, dans l'ordre du référentiel
([criteres-rgaa-4.1.2.md](criteres-rgaa-4.1.2.md)). Aucune ligne n'est omise.

```markdown
#### Thème 1 — Images

| ID | Titre | Statut | Méthode | Preuve ou raison | NC |
|----|-------|--------|---------|------------------|----|
| 1.1 | Image porteuse d'information : alternative | C | statique | `img` avec `alt` dans … | |
| 1.3 | Pertinence des alternatives | NT | humain | humain requis | |
```

### Vérifications runtime

Une ligne par test runtime réellement exécuté, avec son critère.

| Critère | Test | Résultat | Source | Preuve |
|---------|------|----------|--------|--------|
| 7.3 | Parcours clavier | NC | Claude in Chrome | 12 arrêts Tab ; menu inaccessible au clavier |
| 10.4 | Zoom 200 % | C | Playwright | `scrollWidth` = `clientWidth` |
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
- **humain requis (N)** : 1.3, 1.4, … — à vérifier par une personne
- **outil indisponible (N)** : 10.12, 10.13, … — relancer avec un navigateur
- **hors périmètre composant (N)** : 8.5, 8.3, … — auditer la page complète
- **à confirmer (N)** : 4.10 — test ciblé sur les vidéos de la page
```

### Mention de limites

Une ligne : pas de lecteur d'écran testé ; zoom réel ou approximé ;
authentification ou données de test éventuelles.

## Partie 2 — Export JSON (optionnel)

Même contenu que le Markdown, en JSON, pour un traitement automatique.
Fichier `audits/rgaa-AAAA-MM-JJ.json`.

```json
{
  "rgaa_version": "4.1.2",
  "skill_version": "…",
  "date": "AAAA-MM-JJ",
  "scope": { "url": "", "files": [], "mode": "page", "stack": "next" },
  "commit": "",
  "tools": { "runtime": "Playwright" },
  "counts": { "C": 0, "NC": 0, "NA": 0, "NT": 0 },
  "taux_conformite": 0.0,
  "couverture": 0.0,
  "criteria": [
    {
      "id": "1.1",
      "level": "A",
      "title": "Image porteuse d'information : alternative",
      "status": "C",
      "method": "statique",
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
- `nc_ref` vaut l'identifiant `NC-xx` quand le statut est `NC`, sinon `null`.
- Le JSON doit être cohérent avec le Markdown : mêmes comptages, mêmes NC.
