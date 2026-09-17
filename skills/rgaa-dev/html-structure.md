# Tester la structure HTML

La structure HTML est la colonne vertébrale de l'accessibilité. Un lecteur d'écran navigue
principalement via les titres, les landmarks et les listes — pas via le visuel.

---

## Outils de validation

### W3C Markup Validator
**URL** : https://validator.w3.org/

Valide la conformité HTML. Les erreurs de balisage cassent souvent l'interprétation
par les lecteurs d'écran.

```bash
# Validation en ligne de commande (CI/CD) — HTML rendu, pas les sources JSX
npx html-validate "dist/**/*.html"

# ou via curl sur une page servie localement
curl -s --data-urlencode "fragment=$(curl -s http://localhost:5173/habilitations)" \
  "https://validator.nu/?out=json" | jq '.messages[] | select(.type == "error")'
```

### Extensions navigateur — Structure visuelle

| Extension | Navigateur | Ce qu'elle montre |
|-----------|------------|-------------------|
| **HeadingsMap** | Chrome / Firefox | Arborescence des titres h1→h6, erreurs de hiérarchie |
| **Landmarks** (TPGi) | Chrome / Firefox | Overlay des regions ARIA et HTML5 landmarks |
| **WAVE** | Chrome / Firefox | Erreurs structure + landmarks + titres en overlay |
| **axe DevTools** | Chrome / Firefox | Audit complet incluant structure |
| **ARC Toolkit** | Chrome | Audit RGAA avec détail par critère |

### Arbre d'accessibilité dans Chrome DevTools

```
DevTools → Elements → Onglet "Accessibility" (panneau latéral)
→ Cocher "Enable full-page accessibility tree"
→ Icône arbre en haut du panneau Elements
```

Permet de voir exactement ce que le lecteur d'écran perçoit : rôle, nom, état de chaque nœud.

### Inspection rapide dans la console

```javascript
// Lister tous les titres et leur niveau
document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
  console.log(`${h.tagName}: ${h.textContent.trim()}`)
})

// Vérifier la présence des landmarks obligatoires
const required = ['main', '[role="main"]', 'nav', 'header', 'footer']
required.forEach(sel => {
  const el = document.querySelector(sel)
  console.log(`${sel}: ${el ? '✓' : '❌ ABSENT'}`)
})

// Lister les landmarks avec leur label
document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], [role]').forEach(el => {
  const label = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '(sans label)'
  console.log(`${el.tagName}[${el.getAttribute('role') || ''}]: ${label}`)
})

// Détecter les images sans alt
document.querySelectorAll('img:not([alt])').forEach(img => {
  console.warn('Image sans alt:', img.src)
})

// Détecter les champs sans label associé
document.querySelectorAll('input, select, textarea').forEach(field => {
  const id = field.id
  const label = id ? document.querySelector(`label[for="${id}"]`) : null
  const ariaLabel = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby')
  if (!label && !ariaLabel) {
    console.warn('Champ sans label:', field)
  }
})
```

---

## Checklist structure HTML

### Titres (RGAA 9.1)
- [ ] Un seul `<h1>` par page, cohérent avec le `<title>`
- [ ] Hiérarchie sans saut (h1 → h2 → h3, jamais h1 → h3)
- [ ] Titres utilisés pour structurer le contenu, pas pour le style
- [ ] Vérifier avec HeadingsMap ou DevTools
- [ ] Le niveau de titre est paramétrable si le composant est réutilisable

```tsx
import { useId } from 'react'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

function Section({
  title,
  headingLevel = 2,
  children,
}: {
  title: string
  headingLevel?: HeadingLevel
  children: React.ReactNode
}) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <Heading id={titleId}>{title}</Heading>
      {children}
    </section>
  )
}
```

