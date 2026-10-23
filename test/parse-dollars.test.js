import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDollarsToCents } from "../src/money.js";

test("parseDollarsToCents reads dollars and cents exactly", () => {
  assert.equal(parseDollarsToCents("12.34"), 1234);
  assert.equal(parseDollarsToCents("100"), 10000);
  assert.equal(parseDollarsToCents("100.00"), 10000);
  assert.equal(parseDollarsToCents("0"), 0);
});

test("parseDollarsToCents avoids float rounding", () => {
  // As floats, 0.1 * 100, 1.15 * 100 and 4.35 * 100 are not whole numbers.
  assert.equal(parseDollarsToCents("0.1"), 10);
  assert.equal(parseDollarsToCents("1.15"), 115);
  assert.equal(parseDollarsToCents("4.35"), 435);
  assert.equal(parseDollarsToCents("1000000000.00"), 100_000_000_000);
});

test("parseDollarsToCents accepts a missing dollar or cent part and surrounding spaces", () => {
  assert.equal(parseDollarsToCents(".5"), 50);
  assert.equal(parseDollarsToCents("7."), 700);
  assert.equal(parseDollarsToCents(" 3.25 "), 325);
});

test("parseDollarsToCents returns null for text that is not a dollar amount", () => {
  for (const text of ["", " ", ".", "abc", "-5", "+5", "1.234", "1,000", "1e3", "$5", "0x10", "1.2.3", "Infinity"]) {
    assert.equal(parseDollarsToCents(text), null, JSON.stringify(text));
  }
});

test("parseDollarsToCents returns null when the cents would not be an exact Number", () => {
  assert.equal(parseDollarsToCents("999999999999999999999"), null);
});
