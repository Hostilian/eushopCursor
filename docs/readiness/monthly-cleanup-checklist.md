# Monthly Readiness Cleanup Checklist

Run this checklist in the first week of each month.

## 1) Archive hygiene

- [ ] Archive weekly review files older than active retention window.
- [ ] Keep most recent weekly review files in active references.
- [ ] Verify required preservation set remains accessible.

## 2) Doc consistency

- [ ] Ensure `README.md` and `master-toc.md` reflect current artifacts.
- [ ] Run `pnpm readiness:index:check` and resolve missing index references.
- [ ] Remove or mark duplicated/obsolete guidance.
- [ ] Update dependency graph if major artifact flow changed.

## 3) Ownership and governance

- [ ] Refresh `role-directory.md` and backup owners.
- [ ] Confirm RACI still matches current team structure.
- [ ] Close or renew expired liability/exception entries.

## 4) Metrics and evidence

- [ ] Confirm scorecard and KPI playbook are aligned.
- [ ] Verify evidence log contains latest cycle closure entries.
- [ ] Confirm lessons-to-actions tracker is current.
- [ ] Run `pnpm readiness:status:check` and resolve any vocabulary drift.

## 5) Transition readiness

- [ ] Validate on-call run card and post-launch matrix are current.
- [ ] Confirm retro templates and closeout checklist remain fit for next cycle.
