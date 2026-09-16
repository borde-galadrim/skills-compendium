# Skills compendium

Portable agent skills. Each folder is an Agent Skill (`SKILL.md` plus optional helpers) and works in any IDE or harness that loads that format.

Skills discover repository conventions from Git metadata, manifests, CI config, and repo guidance — they do not assume a specific forge, package manager, default branch, or project domain.

Copy a skill folder into your user skills directory, or into a project's skills directory to keep it repo-local.

## Skills

| Skill | When to use |
| --- | --- |
| [rgaa-dev](rgaa-dev/) | RGAA 4.1.2 / WCAG 2.2 AA implementation guide (HTML + React/TypeScript, optional DSFR) and a separate Rails-only static-code audit for French public-sector web apps. Vendored from [Isalafont/claude-skill-rgaa-dev](https://github.com/Isalafont/claude-skill-rgaa-dev). |

## Install

User-level (common Agent Skills home):

```bash
cp -R <skill-name> ~/.agents/skills/
```

Project-level:

```bash
cp -R <skill-name> .agents/skills/
```

Use whichever skills directory your harness documents if it differs from those paths.

**rgaa-dev** ships two skills under `rgaa-dev/skills/` (`rgaa-dev` and `audit`). Copy both folders:

```bash
cp -R rgaa-dev/skills/rgaa-dev rgaa-dev/skills/audit ~/.agents/skills/
```

Upstream repo, changelog, and licence: [github.com/Isalafont/claude-skill-rgaa-dev](https://github.com/Isalafont/claude-skill-rgaa-dev).

## Portability

- **Default branch:** resolved from `origin/HEAD`, then common branch names, then repo docs — not hardcoded to `main`.
- **Package manager / CI:** inferred from lockfiles, manifests, and workflow config.
- **Forge CLIs** (`gh`, `glab`, etc.): optional adapters when installed; never required.
- **Change-request output:** returned as markdown in chat by default; file output only when requested or repo convention requires it.

Repo-specific rules in `AGENTS.md`, `CONTRIBUTING.md`, and area docs always override generic skill heuristics.
