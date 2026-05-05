# Readiness Docs Index

This folder is the operating package for 30-day launch readiness and post-launch stabilization governance.

## Core command center

- `30-day-master.md` - mission, timeline, owner map, and gate checklist.
- `master-toc.md` - navigation-first index for the entire readiness system.
- `readiness-command-matrix.md` - command chooser for verify/triage/RC/readiness checks.
- `dependency-graph.md` - dependency map between readiness artifacts.
- `archive-and-retention-policy.md` - retention tiers and archive rules for readiness artifacts.
- `monthly-cleanup-checklist.md` - recurring cleanup and consistency checklist.
- `onboarding-quickstart.md` - first 30 minutes/day/week guide for new readiness contributors.
- `onboarding-checklist.md` - onboarding completion checklist for new team members.
- `faq-and-troubleshooting.md` - quick answers and fix paths for common readiness blockers.
- `triage-decision-aid.md` - fast prioritization aid for competing blockers.
- `command-center-dashboard.md` - single-pane daily/weekly status dashboard.
- `weekly-dashboard-snapshot-template.md` - compact weekly snapshot template for leadership updates.
- `dashboard-autofill-playbook.md` - source-to-field mapping for fast dashboard refresh.
- `ten-minute-update-routine.md` - rapid routine to keep readiness status current.
- `quarterly-maturity-model.md` - readiness capability maturity framework.
- `quarterly-maturity-assessment-template.md` - quarterly maturity scoring worksheet.
- `quarterly-improvement-roadmap-template.md` - template for next-quarter readiness improvement plan.
- `drill-scenario-library.md` - catalog and template for readiness drill scenarios.
- `pre-mortem-template.md` - structured pre-gate failure forecasting session template.
- `weekly-exec-brief-template.md` - concise executive briefing template for weekly readiness status.
- `handover-continuity-template.md` - structured handover record for owner transitions.
- `absence-coverage-playbook.md` - backup ownership procedure during absences.
- `decision-audit-trail-index.md` - map of decision artifacts and audit workflow.
- `dependency-change-impact-checklist.md` - pre-merge impact controls for dependency updates.
- `release-freeze-protocol.md` - freeze levels, exception path, and exit criteria.
- `hotfix-protocol.md` - urgent patch process during freeze/post-launch incidents.
- `daily-status-update-template.md` - concise daily readiness update format.
- `escalation-contact-matrix.md` - primary/backup escalation contacts by function.
- `announcement-checklist.md` - checklist for high-impact readiness communications.
- `policy-compliance-checklist.md` - pre-gate policy conformance checklist.
- `policy-exception-request-template.md` - structured request form for control deviations.
- `policy-exception-review-log.md` - tracked lifecycle log for policy exceptions.
- `automation-inventory.md` - catalog of automations supporting readiness controls.
- `automation-safety-checklist.md` - guardrails for automation changes.
- `automation-change-log.md` - audit log for readiness automation updates.
- `data-contract-checklist.md` - contract quality checks for metric/event changes.
- `metric-anomaly-response-playbook.md` - response flow for KPI anomalies.
- `kpi-source-of-truth-register.md` - authoritative source mapping for readiness KPIs.
- `security-control-evidence-matrix.md` - control-to-evidence mapping for security gate.
- `vulnerability-triage-playbook.md` - SLA-driven vulnerability triage process.
- `security-signoff-checklist.md` - final security sign-off checklist before go/no-go.
- `slo-breach-response-template.md` - structured response template for SLO breaches.
- `error-budget-policy.md` - burn thresholds and release posture policy.
- `reliability-review-checklist.md` - weekly reliability review checklist.
- `critical-journey-acceptance-matrix.md` - pass/fail matrix for core user journeys.
- `ux-regression-checklist.md` - UX regression guard checklist for gates and RCs.
- `launch-copy-consistency-checklist.md` - messaging consistency checks before launch.
- `partner-readiness-checklist.md` - partner operational/compliance readiness checks.
- `support-playbook-template.md` - support triage and escalation template.
- `launch-kpi-target-sheet.md` - explicit launch KPI targets and thresholds.
- `owner-matrix.md` - role accountability and RACI.
- `risk-register.md` - prioritized risks with scoring and mitigations.
- `governance-cadence.md` - recurring review and escalation model.
- `execution-checklist.md` - day-to-day and weekly execution checklist.
- `artifact-status-board.md` - readiness artifact completion tracker.
- `evidence-log.md` - dated evidence records for gate readiness.
- `owner-action-register.md` - owner-level action tracker with due dates.
- `kickoff-brief.md` - kickoff goals, working agreements, and owner asks.
- `weekly-review-template.md` - weekly review operating template.
- `weekly-review-2026-W19.md` - filled first-week readiness review instance.
- `weekly-review-2026-W20.md` - forward week review instance.
- `weekly-review-2026-W21.md` - pre-RC week review instance.
- `weekly-review-2026-W22.md` - RC-week final pre-go/no-go review instance.
- `signoff-packet-template.md` - final pre-go/no-go evidence packet template.
- `signoff-packet-2026-06-03.md` - prefilled sign-off packet for final meeting.
- `rc-command-runbook.md` - mandatory RC command sequence and evidence protocol.
- `meeting-calendar-2026-05.md` - concrete meeting schedule for the readiness window.
- `away-operations-playbook.md` - deterministic execution flow for away-window coverage.
- `leadership-dashboard-snapshot.md` - concise leadership-facing readiness snapshot.
- `go-no-go-meeting-script.md` - 30-minute facilitation script for final decision meeting.
- `go-no-go-decision-tree.md` - visual decision path for `GO` vs `HOLD`.
- `incident-comms-template-pack.md` - internal, leadership, and customer incident comms templates.
- `operator-cockpit.md` - one-page daily operator control panel.
- `daily-status-log-template.md` - lightweight daily readiness journal template.
- `role-directory.md` - centralized role-to-person mapping.
- `raci-quick-reference.md` - fast accountability reference for key readiness activities.
- `final-return-checklist.md` - strict day-back sequence for final readiness closure.
- `return-handoff-onepager.md` - concise return-state summary and execution priorities.
- `status-vocabulary.md` - canonical status terms and mapping rules.
- `vocabulary-lock-report.md` - audit summary confirming status vocabulary consistency.
- Script: `pnpm readiness:status:check` - guardrail that fails on legacy status terms in status-like contexts.
- Script: `pnpm readiness:index:check` - verifies readiness indexes only reference existing docs.
- Script: `pnpm readiness:doctor` - prints readiness status/action counts and top in_progress items.
- Script: `pnpm readiness:doctor:write` - writes the latest doctor snapshot to `docs/readiness/doctor-latest.md`.
- Script: `pnpm readiness:doctor:fresh` - fails if `doctor-latest.md` is stale.
- Script: `pnpm readiness:verify` - single-command readiness validation (`status`, `claims`, `i18n`, `pictures`, full `verify`).
- Script: `pnpm readiness:rc` - alias for RC/decision windows (`pnpm readiness:verify`).
- Script: `pnpm readiness:triage` - preferred recovery sequence (`status`, `claims`, full `verify`).
- `kpi-data-collection-playbook.md` - weekly KPI extraction and validation procedure.
- `weekly-evidence-checklist.md` - pre-review evidence completeness checklist.
- `doctor-latest.md` - generated readiness diagnostics snapshot (`pnpm readiness:doctor:write`).
- `day30-closeout-checklist.md` - final readiness program closure checklist.
- `post-launch-transition-template.md` - handoff template for first 30 days after launch.
- `failure-modes-and-anti-patterns.md` - common readiness failure patterns and controls.
- `prevention-checklist.md` - weekly preventative checklist to reduce gate-time surprises.
- `minimum-viable-go-packet.md` - required 10-artifact packet for final `GO` decision.
- `go-packet-completeness-score.md` - pre-meeting packet completeness scoring sheet.
- `go-decision-minutes-template.md` - compliance-grade final decision meeting minutes template.
- `go-conditions-liability-register.md` - tracked conditions/liabilities tied to `GO` decisions.
- `post-launch-incident-matrix.md` - severity and escalation matrix for post-launch incidents.
- `oncall-run-card.md` - first-responder run card for incident handling.
- `retro-24h-template.md` - first-day post-release retrospective template.
- `retro-7d-template.md` - week-one retrospective template.
- `retro-30d-template.md` - month-one retrospective template.
- `lessons-to-actions-tracker.md` - tracker that converts lessons into owned actions.

