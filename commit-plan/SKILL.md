---
name: commit-plan
description: Analyzes staged and unstaged git changes, proposes a multi-commit plan grouped by logical concern (2–5 related files per commit when possible), with copy-pasteable git commands and messages, and commits only after explicit user validation. Use when the user asks for a commit plan, wants to organize/split changes into commits, or says "commit plan", "plan my commits", or "commit these changes".
---

# Commit Plan

Plan focused, multi-commit splits from current working tree changes, get user approval, then execute.

## Workflow

```
1. Analyze  →  2. Propose plan  →  3. User validates  →  4. Execute commits
```

**Never commit without explicit user validation** (e.g. "looks good", "go ahead", "commit it").

---

## Phase 1 — Analyze

Run in parallel:

```bash
git status
git diff --staged
git diff
git log --oneline -15
```

Also check:

- Untracked files that belong in the plan
- Files that should **not** be committed (`.env`, credentials, secrets) — warn the user
- Whether the branch tracks a remote and if commits are already pushed (affects amend rules)

---

## Phase 2 — Propose plan

**Split by concern, group within concern.** Produce several commits — never one catch-all commit — but **group related files together** when they share one reason and land safely as a unit.

### Grouping rules (apply first)

1. **One reason per commit** — if the message needs "and" for unrelated work, split.
2. **Target 2–5 files per commit** — prefer grouping co-dependent files over one commit per file.
3. **Single-file commits are fine** when a change truly stands alone or mixing would blur review.
4. **Re-examine any draft commit with 6+ files** — split by sub-concern unless files are genuinely inseparable.
5. **Order by dependency** — types → services → components → wiring; group files within each layer when they belong together.
6. **Never mix concerns** — unrelated fixes, refactors, and features always get separate commits.

### What to group in one commit

| Case | Example |
|------|---------|
| Tight pair that breaks without the other | `.tsx` + its colocated `.types.ts` |
| Same layer, same feature slice | query + service, or panel + constants + shared styles |
| Co-dependent wiring | overlay component + provider updated for the same step |
| Rename / move | old path deleted + new path added |
| Mechanical barrel export | `index.ts` with the components it re-exports |
| Generated + source | Only if repo policy requires committing together |

If unsure whether to group, **group when files share one reviewable reason** — avoid splitting into many 1-file commits when the diff is clearly one feature slice.

If unsure whether to split, **split when concerns differ** — do not bundle unrelated areas just to hit 2–5 files.

### Commit message style

1. **Match repo style** — read `git log` for the current branch
2. **Fall back to conventional commits** (`feat:`, `fix:`, `refactor:`, `chore:`) when repo style is inconsistent

Messages: 1–2 sentences, focus on **why**, not a file list.

### Plan output format

Present the plan using this structure. **Every commit must include a copy-pasteable command block** (`git add` + `git commit` with HEREDOC) so the user can run commits manually or approve agent execution.

````markdown
## Commit Plan

**Branch:** `current-branch`
**Files changed:** N files (+X / -Y lines)
**Commits proposed:** N

---

### Commit 1/N — `type: short subject`
**Why:** One sentence explaining the purpose.
**Files:**
- `path/to/file.ts` (modified)
- `path/to/new.ts` (new)

**Commands:**
```bash
git add path/to/file.ts path/to/new.ts
git commit -m "$(cat <<'EOF'
type: short subject

One sentence explaining the purpose.
EOF
)"
```

### Commit 2/N — `type: short subject`
...

---

**Excluded from plan:**
- `path/to/secret.env` — contains secrets

**Notes:**
- Any risks, ordering rationale, or open questions

---

**Copy-paste all commands** (run in order):

```bash
git add path/to/file.ts path/to/new.ts
git commit -m "$(cat <<'EOF'
type: short subject

One sentence explaining the purpose.
EOF
)"

git add path/to/other.ts path/to/other-two.ts
git commit -m "$(cat <<'EOF'
type: other subject

Why for this commit.
EOF
)"
```

---

Reply **approve** to have me execute as-is, copy-paste the commands yourself, or tell me what to change (reorder, merge, split, edit messages).
````

