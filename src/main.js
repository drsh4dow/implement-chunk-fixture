import { formatCents } from "./money.js";

document.querySelector("#app").textContent = `Ready. Example: ${formatCents(1234)}`;
