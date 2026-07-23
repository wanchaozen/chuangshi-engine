import assert from "node:assert/strict";
import test from "node:test";
import { checkCondition, parseCondition } from "../src/condition.js";

const properties = {
  AGE: 18,
  HEALTH: 7,
  TAGS: [1, 3]
};

test("evaluates numeric comparisons", () => {
  assert.equal(checkCondition(properties, "AGE>=18&HEALTH>5"), true);
  assert.equal(checkCondition(properties, "AGE<18|HEALTH=0"), false);
});

test("evaluates membership comparisons", () => {
  assert.equal(checkCondition(properties, "TAGS?[2,3]"), true);
  assert.equal(checkCondition(properties, "TAGS![1,4]"), false);
});

test("supports nested groups", () => {
  assert.equal(checkCondition(properties, "(AGE=18|AGE=19)&HEALTH>=7"), true);
});

test("rejects malformed expressions", () => {
  assert.throws(() => parseCondition("(AGE=18"), /Missing closing parenthesis/);
  assert.throws(() => parseCondition("AGE"), /Missing comparison operator/);
});
