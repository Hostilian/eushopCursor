# Final Return Checklist (Day-Back)

Use this strict sequence when the team returns, so final readiness closeout can be done quickly and safely.

## 1) Re-establish baseline (10-15 min)

1. Open `docs/readiness/operator-cockpit.md`.
2. Confirm owner aliases in `docs/readiness/role-directory.md`.
3. Review in_progress actions in `docs/readiness/owner-action-register.md`.
4. Confirm latest risks in `docs/readiness/risk-register.md`.
5. Run `pnpm readiness:doctor` for a quick status snapshot before execution.
6. Run `pnpm readiness:doctor:fresh` to verify snapshot freshness policy.

## 2) Refresh objective evidence (20-30 min)

7. Run RC command sequence from `docs/readiness/rc-command-runbook.md`.
   - Preferred: run `pnpm readiness:rc` (alias of `pnpm readiness:verify`).
8. Add command outcomes to `docs/readiness/evidence-log.md`.
9. Update gate status rows in `docs/readiness/go-no-go-decision.md`.

## 3) Close QA/SRE execution evidence (20-30 min)

10. Complete final journey evidence in `docs/readiness/rehearsal-report.md`.
11. Complete final drill evidence in `docs/readiness/incident-drill-report.md`.
12. Update KPI snapshot rows in `docs/readiness/readiness-scorecard.md`.

## 4) Close security/data/governance gates (15-25 min)

13. Finalize `docs/readiness/security-privacy-checklist.md` reviewer sign-off.
14. Update risk changes and exceptions in `docs/readiness/risk-register.md`.
15. Complete `docs/readiness/signoff-packet-2026-06-03.md`.

## 5) Run final decision sequence (10-15 min)

16. Execute meeting using `docs/readiness/go-no-go-meeting-script.md`.
17. Record final decision in `docs/readiness/go-no-go-decision.md`.
18. Publish final summary in `docs/readiness/day30-exec-summary.md`.

## 6) Post-decision closeout (10 min)

19. Update artifact states in `docs/readiness/artifact-status-board.md`.
20. Add final daily entry from `docs/readiness/daily-status-log-template.md`.
21. Append a short wrap-up in `docs/handoffs/2026-05-05.md`.

## Completion criteria

- All mandatory gates marked done with linked evidence.
- Final recommendation set to `GO` or `HOLD` with conditions.
- Owner sign-offs and follow-up dates recorded.

## If verification fails

1. Run `pnpm readiness:triage` (preferred repair sequence).
2. If needed, run `pnpm readiness:status:check`, then `pnpm claims:check`, then `pnpm verify`.
3. Re-run `pnpm readiness:doctor` to confirm post-fix state.
4. Re-run `pnpm readiness:doctor:fresh` after snapshot refresh.
5. Record outcomes in `docs/readiness/evidence-log.md`.
