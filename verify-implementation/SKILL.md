---
name: verify-implementation
description: Verifies that an approved implementation plan was built correctly without regressions, unnecessary helper duplication, architectural problems, poor practices, or security defects. Use after planned code changes are complete, before merge or release, or when the user asks to verify the plan was implemented correctly.
disable-model-invocation: true
---

# Verify Implementation

Post-plan acceptance gate. **Read-only** — do not edit files, commit, or claim a check passed without evidence.

Use when a plan has been implemented and you need to confirm it is safe to merge or hand off.

## When to use / not use

**Use:** plan is done, "verify the implementation", "did we build the plan correctly", pre-merge acceptance, post-agent implementation review.

**Not use:** still planning (use design skills instead), quick uncommitted scratch review (use `code-review` or `review-bugbot`), or the user wants fixes applied (verify first, fix only if asked).

## Inputs

Resolve before starting:

| Input | Source (in order) |
|-------|-------------------|
| **Plan / spec** | Conversation plan, user-provided spec path, issue/PR body, `docs/` or `.scratch/` matching the branch |
| **Diff scope** | User-supplied base, else merge-base with default branch (`git merge-base HEAD origin/main` or repo default) |
| **Repo rules** | `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, area docs (`doc/`, `docs/`) |
| **Validation commands** | `package.json` scripts, CI config, area test docs |

If plan or diff is missing, report `BLOCKED` and stop.

## Workflow

```
1. Pin scope  →  2. Trace requirements  →  3. Parallel review axes  →  4. Mechanical checks  →  5. Report
```

### 1. Pin scope

Run in parallel:

```bash
git status --short
git log <base>..HEAD --oneline
git diff --stat <base>...HEAD
```

Confirm `<base>` resolves (`git rev-parse <base>`). Empty diff → report and stop.

List changed areas (packages, layers, CMS modules, API routes). Note anything outside the plan as potential scope creep.

### 2. Trace requirements

Extract every requirement from the plan as a numbered checklist. For each:

- **Implemented** — cite file(s) and behavior
- **Partial** — what is missing
- **Missing** — not in the diff
- **Unrequested** — in the diff but not in the plan (scope creep)

Also flag plan items that need **CoreMedia Studio** steps the code cannot prove — mark as `MANUAL`.

### 3. Parallel review axes

Spawn **up to four read-only sub-agents in parallel** (skip any axis with nothing to check). Each gets: diff command, plan excerpt, changed-file list, and repo rules paths — not the full patch in the parent prompt.

| Axis | Focus | Sub-agent brief |
|------|-------|-----------------|
| **Plan** | Requirements, scope creep, wrong behavior | "Map each plan requirement to the diff. Report missing, partial, wrong, and unrequested changes. Quote the plan line per finding. Under 400 words." |
| **Regression** | Breakage of existing behavior | "What existing flows could this diff break? Check call sites, exports, feature flags, error paths, and tests touched or missing. Under 400 words." |
| **Architecture** | Duplication, seams, depth | "Flag duplicated helpers/logic, pass-through modules, speculative abstractions, wrong dependency direction, shallow interfaces. Prefer reusing existing utilities. Use deep-module vocabulary. Under 400 words." |
| **Security** | Secrets, auth, injection, config | "Review for security defects: input validation, authz, XSS/CSRF/injection, secret leakage, runtime env misuse. Under 400 words." |

**Architecture vocabulary:** consult `/codebase-design` skill terms (module, interface, depth, seam) — reference, do not re-teach.

**Repo-specific gates** (when `AGENTS.md` or area docs exist): read [CHECKLIST.md](CHECKLIST.md) and apply matching sections. Repo docs override generic heuristics.

**Optional deeper passes** (only when user asks or change is large/security-sensitive):

- `/code-review` for Standards + Spec axes against a fixed point
- `/review-bugbot` for bug-focused diff review
- `/review-security` for dedicated security subagent

Do not run optional passes by default — this skill's four axes are the baseline.

### 4. Mechanical checks

Run the **smallest relevant commands first**, then broaden:

1. Targeted tests for changed modules (if identifiable)
2. Package lint / typecheck for touched packages
3. Broader test or build only when the change warrants it

Record exact commands and pass/fail. A check that was not run is `UNVERIFIED`, not pass.

Discover commands from `package.json` at repo root and in touched packages (`CoreMedia_AvivA_Next`, `CoreMedia_AvivA_API-Gateway`, etc.). Prefer `pnpm --dir <pkg> <script>` when the monorepo delegates that way.

### 5. Report

Produce output using [REPORT-TEMPLATE.md](REPORT-TEMPLATE.md).

**Verdict rules:**

| Verdict | When |
|---------|------|
| `PASS` | All requirements met, no blocking findings, mechanical checks pass |
| `PASS WITH WARNINGS` | Requirements met, only low/medium findings or unverified manual steps |
| `FAIL` | Any missing requirement, wrong behavior, or blocking/high finding |
| `BLOCKED` | Plan or diff unavailable, or critical checks could not run |

**Finding format:** severity (`critical` / `high` / `medium` / `low` / `nit`), location (`file:line`), evidence, impact, recommendation.

Sort findings by severity. End with one sentence: ready to merge or what must be fixed first.

Do not fix findings unless the user explicitly asks next.

## Severity guide

| Level | Examples |
|-------|----------|
| **critical** | Security hole, data loss, broken auth, hardcoded secrets, plan requirement entirely missing |
| **high** | Regression in core flow, wrong business logic, duplicated utility that already exists, CMS ID hardcoding |
| **medium** | Shallow module, missing edge-case test, scope creep with risk |
| **low** | Naming, minor duplication, style |
| **nit** | Preference, optional refactor |

## Examples

See [examples.md](examples.md).
