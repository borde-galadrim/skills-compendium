---
name: pr-description
description: Generates pull request descriptions from git changes using a structured Summary / includes / Related tickets format. Writes pr-description.md at the repo root and returns raw markdown only. Use when the user asks for a PR description, PR body, pull request summary, or says "generate PR description", "/pr-description", or wants help writing a PR before opening it with gh.
---

# PR Description

Generate a PR body from branch changes. Output is ready to paste into GitHub or pass to `gh pr create --body`.

## Output format (required)

Always deliver the PR description as a **standalone markdown document**:

1. **Write** the description to `pr-description.md` at the repository root (create or overwrite).
2. **Return** the same content in chat as raw markdown — the full document only, with no preamble, commentary, or closing notes before or after.

Do not wrap the returned markdown in a code fence. Do not summarize the description in prose instead of returning it. The chat response and `pr-description.md` must match.

## Workflow

1. **Analyze changes** — run in parallel when possible:

```bash
git status
git diff
git diff --staged
git log --oneline -20
git log main...HEAD --oneline
```

Adjust `main` to the repo's default base branch if different (`master`, `develop`, etc.).

2. **Infer scope** — from diffs and commits: feature area, CMS blocks, new utilities, guides, fixes, refactors.
3. **Draft the description** using the template below.
4. **Write** `pr-description.md` at the repository root.
5. **Return** the file contents as the response (markdown only).
6. **Omit optional sections** when not applicable; use placeholders when the user must fill in details you cannot infer.

---

## Output template

Use this structure. **Only include sections that apply.** Leave `[placeholders]` for unknown values.

```markdown
# Summary

> This PR is based on the branch of #[PR numbers], please review #[PR numbers] first before reviewing this PR.

This PR [implements | fixes | refactors | adds] the _[Feature or component name]_ [for/on/in] _[Context, e.g. Homepage]_.

This PR includes :
- [Bullet 1 — concrete change, e.g. new cms-component with related guide for studio edition]
- [Bullet 2]
- [Bullet 3]

## Related tickets

[AVA-XXX Ticket title]
```

### Section rules

| Section | Required? | Notes |
|---------|-----------|-------|
| `# Summary` | Yes | Always present |
| Blockquote (PR dependencies) | No | Only when this branch stacks on other open PRs. Use `#[number]` format. Omit entirely if standalone. |
| Opening paragraph | Yes | One clear sentence: what this PR does. Use `_underscores_` for emphasis on names (CMS blocks, pages, utilities). |
| `This PR includes :` bullets | Usually | List distinct deliverables (components, helpers, guides, migrations). Skip if a single trivial change. |
| `## Related tickets` | No | One line per ticket: `AVA-XXX Short title`. Omit if no ticket or unknown — use `[AVA-XXX Title]` placeholder. |

### Wording conventions

- **implements** — new feature or CMS block
- **fixes** — bug fix
- **refactors** — behavior unchanged, structure improved
- **adds** — incremental capability (helper, guide, config)
- Bullets: start lowercase after the dash; be specific (file/area names when helpful).
- Do **not** invent ticket numbers or PR numbers — use placeholders.

---

## Optional additions

Add only if the user asks or the change clearly needs it:

```markdown
## Test plan

- [ ] [How to verify change 1]
- [ ] [How to verify change 2]
```

```markdown
## Notes

[Breaking changes, feature flags, follow-up work, or deployment notes]
```

Default output **does not** include Test plan unless requested (user's standard template focuses on Summary + tickets).

---

## Example

**Input:** Branch adds Partnership homepage CMS block, display-options color helper, studio guides. Depends on PRs #28 and #32. Ticket AVA-236.

**Output** (written to `pr-description.md` and returned as raw markdown in chat):

# Summary

> This PR is based on the branch of #28 and #32, please review #28 and #32 first before reviewing this PR.

This PR implements the _Partnership_ CMS view block for the _Homepage_.

This PR includes :
- A new cms-component with related guide for studio edition.
- A new CoreMedia utility helper for _Display Options_ Color handling.
- Related guide for studio edition.

## Related tickets

AVA-236 Partnership

**Input:** Small bugfix, no stacked PRs, ticket unknown.

**Output** (written to `pr-description.md` and returned as raw markdown in chat):

# Summary

This PR fixes _[describe fix]_ in _[area]_.

This PR includes :
- [Specific change]

## Related tickets

[AVA-XXX Title]

---

## Integration with `gh`

When the user wants to open the PR, after they approve the description:

```bash
gh pr create --title "[concise title]" --body-file pr-description.md
```

Title: short, imperative, matches repo `git log` style when obvious.
