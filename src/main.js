import { formatCents } from "./money.js";
import { fieldMessage, readTipForm } from "./tip-form.js";

const form = document.querySelector("#tip-form");
const messages = document.querySelector("#messages");
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

  // Amounts show only for input computeTip accepts; otherwise each invalid
  // field gets its own message so every problem is visible at once.
  if (result.kind === "invalid") {
    messages.replaceChildren(...result.fields.map(renderMessage));
    amounts.hidden = true;
    return;
  }

  messages.replaceChildren();

  tipAmount.value = formatCents(result.tipCents);
  totalAmount.value = formatCents(result.totalCents);
  perPersonAmount.value = formatCents(result.perPersonCents);
  amounts.hidden = false;
}

function renderMessage(field) {
  const paragraph = document.createElement("p");
  paragraph.textContent = fieldMessage(field);
  return paragraph;
}

// Results update as the person types, so Enter has nothing to submit.
form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", render);
render();