## Product and engineering readiness

- `critical-journeys.md` - launch-critical flow definitions and pass criteria.
- `system-dependency-map.md` - service dependency graph and failure domains.
- `test-matrix.md` - tiered checks, severity policy, and rehearsal protocol.
- `gate-matrix.md` - risk-tiered quality/security/release controls.
- `slo-and-incident-policy.md` - SLO targets, error budgets, and post-incident test backfill policy.

## Security, data, GTM, and operations

- `security-privacy-checklist.md` - launch control checklist for security/privacy.
- `security-data-framework.md` - security baseline, secret governance, dependency SLA, and data observability.
- `kpi-dictionary.md` - readiness KPI definitions and thresholds.
- `event-taxonomy.md` - product and reliability event naming and payload standards.
- `readiness-scorecard.md` - weekly/monthly scorecard operations and escalation.
- `business-kpi-bridge.md` - engineering initiative to business KPI traceability and quarterly targets.
- `gtm-playbook.md` - launch narrative, SLA, and corridor activation guidance.
- `ops-runbook-index.md` - index of deploy/recovery/legal/ops runbooks.

## Week 4 execution and leadership artifacts

- `rehearsal-report.md` - RC rehearsal evidence capture.
- `incident-drill-report.md` - tabletop drill record and findings.
- `go-no-go-decision.md` - final decision record and risk acceptance.
- `day30-exec-summary.md` - executive summary and post-launch next steps.
