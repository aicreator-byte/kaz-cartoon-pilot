// ============================================================================
// FrogCanvas.js — Kodok Desain C digambar via Canvas 2D (tanpa SVG geometris)
// Digunakan untuk eksperimen TEST 1–3 sebelum implementasi engine penuh.
// Semua animasi deterministik berdasarkan frame number (tidak ada random,
// tidak ada Date.now()). Loop 180 frame = 6 detik @ 30fps.
// ============================================================================

const COLORS = {
  skinDark: "#4A5D23",   // hijau zaitun gelap (gradient bawah)
  skinBase: "#6B8E23",   // hijau zaitun dasar
  skinLight: "#8FBC8F",  // highlight kulit
  bellyBase: "#B8C87A",  // perut dasar
  bellyLight: "#E8F5A9", // perut terang
  spot: "#3E4A1F",       // bintik kulit
  iris: "#DAA520",       // iris keemasan
  pupil: "#1A1A1A",      // pupil hitam
  highlight: "#FFFFFF",  // kilauan mata
  eyelid: "#556B2F",     // kelopak mata
  outline: "#2F3B14",    // garis tepi
  mouth: "#3D2B1F",      // mulut
  tongue: "#FF6B6B",     // lidah
  bg: "#FDFBF0",         // background
  ground: "#D4C58A",     // tanah
  shadow: "rgba(0,0,0,0.25)",
};

// Loop: 180 frame = 6 detik @ 30fps
const LOOP_FRAMES = 180;

