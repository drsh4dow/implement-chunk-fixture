export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function requireInteger(name, value, min, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${name} must be an integer, got ${value}`);
  }
  if (value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}, got ${value}`);
  }
}

// All arithmetic stays in integer cents: the tip rounds half-up, and the
// per-person share rounds up so the group never underpays.
export function computeTip(billCents, percent, people) {
  requireInteger("billCents", billCents, 0);
  requireInteger("percent", percent, 0, 100);
  requireInteger("people", people, 1);
  const tipCents = Math.floor((billCents * percent + 50) / 100);
  const totalCents = billCents + tipCents;
  const perPersonCents = Math.floor((totalCents + people - 1) / people);
  return { tipCents, totalCents, perPersonCents };
}
