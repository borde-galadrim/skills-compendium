# Skills compendium

Portable agent skills. Each folder under `skills/` is an Agent Skill (`SKILL.md` plus optional helpers) and works in any IDE or harness that loads that format.

Skills discover repository conventions from Git metadata, manifests, CI config, and repo guidance — they do not assume a specific forge, package manager, default branch, or project domain.

This repository is the source of truth. Install from GitHub so later edits can be pulled with an update command, rather than recopying folders.

## Skills

| Skill | When to use |
| --- | --- |
| [rgaa-dev](skills/rgaa-dev/) | RGAA 4.1.2 / WCAG 2.2 AA implementation guide (HTML + React/TypeScript, optional DSFR) for French public-sector web apps. |
| [audit](skills/audit/) | RGAA 4.1.2 static-code audit (C/NC/NA report). |

Based on [Isalafont/claude-skill-rgaa-dev](https://github.com/Isalafont/claude-skill-rgaa-dev) (Licence Ouverte 2.0). Last vendored update: September 2026.

## Install

Replace `borde-galadrim/skills-compendium` with this repository if you forked it. A private repo needs GitHub access.

**npx skills** (any Agent Skills client):

```bash
npx skills add borde-galadrim/skills-compendium
```

Later, after this repo changes:

```bash
npx skills update
```

Optional: `--skill rgaa-dev --skill audit`, or `-g` for a user-wide install.

**GitHub CLI** (Cursor example, user-wide):

```bash
gh skill install borde-galadrim/skills-compendium --all --agent cursor --scope user
```

Later:

```bash
gh skill update
```

Use `--scope project` inside an application repo to install into `.agents/skills/` (committed with that project). Pin a release with `@tag` or `--pin` when a client must not float.

**Copy fallback** (snapshot — will not track updates):

```bash
cp -R skills/rgaa-dev skills/audit ~/.agents/skills/
```

Project-level copy:

```bash
cp -R skills/rgaa-dev skills/audit .agents/skills/
```

Use whichever skills directory your harness documents if it differs from those paths.

## Portability

- **Default branch:** resolved from `origin/HEAD`, then common branch names, then repo docs — not hardcoded to `main`.
- **Package manager / CI:** inferred from lockfiles, manifests, and workflow config.
- **Forge CLIs** (`gh`, `glab`, etc.): optional adapters when installed; never required.
- **Change-request output:** returned as markdown in chat by default; file output only when requested or repo convention requires it.

Repo-specific rules in `AGENTS.md`, `CONTRIBUTING.md`, and area docs always override generic skill heuristics.
