import { formatCents } from "./money.js";
import { readTipForm } from "./tip-form.js";

const form = document.querySelector("#tip-form");
const amounts = document.querySelector("#amounts");
const tipAmount = document.querySelector("#tip-amount");
const totalAmount = document.querySelector("#total-amount");
const perPersonAmount = document.querySelector("#per-person-amount");

function render() {
  const result = readTipForm({
    bill: form.elements.bill.value,
    tip: form.elements.tip.value,
    people: form.elements.people.value,
  });

  // Amounts show only for input computeTip accepts.
  if (result.kind === "invalid") {
    amounts.hidden = true;
    return;
  }

  tipAmount.value = formatCents(result.tipCents);
  totalAmount.value = formatCents(result.totalCents);
  perPersonAmount.value = formatCents(result.perPersonCents);
  amounts.hidden = false;
}

// Results update as the person types, so Enter has nothing to submit.
form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", render);
render();
