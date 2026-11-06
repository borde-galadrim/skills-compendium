#!/usr/bin/env node
// Installe les règles RGAA permanentes dans un projet — rgaa-dev
//
// Écrit le contenu de project-rules.md dans AGENTS.md, entre deux marqueurs.
// Relancer le script remplace le bloc (pas de doublon) : à refaire après
// `npx skills update`. Si CLAUDE.md existe sans référence à AGENTS.md, ajoute
// `@AGENTS.md` ; si CLAUDE.md est absent mais `.claude/` existe, le crée.
// Sans dépendance, Node ≥ 18.
//
// Usage (depuis la racine du projet) :
//   node .agents/skills/rgaa-dev/scripts/install-project-rules.mjs [dossier] [--check]
//
// --check : n'écrit rien ; code de sortie 1 si le bloc est absent ou périmé.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const START = '<!-- rgaa-dev:start';
const END = '<!-- rgaa-dev:end -->';

const argv = process.argv.slice(2);
const CHECK = argv.includes('--check');
const ROOT = resolve(argv.find((a) => !a.startsWith('--')) ?? process.cwd());

const rules = readFileSync(join(HERE, '..', 'project-rules.md'), 'utf8').trim();
const block =
  `${START} — généré par le skill rgaa-dev (scripts/install-project-rules.mjs) ; ` +
  `ne pas modifier à la main, relancer le script -->\n${rules}\n${END}`;

const agentsPath = join(ROOT, 'AGENTS.md');
const claudePath = join(ROOT, 'CLAUDE.md');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

// ---------- AGENTS.md ----------
const agents = read(agentsPath);
let nextAgents;
if (agents === null) {
  nextAgents = `${block}\n`;
} else {
  const s = agents.indexOf(START);
  const e = agents.indexOf(END, s);
  nextAgents =
    s >= 0 && e > s
      ? agents.slice(0, s) + block + agents.slice(e + END.length)
      : `${agents.replace(/\s*$/, '')}\n\n${block}\n`;
}
const agentsStale = nextAgents !== agents;

// ---------- CLAUDE.md ----------
const claude = read(claudePath);
let nextClaude = claude;
if (claude !== null && !/AGENTS\.md/.test(claude)) {
  nextClaude = `${claude.replace(/\s*$/, '')}\n\n@AGENTS.md\n`;
} else if (claude === null && existsSync(join(ROOT, '.claude'))) {
  nextClaude = '@AGENTS.md\n';
}
const claudeStale = nextClaude !== claude;

// ---------- sortie ----------
if (CHECK) {
  if (agentsStale) console.error(`✗ ${agentsPath} : bloc rgaa-dev absent ou périmé`);
  if (claudeStale) console.error(`✗ ${claudePath} : n'importe pas AGENTS.md`);
  if (agentsStale || claudeStale) {
    console.error('→ node .agents/skills/rgaa-dev/scripts/install-project-rules.mjs');
    process.exit(1);
  }
  console.log('✓ Règles rgaa-dev à jour');
  process.exit(0);
}

if (agentsStale) {
  writeFileSync(agentsPath, nextAgents);
  console.log(`✓ ${agentsPath} : bloc rgaa-dev ${agents === null ? 'créé' : 'écrit'}`);
} else {
  console.log(`= ${agentsPath} : déjà à jour`);
}
if (claudeStale) {
  writeFileSync(claudePath, nextClaude);
  console.log(`✓ ${claudePath} : import @AGENTS.md ${claude === null ? 'créé' : 'ajouté'}`);
} else if (claude === null) {
  console.log('· CLAUDE.md absent et pas de dossier .claude/ : rien à faire pour Claude Code');
}
