import { computeTip, invalidTipFields, parseDollarsToCents, parseHundredths } from "./money.js";

const PEOPLE_PATTERN = /^\d+$/;

/**
 * @typedef {import("./money.js").TipField} TipField
 * @typedef {{ kind: "amounts", tipCents: number, totalCents: number, perPersonCents: number }} TipAmounts
 * @typedef {{ kind: "invalid", fields: TipField[] }} TipInvalid
 */

/**
 * Maps the raw text of the tip form to the amounts to show, or to the list of
 * fields whose text does not parse or that computeTip rejects.
 *
 * @param {{ bill: string, tipPercent: string, people: string }} input raw input values
 * @returns {TipAmounts | TipInvalid} invalid fields are listed in form order
 */
export function readTipForm(input) {
  const billCents = parseDollarsToCents(input.bill);
  const percent = parsePercent(input.tipPercent);
  const people = parsePeople(input.people);

  const fields = invalidTipFields(billCents, percent, people);
  if (fields.length > 0) {
    return { kind: "invalid", fields };
  }

  return { kind: "amounts", ...computeTip(billCents, percent, people) };
}

// The message text is a product decision (#4). Change it only with the
// product owner.
const FIELD_MESSAGES = {
  bill: "Enter a bill of $0.00 or more",
  tipPercent: "Enter a tip between 0 and 100%",
  people: "Enter at least 1 person",
};

/**
 * The message that tells the person how to fix an invalid field.
 *
 * @param {TipField} field
 * @returns {string}
 */
export function fieldMessage(field) {
  return FIELD_MESSAGES[field];
}

function parsePercent(text) {
  const hundredths = parseHundredths(text);
  if (hundredths === null) {
    return null;
  }
  return hundredths / 100;
}

function parsePeople(text) {
  const trimmed = text.trim();
  if (!PEOPLE_PATTERN.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}
