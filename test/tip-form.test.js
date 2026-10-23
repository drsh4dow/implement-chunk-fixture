import assert from "node:assert/strict";
import { test } from "node:test";
import { readTipForm } from "../src/tip-form.js";

const valid = { bill: "100.00", tip: "18", people: "3" };

test("readTipForm turns the ticket example into amounts", () => {
  assert.deepEqual(readTipForm(valid), {
    kind: "amounts",
    tipCents: 1800,
    totalCents: 11800,
    perPersonCents: 3934,
  });
});

test("readTipForm accepts the boundaries of each field", () => {
  assert.deepEqual(readTipForm({ bill: "0", tip: "0", people: "1" }), {
    kind: "amounts",
    tipCents: 0,
    totalCents: 0,
    perPersonCents: 0,
  });
  assert.deepEqual(readTipForm({ bill: "1000000000", tip: "100", people: "1" }).kind, "amounts");
  assert.deepEqual(readTipForm({ bill: "12.34", tip: "12.5", people: "2" }), {
    kind: "amounts",
    tipCents: 154,
    totalCents: 1388,
    perPersonCents: 694,
  });
});

function readWith(input) {
  return readTipForm({ ...valid, ...input });
}

test("readTipForm marks a bad bill invalid", () => {
  for (const bill of ["", "abc", "-1", "1.234", "1000000000.01"]) {
    assert.deepEqual(readWith({ bill }), { kind: "invalid", fields: ["bill"] }, JSON.stringify(bill));
  }
});

test("readTipForm marks a bad tip invalid", () => {
  for (const tip of ["", "abc", "-1", "100.01", "101", "12.345"]) {
    assert.deepEqual(readWith({ tip }), { kind: "invalid", fields: ["tip"] }, JSON.stringify(tip));
  }
});

test("readTipForm marks a bad people count invalid", () => {
  for (const people of ["", "abc", "0", "-1", "1.5", "99999999999999999999"]) {
    assert.deepEqual(readWith({ people }), { kind: "invalid", fields: ["people"] }, JSON.stringify(people));
  }
});

test("readTipForm lists every invalid field in form order", () => {
  assert.deepEqual(readTipForm({ bill: "", tip: "200", people: "0" }), {
    kind: "invalid",
    fields: ["bill", "tip", "people"],
  });
});