**Command block rules:**
- One `git add` line listing exactly that commit's files (space-separated paths)
- One `git commit` with HEREDOC — message body matches the **Why** (subject line = commit title)
- End with a **Copy-paste all commands** section concatenating every commit's commands in order (blank line between commits)
- Use repo-relative paths
- **Shell-safe paths (mandatory):** single-quote every path that contains shell metacharacters — especially `[` `]` (CoreMedia view files like `CMCollection.asPageBodyElement[M33-…].tsx`), also `*` `?` `{` `}` spaces `$` backticks. Unquoted `[…]` fails instantly in zsh with `no matches found` before `git` runs. Prefer single quotes (`'path[with].tsx'`) so the paste works in zsh and bash. Plain alphanumeric paths stay unquoted.

**Prefer fewer, well-grouped commits over many 1-file commits.** If the diff spans 10+ files, expect roughly 3–6 commits when changes cluster by feature — not 8–12 micro-commits unless concerns are truly independent.

Adjust commit count and groupings based on the diff — the template is a guide, not a fixed layout.

---

## Phase 3 — User validation

Wait for explicit approval. If the user requests changes:

- Revise the plan
- Re-present the full updated plan
- Do not commit until re-approved

If there are **no changes** to commit, say so and stop.

---

## Phase 4 — Execute commits

After approval, run the **same commands from the plan** for each commit in order (do not improvise different staging or messages).

1. `git add <files>` — only that commit's files
2. `git commit -m "$(cat <<'EOF' ... EOF')"` — exact message from the plan
3. After all commits: `git status` to verify clean state (or report remaining changes)

If the user copy-pastes commands themselves instead of approving agent execution, skip Phase 4 and offer to verify with `git log` / `git status` if helpful.

### Git safety (mandatory)

- **NEVER** update git config
- **NEVER** run destructive commands (`push --force`, `hard reset`) unless explicitly requested
- **NEVER** skip hooks (`--no-verify`, `--no-gpg-sign`) unless explicitly requested
- **NEVER** force-push to `main`/`master` — warn if requested
- **NEVER** use `git commit --amend` unless ALL apply:
  1. User explicitly requested amend, OR pre-commit hook auto-modified files from your commit
  2. HEAD commit was created by you in this conversation
  3. Commit has NOT been pushed to remote
- If a commit **fails** due to a hook: fix the issue, create a **new** commit (do not amend)
- **Do not push** unless the user explicitly asks

### Execution report

After committing, summarize:

```markdown
## Commits created

| # | Hash | Message |
|---|------|---------|
| 1 | `abc1234` | feat: ... |

**Remaining changes:** none / list any
```

---

## Grouping heuristics

| Situation | Action |
|-----------|--------|
| New feature + unrelated fix | Separate commits (never combine) |
| Layered feature (types, service, UI, wiring) | **One commit per layer**, grouping all files in that layer when they share one reason |
| Multiple components in same feature slice | **One commit** when they ship together and share styling/constants |
| Types + sole consumer in same slice | Group when introduced together; split only if types are reused broadly |
| Refactor + behavior change | Refactor first, behavior second — separate commits |
| Generated files + source | Source first, generated after (or exclude generated if policy says so) |
| WIP / debug code | Exclude or separate `chore:` commit only if user agrees |
| Single file, single purpose | **One commit** — do not pad with unrelated files |
| 6+ files in one draft commit | Re-examine: split by sub-concern unless one indivisible feature slice |
| Many 1-file commits for one feature | **Merge** into 2–5 file commits by layer or slice |

### Anti-patterns

- ❌ One commit for the entire working tree ("feat: appointment step 2" with 9 unrelated concerns)
- ❌ "feat: add StoreInfo module" bundling query, service, 5 components, and wiring across layers
- ❌ Grouping all header changes because they're all in `design-system/templates/header/` when fixes are unrelated
- ❌ Eight 1-file commits for one feature slice that reviewers must read as a single unit
- ✅ `feat(cms): add M22 StoreInfo data layer` (query + service, 2 files) → `feat(cms): add StoreInfo module UI` (types + mapper + components, 4 files) → `feat(cms): wire M22 StoreInfo view` (3 files)

---

## Examples

See [examples.md](examples.md) for sample plans.
