# Commit Plan Examples

## Example 1 — Feature with multiple layers (grouped by layer)

**Input:** New CMS module (types, GraphQL, mapper, components, view wiring)

**Plan:** Split by layer, group related files within each layer. 9 files → 4 commits (not 1, not 9).

````markdown
## Commit Plan

**Branch:** `feat/m22-store-info`
**Files changed:** 9 files
**Commits proposed:** 4

---

### Commit 1/4 — `feat(cms): add M22 StoreInfo data layer`
**Why:** Query and service are one data-layer slice; they land and review together.
**Files:**
- `lib/coremedia/graphql/queries/m22StoreInfo.query.ts` (new)
- `lib/coremedia/graphql/m22StoreInfo.cms.service.ts` (new)

**Commands:**
```bash
git add lib/coremedia/graphql/queries/m22StoreInfo.query.ts lib/coremedia/graphql/m22StoreInfo.cms.service.ts
git commit -m "$(cat <<'EOF'
feat(cms): add M22 StoreInfo data layer

Query and service are one data-layer slice; they land and review together.
EOF
)"
```

### Commit 2/4 — `feat(cms): add StoreInfo module types and mapper`
**Why:** Types and mapper are a tight pair; UI components depend on both.
**Files:**
- `components/cms-modules/store-info/storeInfo.types.ts` (new)
- `components/cms-modules/store-info/storeInfo.mapper.ts` (new)

**Commands:**
```bash
git add components/cms-modules/store-info/storeInfo.types.ts components/cms-modules/store-info/storeInfo.mapper.ts
git commit -m "$(cat <<'EOF'
feat(cms): add StoreInfo module types and mapper

Types and mapper are a tight pair; UI components depend on both.
EOF
)"
```

### Commit 3/4 — `feat(cms): add StoreInfo module components`
**Why:** Both UI blocks and the barrel export ship as one module slice.
**Files:**
- `components/cms-modules/store-info/StoreInfoBlock.tsx` (new)
- `components/cms-modules/store-info/StoreInfoImageCarousel.tsx` (new)
- `components/cms-modules/store-info/index.ts` (new)

**Commands:**
```bash
git add components/cms-modules/store-info/StoreInfoBlock.tsx components/cms-modules/store-info/StoreInfoImageCarousel.tsx components/cms-modules/store-info/index.ts
git commit -m "$(cat <<'EOF'
feat(cms): add StoreInfo module components

Both UI blocks and the barrel export ship as one module slice.
EOF
)"
```

### Commit 4/4 — `feat(cms): wire M22 StoreInfo into view dispatcher`
**Why:** View wiring depends on all module pieces; registry and mapping updated together for the new viewtype.
**Files:**
- `components/views/CMCollection/CMCollection.asPageBodyElement[M22-StoreInfo].tsx` (new)
- `lib/viewdispatcher/cmsModuleViewtypes.ts` (modified)
- `lib/viewdispatcher/viewmapping.ts` (modified)

**Commands:**
```bash
git add 'components/views/CMCollection/CMCollection.asPageBodyElement[M22-StoreInfo].tsx' lib/viewdispatcher/cmsModuleViewtypes.ts lib/viewdispatcher/viewmapping.ts
git commit -m "$(cat <<'EOF'
feat(cms): wire M22 StoreInfo into view dispatcher

View wiring depends on all module pieces; registry and mapping updated together for the new viewtype.
EOF
)"
```

---

**Copy-paste all commands** (run in order):

