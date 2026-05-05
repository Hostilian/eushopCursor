# Data Contract Checklist

Use this checklist when adding or changing readiness-related metrics/events.

## Contract definition

- [ ] Event/metric name is stable and documented.
- [ ] Required fields and types are defined.
- [ ] Producer and consumer owners are identified.
- [ ] Backward compatibility impact is assessed.

## Validation

- [ ] Schema validation exists for new/changed payload.
- [ ] Test coverage includes expected and invalid payloads.
- [ ] Sampling/volume assumptions documented.

## Governance

- [ ] Change is reflected in `event-taxonomy.md`.
- [ ] KPI dependencies updated in `kpi-dictionary.md`.
- [ ] Source-of-truth register entry created/updated.
