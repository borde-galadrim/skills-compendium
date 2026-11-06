## Accessibilité (RGAA 4.1.2 / WCAG 2.2 AA) — obligatoire

Tout code d'interface (composant, page, formulaire, style) doit être conforme RGAA.
Avant de créer ou modifier un composant UI, charger le skill `rgaa-dev`
(projet : `.agents/skills/rgaa-dev/`) et suivre son tableau « Quel fichier lire selon la tâche ».
Skill absent : `npx skills add borde-galadrim/skills-compendium --skill rgaa-dev`.

Règles non négociables, même sans lire le skill :

1. HTML natif d'abord (`<button>`, `<a href>`, `<label>`) ; pas de `<div>` cliquable.
2. Tout élément interactif est utilisable au clavier ; pas de `tabindex` > 0.
3. Focus toujours visible : jamais `outline: none` sans alternative.
4. Tout contenu non textuel a une alternative (`alt`, nom accessible) ; un `aria-label` contient le texte visible.
5. Champs de formulaire labellisés ; erreurs identifiées et reliées au champ.
6. Contraste ≥ 4.5:1 (texte), cible ≥ 24×24 px ; la couleur n'est jamais le seul vecteur d'information.
7. Hiérarchie de titres et landmarks corrects.
8. Zoom 200 % sans perte de contenu.
