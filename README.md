# Skills compendium

Portable agent skills. Each folder under `skills/` is an Agent Skill (`SKILL.md` plus optional helpers) and works in any IDE or harness that loads that format.

Skills discover repository conventions from Git metadata, manifests, CI config, and repo guidance — they do not assume a specific forge, package manager, default branch, or project domain.

This repository is the source of truth. Install from GitHub so later edits can be pulled with an update command, rather than recopying folders.

## Skills

| Skill | When to use |
| --- | --- |
| [rgaa-dev](skills/rgaa-dev/) | RGAA 4.1.2 / WCAG 2.2 AA implementation guide (HTML + React/TypeScript, optional DSFR) for French public-sector web apps. |
| [rgaa-audit](skills/rgaa-audit/) | RGAA 4.1.2 audit of all 106 criteria: DOM inventory and applicability, static code analysis, browser checks (Claude in Chrome first, plus a zero-dependency Chrome runner) and evidence-based agent judgment; each criterion gets C / NC / NA / NT plus a confidence level. Output as Markdown, published artifact page, JSON, or direct fixes. |

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

Optional: `--skill rgaa-dev --skill rgaa-audit`, or `-g` for a user-wide install.

**Always-on project rules** (recommended for app repos). A skill loads only when the agent decides a task matches it. This step also puts a short block of RGAA rules ([project-rules.md](skills/rgaa-dev/project-rules.md)) in the project's `AGENTS.md`, so every session sees them. Run from the project root:

```bash
npx skills add borde-galadrim/skills-compendium --skill rgaa-dev -y \
  && node .agents/skills/rgaa-dev/scripts/install-project-rules.mjs
```

The script writes the block between `<!-- rgaa-dev:start -->` / `<!-- rgaa-dev:end -->` markers. Rerunning it replaces the block, so run it again after `npx skills update`. If `CLAUDE.md` exists and doesn't reference `AGENTS.md`, it appends `@AGENTS.md`. If `CLAUDE.md` is missing but `.claude/` exists, it creates the file. Add `--check` in CI to fail when the block is missing or stale.

Already installed the skill? Ask your agent to "set up rgaa-dev in this project": the skill runs the script, or makes the same edit by hand if Node isn't available. To target one harness: `npx skills add borde-galadrim/skills-compendium --agent claude-code|cursor|codex`.

**GitHub CLI** (Claude Code example, user-wide; use `--agent cursor` or `--agent codex` for the other harnesses):

```bash
gh skill install borde-galadrim/skills-compendium --all --agent claude-code --scope user
```

Later:

```bash
gh skill update
```

Use `--scope project` inside an application repo to install into the project (committed with it): `.claude/skills/` for Claude Code, `.agents/skills/` for Cursor, Codex and most other agents. Pin a release with `@tag` or `--pin` when a client must not float.

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

Non vérifié : les chemins Claude Code (`~/.claude/skills/`, `.claude/skills/`) n'ont pas été contrôlés dans cette passe. Chemins vérifiés par recherche web (non confirmés sur la page officielle) : Cursor (`.cursor/skills/`, `.agents/skills/`, `~/.cursor/skills/`, `~/.agents/skills/`) et Codex (`.agents/skills/`, `~/.agents/skills/`). Le flag `--agent claude-code|cursor|codex` de `npx skills` n'a pas non plus été vérifié ; celui de `gh skill install` figure dans son aide.

## Compatibility

| Harnais | Format | Invocation | Prérequis navigateur (Phase 2 de `rgaa-audit`) |
| --- | --- | --- | --- |
| Claude Code | `SKILL.md` | `/rgaa-audit <chemin>` | Extension Claude in Chrome connectée (moyen privilégié) |
| Cursor | `SKILL.md` | `/rgaa-audit <chemin>` | Navigateur intégré de Cursor |
| Codex | `SKILL.md` | Citer `rgaa-audit` par son nom | Playwright MCP ou navigateur Codex configuré |

Sous Claude Code, `rgaa-audit` pilote en priorité le Chrome de l'utilisateur via Claude in Chrome (sessions authentifiées comprises) et complète par le script runtime les mesures que l'extension ne fournit pas (émulation exacte du zoom, mouvement réduit, écouteurs d'événements, axe-core). Ailleurs, la skill utilise le script runtime puis l'outil navigateur du harnais. Aucun outil n'est obligatoire : `references/runtime-browser.md` contient le tableau de correspondance entre capacités et outils. Sans outil navigateur, `rgaa-audit` demande à l'humain de réaliser les trois tests runtime (clavier, zoom 200 %, focus visible) et marque `non exécuté` ce qui n'a pas été vérifié.

`paths:` dans le frontmatter de `rgaa-audit` est une option propre à Claude Code ; les autres harnais l'ignorent.

Contributeurs : voir [AGENTS.md](AGENTS.md) (`CLAUDE.md` importe ce fichier).

## Portability

- **Default branch:** resolved from `origin/HEAD`, then common branch names, then repo docs — not hardcoded to `main`.
- **Package manager / CI:** inferred from lockfiles, manifests, and workflow config.
- **Forge CLIs** (`gh`, `glab`, etc.): optional adapters when installed; never required.
- **Change-request output:** returned as markdown in chat by default; file output only when requested or repo convention requires it.

Repo-specific rules in `AGENTS.md`, `CONTRIBUTING.md`, and area docs always override generic skill heuristics.
