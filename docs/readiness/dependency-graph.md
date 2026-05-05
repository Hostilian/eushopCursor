# Readiness Dependency Graph

```mermaid
flowchart TD
  master[master_toc] --> core[30_day_master]
  core --> owners[owner_matrix]
  core --> risk[risk_register]
  core --> gates[gate_matrix]
  core --> tests[test_matrix]
  core --> score[readiness_scorecard]
  core --> decision[go_no_go_decision]

  owners --> roleDir[role_directory]
  owners --> raci[raci_quick_reference]
  owners --> actions[owner_action_register]

  tests --> rehearsal[rehearsal_report]
  tests --> drills[incident_drill_report]
  drills --> incidentPolicy[slo_and_incident_policy]
  drills --> incidentComms[incident_comms_template_pack]

  score --> kpiDict[kpi_dictionary]
  score --> kpiCollect[kpi_data_collection_playbook]
  score --> businessBridge[business_kpi_bridge]

  decision --> goPacket[minimum_viable_go_packet]
  decision --> goScore[go_packet_completeness_score]
  decision --> goMinutes[go_decision_minutes_template]
  decision --> liability[go_conditions_liability_register]
  decision --> signoff[signoff_packet_template]

  decision --> closeout[day30_closeout_checklist]
  closeout --> transition[post_launch_transition_template]
  transition --> incidentMatrix[post_launch_incident_matrix]
  transition --> oncall[oncall_run_card]
  transition --> retros[retro_templates]
```

## Dependency usage notes

- Update upstream docs first (`30-day-master`, `owner-matrix`, `risk-register`) before updating dependent decision artifacts.
- Decision artifacts should only be finalized after test/rehearsal/drill evidence is done.
- Post-launch transition docs depend on final go/no-go outcomes and closeout status.
