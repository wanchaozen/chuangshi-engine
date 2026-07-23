import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { auditEventDatabase } from "../src/audit.js";

const path = new URL("../examples/demo-world-100.zh-CN.json", import.meta.url);

test("open-source demo contains exactly 100 original events", async () => {
  const database = JSON.parse(await fs.readFile(path, "utf8"));
  assert.equal(database.events.length, 100);
  assert.equal(new Set(database.events.map(event => event.key)).size, 100);
  assert.match(database.notice, /正式事件库无关/);
});

test("all 100 demo events form a valid referenced graph", async () => {
  const database = JSON.parse(await fs.readFile(path, "utf8"));
  const report = auditEventDatabase(database);
  assert.equal(report.valid, true, JSON.stringify(report, null, 2));
  assert.equal(report.summary.referencedEventTitles, 99);
  assert.equal(report.summary.unconditionalOrphans, 0);
  assert.equal(report.summary.unknownEffectTargets, 0);
});

test("demo story contains prose but no production crossover names", async () => {
  const raw = await fs.readFile(path, "utf8");
  for (const protectedName of ["唐三", "荒天帝", "真主", "重生唐三"]) {
    assert.equal(raw.includes(protectedName), false);
  }
  const database = JSON.parse(raw);
  assert.ok(database.events.every(event => event.title && event.text.length >= 30));
});
