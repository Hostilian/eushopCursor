# Go/No-Go Decision Tree

```mermaid
flowchart TD
  start[Start_GoNoGo_Review] --> p0{Any_Open_P0}
  p0 -->|Yes| holdP0[HOLD_and_Assign_Containment]
  p0 -->|No| sec{Critical_Security_Control_Signed}
  sec -->|No| holdSec[HOLD_and_Assign_Security_Action]
  sec -->|Yes| gates{All_Required_Gates_Passed}
  gates -->|No| holdGate[HOLD_and_Complete_Gate_Evidence]
  gates -->|Yes| risk{Unaccepted_High_Risk_Without_Expiry}
  risk -->|Yes| holdRisk[HOLD_and_Record_Risk_Acceptance]
  risk -->|No| signoff{Required_Owner_Signoffs_Complete}
  signoff -->|No| holdSign[HOLD_and_Complete_Signoffs]
  signoff -->|Yes| go[GO_with_Conditions_if_Any]
```

## Decision policy

- Any `HOLD` branch must produce:
  - owner,
  - due date,
  - next review checkpoint.
- `GO` requires documented rollback owner and validated rollback path.
