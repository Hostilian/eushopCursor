# Dependency Change Impact Checklist

Use this checklist before merging dependency changes during readiness windows.

## Scope identification

- [ ] Dependency change type identified (`patch`, `minor`, `major`).
- [ ] Affected runtime surfaces listed (web, api, admin, mobile, jobs).
- [ ] Hotspot overlap checked.

## Risk assessment

- [ ] Security implications reviewed.
- [ ] Build/runtime compatibility reviewed.
- [ ] Rollback complexity evaluated.
- [ ] Potential KPI impact identified.

## Validation requirements

- [ ] `pnpm claims:check`
- [ ] `pnpm i18n:check` (if applicable)
- [ ] `pnpm verify`
- [ ] Targeted smoke checks for impacted surfaces

## Decision requirements

- [ ] Owner approved change window.
- [ ] Freeze window exceptions documented (if relevant).
- [ ] Evidence logged in `evidence-log.md`.