```bash
git add lib/coremedia/graphql/queries/m22StoreInfo.query.ts lib/coremedia/graphql/m22StoreInfo.cms.service.ts
git commit -m "$(cat <<'EOF'
feat(cms): add M22 StoreInfo data layer

Query and service are one data-layer slice; they land and review together.
EOF
)"

git add components/cms-modules/store-info/storeInfo.types.ts components/cms-modules/store-info/storeInfo.mapper.ts
git commit -m "$(cat <<'EOF'
feat(cms): add StoreInfo module types and mapper

Types and mapper are a tight pair; UI components depend on both.
EOF
)"

git add components/cms-modules/store-info/StoreInfoBlock.tsx components/cms-modules/store-info/StoreInfoImageCarousel.tsx components/cms-modules/store-info/index.ts
git commit -m "$(cat <<'EOF'
feat(cms): add StoreInfo module components

Both UI blocks and the barrel export ship as one module slice.
EOF
)"

git add 'components/views/CMCollection/CMCollection.asPageBodyElement[M22-StoreInfo].tsx' lib/viewdispatcher/cmsModuleViewtypes.ts lib/viewdispatcher/viewmapping.ts
git commit -m "$(cat <<'EOF'
feat(cms): wire M22 StoreInfo into view dispatcher

View wiring depends on all module pieces; registry and mapping updated together for the new viewtype.
EOF
)"
```

---

Reply **approve** to have me execute as-is, copy-paste the commands yourself, or tell me what to change.
````

**Note:** If `cmsModuleViewtypes.ts` and `viewmapping.ts` were modified for unrelated reasons, split into two commits (viewtype registration vs mapping entry).

---

## Example 2 — Bug fix + unrelated tweak

**Input:** Button style fix + unrelated CTA view change

**Plan:** Already atomic — 1 file per commit. No merging.

````markdown
## Commit Plan

**Branch:** `fix/button-styles`
**Files changed:** 2 files
**Commits proposed:** 2

---

### Commit 1/2 — `fix: tertiary button transparent background`
**Why:** Tertiary buttons were rendering with an opaque background.
**Files:**
- `design-system/primitives/buttons/button-tokens.css` (modified)

**Commands:**
```bash
git add design-system/primitives/buttons/button-tokens.css
git commit -m "$(cat <<'EOF'
fix: tertiary button transparent background

Tertiary buttons were rendering with an opaque background.
EOF
)"
```

### Commit 2/2 — `fix(cms): correct GenericCta viewtype handling`
**Why:** Unrelated CTA mapping fix discovered during testing.
**Files:**
- `components/views/CMTeaser/CMTeaser.asPageBodyElement[M00-GenericCta].tsx` (modified)

**Commands:**
```bash
git add 'components/views/CMTeaser/CMTeaser.asPageBodyElement[M00-GenericCta].tsx'
git commit -m "$(cat <<'EOF'
fix(cms): correct GenericCta viewtype handling

Unrelated CTA mapping fix discovered during testing.
EOF
)"
```

---

**Copy-paste all commands** (run in order):

```bash
git add design-system/primitives/buttons/button-tokens.css
git commit -m "$(cat <<'EOF'
fix: tertiary button transparent background

Tertiary buttons were rendering with an opaque background.
EOF
)"

git add 'components/views/CMTeaser/CMTeaser.asPageBodyElement[M00-GenericCta].tsx'
git commit -m "$(cat <<'EOF'
fix(cms): correct GenericCta viewtype handling

Unrelated CTA mapping fix discovered during testing.
EOF
)"
```

---

Reply **approve** to have me execute as-is, copy-paste the commands yourself, or tell me what to change.
````

---

## Example 3 — User revises plan

**User:** "Split commit 3 — keep the barrel separate"

**Agent:** Re-presents updated plan: components in one commit (2 files), barrel in its own commit (1 file). Waits for approval again.

**User:** "approve"

**Agent:** Executes the commands from the plan sequentially, reports hashes.

---

## Example 4 — When to stop splitting

**Input:** Single-line typo fix in one file

**Plan:** One commit. Do not invent extra commits or bundle unrelated nearby edits.

````markdown
### Commit 1/1 — `fix: correct StoreCard aria label`
**Why:** Screen readers announced the wrong label.
**Files:**
- `components/StoreCard/StoreCard.tsx` (modified)
````
