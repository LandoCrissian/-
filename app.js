// Small, deliberate. No analytics. No storage.
console.log("?");

const reveals = document.querySelectorAll(".reveal");
const responseEl = document.getElementById("response");
const askInput = document.getElementById("askInput");
const markEl = document.getElementById("mark");

// ------------------------------
// LOCKED MODE (v1 freeze)
// ------------------------------
// Keep this false until you are READY to reveal factual info.
// When false: site behaves exactly like today (always "?").
const ANSWER_MODE = false;

// ------------------------------
// LAUNCH FACTS (fill later, keep empty now)
// ------------------------------
const FACTS = {
  ca: "",                 // e.g. "FQdsGHDj...pump"
  buy: "",                // e.g. "https://pump.fun/..."
  community: "",          // e.g. "https://x.com/i/communities/...."
  fees: ""                // e.g. "creator fees → buybacks + rewards (transparent)"
};

// ------------------------------
// ANSWER MAP (minimal, factual, short)
// Only used when ANSWER_MODE = true
// ------------------------------
const ANSWERS = [
  {
    match: /(ca|contract|address)\b/i,
    text: () => (FACTS.ca ? `CA: ${FACTS.ca}` : "?")
  },
  {
    match: /(buy|where.*buy|purchase|get)\b/i,
    text: () => (FACTS.buy ? `BUY: ${FACTS.buy}` : "?")
  },
  {
    match: /(community|join|where.*talk|discord|telegram)\b/i,
    text: () => (FACTS.community ? `COMMUNITY: ${FACTS.community}` : "?")
  },
  {
    match: /(fees|creator fee|tax|where.*fees|used)\b/i,
    text: () => (FACTS.fees ? `FEES: ${FACTS.fees}` : "?")
  }
];

// ------------------------------
// EGG CONFIG (private knobs)
// ------------------------------
const TIME_GATE = {
  hour: 3,         // 03:33 UTC (example)
  minute: 33,
  windowSeconds: 60
};

const RARE_THINK_CHANCE = 0.05;       // 5%: longer delay, no glitch
const VERY_RARE_SILENT_CHANCE = 0.01; // 1%: show nothing (deniable)

const MICRO_MOVE_CHANCE = 0.22;       // 22% chance per session
const MICRO_MOVE_PX = 2;              // max shift magnitude

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
  setTimeout(() => responseEl.classList.remove("show"), 2500);
}

function resolveAnswer(userText) {
  if (!ANSWER_MODE) return null;
  const t = (userText || "").trim();
  if (!t) return null;

  for (const a of ANSWERS) {
    if (a.match.test(t)) {
      const out = a.text();
      return (out && out.trim()) ? out : "?";
    }
  }
  return null; // not matched → fall through to normal "?"
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

  markEl.style.transform = `translate(${dx}px, ${dy}px) translateZ(0)`;
})();

// ------------------------------
// EGG #5: DevTools Whisper (quiet)
// ------------------------------
(function devtoolsWhisper() {
  try {
    console.log(DEVTOOLS_WHISPER);
  } catch (_) {}
})();

// ------------------------------
// Ask bar behavior + Eggs (+ optional Answers)
// ------------------------------
let busy = false;

askInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (busy) return;

  busy = true;

  const userText = (askInput.value || "").trim();
  askInput.value = "";

  // If ANSWER_MODE is on and question matches, we return the answer
  // with a slightly "considered" delay and NO glitch.
  const maybeAnswer = resolveAnswer(userText);

  // BASE delay feels like "thinking"
  let delay = 360 + Math.floor(Math.random() * 220);

  const timeGate = inTimeGateUTC();
  if (timeGate) delay = 1200 + Math.floor(Math.random() * 400);

  const rareThink = Math.random() < RARE_THINK_CHANCE;
  const veryRareSilent = Math.random() < VERY_RARE_SILENT_CHANCE;

  // Answers should feel deliberate (slower, no glitch)
  if (maybeAnswer) {
    delay = 900 + Math.floor(Math.random() * 450);
  }

  setTimeout(() => {
    if (veryRareSilent) {
      busy = false;
      return;
    }

    if (maybeAnswer) {
      showResponse(maybeAnswer);
      busy = false;
      return;
    }

    if (rareThink || timeGate) {
      showResponse("?");
      busy = false;
      return;
    }

    glitchPulse();
    showResponse("?");
    busy = false;

  }, delay);
});

// ------------------------------
// Subtle "presence" while focused
// ------------------------------
let focusTimer = null;

askInput.addEventListener("focus", () => {
  const chance = 0.12;

  focusTimer = setTimeout(() => {
    if (Math.random() < chance) glitchPulse();
  }, 7000);
});

askInput.addEventListener("blur", () => {
  if (focusTimer) clearTimeout(focusTimer);
  focusTimer = null;
});
