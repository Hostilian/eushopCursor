# Error Budget Policy

Defines how error budgets govern release velocity and reliability safeguards.

## Policy principles

- Reliability targets are non-negotiable guardrails.
- Burn rate informs release posture.
- Persistent burn triggers stabilization priorities.

## Burn thresholds and actions

| Burn level | Condition | Required action |
| --- | --- | --- |
| Low | < 25% budget consumed | Normal release cadence |
| Medium | 25-50% consumed | Increase monitoring and reduce risky changes |
| High | 50-75% consumed | Enter soft freeze for affected surface |
| Critical | > 75% consumed | Hard freeze except P0/P1 containment |

## Governance actions

- Record burn status in weekly review.
- Link mitigation actions in owner action register.
- Escalate repeated high/critical burn to risk register.
