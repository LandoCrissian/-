// Small, deliberate. No analytics. No storage.
console.log("?");

// ------------------------------
// DOM
// ------------------------------
const reveals = document.querySelectorAll(".reveal");

// ASK (stays text)
const responseEl = document.getElementById("response");
const askInput = document.getElementById("askInput");
const markEl = document.getElementById("mark");

// VAULT (fully separate)
const vaultInputEl = document.getElementById("vaultInput");
const vaultBtnEl = document.getElementById("vaultBtn");
const vaultSubEl = document.getElementById("vaultSub");
const vaultResultEl = document.getElementById("vaultResult");
const vaultStatusEl = document.getElementById("vaultStatus");

// TROLL PANEL
const comboEl = document.getElementById("trollCombo");
const solEl = document.getElementById("solTicker");
const trollSubEl = document.getElementById("trollSub");
const lockStatusEl = document.getElementById("lockStatus");

// ------------------------------
// LINK: VAULT -> TOP PANEL (UNLOCK)
// ------------------------------
let topOverrideTimer = null;
let topSubOverrideTimer = null;

function setTopSub(text, ms = 1400) {
  if (!trollSubEl) return;
  const prev = trollSubEl.textContent;

  clearTimeout(topSubOverrideTimer);
  trollSubEl.textContent = text;

  topSubOverrideTimer = setTimeout(() => {
    trollSubEl.textContent = prev;
  }, ms);
}

function flashTopComboFromAttempt(attemptDigits) {
  if (!comboEl) return;

  // Convert 10 digits into a "key-like" triplet: 4-4-2 padded to 4
  // Example: 1234567890 -> 1234-5678-90Q?
  const a = attemptDigits.slice(0, 4);
  const b = attemptDigits.slice(4, 8);
  const c = attemptDigits.slice(8, 10);

  // add 2 chars to make it feel like the existing 4-char block
  const pad = "??";
  const temp = `${a}-${b}-${c}${pad}`;

  const prev = comboEl.textContent;
  clearTimeout(topOverrideTimer);

  // show "sync" combo
  comboEl.textContent = temp;

  // subtle status flicker
  if (lockStatusEl) lockStatusEl.textContent = "LOCKED";

  topOverrideTimer = setTimeout(() => {
    comboEl.textContent = prev; // returns to mutated stream
  }, 1600);
}

function burstSolLeak(ms = 1200) {
  // temporarily increase chance of number flash after a vault attempt
  if (!SOL_LEAK || !SOL_LEAK.enabled) return;

  const prev = {
    flashChance: SOL_LEAK.flashChance,
    flashMs: SOL_LEAK.flashMs
  };

  SOL_LEAK.flashChance = 0.75; // big leak
  SOL_LEAK.flashMs = 300;

  setTimeout(() => {
    SOL_LEAK.flashChance = prev.flashChance;
    SOL_LEAK.flashMs = prev.flashMs;
  }, ms);
}

// ------------------------------
// LOCKED MODE (v1 freeze)
// ------------------------------
const ANSWER_MODE = false;

// ------------------------------
// LAUNCH FACTS
// ------------------------------
const FACTS = {
  ca: "",
  buy: "",
  community: "https://x.com/i/communities/2006505348979687806",
  fees: ""
};

// ------------------------------
// COMMUNITY MATCH (strong)
// ------------------------------
const COMMUNITY_MATCH = /\b(community|comms|chat|talk|join|group|hub|members|updates|announcements)\b/i;

function isCommunityHit(text) {
  const t = (text || "").toLowerCase();
  if (!t) return false;
  if (COMMUNITY_MATCH.test(t)) return true;
  if (t.includes("x.com/i/communities/")) return true;
  if (t.includes("communities/2006505348979687806")) return true;
  return false;
}

// ------------------------------
// VAULT CONFIG
// ------------------------------
const VAULT = {
  enabled: true,
  digits: 10,
  unlockEnabled: false,
  unlockCode: "0000000000"
};

