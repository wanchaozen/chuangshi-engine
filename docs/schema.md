# Event database schema

The root object contains:

| Field | Type | Description |
| --- | --- | --- |
| `version` | number or string | Producer-defined schema version |
| `properties` | string[] | Numeric or list-valued state keys |
| `flags` | string[] | Boolean/count markers and event gates |
| `events` | Event[] | Event records |

An event contains:

| Field | Required | Description |
| --- | --- | --- |
| `key` | yes | Unique stable identifier |
| `conditions` | yes | Array of `{ key, value, type }` |
| `choices` | yes | Player or automatic choices |
| `triggeredOnly` | no | Event is entered only through another event |
| `disabled` | no | Event is deliberately excluded |
| `random` | no | Parallel `keys` and `values` arrays |

Condition type codes:

| Type | Meaning |
| --- | --- |
| `2` | greater than or equal |
| `3` | equal |
| `4` | less than |
| `5` | greater than |
| `6` | less than or equal |

Each choice contains an `effects` array. An effect has a `target` and `value`.
The target may be a property, a flag, another event key, `END`, or
`GAME_OVER`.

The auditor does not invent missing semantics. Projects with different
comparison codes or lifecycle rules should add an adapter before auditing.
