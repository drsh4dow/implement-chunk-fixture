export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Digits, optionally a point, then at most two decimal digits. At least one
// digit must appear, before or after the point.
const HUNDREDTHS_PATTERN = /^(?=\.?\d)(\d*)(?:\.(\d{0,2}))?$/;

/**
 * Reads a non-negative decimal typed by a person, such as "12.34", "100" or
 * ".5", as a count of hundredths, without float math.
 *
 * @param {string} text
 * @returns {number | null} integer hundredths, or null when the text is
 *   negative, malformed, has more than two decimal places, or is too large to
 *   represent exactly
 */
export function parseHundredths(text) {
  const match = HUNDREDTHS_PATTERN.exec(text.trim());
  if (match === null) {
    return null;
  }

  const [, wholeDigits, decimalDigits = ""] = match;
  const hundredths = Number(wholeDigits || "0") * 100 + Number(decimalDigits.padEnd(2, "0"));
  if (!Number.isSafeInteger(hundredths)) {
    return null;
  }

  return hundredths;
}

/**
 * Reads a dollar amount typed by a person as integer cents.
 *
 * @param {string} text
 * @returns {number | null} see parseHundredths
 */
export function parseDollarsToCents(text) {
  return parseHundredths(text);
}

// Percents are handled as integer hundredths of a percent (basis points).
const BASIS_POINTS_PER_100_PERCENT = 10_000;

// The largest intermediate is billCents * 10_000 + 5_000, about 1e15 at this
// cap ($1 billion). That is under a ninth of Number.MAX_SAFE_INTEGER (about
// 9e15), so all arithmetic below stays exact in integer-valued Numbers.
const MAX_BILL_CENTS = 100_000_000_000;

/**
 * @typedef {"bill" | "tipPercent" | "people"} TipField
 */

/**
 * Lists the computeTip arguments that are outside its contract. Accepts any
 * values, so a caller can pass null for text that did not parse.
 *
 * @param {unknown} billCents
 * @param {unknown} percent
 * @param {unknown} people
 * @returns {TipField[]} the invalid fields, in form order
 */
export function invalidTipFields(billCents, percent, people) {
  const fields = [];
  if (!Number.isInteger(billCents) || billCents < 0 || billCents > MAX_BILL_CENTS) {
    fields.push("bill");
  }
  if (!isPercentWithTwoDecimals(percent)) {
    fields.push("tipPercent");
  }
  if (!Number.isSafeInteger(people) || people < 1) {
    fields.push("people");
  }
  return fields;
}

const FIELD_CONTRACTS = {
  bill: `billCents must be an integer from 0 to ${MAX_BILL_CENTS}`,
  tipPercent: "percent must be a number from 0 to 100 with at most two decimal places",
  people: "people must be an integer of at least 1",
};

/**
 * Splits a bill plus tip between people, exact to the cent.
 *
 * @param {number} billCents integer cents, 0 to MAX_BILL_CENTS
 * @param {number} percent 0 to 100, with at most two decimal places
 * @param {number} people integer, at least 1
 * @returns {{ tipCents: number, totalCents: number, perPersonCents: number }}
 *   The tip rounds half-up to the cent. Each share rounds up, so
 *   people * perPersonCents never falls short of totalCents.
 * @throws {RangeError} when any input is outside its contract
 */
export function computeTip(billCents, percent, people) {
  const invalid = invalidTipFields(billCents, percent, people);
  if (invalid.length > 0) {
    const values = { bill: billCents, tipPercent: percent, people };
    const problems = invalid.map((field) => `${FIELD_CONTRACTS[field]}, got ${describe(values[field])}`);
    throw new RangeError(problems.join("; "));
  }

  const basisPoints = Math.round(percent * 100);
  const tipCents = floorDiv(
    billCents * basisPoints + BASIS_POINTS_PER_100_PERCENT / 2,
    BASIS_POINTS_PER_100_PERCENT,
  );
  const totalCents = billCents + tipCents;
  const perPersonCents = ceilDiv(totalCents, people);

  return { tipCents, totalCents, perPersonCents };
}

// Accepts exactly the Numbers that a decimal literal with at most two places
// produces (12, 12.5, 12.34). Dividing an integer by 100 is correctly rounded,
// so Math.round(percent * 100) / 100 equals the Number of the two-decimal
// literal exactly. Any finer value, like 12.345, differs from it.
function isPercentWithTwoDecimals(percent) {
  if (typeof percent !== "number" || Number.isNaN(percent)) {
    return false;
  }
  if (percent < 0 || percent > 100) {
    return false;
  }
  return Math.round(percent * 100) / 100 === percent;
}

function describe(value) {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}

// Integer division for non-negative safe integers. The remainder and the
// subtraction are exact, and dividing an exact multiple is exact, so no
// float quotient is ever rounded.
function floorDiv(dividend, divisor) {
  return (dividend - (dividend % divisor)) / divisor;
}

function ceilDiv(dividend, divisor) {
  const quotient = floorDiv(dividend, divisor);
  if (dividend % divisor === 0) {
    return quotient;
  }
  return quotient + 1;
}