### Landmarks / Régions (RGAA 12.6)
- [ ] `<header>` (ou `role="banner"`) — en-tête du site
- [ ] `<nav aria-label="...">` — navigation(s)
- [ ] `<main>` (ou `role="main"`) — contenu principal, unique par page
- [ ] `<footer>` (ou `role="contentinfo"`) — pied de page
- [ ] Plusieurs `<nav>` → labels distincts (`aria-label` différents)
- [ ] `<aside aria-label="...">` si contenu complémentaire
- [ ] Pas de `<section>` sans `aria-label` (sinon invisible aux lecteurs d'écran)

```html
<!-- ❌ Section sans nom = landmark générique ignoré -->
<section>
  <h2>Habilitations en cours</h2>
</section>

<!-- ✅ Section nommée = landmark region identifiable -->
<section aria-labelledby="section-title">
  <h2 id="section-title">Habilitations en cours</h2>
</section>
```

### Listes (RGAA 9.3)
- [ ] Listes d'éléments → `<ul>` ou `<ol>` + `<li>`
- [ ] Listes de définitions → `<dl>` + `<dt>` + `<dd>`
- [ ] Pas de `<ul>` vides
- [ ] Pas de fausse liste (divs avec tirets visuels)
- [ ] Navigation → `<ul>` de `<li>` contenant les liens (pattern standard)

```html
<!-- ❌ Fausse liste (perd la sémantique) -->
<div class="list">
  <div>— Élément 1</div>
  <div>— Élément 2</div>
</div>

<!-- ✅ Liste sémantique -->
<ul>
  <li>Élément 1</li>
  <li>Élément 2</li>
</ul>

<!-- ✅ Liste de définitions (propriétés d'une habilitation) -->
<dl>
  <dt>API</dt>
  <dd>API Particulier</dd>
  <dt>Statut</dt>
  <dd>Validée</dd>
  <dt>Date de création</dt>
  <dd><time datetime="2024-01-15">15 janvier 2024</time></dd>
</dl>
```

### Tableaux (RGAA 5.x)
- [ ] `<caption>` présent
- [ ] `<th scope="col">` pour en-têtes de colonnes
- [ ] `<th scope="row">` pour en-têtes de lignes (si applicable)
- [ ] Pas de tableau pour la mise en page

### Formulaires (RGAA 11.x)
- [ ] `<label for="id">` sur chaque champ
- [ ] `<fieldset>` + `<legend>` pour les groupes radio/checkbox
- [ ] Pas de `<table>` pour aligner les champs

### Éléments sémantiques
- [ ] Utiliser les bons éléments HTML (pas de `<div>` cliquable à la place de `<button>`)
- [ ] `<button>` pour les actions, `<a>` pour les navigations
- [ ] `<time datetime="...">` pour les dates
- [ ] `<address>` pour les coordonnées
- [ ] `<abbr title="...">` pour les abréviations (première occurrence)
- [ ] `<strong>` pour l'importance, `<em>` pour l'emphase (pas pour le style)
- [ ] `<blockquote>` pour les citations

```html
<!-- ❌ Div cliquable (non accessible au clavier, pas de rôle) -->
<div class="btn" onclick="submit()">Envoyer</div>

<!-- ✅ Bouton natif -->
<button type="button" onclick="submit()">Envoyer</button>

<!-- ❌ Span pour texte important -->
<span class="bold">Attention</span>

<!-- ✅ Élément sémantique -->
<strong>Attention</strong>
```

---

## Tester avec les outils navigateur — pas à pas

### HeadingsMap (titres)
1. Installer l'extension HeadingsMap
2. Ouvrir la page à tester
3. Cliquer sur l'icône HeadingsMap → onglet "Headings"
4. Vérifier : hiérarchie sans saut, h1 unique, tous les titres pertinents

### Landmarks (TPGi)
1. Installer l'extension Landmarks
2. Ouvrir la page → cliquer l'icône
3. Vérifier : présence de `main`, `nav`, `header`, `footer`
4. Chaque landmark a un label distinct si plusieurs du même type

### Arbre d'accessibilité Chrome
1. DevTools → Elements
2. Onglet "Accessibility" dans le panneau latéral
3. Activer "Enable full-page accessibility tree"
4. Cliquer l'icône en forme d'arbre en haut du panneau Elements
5. Naviguer dans l'arbre et vérifier rôles, noms, états

### Test rapide avec Tab uniquement
1. Fermer la souris
2. Utiliser uniquement Tab / Shift+Tab / Enter / Espace / Flèches
3. Vérifier : focus visible, ordre logique, tous les éléments interactifs atteignables

---

## Validation HTML dans les tests

Valider le **HTML rendu**, pas les sources JSX. React Testing Library pour le composant, Playwright pour la page.

```tsx
import { render, screen } from '@testing-library/react'

it('produit un titre de niveau cohérent', () => {
  render(<AuthorizationCard title="API Particulier" headingLevel={3} />)
  expect(screen.getByRole('heading', { level: 3, name: 'API Particulier' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
})
```

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('la page produit un HTML accessible', async ({ page }) => {
  await page.goto('/habilitations')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
```

Matcher axe au niveau composant : [react-patterns.md](react-patterns.md) §Tests.

---

## Erreurs HTML fréquentes en JSX

### IDs dupliqués (très fréquent dans un `.map()`)

```tsx
{/* ❌ IDs dupliqués si plusieurs cartes sur la page */}
{items.map((item) => (
  <article id="card" key={item.id}>
    <p id="status">{item.status}</p>
  </article>
))}

{/* ✅ IDs uniques — identifiant métier ou useId() dans l'enfant */}
{items.map((item) => (
  <article id={`card-${item.id}`} key={item.id}>
    <p id={`status-${item.id}`}>{item.status}</p>
  </article>
))}
```

### `aria-describedby` pointant vers un ID inexistant

```tsx
{/* ❌ L'ID n'existe que si une erreur est présente */}
<input aria-describedby="email-error" />
{error ? <p id="email-error">{error}</p> : null}

{/* ✅ L'attribut n'est ajouté que si l'élément cible existe */}
<input aria-describedby={error ? 'email-error' : undefined} />
{error ? <p id="email-error">{error}</p> : null}
```

### `htmlFor` / `id` désynchronisés

```tsx
{/* ❌ id généré ailleurs que le htmlFor */}
<label htmlFor="email">Email</label>
<input id="user-email" />

{/* ✅ même id, de préférence via useId() */}
const id = useId()
<label htmlFor={id}>Email</label>
<input id={id} />
```

### Boutons sans type dans un formulaire

```tsx
{/* ❌ Type par défaut = "submit" → soumet le formulaire involontairement */}
<button onClick={toggleSection}>Voir plus</button>

{/* ✅ Type explicite */}
<button type="button" onClick={toggleSection}>Voir plus</button>
```