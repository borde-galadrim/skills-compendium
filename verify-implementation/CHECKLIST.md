# Verification checklist

Apply sections that match the changed area. **Repo docs (`AGENTS.md`, area `doc/`) always win** over this list.

## All changes

- [ ] Every plan requirement traced to code or marked missing/partial/manual
- [ ] No unrequested scope creep, or scope creep is called out explicitly
- [ ] New helpers searched against existing utilities — no duplicate `formatX`, `parseY`, `normalizeZ` when one exists
- [ ] No one-liner wrappers around a single call unless they hide a real seam
- [ ] Error paths handled; failures do not leak secrets or stack traces to clients
- [ ] Tests exist at agreed seams for non-trivial behavior (or gap is reported)

## Regression

- [ ] Public exports, types, and GraphQL fragments unchanged unless planned
- [ ] Call sites of refactored functions still correct
- [ ] Feature flags / env-gated behavior still gated correctly
- [ ] Backward-compatible API responses where consumers exist

## Architecture

- [ ] Logic lives at the right layer (mapper vs view vs service vs route)
- [ ] No "middle man" pass-through module (delegates only)
- [ ] No speculative generality (unused params, hooks, abstractions)
- [ ] Dependencies point inward — UI does not reach into infra directly
- [ ] Module interface is smaller than its implementation (depth)

## Security

- [ ] User input validated at trust boundary
- [ ] Output encoded where rendered in HTML
- [ ] Authn/authz checked on new endpoints or sensitive actions
- [ ] No secrets in code, logs, client bundles, or API responses
- [ ] No new `NEXT_PUBLIC_*` for deployment-specific config
- [ ] Runtime config read server-side; browser gets allowlisted values via same-origin endpoint only

## Aviva monorepo (when touching this repo)

- [ ] No hardcoded CoreMedia content IDs or new `*_CONTENT_ID` env vars
- [ ] CMS relationships via GraphQL from page grid entry points, not out-of-band IDs
- [ ] Runtime env vars follow `AGENTS.md` rules (server vs client, `requireEnv` in API Gateway)
- [ ] Hybris/catalog route changes respect financing coupling doc when latency symptoms match
- [ ] Commands run from repo root with `pnpm --dir` when appropriate

## CMS modules (when touching `components/cms-modules` or views)

- [ ] Follows `doc/CMS_MODULE_PIPELINE.md` (mapper, view registration, GraphQL fragments)
- [ ] Viewtype string matches Studio content model
- [ ] Mapper is pure transformation; no fetch in mapper
- [ ] Studio documentation steps noted for anything code cannot verify

## API Gateway (when touching `CoreMedia_AvivA_API-Gateway`)

- [ ] New required env vars added to startup validation
- [ ] `requireEnv` used; missing config stops startup
- [ ] Request-time errors do not leak env values
