# Skills compendium

Personal Cursor agent skills. Copy a skill folder into `~/.cursor/skills/` to use it across projects, or into `.cursor/skills/` to keep it repo-local.

This repo is a copy of the live skills in `~/.cursor/skills/`. It does not include Aviva/CoreMedia CMS skills, Cursor built-ins, or third-party libraries installed under `~/.agents/skills/`.

## Skills

| Skill | When to use |
| --- | --- |
| [commit-plan](commit-plan/) | Split working-tree changes into a multi-commit plan, then commit after you approve it. |
| [grill-me](grill-me/) | Relentless interview of a plan or design until the decision tree is resolved. |
| [pr-description](pr-description/) | Generate a PR body (`Summary` / includes / related tickets) from git changes. |
| [release-note](release-note/) | User-facing changelog between git ranges, tagged as features, improvements, or small fixes. |
| [verify-implementation](verify-implementation/) | Read-only check that an approved plan was built correctly before merge. |

## Install

```bash
cp -R <skill-name> ~/.cursor/skills/
```
