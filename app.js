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
  community: "https://x.com/i/communities/2006505348979687806",          // e.g. "https://x.com/i/communities/...."
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

    // Community/comms always wins (even in locked mode)
if (COMMUNITY_MATCH.test(userText) && FACTS.community) {
  showResponseFor(60000, `COMMUNITY: ${FACTS.community}`);
  busy = false;
  return;
}

// Normal answer mode (when enabled)
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

  if (COMMUNITY_MATCH.test(userText) && FACTS.community) {
  delay = 420; // fast + deliberate
}
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

(() => {
  const comboEl = document.getElementById("trollCombo");
  const solEl = document.getElementById("solTicker");
  const subEl = document.getElementById("trollSub");
  const statusEl = document.getElementById("lockStatus");

  if (!comboEl || !solEl || !subEl || !statusEl) return;

  // Non-interactive: make sure no input focus vibes
  comboEl.style.pointerEvents = "none";
  solEl.style.pointerEvents = "none";

  const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to feel more "code"
  const DIG = "0123456789";

  // Build a combo like "A7KQ-19F3-ZP0X"
  function randChar() {
    return Math.random() < 0.55
      ? ABC[(Math.random() * ABC.length) | 0]
      : DIG[(Math.random() * DIG.length) | 0];
  }

  function randBlock(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += randChar();
    return s;
  }

  let combo = `${randBlock(4)}-${randBlock(4)}-${randBlock(4)}`;
  comboEl.textContent = combo;

  // "Brute force" effect: mutate a couple chars rapidly
  const mutate = () => {
    const chars = combo.split("");
    // mutate 2-4 positions, avoid hyphens
    const mutations = 2 + ((Math.random() * 3) | 0);
    for (let k = 0; k < mutations; k++) {
      let idx = (Math.random() * chars.length) | 0;
      if (chars[idx] === "-") idx = (idx + 1) % chars.length;
      chars[idx] = randChar();
    }
    combo = chars.join("");
    comboEl.textContent = combo;
  };

  // Every few seconds, "fail" and reset like a system cycling
  const failCycle = () => {
    const msgs = [
      "attempting…",
      "timing window missed",
      "checksum mismatch",
      "access denied",
      "rotating keys…",
      "re-seeding…",
      "rate limit engaged",
      "invalid phrase",
      "still early"
    ];
    subEl.textContent = msgs[(Math.random() * msgs.length) | 0];

    // flicker LOCKED a bit
    statusEl.textContent = "LOCKED";
  };

  // SOL ticker always flipping ????
  // (Optional: you can make it *almost* show numbers, then censor)
  const tickSol = () => {
    const style = Math.random();
    if (style < 0.7) {
      solEl.textContent = "????";
    } else if (style < 0.9) {
      solEl.textContent = "? ? ? ?";
    } else {
      // tease: "12?.??" then blank
      const tease = `${(10 + ((Math.random() * 90) | 0))}?.??`;
      solEl.textContent = tease;
      setTimeout(() => (solEl.textContent = "????"), 180);
    }
  };

  // Start loops
  const comboTimer = setInterval(mutate, 90);     // rapid brute-force
  const cycleTimer = setInterval(failCycle, 2400); // system messages
  const solTimer = setInterval(tickSol, 160);     // flip ticker fast

  // Initial call
  failCycle();
  tickSol();

  // Safety: stop animating if tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(comboTimer);
      clearInterval(cycleTimer);
      clearInterval(solTimer);
    }
  }, { once: true });
})();