// ------------------------------
// SOL LEAK (troll panel ticker)
// ------------------------------
const SOL_LEAK = {
  enabled: true,
  flashChance: 0.18,
  flashMs: 240,
  min: 0.0,
  max: 99.99
};

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
// EGG CONFIG
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

// ------------------------------
// ASK UI helpers (ONLY ask uses these)
// ------------------------------
function clearAskResponse() {
  if (!responseEl) return;
  responseEl.classList.remove("show", "linkmode", "long");
  responseEl.textContent = "";
}

function showAskResponseFor(ms, text = "?", opts = {}) {
  if (!responseEl) return;

  responseEl.classList.toggle("linkmode", !!opts.linkmode);
  responseEl.classList.toggle("long", !!opts.long);

  if (opts.html) responseEl.innerHTML = opts.html;
  else responseEl.textContent = text;

  responseEl.classList.add("show");

  clearTimeout(showAskResponseFor._t);
  showAskResponseFor._t = setTimeout(() => clearAskResponse(), ms);
}

function showAskResponse(text = "?", opts = {}) {
  showAskResponseFor(2500, text, opts);
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
// VAULT helpers (NEVER touches ask response)
// ------------------------------
function setVaultSub(text) {
  if (vaultSubEl) vaultSubEl.textContent = text;
}

function showVaultResult(text) {
  if (!vaultResultEl) return;
  vaultResultEl.textContent = text;
  vaultResultEl.classList.add("show");
  clearTimeout(showVaultResult._t);
  showVaultResult._t = setTimeout(() => {
    vaultResultEl.classList.remove("show");
    vaultResultEl.textContent = "";
  }, 9000);
}

function parseVaultAttempt(text) {
  if (!VAULT.enabled) return null;
  const raw = (text || "").trim();
  if (!raw) return null;

  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length !== VAULT.digits) return null;

  return digitsOnly;
}

let vaultBusy = false;

function handleVaultTry() {
  if (!VAULT.enabled) return;
  if (vaultBusy) return;

  const attempt = parseVaultAttempt(vaultInputEl ? vaultInputEl.value : "");
  if (!attempt) {
    glitchPulse();
    setVaultSub("need 10 digits");
    showVaultResult("??????????");
    return;
  }

  vaultBusy = true;

  // >>> NEW: make the TOP PANEL react (no more autopilot feel)
  setTopSub("verifying…");
  flashTopComboFromAttempt(attempt);
  burstSolLeak(1200);

  setVaultSub("checking…");
  if (vaultStatusEl) vaultStatusEl.textContent = "LOCKED";

  if (vaultInputEl) vaultInputEl.value = "";

  const delay = 650 + Math.floor(Math.random() * 650);

  setTimeout(() => {
    glitchPulse();

    if (VAULT.unlockEnabled && attempt === VAULT.unlockCode) {
      if (vaultStatusEl) vaultStatusEl.textContent = "UNLOCKED";
      setVaultSub("…");
      showVaultResult("UNLOCKED");

      // >>> NEW: top panel reacts to success too
      setTopSub("access granted", 2000);
      if (lockStatusEl) lockStatusEl.textContent = "UNLOCKED";

      vaultBusy = false;
      return;
    }

    const masked = attempt.slice(0, 2) + "????????" + attempt.slice(-2);
    setVaultSub("timing window missed");
    showVaultResult(masked);

    // >>> NEW: top panel reacts to failure
    setTopSub("checksum mismatch", 1600);

    vaultBusy = false;
  }, delay);
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
// EGG: Micro shift (once per session)
// ------------------------------
(function microMoveOncePerSession() {
  if (!markEl) return;
  if (Math.random() > MICRO_MOVE_CHANCE) return;

  const dx = randInt(-MICRO_MOVE_PX, MICRO_MOVE_PX);
  const dy = randInt(-MICRO_MOVE_PX, MICRO_MOVE_PX);
  markEl.style.transform = `translate(${dx}px, ${dy}px) translateZ(0)`;
})();

// ------------------------------
// EGG: DevTools whisper
// ------------------------------
(function devtoolsWhisper() {
  try { console.log(DEVTOOLS_WHISPER); } catch (_) {}
})();

// ------------------------------
// ASK behavior (stays TEXT; never numeric)
// ------------------------------
let askBusy = false;

if (askInput) {
  // IMPORTANT: keep Ask as text (fixes your iOS keypad issue)
  askInput.setAttribute("type", "text");
  askInput.setAttribute("inputmode", "text");
  askInput.setAttribute("pattern", "");
  askInput.setAttribute("autocomplete", "off");
  askInput.setAttribute("autocapitalize", "off");
  askInput.setAttribute("spellcheck", "false");

  askInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (askBusy) return;

    askBusy = true;

    const userText = (askInput.value || "").trim();
    askInput.value = "";

    const communityHit = isCommunityHit(userText) && !!FACTS.community;
    const maybeAnswer = resolveAnswer(userText);

    let delay = 360 + Math.floor(Math.random() * 220);

    const timeGate = inTimeGateUTC();
    if (timeGate) delay = 1200 + Math.floor(Math.random() * 400);

    const rareThink = Math.random() < RARE_THINK_CHANCE;
    const veryRareSilent = Math.random() < VERY_RARE_SILENT_CHANCE;

    if (communityHit) delay = 420;
    if (maybeAnswer) delay = 900 + Math.floor(Math.random() * 450);

    setTimeout(() => {
      if (veryRareSilent) {
        askBusy = false;
        return;
      }

      if (communityHit) {
        showAskResponseFor(25000, "", {
          linkmode: true,
          html: `
            COMMUNITY<br>
            <a href="${FACTS.community}" target="_blank" rel="noopener noreferrer">
              join →
            </a>
          `
        });
        askBusy = false;
        return;
      }

      if (maybeAnswer) {
        const long = maybeAnswer.length > 24;
        showAskResponseFor(6000, maybeAnswer, { long });
        askBusy = false;
        return;
      }

      if (rareThink || timeGate) {
        showAskResponse("?");
        askBusy = false;
        return;
      }

      glitchPulse();
      showAskResponse("?");
      askBusy = false;
    }, delay);
  });
}

