import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCents } from "../src/money.js";

test("formatCents renders dollars", () => {
  assert.equal(formatCents(1234), "$12.34");
});
