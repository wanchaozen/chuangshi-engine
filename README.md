# Chuangshi Engine

[简体中文](README.zh-CN.md)

Chuangshi Engine is a small, dependency-free toolkit for data-driven narrative
and life-simulation games. It provides:

- a condition expression parser and evaluator;
- a static auditor for large event graphs;
- checks for broken references, unknown properties, duplicate keys, malformed
  random branches, unsupported comparisons, and unreachable events;
- a command-line interface suitable for local development and CI.

The toolkit was extracted from **Creation at the Beginning (创世之初)**, a
cross-world life-simulation game whose production database contains thousands
of narrative events. This repository contains the reusable engine and synthetic
examples only. The game's private story database and art assets are not
included.

![Ink-wash celestial landscape](assets/images/cloud-scroll.png)

The repository includes two curated showcase images and one short original
procedural ambient track. Their licensing is documented in
[assets/README.md](assets/README.md).

It also includes an independent, original
[100-event Chinese demo story](examples/demo-world-100.zh-CN.json). The demo
shows event chaining, choices, state changes, and an ending without exposing
any production story, character, or hidden condition from the game.

## Playable browser demo

The zero-build browser demo connects the 100-event story, two curated showcase
images, stat changes, branching choices, and an original ambient track. Serve
the repository root with any static HTTP server, then open `demo/`.

## Why this exists

Large data-driven games can fail silently: a typo in a target name may make an
entire event chain unreachable, and an enabled event without an entry condition
may behave differently across runtimes. Chuangshi Engine turns those problems
into deterministic CI reports.

## Requirements

- Node.js 20 or newer

No runtime dependencies are required.

## Quick start

```bash
git clone https://github.com/wanchaozen/chuangshi-engine.git
cd chuangshi-engine
npm test
npm run audit:example
npm run audit:world
```

Audit your own event database:

```bash
node src/cli.js path/to/events.json report.json
```

The command exits with:

- `0` when no errors or warnings are found;
- `1` when the database is readable but findings exist;
- `2` for invalid input or CLI errors.

## Condition syntax

```js
import { checkCondition } from "@wanchaozen/chuangshi-engine";

const state = { AGE: 18, HEALTH: 7, TAGS: [1, 3] };

checkCondition(state, "AGE>=18&HEALTH>5");       // true
checkCondition(state, "(AGE=18|AGE=19)&TAGS?[3]"); // true
```

Supported comparison operators:

| Operator | Meaning |
| --- | --- |
| `>` `<` `>=` `<=` | numeric comparison |
| `=` `!=` | equality or array membership |
| `?` | value/array overlaps the supplied array |
| `!` | value/array does not overlap the supplied array |

Logical operators are `&` and `|`; parentheses are supported.

## Event database format

See [examples/events.json](examples/events.json) and
[docs/schema.md](docs/schema.md). The schema deliberately uses neutral,
synthetic data so projects can adopt it without depending on the game.

## Project status

The public API is experimental until `1.0.0`. The initial roadmap is:

- JSON Schema validation;
- cycle and reachability analysis;
- deterministic simulation;
- graph visualization;
- adapters for common spreadsheet exports.

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Origin and attribution

The condition evaluator originated in
[VickScarlet/lifeRestart](https://github.com/VickScarlet/lifeRestart) and has
been substantially adapted for explicit validation, object/Map support, public
parsing APIs, and predictable error handling. The original MIT copyright
notice is preserved in [LICENSE](LICENSE) and [NOTICE](NOTICE).

The event auditing toolkit and documentation were developed for the
**Creation at the Beginning (创世之初)** project.

## License

MIT. See [LICENSE](LICENSE).
