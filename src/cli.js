#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { auditEventDatabase } from "./audit.js";

const [input, output] = process.argv.slice(2);

if (!input) {
  console.error("Usage: chuangshi-audit <events.json> [report.json]");
  process.exit(2);
}

try {
  const database = JSON.parse(await fs.readFile(input, "utf8"));
  const report = auditEventDatabase(database);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (output) await fs.writeFile(output, json);
  else process.stdout.write(json);
  process.exitCode = report.valid ? 0 : 1;
} catch (error) {
  console.error(`Audit failed: ${error.message}`);
  process.exitCode = 2;
}
