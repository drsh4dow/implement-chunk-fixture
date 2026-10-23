import { computeTip, parseDollarsToCents } from "./money.js";

const PERCENT_PATTERN = /^\d+(?:\.\d+)?$/;
const PEOPLE_PATTERN = /^\d+$/;

/**
 * @typedef {"bill" | "tip" | "people"} TipField
 * @typedef {{ kind: "amounts", tipCents: number, totalCents: number, perPersonCents: number }} TipAmounts
 * @typedef {{ kind: "invalid", fields: TipField[] }} TipInvalid
 */

/**
 * Maps the raw text of the tip form to the amounts to show, or to the list of
 * fields whose text computeTip would not accept.
 *
 * @param {{ bill: string, tip: string, people: string }} input raw input values
 * @returns {TipAmounts | TipInvalid} invalid fields are listed in form order
 */
export function readTipForm(input) {
  const billCents = parseDollarsToCents(input.bill);
  const percent = parseNumber(input.tip, PERCENT_PATTERN);
  const people = parseNumber(input.people, PEOPLE_PATTERN);

  // computeTip owns the limits. Each field is checked alone, paired with
  // values known to be valid, so a rejection names exactly that field.
  /** @type {TipField[]} */
  const fields = [];
  if (billCents === null || !computeTipAccepts(billCents, 0, 1)) {
    fields.push("bill");
  }
  if (percent === null || !computeTipAccepts(0, percent, 1)) {
    fields.push("tip");
  }
  if (people === null || !computeTipAccepts(0, 0, people)) {
    fields.push("people");
  }

  if (fields.length > 0) {
    return { kind: "invalid", fields };
  }

  return { kind: "amounts", ...computeTip(billCents, percent, people) };
}

function parseNumber(text, pattern) {
  const trimmed = text.trim();
  if (!pattern.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

function computeTipAccepts(billCents, percent, people) {
  try {
    computeTip(billCents, percent, people);
    return true;
  } catch (error) {
    if (error instanceof RangeError) {
      return false;
    }
    throw error;
  }
}
