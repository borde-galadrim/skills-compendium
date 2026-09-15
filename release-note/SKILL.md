---
name: release-note
description: Lists user-facing changes as bullet points classified as new features, improvements, or small fixes. Compares git ranges (tag..tag, or HEAD vs develop/main/origin). Use when the user asks for release notes, what shipped since a tag, changelog between tags, or "/release-note".
disable-model-invocation: true
---

# Release note

Summarize what changed for humans who use or operate the product—not for engineers reviewing code. Works in **any** git repo.

## Resolve the git range

Default when the user does **not** name a range:

| Situation | Range |
|-----------|--------|
| Unspecified | `HEAD` (current branch tip) vs default base branch |
| User says `origin` / remote base | Use `origin/<base>` instead of local `<base>` |

**Default base branch:** `develop` if it exists (local or `origin/develop`), else `main`, else `master`.

```bash
git rev-parse --abbrev-ref HEAD
git show-ref --verify --quiet refs/heads/develop || git show-ref --verify --quiet refs/remotes/origin/develop
git show-ref --verify --quiet refs/heads/main || git show-ref --verify --quiet refs/remotes/origin/main
```

Prefer `<base>..<current>` where `<current>` is `HEAD` unless the user names another tip. For “on develop but not tagged yet”, use `<tag>..develop` (or `origin/develop`).

When the user **does** mention tags or refs, honor them:

| User intent | Range |
|-------------|--------|
| “since last tag” | `<latest-semver-tag>..HEAD` (or `..develop` if they said develop) |
| “between v1.2 and v1.3” | `v1.2..v1.3` |
| “since v1.36.2 on develop” | `v1.36.2..develop` |
| “current vs origin/main” | `origin/main..HEAD` |

**Latest tag** (when asked “last tag” / “since last release”):

```bash
git fetch --tags --quiet
git tag -l 'v*' --sort=-v:refname | head -10
```

Pick the highest semver-like `v*` tag that is an ancestor of the comparison tip. Skip junk tags (`latest`, `*-dev-*`, `vTest-*`) unless the user named them.

```bash
git merge-base --is-ancestor <from> <to>
git rev-list --count <from>..<to>
```

If `<from>` is not an ancestor of `<to>`, say so; use symmetric `git log <from>...<to>` only if needed.

### Multi-repo workspaces

If the workspace root is not a git repo but children are, detect repos with `.git` and cover each unless the user scoped to one. State the range **per repo**.

## Collect changes

```bash
git log <from>..<to> --oneline --no-merges
git log <from>..<to> --format='%s%n%b%n---' --no-merges
git log <from>..<to> --oneline --merges | head -30
```

Optional: `gh pr list --state merged --base <base> --limit 20 --json number,title,mergedAt`

## Classify

| Label | When |
|-------|------|
| **New feature** | New capability, flow, or meaningful new UX |
| **Improvement** | Noticeable polish on something that already existed |
| **Small fix** | Bug fix, hardening, minor correction |

Omit pure chore/refactor/test and **internal-only** docs unless the user asks for a full dump. Merge related commits into **one outcome bullet**.

### Docs inclusion

Include documentation when the intended readers are **product audiences** (customers, end users, content authors, support, operators)—anyone who uses the product or configures it, not only developers.

- Include: help content, authoring/admin guides, user-facing changelogs, in-product guidance
- Omit: contributor/dev-only docs (internals, test notes, engineering READMEs) unless asked for everything

User-relevant docs → **New feature** (new guide) or **Improvement** (updated guidance). Commit prefixes are hints only.

Lead with what those audiences care about; mention backend/infra only when it changes speed, reliability, or unlocks a user-facing change.

## Output format (required)

```markdown
## `<from>` → `<to>`
<!-- add (repo name) when multiple repos -->

### New features
- …

### Improvements
- …

### Small fixes
- …
```

- One short opener: range + repo(s)
- Bullets = outcome language, not commit subjects
- Omit empty sections
- Do not invent changes not in commits/PRs/diffs
- If the range was ambiguous, state what you chose

## Example

```markdown
## `v1.2.0` → `develop`

### New features
- Category product listing with filters and sort
- Authoring guide for the new listing module

### Improvements
- Faster first load of category listings
- Clearer filter labels in the admin guide

### Small fixes
- Filtered listing pages excluded from search indexing
```
