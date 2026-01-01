// Small, deliberate. No analytics. No storage.
console.log("?");

const reveals = document.querySelectorAll(".reveal");
const responseEl = document.getElementById("response");
const askInput = document.getElementById("askInput");
const markEl = document.getElementById("mark");

// ------------------------------
// LOCKED MODE (v1 freeze)
// ------------------------------
const ANSWER_MODE = false;

// ------------------------------
// LAUNCH FACTS (fill later, keep empty now)
// ------------------------------
const FACTS = {
  ca: "",
  buy: "",
  community: "https://x.com/i/communities/2006505348979687806",
  fees: ""
};

// ------------------------------
// COMMUNITY MATCH (works even in locked mode)
// ------------------------------
const COMMUNITY_MATCH =
  /\b(community|comms|chat|talk|where.*talk|join|x community|twitter community|group|hub|members|updates|announcements)\b/i;

// ------------------------------
// ANSWER MAP (only used when ANSWER_MODE = true)
// ------------------------------
const ANSWERS = [
  { match: /(ca|contract|address)\b/i, text: () => (FACTS.ca ? `CA: ${FACTS.ca}` : "?") },
  { match: /(buy|where.*buy|purchase|get)\b/i, text: () => (FACTS.buy ? `BUY: ${FACTS.buy}` : "?") },
  { match: /(community|join|where.*talk|discord|telegram)\b/i, text: () => (FACTS.community ? `COMMUNITY: ${FACTS.community}` : "?") },
  { match: /(fees|creator fee|tax|where.*fees|used)\b/i, text: () => (FACTS.fees ? `FEES: ${FACTS.fees}` : "?") }
];

// ------------------------------
// EGG CONFIG (private knobs)
// ------------------------------
const TIME_GATE = { hour: 3, minute: 33, windowSeconds: 60 };

const RARE_THINK_CHANCE = 0.05;
const VERY_RARE_SILENT_CHANCE = 0.01;

const MICRO_MOVE_CHANCE = 0.22;
const MICRO_MOVE_PX = 2;

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

// default short response (2.5s)
function showResponseFor(ms, text = "?", opts = {}) {
  if (!responseEl) return;

  // style class for long text
  responseEl.classList.toggle("long", !!opts.long);

  // allow clickable link rendering
  if (opts.html) responseEl.innerHTML = opts.html;
  else responseEl.textContent = text;

  responseEl.classList.add("show");
  clearTimeout(showResponseFor._t);
  showResponseFor._t = setTimeout(() => {
    responseEl.classList.remove("show");
    responseEl.classList.remove("long");
  }, ms);
}

// long response (e.g. 60s)
function showResponseFor(ms, text = "?") {
  if (!responseEl) return;
  responseEl.textContent = text;
  responseEl.classList.add("show");
  clearTimeout(showResponseFor._t);
  showResponseFor._t = setTimeout(() => responseEl.classList.remove("show"), ms);
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
  return null;
}

// ------------------------------
// Reveal on scroll
// ------------------------------
if (reveals && reveals.length) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add("on");
  }, { threshold: 0.15 });

  reveals.forEach(el => io.observe(el));
}

// ------------------------------
// EGG #0: Micro shift (once per session)
// ------------------------------
(function microMoveOncePerSession() {
  if (!markEl) return;
  if (Math.random() > MICRO_MOVE_CHANCE) return;

  const dx = randInt(-MICRO_MOVE_PX, MICRO_MOVE_PX);
  const dy = randInt(-MICRO_MOVE_PX, MICRO_MOVE_PX);
  markEl.style.transform = `translate(${dx}px, ${dy}px) translateZ(0)`;
})();

// ------------------------------
// EGG #5: DevTools whisper
// ------------------------------
(function devtoolsWhisper() {
  try { console.log(DEVTOOLS_WHISPER); } catch (_) {}
})();

// ------------------------------
// Ask bar behavior
// ------------------------------
let busy = false;

if (askInput) {
  askInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (busy) return;

    busy = true;

    const userText = (askInput.value || "").trim();
    askInput.value = "";

    const communityHit = COMMUNITY_MATCH.test(userText) && !!FACTS.community;
    const maybeAnswer = resolveAnswer(userText);

    // BASE delay feels like "thinking"
    let delay = 360 + Math.floor(Math.random() * 220);

    const timeGate = inTimeGateUTC();
    if (timeGate) delay = 1200 + Math.floor(Math.random() * 400);

    const rareThink = Math.random() < RARE_THINK_CHANCE;
    const veryRareSilent = Math.random() < VERY_RARE_SILENT_CHANCE;

    // Community should respond quickly + deliberate
    if (communityHit) delay = 420;

    // Answers should feel deliberate (slower, no glitch)
    if (maybeAnswer) delay = 900 + Math.floor(Math.random() * 450);

    setTimeout(() => {
      if (veryRareSilent) {
        busy = false;
        return;
      }

      // Community/comms always wins (even in locked mode)
      if (communityHit) {
  showResponseFor(
    60000,
    "",
    {
      long: true,
      html: `COMMUNITY<br><a href="${FACTS.community}" target="_blank" rel="noopener noreferrer">${FACTS.community}</a>`
    }
  );
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
  });
}

// ------------------------------
// Subtle "presence" while focused
// ------------------------------
let focusTimer = null;

if (askInput) {
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
}

// ------------------------------
// LOCKED TROLL PANEL (non-interactive)
// ------------------------------
(() => {
  const comboEl = document.getElementById("trollCombo");
  const solEl = document.getElementById("solTicker");
  const subEl = document.getElementById("trollSub");
  const statusEl = document.getElementById("lockStatus");

  if (!comboEl || !solEl || !subEl || !statusEl) return;

  comboEl.style.pointerEvents = "none";
  solEl.style.pointerEvents = "none";

  const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const DIG = "0123456789";

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

  const mutate = () => {
    const chars = combo.split("");
    const mutations = 2 + ((Math.random() * 3) | 0);
    for (let k = 0; k < mutations; k++) {
      let idx = (Math.random() * chars.length) | 0;
      if (chars[idx] === "-") idx = (idx + 1) % chars.length;
      chars[idx] = randChar();
    }
    combo = chars.join("");
    comboEl.textContent = combo;
  };

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

  const failCycle = () => {
    subEl.textContent = msgs[(Math.random() * msgs.length) | 0];
    statusEl.textContent = "LOCKED";
  };

  const tickSol = () => {
    const r = Math.random();
    if (r < 0.7) solEl.textContent = "????";
    else if (r < 0.9) solEl.textContent = "? ? ? ?";
    else {
      const tease = `${(10 + ((Math.random() * 90) | 0))}?.??`;
      solEl.textContent = tease;
      setTimeout(() => (solEl.textContent = "????"), 180);
    }
  };

  let comboTimer = null, cycleTimer = null, solTimer = null;

  function start() {
    if (comboTimer) return;
    comboTimer = setInterval(mutate, 90);
    cycleTimer = setInterval(failCycle, 2400);
    solTimer = setInterval(tickSol, 160);
    failCycle();
    tickSol();
  }

  function stop() {
    if (comboTimer) clearInterval(comboTimer);
    if (cycleTimer) clearInterval(cycleTimer);
    if (solTimer) clearInterval(solTimer);
    comboTimer = cycleTimer = solTimer = null;
  }

  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
})();
