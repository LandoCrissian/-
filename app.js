// Small, deliberate. No analytics. No storage.
console.log("?");

const reveals = document.querySelectorAll(".reveal");
const responseEl = document.getElementById("response");
const askInput = document.getElementById("askInput");
const markEl = document.getElementById("mark");

// ------------------------------
// EGG CONFIG (private knobs)
// ------------------------------

// Daily "time gate" window (UTC). Keep it obscure.
const TIME_GATE = {
  hour: 3,         // 03:33 UTC (example)
  minute: 33,
  windowSeconds: 60
};

// Rare ask behavior
const RARE_THINK_CHANCE = 0.05;     // 5%: longer delay, no glitch
const VERY_RARE_SILENT_CHANCE = 0.01; // 1%: show nothing (deniable)

// Micro movement (per session)
const MICRO_MOVE_CHANCE = 0.22;     // 22% chance per session
const MICRO_MOVE_PX = 2;            // max shift magnitude

// DevTools whisper
const DEVTOOLS_WHISPER = "// you’re paying attention";

// ------------------------------
// Helpers
// ------------------------------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inTimeGateUTC() {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  const s = now.getUTCSeconds();

  if (h !== TIME_GATE.hour || m !== TIME_GATE.minute) return false;
  return s >= 0 && s < TIME_GATE.windowSeconds;
}

function glitchPulse() {
  document.body.classList.add("glitch");
  setTimeout(() => document.body.classList.remove("glitch"), 170);
}

function showResponse(char = "?") {
  responseEl.textContent = char;
  responseEl.classList.add("show");
  setTimeout(() => responseEl.classList.remove("show"), 2000);
}

// ------------------------------
// Reveal on scroll
// ------------------------------
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("on");
  }
}, { threshold: 0.15 });

reveals.forEach(el => io.observe(el));

// ------------------------------
// EGG #0: "Did it Move?" (micro shift)
// ------------------------------
(function microMoveOncePerSession() {
  if (!markEl) return;
  if (Math.random() > MICRO_MOVE_CHANCE) return;

  const dx = randInt(-MICRO_MOVE_PX, MICRO_MOVE_PX);
  const dy = randInt(-MICRO_MOVE_PX, MICRO_MOVE_PX);

  // Apply a subtle translate without animation.
  // Deniable. Small. Session-only.
  markEl.style.transform = `translate(${dx}px, ${dy}px) translateZ(0)`;
})();

// ------------------------------
// EGG #5: DevTools Whisper (quiet)
// ------------------------------
(function devtoolsWhisper() {
  // Only print once, but not in a way that screams "puzzle".
  // A single line comment is enough.
  try {
    // This will show up for anyone inspecting, without being a feature.
    console.log(DEVTOOLS_WHISPER);
  } catch (_) {}
})();

// ------------------------------
// Ask bar behavior + Eggs
// ------------------------------
let busy = false;

askInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (busy) return;

  busy = true;

  // Capture but do nothing with it (we want indifference)
  const userText = (askInput.value || "").trim();
  askInput.value = "";

  // BASE delay feels like "thinking"
  let delay = 360 + Math.floor(Math.random() * 220);

  // EGG #1: Time Gate changes the "thinking" feel (no new text)
  // During the gate, thinking is heavier + slightly more consistent.
  const timeGate = inTimeGateUTC();
  if (timeGate) {
    delay = 1200 + Math.floor(Math.random() * 400);
  }

  // EGG #3: Rare "consideration" (longer delay, no glitch)
  const rareThink = Math.random() < RARE_THINK_CHANCE;

  // VERY rare: "nothing happens" (deniable)
  const veryRareSilent = Math.random() < VERY_RARE_SILENT_CHANCE;

  setTimeout(() => {
    // If silent egg triggers, do nothing.
    if (veryRareSilent) {
      busy = false;
      return;
    }

    // Rare think: no glitch, just response
    if (rareThink || timeGate) {
      showResponse("?");
      busy = false;
      return;
    }

    // Normal behavior
    glitchPulse();
    showResponse("?");
    busy = false;

    // Egg hook placeholder (kept OFF for now)
    // eggHook(userText);

  }, delay);
});

// ------------------------------
// Subtle "presence" while focused
// ------------------------------
let focusTimer = null;

askInput.addEventListener("focus", () => {
  // After a few seconds of staring, a micro glitch pulse can occur rarely.
  // This makes the site feel like it noticed them.
  const chance = 0.12;

  focusTimer = setTimeout(() => {
    if (Math.random() < chance) {
      glitchPulse();
      // No response shown. Just a nudge.
    }
  }, 7000);
});

askInput.addEventListener("blur", () => {
  if (focusTimer) clearTimeout(focusTimer);
  focusTimer = null;
});

// Placeholder for future eggs (do nothing yet)
function eggHook(_text) {
  // Intentionally empty in v1.
}
