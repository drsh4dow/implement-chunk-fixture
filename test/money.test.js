import assert from "node:assert/strict";
import { test } from "node:test";
import { computeTip, formatCents } from "../src/money.js";

test("formatCents renders dollars", () => {
  assert.equal(formatCents(1234), "$12.34");
});

test("computeTip with 0% adds no tip", () => {
  assert.deepEqual(computeTip(1234, 0, 1), {
    tipCents: 0,
    totalCents: 1234,
    perPersonCents: 1234,
  });
  assert.deepEqual(computeTip(0, 0, 1), {
    tipCents: 0,
    totalCents: 0,
    perPersonCents: 0,
  });
});

test("computeTip 15% on $12.34 rounds the tip to 185 cents", () => {
  assert.deepEqual(computeTip(1234, 15, 1), {
    tipCents: 185,
    totalCents: 1419,
    perPersonCents: 1419,
  });
});

test("computeTip 18% on $100.00 split 3 ways rounds each share up", () => {
  assert.deepEqual(computeTip(10000, 18, 3), {
    tipCents: 1800,
    totalCents: 11800,
    perPersonCents: 3934,
  });
});

test("computeTip rounds a half-cent tip up", () => {
  assert.equal(computeTip(1235, 10, 1).tipCents, 124);
});

test("computeTip does not round up an even split", () => {
  assert.equal(computeTip(900, 0, 3).perPersonCents, 300);
});

test("computeTip rejects an invalid bill", () => {
  assert.throws(() => computeTip(-1, 15, 1), { name: "RangeError", message: /billCents/ });
  assert.throws(() => computeTip(12.5, 15, 1), { name: "TypeError", message: /billCents/ });
  assert.throws(() => computeTip("1234", 15, 1), { name: "TypeError", message: /billCents/ });
});

test("computeTip rejects a percent outside the integers 0-100", () => {
  assert.throws(() => computeTip(1234, 101, 1), { name: "RangeError", message: /percent/ });
  assert.throws(() => computeTip(1234, -1, 1), { name: "RangeError", message: /percent/ });
  assert.throws(() => computeTip(1234, 12.5, 1), { name: "TypeError", message: /percent/ });
});

test("computeTip rejects fewer than one person or a fractional count", () => {
  assert.throws(() => computeTip(1234, 15, 0), { name: "RangeError", message: /people/ });
  assert.throws(() => computeTip(1234, 15, 1.5), { name: "TypeError", message: /people/ });
});
