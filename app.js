// Small, deliberate. No analytics. No storage.

console.log("?");

const reveals = document.querySelectorAll(".reveal");
const responseEl = document.getElementById("response");
const askInput = document.getElementById("askInput");

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("on");
  }
}, { threshold: 0.15 });

reveals.forEach(el => io.observe(el));

// Ask bar behavior
let busy = false;

function glitchPulse() {
  document.body.classList.add("glitch");
  setTimeout(() => document.body.classList.remove("glitch"), 170);
}

function showResponse(char = "?") {
  responseEl.textContent = char;
  responseEl.classList.add("show");
  setTimeout(() => responseEl.classList.remove("show"), 2000);
}

askInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (busy) return;

  busy = true;

  // Capture but do nothing with it (we want indifference)
  const userText = (askInput.value || "").trim();
  askInput.value = "";

  // micro delay feels like "thinking"
  const delay = 360 + Math.floor(Math.random() * 220);

  setTimeout(() => {
    glitchPulse();
    showResponse("?");
    busy = false;

    // Easter-egg hook (OFF by default)
    // If you later want rare events, we’ll enable carefully without breaking mystique:
    // eggHook(userText);

  }, delay);
});

// Placeholder for future eggs (do nothing yet)
function eggHook(_text) {
  // Intentionally empty in v1.
}