function getAnimationState(frame) {
  const f = frame % LOOP_FRAMES;
  if (f < 45) return { state: "idle", t: f / 45 };             // 0–1.5s: bernapas
  if (f < 60) return { state: "blink", t: (f - 45) / 15 };     // 1.5–2s: kedip
  if (f < 105) return { state: "surprised", t: (f - 60) / 45 }; // 2–3.5s: terkejut
  if (f < 135) return { state: "crouch", t: (f - 105) / 30 };   // 3.5–4.5s: membungkuk
  if (f < 150) return { state: "jump", t: (f - 135) / 15 };    // 4.5–5s: lompat ke atas
  if (f < 165) return { state: "hang", t: (f - 150) / 15 };    // 5–5.5s: di puncak
  if (f < 180) return { state: "impact", t: (f - 165) / 15 };  // 5.5–6s: jatuh & ledakan
  return { state: "idle", t: 0 };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

// ---------- Bagian tubuh ----------

function drawBody(ctx, state, t) {
  const eio = easeInOutCubic;
  const bodyW = 110;
  const bodyH = 130;

  // Squash/stretch dari animasi
  let sx = 1, sy = 1, yOff = 0;
  if (state === "crouch") {
    const ct = eio(t);
    sx = 1 + ct * 0.25;
    sy = 1 - ct * 0.35;
    yOff = ct * 30;
  } else if (state === "jump") {
    const jt = eio(t);
    sx = 1 - jt * 0.15;
    sy = 1 + jt * 0.35;
    yOff = -jt * 20;
  } else if (state === "hang") {
    sx = 0.92; sy = 1.08;
  } else if (state === "impact") {
    const it = eio(t);
    sx = 1 + it * 0.35;
    sy = 1 - it * 0.45;
    yOff = it * 25;
  }

  ctx.save();
  ctx.translate(0, yOff);
  ctx.scale(sx, sy);

  // Bayong di bawah badan
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(0, bodyH * 0.55 + 10, bodyW * 0.5, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Badan utama dengan gradasi
  const bodyGrad = ctx.createLinearGradient(
    -bodyW / 2, -bodyH / 2, bodyW / 2, bodyH / 2
  );
  bodyGrad.addColorStop(0, COLORS.skinDark);
  bodyGrad.addColorStop(0.45, COLORS.skinBase);
  bodyGrad.addColorStop(1, COLORS.skinLight);

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 5, bodyW * 0.5, bodyH * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Perut (hijau kekuningan dengan lipatan)
  const bellyGrad = ctx.createLinearGradient(0, -bodyH * 0.15, 0, bodyH * 0.35);
  bellyGrad.addColorStop(0, COLORS.bellyBase);
  bellyGrad.addColorStop(1, COLORS.bellyLight);

  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 12, bodyW * 0.42, bodyH * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lipatan perut
  ctx.strokeStyle = COLORS.skinDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 8, bodyW * 0.38, bodyH * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Bintik kulit di punggung
  ctx.fillStyle = COLORS.spot;
  const spots = [
    [-45, -18, 10], [-30, -8, 8], [-15, 2, 12],
    [25, -12, 9], [40, -5, 7], [10, -20, 11],
  ];
  for (const [sx2, sy2, r] of spots) {
    ctx.beginPath();
    ctx.arc(sx2, sy2, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBackLeg(ctx, x, y, isRight, state, t) {
  const eio = easeInOutCubic;
  const side = isRight ? 1 : -1;
  let bend = 0, legY = y, legScale = 1;

  if (state === "crouch") {
    const ct = eio(t);
    bend = ct * 45;
    legY = y + ct * 25;
    legScale = 1 - ct * 0.1;
  } else if (state === "jump") {
    const jt = eio(t);
    bend = -jt * 30;
    legY = y - jt * 15;
    legScale = 1 + jt * 0.05;
  } else if (state === "hang") {
    bend = 20;
    legScale = 1.05;
  } else if (state === "impact") {
    const it = eio(t);
    bend = it * 50;
    legY = y + it * 20;
    legScale = 1 - it * 0.1;
  }

  ctx.save();
  ctx.translate(x * side, legY);
  ctx.scale(legScale, legScale);

  // Panggul (uiran di sisi badan)
  ctx.fillStyle = COLORS.skinBase;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(side * 8, -10, 22, 28, side * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Betis (kaki belakang kuat, melengkung)
  ctx.fillStyle = ctx.createLinearGradient(
    side * 15, -20, side * 35, 40
  );
  ctx.fillStyle = COLORS.skinBase;
  ctx.beginPath();
  ctx.moveTo(side * 10, -5);
  ctx.bezierCurveTo(
    side * 25, -10 + bend,
    side * 45, 20 + bend,
    side * 30, 50
  );
  ctx.lineTo(side * 20, 58);
  ctx.bezierCurveTo(
    side * 35, 42 + bend,
    side * 15, -5 + bend,
    side * 10, -5
  );
  ctx.fill();
  ctx.stroke();

  // Kaki dengan 5 jari
  ctx.fillStyle = COLORS.bellyLight;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const toeX = side * (12 + i * 7);
    const toeY = 48 + Math.sin(i * 0.8) * 3;
    ctx.beginPath();
    ctx.ellipse(toeX, toeY, 7, 12, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawArm(ctx, x, y, isRight, state, t) {
  const side = isRight ? 1 : -1;
  let armX = x * side, armY = y, bend = 0;

  if (state === "surprised") {
    bend = 15;
    armY = y - 5;
  } else if (state === "jump" || state === "hang") {
    bend = -10;
    armY = y - 10;
  } else if (state === "impact") {
    const it = easeInOutCubic(t);
    bend = it * 25;
    armY = y + it * 10;
  }

  ctx.save();
  ctx.translate(armX, armY);

  // Lengan depan
  ctx.fillStyle = COLORS.skinBase;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(side * 12, bend, side * 28, 15 + bend, side * 22, 28);
  ctx.lineTo(side * 14, 32);
  ctx.bezierCurveTo(side * 22, 20 + bend, side * 6, 5, 0, 0);
  ctx.fill();
  ctx.stroke();

  // Tangan dengan 4 jari
  ctx.fillStyle = COLORS.bellyLight;
  for (let i = 0; i < 4; i++) {
    const fingerX = side * (8 + i * 5);
    const fingerY = 25 + Math.cos(i * 0.7) * 2;
    ctx.beginPath();
    ctx.arc(fingerX, fingerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawHead(ctx, x, y, state, t) {
  const eio = easeInOutCubic;
  const headW = 105;
  const headH = 85;

  let squashX = 1, squashY = 1, yOff = 0;
  if (state === "surprised") {
    squashY = 1 - t * 0.15;
    yOff = t * 10; // kepala naik sedikit saat terkejut
  } else if (state === "crouch") {
    squashX = 1 + eio(t) * 0.1;
    squashY = 1 - eio(t) * 0.1;
  } else if (state === "impact") {
    const it = eio(t);
    squashX = 1 + it * 0.2;
    squashY = 1 - it * 0.25;
    yOff = it * 15;
  }

  ctx.save();
  ctx.translate(x, y + yOff);
  ctx.scale(squashX, squashY);

  // Kepala
  ctx.fillStyle = COLORS.skinBase;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 0, headW * 0.5, headH * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ---------- Mata ----------
  const eyeY = -15;
  const eyeSpacing = 32;
  const eyeBaseSize = 24;
  let eyeSize = eyeBaseSize;
  let lidOffset = 0;
  let pupilScale = 1;

  if (state === "surprised") {
    eyeSize = eyeBaseSize * 1.35;
    lidOffset = -8; // kelopak mata terangkat
    pupilScale = 0.7; // pupil kecil saat kaget
  } else if (state === "blink") {
    // Kedip: kelopak mata menutup
    const blinkT = easeInOutCubic(t);
    lidOffset = blinkT * 35; // menutup lalu buka
    eyeSize = eyeBaseSize * (1 - blinkT * 0.5);
  }

  // Mata kiri
  drawEye(ctx, -eyeSpacing, eyeY, eyeSize, lidOffset, pupilScale, state);
  // Mata kanan
  drawEye(ctx, eyeSpacing, eyeY, eyeSize, lidOffset, pupilScale, state);

  // ---------- Mulut ----------
  drawMouth(ctx, 0, 20, state, t);

  ctx.restore();
}

function drawEye(ctx, x, y, size, lidOffset, pupilScale, state) {
  const surprised = state === "surprised";

  // Kelopak mata (bagian atas)
  ctx.fillStyle = COLORS.skinBase;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.6, y - size * 0.5 + lidOffset);
  ctx.bezierCurveTo(x, y - size * 0.7 + lidOffset, x + size * 0.6, y - size * 0.7 + lidOffset, x + size * 0.6, y - size * 0.5 + lidOffset);
  ctx.lineTo(x + size * 0.6, y + size * 0.5);
  ctx.bezierCurveTo(x + size * 0.6, y + size * 0.7, x - size * 0.6, y + size * 0.7, x - size * 0.6, y + size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kulit mata (sclera putih)
  ctx.fillStyle = COLORS.highlight;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.85, size * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Iris keemasan
  const irisSize = size * 0.45 * pupilScale;
  const irisGrad = ctx.createRadialGradient(
    x - irisSize * 0.2, y - irisSize * 0.2, 0,
    x, y, irisSize
  );
  irisGrad.addColorStop(0, "#F4C542");
  irisGrad.addColorStop(0.6, COLORS.iris);
  irisGrad.addColorStop(1, "#8B6B14");

  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(x, y, irisSize, 0, Math.PI * 2);
  ctx.fill();

  // Pupil hitam (vertikal seperti kodok)
  ctx.fillStyle = COLORS.pupil;
  ctx.beginPath();
  ctx.ellipse(x, y, irisSize * 0.35, irisSize * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight mata (kilauan)
  ctx.fillStyle = COLORS.highlight;
  ctx.beginPath();
  ctx.arc(x - irisSize * 0.25, y - irisSize * 0.25, irisSize * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - irisSize * 0.1, y - irisSize * 0.4, irisSize * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Garis bawah kelopak
  if (lidOffset > 5) {
    ctx.strokeStyle = COLORS.eyelid;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, y + size * 0.45);
    ctx.bezierCurveTo(x, y + size * 0.3, x + size * 0.6, y + size * 0.45, x + size * 0.6, y + size * 0.45);
    ctx.stroke();
  }
}

function drawMouth(ctx, x, y, state, t) {
  const eio = easeInOutCubic;

  if (state === "surprised") {
    // Mulut berbentuk O saat terkejut
    const openT = eio(t);
    const mouthW = 14 + openT * 10;
    const mouthH = 8 + openT * 14;

    ctx.fillStyle = COLORS.mouth;
    ctx.beginPath();
    ctx.ellipse(x, y, mouthW * 0.5, mouthH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lidah di dalam
    ctx.fillStyle = COLORS.tongue;
    ctx.beginPath();
    ctx.ellipse(x, y + mouthH * 0.2, mouthW * 0.35, mouthH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (state === "impact") {
    // Ekspresi lucu saat ledakan: mulut kecil terengah-engah
    const it = eio(t);
    ctx.fillStyle = COLORS.mouth;
    ctx.beginPath();
    ctx.ellipse(x, y + it * 3, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Neutral: garis lurus kecil
    ctx.fillStyle = COLORS.mouth;
    ctx.fillRect(x - 8, y - 2, 16, 3);
  }
}

// ---------- Fungsi utama: menggambar seluruh kodok ----------

export function drawFrog(ctx, frame, width, height) {
  // Bersihkan canvas
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // Tanah
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, height * 0.72, width, height * 0.28);

  const anim = getAnimationState(frame);
  const { state, t } = anim;

  // Posisi kodok
  let frogY = height * 0.7;
  let scale = 1;
  let squashX = 1, squashY = 1;
  let jumpOffsetY = 0;

  if (state === "idle") {
    frogY = height * 0.7 + Math.sin(frame * 0.15) * 3;
    squashY = 1 + Math.sin(frame * 0.15) * 0.02;
  } else if (state === "crouch") {
    const ct = easeInOutCubic(t);
    frogY = height * 0.7 + ct * 35;
    scale = 1 - ct * 0.12;
    squashX = 1 + ct * 0.2;
    squashY = 1 - ct * 0.3;
  } else if (state === "jump") {
    const jt = easeInOutCubic(t);
    frogY = height * 0.7 + 35 - jt * 110;
    jumpOffsetY = -jt * 110;
    scale = 1 + jt * 0.08;
    squashX = 1 - jt * 0.12;
    squashY = 1 + jt * 0.28;
  } else if (state === "hang") {
    frogY = height * 0.7 - 75 + Math.sin(t * Math.PI * 2) * 4;
    scale = 1.06;
    squashX = 0.88;
    squashY = 1.12;
  } else if (state === "impact") {
    const it = easeInOutCubic(t);
    frogY = height * 0.7 - 75 + it * 110;
    scale = 1 - it * 0.08;
    squashX = 1 + it * 0.3;
    squashY = 1 - it * 0.4;
  }

  const cx = width / 2;

  // Bayung bawah tanah (berubah sesuai posisi lompat)
  const shadowW = state === "jump" || state === "hang" ? 70 : 130;
  const shadowOpacity = state === "jump" || state === "hang" ? 0.15 : 0.3;
  ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
  ctx.beginPath();
  ctx.ellipse(cx, height * 0.72, shadowW, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, frogY);
  ctx.scale(scale * squashX, scale * squashY);

  // Kaki belakang (di belakang badan)
  drawBackLeg(ctx, -52, 25, false, state, t);
  drawBackLeg(ctx, 52, 25, true, state, t);

  // Badan
  drawBody(ctx, state, t);

  // Lengan depan
  drawArm(ctx, -42, -8, false, state, t);
  drawArm(ctx, 42, -8, true, state, t);

  // Kepala (di atas badan)
  drawHead(ctx, 0, -55, state, t);

  ctx.restore();

  // Caption komedi
  ctx.fillStyle = "#000000";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";
  const captions = {
    idle: "Santai sambil bernapas…",
    blink: "*kedeep*",
    surprised: "WAAAH!",
    crouch: "Siap-siap…",
    jump: "LENGKAT!",
    hang: "Di udara…",
    impact: "THUD!",
  };
  ctx.fillText(captions[state] || "", cx, 90);
}