# Patterns accessibilité — React / TypeScript

HTML sémantique d'abord. Ajouter de l'état, des effets et des refs seulement quand le comportement l'exige (clavier, focus, live regions, async).
Markup JSX compact → [examples-react.md](examples-react.md)

---

## JSX — Attributs ARIA

```tsx
<a href={path} aria-label={`Consulter ${title}`}>
  Consulter
</a>

<button
  type="button"
  aria-expanded={menuOpen}
  aria-controls="nav-menu"
>
  Menu
</button>

<input
  type="email"
  aria-describedby={error ? `${hintId} ${errorId}` : hintId}
  aria-required="true"
  aria-invalid={Boolean(error)}
  autoComplete="email"
/>
```

- Attributs ARIA en kebab-case (`aria-label`, pas `ariaLabel`)
- `htmlFor`, `className`, `tabIndex`, `autoComplete`
- Booléens acceptés : `aria-expanded`, `aria-hidden`, `hidden`, `required`
- Ne pas rendre `aria-describedby` si aucun ID cible n'existe dans le DOM

---

## IDs stables avec `useId`

Chaque instance de composant doit produire des IDs uniques. `useId()` est stable entre le serveur et le client.

```tsx
function TextField({ label, hint, error, ...inputProps }: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {hint ? <p id={hintId}>{hint}</p> : null}
      <input
        id={id}
        {...inputProps}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint ? hintId : null, error ? errorId : null]
          .filter(Boolean)
          .join(' ') || undefined}
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

Dans une liste, `key={item.id}` + `useId()` dans l'enfant suffisent. Un `id="card"` fixe dans un `.map()` duplique les IDs.

---

## Formulaires — labels, erreurs, groupes

```tsx
function ErrorSummary({ errors }: { errors: { id: string; message: string }[] }) {
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [errors])

  if (errors.length === 0) return null

  return (
    <div
      ref={headingRef}
      role="alert"
      aria-labelledby="error-summary-title"
      tabIndex={-1}
      id="error-summary"
    >
      <h2 id="error-summary-title">{errors.length} erreurs à corriger</h2>
      <ul>
        {errors.map((error) => (
          <li key={error.id}>
            <a href={`#${error.id}`}>{error.message}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RoleFieldset({ error, value, onChange }: RoleFieldsetProps) {
  return (
    <fieldset>
      <legend>
        Rôle
        <span className="hint">Sélectionnez votre rôle dans l'organisation</span>
      </legend>
      {ROLES.map((role) => (
        <div key={role}>
          <input
            type="radio"
            id={`role-${role}`}
            name="role"
            value={role}
            checked={value === role}
            onChange={() => onChange(role)}
          />
          <label htmlFor={`role-${role}`}>{roleLabel(role)}</label>
        </div>
      ))}
      {error ? (
        <p role="alert">{error}</p>
      ) : null}
    </fieldset>
  )
}
```

---

## Composants réutilisables

### Bouton icône

```tsx
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  icon: ReactNode
}

function IconButton({ label, icon, type = 'button', ...props }: IconButtonProps) {
  return (
    <button type={type} {...props} aria-label={label}>
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
```

### Badge de statut

```tsx
function StatusBadge({ status, srPrefix }: { status: string; srPrefix?: string }) {
  return (
    <span className={`badge badge--${status}`}>
      {srPrefix ? <span className="sr-only">{srPrefix} : </span> : null}
      {statusLabel(status)}
    </span>
  )
}
```

### Message flash

```tsx
const FLASH_ROLES = {
  error: 'alert',
  alert: 'alert',
  notice: 'status',
  success: 'status',
} as const

function FlashMessage({ type, message }: { type: keyof typeof FLASH_ROLES; message: string }) {
  return (
    <div role={FLASH_ROLES[type]} aria-atomic="true">
      <p>
        <span className="sr-only">{typeLabel(type)} — </span>
        {message}
      </p>
    </div>
  )
}
```

`role="alert"` implique `aria-live="assertive"`. `role="status"` implique `aria-live="polite"`. Ne pas combiner les deux.

---

## État contrôlé et clavier

### Toggle / accordéon

```tsx
function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const buttonId = `${id}-button`
  const panelId = `${id}-panel`

  return (
    <div>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}
        >
          {title}
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded}>
        {children}
      </div>
    </div>
  )
}
```

### Modale — `<dialog>` natif, restauration du focus

```tsx
function ConfirmDialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      onClose={() => {
        triggerRef.current?.focus()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <button type="button" onClick={onClose} aria-label="Fermer">
        <span aria-hidden="true">✕</span>
      </button>
    </dialog>
  )
}
```

`showModal()` piège le focus et gère Escape. Restaurer le focus sur le déclencheur dans `onClose`.

### Listbox — flèches, Home, End

```tsx
function Listbox({ options }: { options: { id: string; label: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const optionRefs = useRef<Array<HTMLDivElement | null>>([])

  function move(next: number) {
    const index = Math.max(0, Math.min(next, options.length - 1))
    setActiveIndex(index)
    optionRefs.current[index]?.focus()
  }

  return (
    <div
      role="listbox"
      aria-activedescendant={options[activeIndex]?.id}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') { event.preventDefault(); move(activeIndex + 1) }
        if (event.key === 'ArrowUp') { event.preventDefault(); move(activeIndex - 1) }
        if (event.key === 'Home') { event.preventDefault(); move(0) }
        if (event.key === 'End') { event.preventDefault(); move(options.length - 1) }
      }}
    >
      {options.map((option, index) => (
        <div
          key={option.id}
          id={option.id}
          role="option"
          aria-selected={index === activeIndex}
          tabIndex={-1}
          ref={(node) => { optionRefs.current[index] = node }}
        >
          {option.label}
        </div>
      ))}
    </div>
  )
}
```

### Onglets — roving tabindex

```tsx
function Tabs({ tabs }: { tabs: { id: string; label: string; panel: ReactNode }[] }) {
  const [selected, setSelected] = useState(tabs[0].id)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function selectAt(index: number) {
    const next = (index + tabs.length) % tabs.length
    setSelected(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Sections"
        onKeyDown={(event) => {
          const current = tabs.findIndex((tab) => tab.id === selected)
          if (event.key === 'ArrowRight') { event.preventDefault(); selectAt(current + 1) }
          if (event.key === 'ArrowLeft') { event.preventDefault(); selectAt(current - 1) }
          if (event.key === 'Home') { event.preventDefault(); selectAt(0) }
          if (event.key === 'End') { event.preventDefault(); selectAt(tabs.length - 1) }
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={tab.id}
            aria-selected={tab.id === selected}
            aria-controls={`${tab.id}-panel`}
            tabIndex={tab.id === selected ? 0 : -1}
            ref={(node) => { tabRefs.current[index] = node }}
            onClick={() => setSelected(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${tab.id}-panel`}
          aria-labelledby={tab.id}
          hidden={tab.id !== selected}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  )
}
```

---

## Live regions

Les mises à jour DOM (SPA, fetch, filtres) ne sont pas vocalisées toutes seules.

```tsx
function useAnnouncer() {
  const ref = useRef<HTMLDivElement>(null)

  function announce(message: string) {
    const region = ref.current
    if (!region) return
    region.textContent = ''
    requestAnimationFrame(() => {
      region.textContent = message
    })
  }

  const region = (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )

  return { announce, region }
}
```

Vider puis remplir force la re-vocalisation. Après un changement de route, annoncer `document.title` :

```tsx
useEffect(() => {
  announce(document.title)
}, [pathname])
```

Filtrage : mettre à jour un `role="status"` visible ou sr-only (`12 habilitations trouvées`).

---

## Chargement asynchrone

```tsx
function AsyncList({ url }: { url: string }) {
  const [busy, setBusy] = useState(false)
  const [items, setItems] = useState<Array<{ id: string; label: string }>>([])

  async function load() {
    setBusy(true)
    try {
      setItems(await fetch(url).then((response) => response.json()))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div aria-busy={busy} aria-live="polite">
      {busy ? <p className="sr-only">Chargement en cours…</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </div>
  )
}
```

Pour une liste React, garder `aria-busy` pendant le fetch. Appeler `load()` au montage ou sur action utilisateur.

Bouton submit en cours d'envoi :

```tsx
<button type="submit" aria-disabled={submitting} aria-describedby={submitting ? statusId : undefined}>
  {submitting ? 'Envoi en cours…' : 'Soumettre la demande'}
</button>
{submitting ? (
  <span id={statusId} className="sr-only" role="status">
    Envoi de la demande en cours, veuillez patienter.
  </span>
) : null}
```

Préférer `aria-disabled` + ignore du submit plutôt que `disabled` si le bouton doit rester perceptible.

---

## Combobox

`role="combobox"` sur l'`<input>`, pas sur un wrapper.

```tsx
function Combobox({ items, onSelect }: ComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()
  const results = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  const activeId = activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined

  return (
    <div>
      <label htmlFor={`${listId}-input`}>Organisation</label>
      <input
        id={`${listId}-input`}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeId}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(event.target.value.length >= 2)
          setActiveIndex(-1)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((index) => Math.min(index + 1, results.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault()
            onSelect(results[activeIndex])
            setOpen(false)
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      <ul id={listId} role="listbox" hidden={!open} aria-label="Suggestions">
        {results.map((item, index) => (
          <li
            key={item.id}
            id={`${listId}-opt-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            onClick={() => {
              onSelect(item)
              setQuery(item.label)
              setOpen(false)
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Stepper

```tsx
function Stepper({ step, total, title, nextTitle }: StepperProps) {
  const titleId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  return (
    <div>
      <div>
        <p>
          Étape {step} sur {total}
        </p>
        <div
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Progression : étape ${step} sur ${total}`}
        />
        {nextTitle ? <p>Étape suivante : {nextTitle}</p> : null}
      </div>
      <h1 id={titleId} ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
    </div>
  )
}
```

Après chaque changement d'étape, le focus va sur le titre (`tabIndex={-1}`).

---

## Tableau triable

`aria-sort` se place sur le `<th>`, pas sur le bouton. Valeurs : `ascending`, `descending`, `none`.

```tsx
type SortDir = 'asc' | 'desc'

function SortableTable({ rows }: { rows: Row[] }) {
  const [column, setColumn] = useState<keyof Row>('date')
  const [direction, setDirection] = useState<SortDir>('desc')
  const { announce, region } = useAnnouncer()

  function sortBy(next: keyof Row) {
    const nextDir: SortDir = column === next && direction === 'asc' ? 'desc' : 'asc'
    setColumn(next)
    setDirection(nextDir)
    announce(`Liste triée par ${columnLabel(next)}, ordre ${nextDir === 'asc' ? 'croissant' : 'décroissant'}`)
  }

  function ariaSort(name: keyof Row) {
    if (name !== column) return 'none' as const
    return direction === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <>
      {region}
      <table>
        <caption>Liste des demandes</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={ariaSort('title')}>
              <button type="button" onClick={() => sortBy('title')} aria-label="Trier par intitulé">
                Intitulé
              </button>
            </th>
            <th scope="col" aria-sort={ariaSort('date')}>
              <button type="button" onClick={() => sortBy('date')} aria-label="Trier par date">
                Date
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortRows(rows, column, direction).map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.title}</th>
              <td>
                <time dateTime={row.date}>{formatDate(row.date)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
```

---

## Iframes (RGAA Thème 2)

```tsx
<iframe src={previewUrl} title={`Prévisualisation : ${filename}`} />

<iframe src={trackerUrl} title="" aria-hidden="true" tabIndex={-1} />
```

Tout iframe informatif a un `title` descriptif. Un iframe décoratif a `title=""`, `aria-hidden="true"` et `tabIndex={-1}`.

---

## Autocomplete (RGAA 11.13 / WCAG 1.3.5)

`autoComplete` est obligatoire sur tout champ collectant **les données personnelles de l'utilisateur connecté**.

Si le champ saisit les données d'**une autre personne** (email d'un destinataire, d'un utilisateur à bannir), le critère ne s'applique pas — `autoComplete="off"` évite que le navigateur propose le profil courant.

```tsx
<input type="text" name="givenName" autoComplete="given-name" />
<input type="text" name="familyName" autoComplete="family-name" />
<input type="text" name="fullName" autoComplete="name" />
<input type="email" name="email" autoComplete="email" />
<input type="tel" name="phone" autoComplete="tel" />
<input type="text" name="organization" autoComplete="organization" />
<input type="text" name="address" autoComplete="street-address" />
<input type="text" name="city" autoComplete="address-level2" />
<input type="text" name="postalCode" autoComplete="postal-code" />
<input type="text" name="siret" autoComplete="off" inputMode="numeric" />
```

| Champ | Valeur `autoComplete` |
|-------|------------------------|
| Prénom | `given-name` |
| Nom de famille | `family-name` |
| Nom complet | `name` |
| E-mail | `email` |
| Téléphone | `tel` |
| Intitulé de poste | `organization-title` |
| Nom d'organisation | `organization` |
| Adresse complète | `street-address` |
| Ville | `address-level2` |
| Code postal | `postal-code` |
| Pays | `country-name` |
| Mot de passe actuel | `current-password` |
| Nouveau mot de passe | `new-password` |

Identifiants spécifiques (SIRET, SIREN, RNA, numéro de dossier) : `autoComplete="off"`.

---

## WCAG 3.3.7 Redundant Entry

Dans un formulaire multi-étapes, pré-remplir toute donnée déjà connue — profil utilisateur ou étapes précédentes.

```tsx
function ContactStep({ profile, wizard, onChange }: ContactStepProps) {
  const email = wizard.contactEmail ?? profile.email
  const phone = wizard.contactPhone ?? profile.phone

  return (
    <>
      <label htmlFor="contact-email">E-mail de contact</label>
      <input
        id="contact-email"
        type="email"
        name="contactEmail"
        value={email}
        autoComplete="email"
        aria-describedby="email-hint"
        onChange={(event) => onChange({ contactEmail: event.target.value })}
      />
      <p id="email-hint">Pré-rempli depuis votre profil — modifiez si nécessaire.</p>
    </>
  )
}
```

Ne pas vider les champs entre les étapes. Persister l'état du wizard (store, URL, session) à chaque `POST` / `onSubmit`.

---

## Tooltip (WCAG 1.4.13)

Hoverable, dismissible (`Escape` sans déplacer le focus), persistent.

```tsx
function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const hideTimeout = useRef<number>(undefined)
  const tipId = useId()

  function show() {
    window.clearTimeout(hideTimeout.current)
    setOpen(true)
  }
  function hide() {
    setOpen(false)
  }
  function startHideDelay() {
    hideTimeout.current = window.setTimeout(hide, 300)
  }

  return (
    <span>
      <button
        type="button"
        aria-describedby={tipId}
        onMouseEnter={show}
        onMouseLeave={startHideDelay}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(event) => {
          if (event.key === 'Escape') hide()
        }}
      >
        {children}
      </button>
      <span
        id={tipId}
        role="tooltip"
        hidden={!open}
        onMouseEnter={show}
        onMouseLeave={startHideDelay}
      >
        {label}
      </span>
    </span>
  )
}
```

Pas d'éléments interactifs dans un tooltip — utiliser une modale ou un disclosure.

---

## Langue et abréviations (RGAA 8.7 / 8.8 / 9.4)

```tsx
<p>
  Consulter la <span lang="en">privacy policy</span> pour plus de détails.
</p>

<a href="https://example.com" lang="en" hrefLang="en" target="_blank" rel="noopener external">
  Example site
  <span className="sr-only"> - nouvelle fenêtre</span>
</a>

function Abbr({ children, title }: { children: string; title: string }) {
  return <abbr title={title}>{children}</abbr>
}
```

Première occurrence seulement pour `<abbr>`.

---

## Tests — composant et navigateur

### React Testing Library + Vitest/Jest + axe-core

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

it('indique le statut aux lecteurs d\'écran', () => {
  render(<StatusBadge status="validated" srPrefix="Statut" />)
  expect(screen.getByText(/Statut/)).toBeInTheDocument()
})

it('n\'a pas de violation axe', async () => {
  const { container } = render(<LoginForm />)
  expect(await axe(container)).toHaveNoViolations()
})

it('restaure le focus à la fermeture de la modale', async () => {
  const user = userEvent.setup()
  render(<PageWithDialog />)
  const trigger = screen.getByRole('button', { name: 'Supprimer' })
  await user.click(trigger)
  await user.keyboard('{Escape}')
  expect(trigger).toHaveFocus()
})
```

Matcher `toHaveNoViolations` : `jest-axe` (Jest) ou `vitest-axe` (Vitest). Interroger par rôle (`getByRole`) plutôt que par test-id.

### Playwright + axe-core

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('la page du formulaire est accessible', async ({ page }) => {
  await page.goto('/habilitations/new')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('Escape ferme la modale et rend le focus', async ({ page }) => {
  await page.goto('/habilitations/1')
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Supprimer' })).toBeFocused()
})
```

Les tests automatisés ne remplacent pas Tab / zoom 200 % / lecteur d'écran. Voir [checklist.md](checklist.md) et [html-structure.md](html-structure.md).