// ------------------------------
// VAULT events (separate from ask)
// ------------------------------
if (vaultInputEl) {
  vaultInputEl.addEventListener("input", () => {
    // digits only, max 10
    vaultInputEl.value = vaultInputEl.value.replace(/\D/g, "").slice(0, VAULT.digits);
  });

  vaultInputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    handleVaultTry();
  });
}

if (vaultBtnEl) {
  vaultBtnEl.addEventListener("click", (e) => {
    e.preventDefault();
    handleVaultTry();
  });
}

// ------------------------------
// Subtle "presence" while ASK focused (ask only)
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
  if (!comboEl || !solEl || !trollSubEl || !lockStatusEl) return;

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
    trollSubEl.textContent = msgs[(Math.random() * msgs.length) | 0];
    lockStatusEl.textContent = "LOCKED";
  };

  const fmt = (n) => n.toFixed(2);

  const tickSol = () => {
    if (!SOL_LEAK.enabled) {
      solEl.textContent = "????";
      return;
    }

    const r = Math.random();

    if (r < 0.55) {
      solEl.textContent = "????";
      return;
    }

    if (r < 0.82) {
      solEl.textContent = "? ? ? ?";
      return;
    }

    if (Math.random() < SOL_LEAK.flashChance) {
      const val = SOL_LEAK.min + Math.random() * (SOL_LEAK.max - SOL_LEAK.min);
      solEl.textContent = fmt(val);
      setTimeout(() => (solEl.textContent = "????"), SOL_LEAK.flashMs);
      return;
    }

    solEl.textContent = "????";
  };

  let comboTimer = null, cycleTimer = null, solTimer = null;

  function start() {
    if (comboTimer) return;
    comboTimer = setInterval(mutate, 90);
    cycleTimer = setInterval(failCycle, 2400);
    solTimer = setInterval(tickSol, 180);
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
