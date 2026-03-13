// ─────────────────────────────────────────────
//  RETRO SOUND ENGINE (Web Audio API)
// ─────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

/** Coin insert — classic arcade "bling" */
function playCoinSound() {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(988, audioCtx.currentTime); // B5
  osc.frequency.setValueAtTime(1319, audioCtx.currentTime + 0.08); // E6
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.25);
}

/** Menu hover — short blip */
function playHoverSound() {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(660, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.06);
}

/** Click / select — confirmation bleep */
function playSelectSound() {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(523, audioCtx.currentTime); // C5
  osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.06); // G5
  osc.frequency.setValueAtTime(1047, audioCtx.currentTime + 0.12); // C6
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.22);
}

/** Power-up sound — ascending sweep */
function playPowerUpSound() {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(260, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.35);
}

/** Level-up / section enter — triumphant jingle */
function playLevelUpSound() {
  ensureAudio();
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "square";
    const t = audioCtx.currentTime + i * 0.09;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.12);
  });
}

// ─────────────────────────────────────────────
//  CUSTOM CURSOR
// ─────────────────────────────────────────────
const cur = document.getElementById("cursor");
document.addEventListener("mousemove", (e) => {
  cur.style.left = e.clientX + "px";
  cur.style.top = e.clientY + "px";
});

// ─────────────────────────────────────────────
//  STAR FIELD
// ─────────────────────────────────────────────
const starsEl = document.getElementById("stars");
for (let i = 0; i < 120; i++) {
  const s = document.createElement("div");
  s.className = "star";
  const colors = ["white", "#FFE600", "#FF2D78", "#00F5FF"];
  const big = Math.random() > 0.85;
  s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--d:${1 + Math.random() * 3}s;--delay:${Math.random() * 3}s;opacity:${0.1 + Math.random() * 0.9};${big ? `width:3px;height:3px;background:${colors[Math.floor(Math.random() * colors.length)]}` : ""}`;
  starsEl.appendChild(s);
}

// ─────────────────────────────────────────────
//  SCORE COUNTER
// ─────────────────────────────────────────────
let score = 0;
const scoreEl = document.getElementById("score");

const scoreInt = setInterval(() => {
  score = Math.min(score + Math.floor(Math.random() * 300 + 50), 999999);
  scoreEl.textContent = String(score).padStart(6, "0");

  if (score >= 999999) {
    clearInterval(scoreInt);
    playPowerUpSound(); // triumphant sound when max score reached
  }
}, 80);

// ─────────────────────────────────────────────
//  INTERSECTION OBSERVER — fade-up + sounds
// ─────────────────────────────────────────────
const sectionSoundsPlayed = new Set();

const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");

        // Animate skill / stat bars
        e.target
          .querySelectorAll(".skill-meter-fill, .char-stat-fill")
          .forEach((b) => {
            b.style.width = b.dataset.width + "%";
          });

        // Play level-up jingle the first time each section scrolls in
        const section = e.target.closest("section");
        if (section && !sectionSoundsPlayed.has(section.id)) {
          sectionSoundsPlayed.add(section.id);
          playLevelUpSound();
        }
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));

// ─────────────────────────────────────────────
//  SOUND BINDINGS — hover / click
// ─────────────────────────────────────────────

// Nav links & buttons — hover blip
document
  .querySelectorAll("nav a, .btn-pixel, .contact-link, .tag-pixel")
  .forEach((el) => {
    el.addEventListener("mouseenter", playHoverSound);
  });

// Buttons & nav links — click select
document.querySelectorAll("nav a, .btn-pixel, .contact-link").forEach((el) => {
  el.addEventListener("click", playSelectSound);
});

// Coin sound on first interaction (like putting a coin in the machine)
let coinPlayed = false;
document.addEventListener(
  "click",
  () => {
    if (!coinPlayed) {
      playCoinSound();
      coinPlayed = true;
    }
  },
  { once: true },
);

// Skill cards — power-up sound on hover
document.querySelectorAll(".skill-card").forEach((el) => {
  el.addEventListener("mouseenter", playPowerUpSound);
});

// Project cards — select sound on hover
document.querySelectorAll(".proj-card").forEach((el) => {
  el.addEventListener("mouseenter", playHoverSound);
});

// ─────────────────────────────────────────────
//  CONTACT FORM — Formspree without redirect
// ─────────────────────────────────────────────
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    playSelectSound();

    const submitBtn = contactForm.querySelector(".form-submit");
    if (!submitBtn) return;

    submitBtn.disabled = true;
    formStatus.textContent = "ENVIANDO MENSAJE...";
    formStatus.classList.remove("is-success", "is-error");

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        contactForm.reset();
        formStatus.textContent = "✔ MENSAJE ENVIADO. TE RESPONDO PRONTO.";
        formStatus.classList.add("is-success");
      } else {
        formStatus.textContent = "✖ NO SE PUDO ENVIAR. PRUEBA OTRA VEZ.";
        formStatus.classList.add("is-error");
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      formStatus.textContent = "✖ ERROR DE CONEXION. INTENTALO DE NUEVO.";
      formStatus.classList.add("is-error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
