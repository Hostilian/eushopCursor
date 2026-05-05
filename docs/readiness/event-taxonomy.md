# Event Taxonomy For Readiness Tracking

## Purpose

Standardize event names and properties used to measure product, reliability, and GTM readiness.

## Naming convention

- `domain.object.action`
- Lowercase snake_case keys for properties.
- Include `surface` (`web`, `mobile`, `admin`, `api`) where relevant.

## Core funnel events

| Event name | Trigger | Required properties | Owner |
| --- | --- | --- | --- |
| `discovery.search.executed` | User runs search/filter query | `surface`, `query_length`, `result_count`, `locale` | Product analytics |
| `listing.detail.viewed` | Listing detail opened | `surface`, `listing_id`, `country`, `has_image` | Product analytics |
| `trip.offer.created` | Trip offer successfully created | `surface`, `trip_id`, `origin`, `destination`, `slot_count` | Product/eng |
| `trip.reservation.created` | Reservation created | `surface`, `reservation_id`, `trip_id`, `fee_cents` | Product/eng |
| `trip.reservation.status_changed` | Reservation transitions state | `surface`, `reservation_id`, `from_status`, `to_status` | Product/eng |
| `chat.message.sent` | Message sent from client | `surface`, `conversation_id`, `message_type` | Eng |
| `picker.image.attached` | Product picker attaches image URL | `surface`, `source` (`real` or `fallback`), `item_id` | Product |

## Reliability and incident events

| Event name | Trigger | Required properties | Owner |
| --- | --- | --- | --- |
| `api.health.failed` | Health endpoint or dependency check fails | `service`, `failure_domain`, `status_code` | SRE |
| `job.execution.failed` | Background job failed | `job_name`, `attempt`, `error_class` | SRE |
| `search.query.failed` | Search request error | `surface`, `error_code`, `timeout_ms` | Engineering |
| `media.fetch.failed` | Remote image fetch/rehost fails | `provider`, `http_status`, `asset_type` | Engineering |

## Consent and privacy rules

- Product analytics events must only emit after explicit consent.
- Operational events needed for reliability/security can emit without marketing profiling payloads.
- Sensitive personal data must never appear in event properties.

## Governance

- Changes to event names require data lead approval.
- Deprecated events stay documented for one release cycle with removal date.
