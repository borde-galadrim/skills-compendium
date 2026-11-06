# Guide contributeurs

Ce dépôt contient des skills d'agent (`skills/<nom>/SKILL.md` + références).

- Garder le corps des skills neutre vis-à-vis des outils : décrire des capacités, pas des noms d'outils.
- Seul `skills/rgaa-audit/references/runtime-browser.md` nomme des identifiants d'outils (tableau de correspondance) ; les autres fichiers peuvent nommer les harnais et Claude in Chrome.
- Ordre des harnais partout (skills et docs) : Claude Code d'abord, puis Cursor, Codex et les autres. Côté navigateur, Claude in Chrome est le moyen runtime privilégié.
- Le contenu des skills est en français ; conserver la langue et le style existants.
- Ne pas dupliquer les règles RGAA entre `rgaa-dev` et `rgaa-audit` : `rgaa-audit` renvoie vers `../rgaa-dev/impacts.md`.
- Ne pas créer de fichiers de rapport ou de documentation hors demande explicite.
