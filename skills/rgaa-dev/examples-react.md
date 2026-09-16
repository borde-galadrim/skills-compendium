# Exemples de code accessibles — React / JSX / TypeScript

> Markup **React + TypeScript** sur du HTML sémantique natif. Pas de design system.
> Comportement (état, clavier, focus, tests) → [react-patterns.md](react-patterns.md)
> HTML sans framework → [examples-html.md](examples-html.md)
> Classes DSFR optionnelles → [examples-dsfr.md](examples-dsfr.md)

Conventions JSX :
- Attributs ARIA en kebab-case : `aria-expanded`, `aria-labelledby` (jamais `ariaExpanded`)
- `htmlFor`, `className`, `tabIndex`, `autoComplete`
- `aria-invalid`, `aria-required`, `hidden` acceptent un booléen
- IDs via `useId()` — voir [react-patterns.md](react-patterns.md) §useId

---

## Liens

```tsx
<a href="https://example.com" target="_blank" rel="noopener external">
  Nom du site
  <span className="sr-only"> (nouvelle fenêtre)</span>
</a>

<a
  href="/habilitations/1"
  aria-label="Consulter l'habilitation API Particulier — DINUM"
>
  Consulter
</a>
```

---

## Images

```tsx
<img src={logoSrc} alt="Retour à l'accueil" />
<img src={decorationSrc} alt="" />

<svg aria-hidden="true" focusable="false" width="16" height="16">
  <use href="#icon-arrow" />
</svg>

<svg role="img" aria-labelledby={titleId}>
  <title id={titleId}>Statut : validé</title>
  <use href="#icon-check" />
</svg>
```

---

## Boutons

```tsx
<button type="button">Enregistrer les modifications</button>

<button type="button" aria-label="Fermer la fenêtre">
  <svg aria-hidden="true" focusable="false">
    <use href="#icon-close" />
  </svg>
</button>

<button
  type="button"
  aria-expanded={open}
  aria-controls={contentId}
  onClick={() => setOpen((value) => !value)}
>
  Voir les détails
</button>
<div id={contentId} hidden={!open}>
  Contenu des détails
</div>
```

Toujours `type="button"` hors soumission de formulaire — le défaut HTML dans un `<form>` est `submit`.

---

## Formulaires

```tsx
function EmailField({ error }: { error?: string }) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id}>
        Adresse e-mail
        <span aria-hidden="true">*</span>
      </label>
      <p id={hintId}>Format attendu : nom@domaine.fr</p>
      <input
        type="email"
        id={id}
        name="email"
        required
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        autoComplete="email"
      />
      {error ? (
        <p id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
```

`aria-describedby` ne référence que des IDs présents dans le DOM. Le récapitulatif d'erreurs et le `autoComplete` : [react-patterns.md](react-patterns.md) §Formulaires et §Autocomplete.

---

## Tableaux

```tsx
<table>
  <caption>Habilitations par statut</caption>
  <thead>
    <tr>
      <th scope="col">Statut</th>
      <th scope="col">Nombre</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Validées</th>
      <td>145</td>
    </tr>
  </tbody>
</table>
```

Tri interactif : [react-patterns.md](react-patterns.md) §Tableau triable.

---

## Navigation

```tsx
<a href="#main-content" className="skip-link">Aller au contenu principal</a>

<nav aria-label="Navigation principale">
  <ul>
    {items.map((item) => (
      <li key={item.href}>
        <a href={item.href} aria-current={item.current ? 'page' : undefined}>
          {item.label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

---

## Accordéon

```tsx
<h3>
  <button
    type="button"
    aria-expanded={expanded}
    aria-controls={panelId}
    id={headerId}
    onClick={() => setExpanded((value) => !value)}
  >
    Cadre juridique
  </button>
</h3>
<div
  id={panelId}
  role="region"
  aria-labelledby={headerId}
  hidden={!expanded}
>
  <p>Contenu de la section…</p>
</div>
```

---

## Onglets

```tsx
<div role="tablist" aria-label="Sections de l'habilitation">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      type="button"
      role="tab"
      id={tab.id}
      aria-selected={tab.id === selectedId}
      aria-controls={tab.panelId}
      tabIndex={tab.id === selectedId ? 0 : -1}
      onClick={() => select(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>
{tabs.map((tab) => (
  <div
    key={tab.panelId}
    role="tabpanel"
    id={tab.panelId}
    aria-labelledby={tab.id}
    hidden={tab.id !== selectedId}
  >
    {tab.content}
  </div>
))}
```

Clavier (flèches, Home, End) : [react-patterns.md](react-patterns.md) §Onglets.

---

## Modale

```tsx
<button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
  Supprimer
</button>

<dialog
  ref={dialogRef}
  aria-labelledby={titleId}
  aria-describedby={descId}
>
  <h2 id={titleId}>Supprimer l'habilitation</h2>
  <p id={descId}>Cette action est irréversible.</p>
  <button type="button" onClick={() => setOpen(false)}>Annuler</button>
  <button type="button" onClick={onConfirm}>Confirmer</button>
</dialog>
```

Focus trap, `showModal()`, restauration du focus : [react-patterns.md](react-patterns.md) §Modale.

---

## Live regions

```tsx
<div role="alert">Erreur : impossible de sauvegarder.</div>
<div role="status">Vos modifications ont été enregistrées.</div>

<div
  ref={announcerRef}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
/>
```

Helper `announce()` : [react-patterns.md](react-patterns.md) §Live regions.

---

## Iframe

```tsx
<iframe
  src={previewUrl}
  title={`Prévisualisation : ${filename}`}
  width={600}
  height={400}
/>

<iframe src={trackingUrl} title="" aria-hidden="true" tabIndex={-1} />
```

---

## Langue

```tsx
<html lang="fr">
<p>
  Ce rapport suit les principes du <span lang="en">responsive design</span>.
</p>
```
