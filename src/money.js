export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Percents are handled as integer hundredths of a percent (basis points),
// so 100% is 10_000 basis points and the tip is bill * basisPoints / 10_000.
const BASIS_POINTS_PER_WHOLE = 10_000;

// The largest intermediate is billCents * 10_000 + 5_000. This cap ($1 billion)
// keeps it, and every total, far below Number.MAX_SAFE_INTEGER, so all
// arithmetic below stays exact in integer-valued Numbers.
const MAX_BILL_CENTS = 100_000_000_000;

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
  if (!Number.isInteger(billCents) || billCents < 0 || billCents > MAX_BILL_CENTS) {
    throw new RangeError(`billCents must be an integer from 0 to ${MAX_BILL_CENTS}, got ${billCents}`);
  }

  const basisPoints = toBasisPoints(percent);

  if (!Number.isSafeInteger(people) || people < 1) {
    throw new RangeError(`people must be an integer of at least 1, got ${people}`);
  }

  const tipCents = floorDiv(billCents * basisPoints + BASIS_POINTS_PER_WHOLE / 2, BASIS_POINTS_PER_WHOLE);
  const totalCents = billCents + tipCents;
  const perPersonCents = ceilDiv(totalCents, people);

  return { tipCents, totalCents, perPersonCents };
}

// Accepts exactly the Numbers that a decimal literal with at most two places
// produces (12, 12.5, 12.34). Integer division by 100 is correctly rounded,
// so basisPoints / 100 reproduces such a literal bit for bit and differs from
// any value with finer precision, like 12.345.
function toBasisPoints(percent) {
  if (typeof percent !== "number" || !(percent >= 0 && percent <= 100)) {
    throw new RangeError(`percent must be a number from 0 to 100, got ${percent}`);
  }

  const basisPoints = Math.round(percent * 100);
  if (basisPoints / 100 !== percent) {
    throw new RangeError(`percent allows at most two decimal places, got ${percent}`);
  }

  return basisPoints;
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
