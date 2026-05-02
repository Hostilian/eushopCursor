# @eushop/party

PartyKit worker for realtime chat. Deploy separately; set `PARTYKIT_HOST` and matching public host on web/mobile — [docs/ops/deploy-runbook.md](../../docs/ops/deploy-runbook.md).

Local development follows PartyKit CLI docs for this package layout.

## Message shape versioning

Chat messages are JSON payloads over the PartyKit socket. When you change the client or server schema:

1. **Bump a `v` field** (or envelope version) inside the payload before rolling out breaking changes.
2. **Deploy server first**, then mobile/web clients, so old clients still receive shapes they understand during rollout.
3. Document additive fields as optional; never rename or remove fields without a version gate.
4. Log unknown `v` values server-side during transitions; drop or ack with an error message the UI can show.

Keep this section updated when the message contract changes.
