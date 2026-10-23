import assert from "node:assert/strict";
import { test } from "node:test";
import { computeTip, formatCents } from "../src/money.js";

test("formatCents renders dollars", () => {
  assert.equal(formatCents(1234), "$12.34");
});

test("computeTip with 0% adds nothing", () => {
  assert.deepEqual(computeTip(1234, 0, 1), {
    tipCents: 0,
    totalCents: 1234,
    perPersonCents: 1234,
  });
});

test("computeTip 15% on $12.34 rounds the tip to the nearest cent", () => {
  // 1234 * 0.15 = 185.1 cents
  assert.deepEqual(computeTip(1234, 15, 1), {
    tipCents: 185,
    totalCents: 1419,
    perPersonCents: 1419,
  });
});

test("computeTip 18% on $100.00 split 3 rounds each share up", () => {
  // 11800 / 3 = 3933.33 cents; 3 * 3934 covers the total
  assert.deepEqual(computeTip(10000, 18, 3), {
    tipCents: 1800,
    totalCents: 11800,
    perPersonCents: 3934,
  });
});

test("computeTip keeps an even split exact", () => {
  assert.equal(computeTip(1000, 20, 4).perPersonCents, 300);
});

test("computeTip rounds a half cent up and anything below it down", () => {
  assert.equal(computeTip(5, 10, 1).tipCents, 1); // 0.5 cents
  assert.equal(computeTip(10, 15, 1).tipCents, 2); // 1.5 cents
  assert.equal(computeTip(4, 10, 1).tipCents, 0); // 0.4 cents
  assert.equal(computeTip(1249, 2, 1).tipCents, 25); // 24.98 cents
});

test("computeTip accepts a $0.00 bill", () => {
  assert.deepEqual(computeTip(0, 18, 2), {
    tipCents: 0,
    totalCents: 0,
    perPersonCents: 0,
  });
});

test("computeTip accepts percents with up to two decimals", () => {
  assert.equal(computeTip(100, 12.5, 1).tipCents, 13); // 12.5 cents
  assert.equal(computeTip(10000, 12.34, 1).tipCents, 1234);
  assert.equal(computeTip(1000, 0.05, 1).tipCents, 1); // 0.5 cents
  assert.equal(computeTip(1234, 100, 1).totalCents, 2468);
});

test("computeTip rejects an invalid bill", () => {
  for (const bill of [-1, 12.5, Number.NaN, Infinity, "1000", null]) {
    assert.throws(() => computeTip(bill, 15, 1), RangeError, String(bill));
  }
});

test("computeTip rejects a bill too large for exact cents", () => {
  assert.throws(() => computeTip(Number.MAX_SAFE_INTEGER, 15, 1), RangeError);
});

test("computeTip rejects a percent outside 0-100 or finer than 0.01", () => {
  for (const percent of [-1, -0.01, 100.01, 101, 12.345, Number.NaN, "15"]) {
    assert.throws(() => computeTip(1000, percent, 1), RangeError, String(percent));
  }
});

test("computeTip rejects fewer than one person or a fractional count", () => {
  for (const people of [0, -1, 1.5, Number.NaN, "2"]) {
    assert.throws(() => computeTip(1000, 15, people), RangeError, String(people));
  }
});
