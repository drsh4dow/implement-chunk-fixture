import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldMessage, readTipForm } from "../src/tip-form.js";

const valid = { bill: "100.00", tipPercent: "18", people: "3" };

// Exact message text from the product decision on #4.
const BILL_MESSAGE = "Enter a bill of $0.00 or more";
const TIP_MESSAGE = "Enter a tip between 0 and 100%";
const PEOPLE_MESSAGE = "Enter at least 1 person";

function readWith(input) {
  return readTipForm({ ...valid, ...input });
}

function messagesWith(input) {
  const result = readWith(input);
  assert.equal(result.kind, "invalid", JSON.stringify(input));
  return result.fields.map(fieldMessage);
}

test("readTipForm turns the ticket example into amounts", () => {
  assert.deepEqual(readTipForm(valid), {
    kind: "amounts",
    tipCents: 1800,
    totalCents: 11800,
    perPersonCents: 3934,
  });
});

test("readTipForm accepts the boundaries of each field", () => {
  assert.deepEqual(readTipForm({ bill: "0", tipPercent: "0", people: "1" }), {
    kind: "amounts",
    tipCents: 0,
    totalCents: 0,
    perPersonCents: 0,
  });
  assert.equal(readTipForm({ bill: "1000000000", tipPercent: "100", people: "1" }).kind, "amounts");
  assert.deepEqual(readTipForm({ bill: "12.34", tipPercent: "12.5", people: "2" }), {
    kind: "amounts",
    tipCents: 154,
    totalCents: 1388,
    perPersonCents: 694,
  });
});

test("readTipForm reads a tip with a missing whole or decimal part, like the bill", () => {
  assert.equal(readTipForm({ bill: "100.00", tipPercent: ".5", people: "1" }).tipCents, 50);
  assert.equal(readTipForm({ bill: "100.00", tipPercent: "7.", people: "1" }).tipCents, 700);
});

test("readTipForm marks a bad bill invalid", () => {
  for (const bill of ["", "abc", "-1", "1.234", "1000000000.01"]) {
    assert.deepEqual(readWith({ bill }), { kind: "invalid", fields: ["bill"] }, JSON.stringify(bill));
  }
});

test("readTipForm marks a bad tip invalid", () => {
  for (const tipPercent of ["", "abc", "-1", "100.01", "101", "12.345", "1e1", "99999999999999999999"]) {
    assert.deepEqual(readWith({ tipPercent }), { kind: "invalid", fields: ["tipPercent"] }, JSON.stringify(tipPercent));
  }
});

test("readTipForm marks a tip with more than two decimals invalid", () => {
  for (const tipPercent of ["18.000", "12.345", "100.000000000000001"]) {
    assert.deepEqual(readWith({ tipPercent }), { kind: "invalid", fields: ["tipPercent"] }, JSON.stringify(tipPercent));
  }
});

test("readTipForm marks a bad people count invalid", () => {
  for (const people of ["", "abc", "0", "-1", "1.5", "99999999999999999999"]) {
    assert.deepEqual(readWith({ people }), { kind: "invalid", fields: ["people"] }, JSON.stringify(people));
  }
});

test("readTipForm lists every invalid field in form order", () => {
  assert.deepEqual(readTipForm({ bill: "", tipPercent: "200", people: "0" }), {
    kind: "invalid",
    fields: ["bill", "tipPercent", "people"],
  });
});

test("a bad bill reads as the bill message", () => {
  for (const bill of ["", "-5", "1.234"]) {
    assert.deepEqual(messagesWith({ bill }), [BILL_MESSAGE], JSON.stringify(bill));
  }
});

test("a bad tip reads as the tip message", () => {
  for (const tipPercent of ["101", "12.345", "18.000"]) {
    assert.deepEqual(messagesWith({ tipPercent }), [TIP_MESSAGE], JSON.stringify(tipPercent));
  }
});

test("a bad people count reads as the people message", () => {
  for (const people of ["0", "1.5"]) {
    assert.deepEqual(messagesWith({ people }), [PEOPLE_MESSAGE], JSON.stringify(people));
  }
});

test("several bad fields read as one message each, in form order", () => {
  const result = readTipForm({ bill: "-5", tipPercent: "101", people: "0" });
  assert.deepEqual(result.fields.map(fieldMessage), [BILL_MESSAGE, TIP_MESSAGE, PEOPLE_MESSAGE]);
});
