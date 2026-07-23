import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { auditEventDatabase } from "../src/audit.js";

test("example database passes the audit", async () => {
  const database = JSON.parse(await fs.readFile(new URL("../examples/events.json", import.meta.url)));
  const report = auditEventDatabase(database);
  assert.equal(report.valid, true);
  assert.equal(report.summary.events, 2);
  assert.equal(report.summary.referencedEventTitles, 1);
});

test("reports unknown targets and orphan events", () => {
  const report = auditEventDatabase({
    properties: [],
    events: [{
      key: "ORPHAN",
      conditions: [],
      choices: [{ effects: [{ target: "MISSING", value: 1 }] }]
    }]
  });
  assert.equal(report.valid, false);
  assert.equal(report.summary.unknownEffectTargets, 1);
  assert.equal(report.summary.unconditionalOrphans, 1);
});
