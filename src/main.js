import { formatCents } from "./money.js";
import { fieldMessage, readTipForm } from "./tip-form.js";

const form = document.querySelector("#tip-form");
const messages = document.querySelector("#messages");
const amounts = document.querySelector("#amounts");
const tipAmount = document.querySelector("#tip-amount");
const totalAmount = document.querySelector("#total-amount");
const perPersonAmount = document.querySelector("#per-person-amount");
const fieldNames = ["bill", "tipPercent", "people"];

function render() {
  const result = readTipForm({
    bill: form.elements.bill.value,
    tipPercent: form.elements.tipPercent.value,
    people: form.elements.people.value,
  });

  if (result.kind === "invalid") {
    markInvalidFields(result.fields);
    messages.replaceChildren(...result.fields.map(renderMessage));
    amounts.hidden = true;
    return;
  }

  markInvalidFields([]);
  messages.replaceChildren();

  tipAmount.value = formatCents(result.tipCents);
  totalAmount.value = formatCents(result.totalCents);
  perPersonAmount.value = formatCents(result.perPersonCents);
  amounts.hidden = false;
}

function renderMessage(field) {
  const paragraph = document.createElement("p");
  paragraph.id = messageId(field);
  paragraph.textContent = fieldMessage(field);
  return paragraph;
}

// Ties each invalid input to its own message so assistive tech announces
// which field is wrong; every other input loses both attributes.
function markInvalidFields(invalidFields) {
  for (const field of fieldNames) {
    const input = form.elements[field];

    if (invalidFields.includes(field)) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", messageId(field));
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }
}

function messageId(field) {
  return `${field}-error`;
}

// Results update as the person types, so Enter has nothing to submit.
form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", render);
render();
