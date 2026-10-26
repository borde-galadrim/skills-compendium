# Skills compendium

Portable agent skills. Each folder under `skills/` is an Agent Skill (`SKILL.md` plus optional helpers) and works in any IDE or harness that loads that format.

Skills discover repository conventions from Git metadata, manifests, CI config, and repo guidance — they do not assume a specific forge, package manager, default branch, or project domain.

This repository is the source of truth. Install from GitHub so later edits can be pulled with an update command, rather than recopying folders.

## Skills

| Skill | When to use |
| --- | --- |
| [rgaa-dev](skills/rgaa-dev/) | RGAA 4.1.2 / WCAG 2.2 AA implementation guide (HTML + React/TypeScript, optional DSFR) for French public-sector web apps. |
| [rgaa-audit](skills/rgaa-audit/) | RGAA 4.1.2 static-code audit (C/NC/NA report). |

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

Optional: `--skill rgaa-dev --skill rgaa-audit`, or `-g` for a user-wide install. To target one harness: `npx skills add borde-galadrim/skills-compendium --agent claude-code|cursor|codex`.

**GitHub CLI** (Cursor example, user-wide):

```bash
gh skill install borde-galadrim/skills-compendium --all --agent cursor --scope user
```

Later:

```bash
gh skill update
```

Use `--scope project` inside an application repo to install into `.agents/skills/` (committed with that project). Pin a release with `@tag` or `--pin` when a client must not float.

**Copy fallback** (snapshot — will not track updates). Install both skills together: `rgaa-audit` links to `rgaa-dev/impacts.md`.

| Harnais | User-wide | Projet |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Cursor | `~/.cursor/skills/` ou `~/.agents/skills/` | `.cursor/skills/` ou `.agents/skills/` |
| Codex | `~/.agents/skills/` | `.agents/skills/` |

Exemple (Claude Code, user-wide) :

```bash
cp -R skills/rgaa-dev skills/rgaa-audit ~/.claude/skills/
```

Chemins vérifiés par recherche web (non confirmés sur la page officielle) : Cursor (`.cursor/skills/`, `.agents/skills/`, `~/.cursor/skills/`, `~/.agents/skills/`) et Codex (`.agents/skills/`, `~/.agents/skills/`). Non vérifié : les chemins Claude Code (`~/.claude/skills/`, `.claude/skills/`) n'ont pas été contrôlés dans cette passe. Le flag `--agent claude-code|cursor|codex` de `npx skills` n'a pas non plus été vérifié.

## Compatibility

| Harnais | Format | Invocation | Prérequis navigateur (Phase 2 de `rgaa-audit`) |
| --- | --- | --- | --- |
| Claude Code | `SKILL.md` | `/rgaa-audit <chemin>` | Extension Claude in Chrome connectée |
| Cursor | `SKILL.md` | `/rgaa-audit <chemin>` | Navigateur intégré de Cursor |
| Codex | `SKILL.md` | Citer `rgaa-audit` par son nom | Playwright MCP ou navigateur Codex configuré |

Les skills ne dépendent d'aucun outil navigateur précis : `references/runtime-browser.md` contient le tableau de correspondance entre capacités et outils. Sans outil navigateur, `rgaa-audit` demande à l'humain de réaliser les trois tests runtime (clavier, zoom 200 %, focus visible) et marque `non exécuté` ce qui n'a pas été vérifié.

`paths:` dans le frontmatter de `rgaa-audit` est une option propre à Claude Code ; les autres harnais l'ignorent.

Contributeurs : voir [AGENTS.md](AGENTS.md) (`CLAUDE.md` importe ce fichier).

## Portability

- **Default branch:** resolved from `origin/HEAD`, then common branch names, then repo docs — not hardcoded to `main`.
- **Package manager / CI:** inferred from lockfiles, manifests, and workflow config.
- **Forge CLIs** (`gh`, `glab`, etc.): optional adapters when installed; never required.
- **Change-request output:** returned as markdown in chat by default; file output only when requested or repo convention requires it.

Repo-specific rules in `AGENTS.md`, `CONTRIBUTING.md`, and area docs always override generic skill heuristics.
