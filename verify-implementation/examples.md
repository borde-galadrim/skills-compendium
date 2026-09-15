# Examples

## Invocation

- "Verify the implementation against the plan"
- "Did we build the plan correctly?"
- `/verify-implementation` after completing a planned CMS module
- "Acceptance check before I open the PR"

## Sample verdict (PASS WITH WARNINGS)

```markdown
# Implementation verification

**Verdict:** PASS WITH WARNINGS

## Scope

- **Plan/spec:** Add PDP02 anchor section variant mapper + view registration
- **Base:** `main...HEAD`
- **Commits:** 2
- **Changed areas:** `CoreMedia_AvivA_Next` CMS module, view dispatch

## Requirement traceability

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Map section variant fields from GraphQL | Implemented | `pdp02AnchorNavigationSectionVariant.mapper.ts` |
| 2 | Register viewtype dispatch | Implemented | `CMCollection.asPageBodyElement[PDP02-…].tsx` |
| 3 | Studio: link settings document | Manual | Requires Studio verification |

## Mechanical evidence

| Check | Command | Result |
|-------|---------|--------|
| Tests | `pnpm --dir CoreMedia_AvivA_Next test -- pdp02` | pass |
| Typecheck | `pnpm --dir CoreMedia_AvivA_Next typecheck` | pass |

## Findings

### [low] Duplicate slug normalizer

- **Location:** `pdp02AnchorNavigationSectionVariant.mapper.ts:42`
- **Evidence:** `normalizeSlug` mirrors `lib/coremedia/sitemap/normalizeChannelExclusion.ts`
- **Impact:** Drift risk if slug rules change
- **Recommendation:** Reuse existing helper

## Final assessment

Implementation matches the plan; merge after swapping the duplicate helper or accepting the low-risk duplication.

```

## Sample verdict (FAIL)

```markdown
**Verdict:** FAIL

### [critical] Hardcoded CMS content ID

- **Location:** `components/foo/Bar.tsx:18`
- **Evidence:** `const SETTINGS_ID = "12345"`
- **Impact:** Violates AGENTS.md; breaks across environments
- **Recommendation:** Resolve settings via GraphQL from page grid entry point

## Final assessment

Not merge-ready — remove hardcoded content ID and wire through CMS relationships.
```
