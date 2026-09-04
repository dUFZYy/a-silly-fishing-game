// =============================================================================
// ist.js — DER IST-ZUSTAND, unveraendert aus dem Spiel
// =============================================================================
//
// Das ist die Messlatte. Der Code stammt Zeile fuer Zeile aus `fish.js`
// (`fishBodyPath`, `drawFishShape`, `drawMaw`) und `creatures.js` (`flat`,
// `cGrad`, `cOutline`, `cEye`). Geaendert ist nur, was das Spiel drumherum
// braucht und hier nicht existiert: `opts.caustic` und `opts.haze` sind aus,
// weil sie zur SZENE gehoeren und nicht zum Fisch, und `uiScale()` gibt es
// hier nicht.
//
// Wer diesen Code neben die fuenf Entwuerfe stellt, sieht sofort das
// Kernproblem: alle sieben Arten haben DIESELBE Koerperlinie. `fishBodyPath`
// kennt nur L und Hh. Ein Hecht ist eine breitgezogene Brasse.

function istBodyPath(c, L, Hh) {
  c.beginPath();
  c.moveTo(L, 0);
  c.bezierCurveTo(L * 0.88, -Hh * 0.68, L * 0.34, -Hh, -L * 0.1, -Hh * 0.94);
  c.bezierCurveTo(-L * 0.52, -Hh * 0.86, -L * 0.76, -Hh * 0.48, -L * 0.9, -Hh * 0.26);
  c.quadraticCurveTo(-L * 0.99, 0, -L * 0.9, Hh * 0.26);
  c.bezierCurveTo(-L * 0.76, Hh * 0.5, -L * 0.48, Hh * 0.88, -L * 0.02, Hh * 0.95);
  c.bezierCurveTo(L * 0.42, Hh, L * 0.86, Hh * 0.62, L, 0);
  c.closePath();
}

function istMaw(c, sp, L, Hh, fine) {
  const art = sp.pattern;
  const mx1 = L * 0.94, my1 = Hh * 0.04;
  const mx0 = L * (art === "teeth" ? 0.52 : 0.4);
  const my0 = Hh * 0.3;
  const gape = Hh * (art === "lure" ? 0.42 : art === "shark" ? 0.32 : 0.24);
  const cU = [(mx0 + mx1) / 2, my0 - gape * 0.6];
  const maw = () => {
    c.beginPath();
    c.moveTo(mx1, my1);
    c.quadraticCurveTo(cU[0], cU[1], mx0, my0);
    c.quadraticCurveTo((mx0 + mx1) / 2 + L * 0.06, my0 + gape * 0.8, mx1 - L * 0.02, my1 + gape * 0.45);
    c.closePath();
  };
  const rg = c.createLinearGradient(mx1, 0, mx0, 0);
  rg.addColorStop(0, "#47161c"); rg.addColorStop(1, "#160709");
  c.fillStyle = rg; maw(); c.fill();
  if (fine) {
    c.save(); maw(); c.clip();
    const qU = t => [(1 - t) * (1 - t) * mx1 + 2 * (1 - t) * t * cU[0] + t * t * mx0,
                     (1 - t) * (1 - t) * my1 + 2 * (1 - t) * t * cU[1] + t * t * my0];
    const zLen = gape * (art === "lure" ? 0.85 : 0.55);
    const zW = L * (art === "lure" ? 0.02 : 0.035);
    const n = art === "shark" ? 6 : art === "lure" ? 5 : 4;
    c.fillStyle = "#f2f4ee";
    for (let i = 0; i < n; i++) {
      const t = (i + 0.7) / (n + 0.8);
      const [tx, ty] = qU(t);
      const len = zLen * (i % 2 ? 0.65 : 1);
      c.beginPath();
      c.moveTo(tx - zW, ty - Hh * 0.04); c.lineTo(tx + zW, ty - Hh * 0.04);
      c.lineTo(tx + zW * 0.15, ty + len); c.closePath(); c.fill();
    }
    for (let i = 0; i < n - 1; i++) {
      const t = (i + 1.2) / (n + 0.8);
      const [tx] = qU(t);
      const by = my1 + gape * 0.45 + (my0 + gape * 0.8 - (my1 + gape * 0.45)) * t * 0.6;
      const len = zLen * 0.55 * (i % 2 ? 1 : 0.7);
      c.beginPath();
      c.moveTo(tx - zW * 0.9 + L * 0.03, by + Hh * 0.04); c.lineTo(tx + zW * 0.9 + L * 0.03, by + Hh * 0.04);
      c.lineTo(tx + L * 0.03, by - len); c.closePath(); c.fill();
    }
    c.restore();
  }
  c.strokeStyle = shadeColor(sp.color, -0.38); c.lineWidth = Math.max(1, L * 0.05); c.lineCap = "round";
  c.beginPath(); c.moveTo(mx1, my1); c.quadraticCurveTo(cU[0], cU[1], mx0, my0); c.stroke();
  c.strokeStyle = shadeColor(sp.belly, -0.12); c.lineWidth = Math.max(1, L * 0.045);
  c.beginPath(); c.moveTo(mx0, my0); c.quadraticCurveTo((mx0 + mx1) / 2 + L * 0.06, my0 + gape * 0.8, mx1 - L * 0.02, my1 + gape * 0.45); c.stroke();
}

// --- creatures.js: der Plattfisch ist im Spiel eine eigene Zeichnung -------
function istCGrad(c, col, y0, y1) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, shadeColor(col.body, -0.20));
  g.addColorStop(0.45, col.body);
  g.addColorStop(0.85, col.belly || shadeColor(col.body, 0.18));
  g.addColorStop(1, shadeColor(col.belly || col.body, -0.08));
  return g;
}
function istCOutline(c, col, L, a = 0.55) {
  c.save(); c.globalAlpha *= a;
  c.strokeStyle = shadeColor(col.body, -0.4);
  c.lineWidth = Math.max(0.8, L * 0.04); c.stroke(); c.restore();
}
function istCEye(c, x, y, r, col) {
  c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(0,0,0,0.25)"; c.lineWidth = Math.max(0.6, r * 0.18);
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  c.fillStyle = "#14171c"; c.beginPath(); c.arc(x + r * 0.18, y, r * 0.52, 0, Math.PI * 2); c.fill();
  c.fillStyle = "rgba(255,255,255,0.95)";
  c.beginPath(); c.arc(x + r * 0.4, y - r * 0.42, r * 0.24, 0, Math.PI * 2); c.fill();
}
function istFlat(c, L, Hh, tail, col) {
  const w = Math.sin(tail) * Hh * 0.16;
  c.fillStyle = shadeColor(col.fin, -0.05);
  c.beginPath(); c.ellipse(0, 0, L * 1.08, Hh * 1.18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = istCGrad(c, col, -Hh, Hh);
  c.beginPath(); c.ellipse(0, w * 0.3, L * 0.95, Hh * 0.92, 0, 0, Math.PI * 2); c.fill(); istCOutline(c, col, L);
  c.fillStyle = shadeColor(col.fin, -0.1);
  c.beginPath(); c.moveTo(-L * 0.9, 0); c.lineTo(-L * 1.45, -Hh * 0.5 + w); c.lineTo(-L * 1.3, w * 0.4); c.lineTo(-L * 1.45, Hh * 0.5 + w); c.closePath(); c.fill();
  c.save();
  c.beginPath(); c.ellipse(0, w * 0.3, L * 0.95, Hh * 0.92, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = 0; i < 8; i++) {
    c.beginPath();
    c.ellipse(-L * 0.7 + i * L * 0.2, Math.sin(i * 2.5) * Hh * 0.5, Hh * 0.13, Hh * 0.1, i, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "rgba(255,255,255,0.16)";
  for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-L * 0.5 + i * L * 0.26, Math.cos(i * 2) * Hh * 0.4, Hh * 0.07, 0, Math.PI * 2); c.fill(); }
  c.restore();
  istCEye(c, L * 0.52, -Hh * 0.28, Hh * 0.16, col);
  istCEye(c, L * 0.56, Hh * 0.1, Hh * 0.16, col);
}

// Welches Muster hat die Art im Spiel wirklich?
const IST_PATTERN = {
  hecht: "dashes", brasse: "scales", scholle: "flat",
  anglerfisch: "lure", kaiserfisch: "stripes", neonfisch: "glow", hai: "shark"
};

// --- drawFishShape, unveraendert bis auf Szene-Effekte (haze/caustic) ------
function istFisch(c, art, x, y, L, dir, tail, opts = {}) {
  const sp = { color: art.color, belly: art.belly, fin: art.fin, h: art.h, pattern: IST_PATTERN[art.id] };
  const Hh = L * sp.h * 0.5;
  const dsc = dir >= 0 ? Math.max(0.12, dir) : Math.min(-0.12, dir);
  c.save();
  c.translate(x, y);
  const body = sp.color, belly = sp.belly, fin = sp.fin;

  // Halo der Leuchtfische (drawFishGlowBehind)
  if (opts.halo && art.leuchtet) {
    const isLure = sp.pattern === "lure";
    const haloCol = isLure ? "#9fffe0" : sp.color;
    const hx0 = (isLure ? L * 1.15 : 0) * dsc, hy0 = isLure ? -Hh * 1.5 : 0;
    const rgbh = hexToRgb(haloCol);
    const pulse = 0.8 + 0.2 * Math.sin(tail * 0.7);
    const hr2 = L * (isLure ? 3.4 : 2.8);
    const hg = c.createRadialGradient(hx0, hy0, 0, hx0, hy0, hr2);
    hg.addColorStop(0, `rgba(${rgbh[0]},${rgbh[1]},${rgbh[2]},${0.55 * pulse})`);
    hg.addColorStop(0.25, `rgba(${rgbh[0]},${rgbh[1]},${rgbh[2]},${0.26 * pulse})`);
    hg.addColorStop(0.6, `rgba(${rgbh[0]},${rgbh[1]},${rgbh[2]},${0.09 * pulse})`);
    hg.addColorStop(1, `rgba(${rgbh[0]},${rgbh[1]},${rgbh[2]},0)`);
    c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = hg;
    c.beginPath(); c.arc(hx0, hy0, hr2, 0, Math.PI * 2); c.fill(); c.restore();
  }

  c.scale(dsc, 1);

  if (sp.pattern === "flat") { istFlat(c, L, Hh, tail, { body, belly, fin }); c.restore(); return; }
  if (art.leuchtet) { c.shadowColor = sp.color; c.shadowBlur = L * 0.8; }

  const fine = L >= 9;
  const tw = Math.sin(tail) * Hh * 0.45;
  const tr = hexToRgb(shadeColor(fin, -0.3));
  const fg = c.createLinearGradient(-L * 0.8, 0, -L * 1.45, 0);
  fg.addColorStop(0, fin);
  fg.addColorStop(0.6, `rgba(${tr[0]},${tr[1]},${tr[2]},0.9)`);
  fg.addColorStop(1, `rgba(${tr[0]},${tr[1]},${tr[2]},0.5)`);
  c.fillStyle = fg;
  c.beginPath();
  c.moveTo(-L * 0.8, -Hh * 0.28);
  c.quadraticCurveTo(-L * 1.12, -Hh * 0.55 + tw * 0.5, -L * 1.4, -Hh * 0.9 + tw);
  c.quadraticCurveTo(-L * 1.16, -Hh * 0.28 + tw * 0.7, -L * 1.14, tw * 0.5);
  c.quadraticCurveTo(-L * 1.16, Hh * 0.28 + tw * 0.7, -L * 1.4, Hh * 0.9 + tw);
  c.quadraticCurveTo(-L * 1.12, Hh * 0.55 + tw * 0.5, -L * 0.8, Hh * 0.28);
  c.closePath(); c.fill();
  if (fine) {
    c.strokeStyle = shadeColor(fin, -0.35); c.globalAlpha *= 0.5; c.lineWidth = Math.max(0.6, L * 0.025);
    for (const k of [-0.55, 0, 0.55]) {
      c.beginPath(); c.moveTo(-L * 0.84, Hh * 0.14 * Math.sign(k || 1) * Math.abs(k) * 2);
      c.quadraticCurveTo(-L * 1.1, Hh * k * 0.8 + tw * 0.6, -L * 1.32, Hh * k * 1.5 + tw * 0.85); c.stroke();
    }
    c.globalAlpha /= 0.5;
  }
  c.beginPath();
  c.moveTo(-L * 0.5, -Hh * 0.7);
  c.quadraticCurveTo(-L * 0.28, -Hh * 1.55, L * 0.02, -Hh * 1.45);
  c.quadraticCurveTo(L * 0.05, -Hh * 1.05, L * 0.32, -Hh * 0.68);
  c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(-L * 0.62, Hh * 0.55);
  c.quadraticCurveTo(-L * 0.5, Hh * 1.15, -L * 0.18, Hh * 0.82);
  c.closePath(); c.fill();

  c.save();
  c.translate(L * 0.02, Hh * 0.34);
  c.rotate(0.9 + Math.sin(tail * 0.9 + 2.6) * 0.22);
  c.fillStyle = shadeColor(fin, -0.4); c.globalAlpha *= 0.75;
  c.beginPath(); c.moveTo(0, 0);
  c.quadraticCurveTo(-L * 0.26, Hh * 0.14, -L * 0.32, Hh * 0.48);
  c.quadraticCurveTo(-L * 0.12, Hh * 0.4, 0, 0);
  c.closePath(); c.fill();
  c.restore();

  const g = c.createLinearGradient(0, -Hh, 0, Hh);
  g.addColorStop(0, shadeColor(body, -0.14)); g.addColorStop(0.42, body);
  g.addColorStop(0.78, belly); g.addColorStop(1, shadeColor(belly, -0.05));
  c.fillStyle = g;
  istBodyPath(c, L, Hh); c.fill();
  c.shadowBlur = 0;
  c.save();
  istBodyPath(c, L, Hh); c.clip();
  const core = c.createLinearGradient(0, -Hh, 0, Hh);
  core.addColorStop(0, "rgba(0,0,0,0)"); core.addColorStop(0.55, "rgba(0,0,0,0)");
  core.addColorStop(0.8, "rgba(8,14,24,0.15)"); core.addColorStop(0.92, "rgba(8,14,24,0.06)");
  core.addColorStop(1, "rgba(8,14,24,0)");
  c.fillStyle = core; c.fillRect(-L * 1.05, -Hh * 1.05, L * 2.1, Hh * 2.1);
  const bounce = c.createLinearGradient(0, Hh * 0.55, 0, Hh * 1.02);
  bounce.addColorStop(0, "rgba(165,215,235,0)"); bounce.addColorStop(1, "rgba(165,215,235,0.24)");
  c.fillStyle = bounce; c.fillRect(-L * 1.05, 0, L * 2.1, Hh * 1.1);
  const gx0 = L * 0.1 + Math.sin(tail * 0.55) * L * 0.24;
  const gloss = c.createRadialGradient(gx0, -Hh * 0.5, 0, gx0, -Hh * 0.38, L * 0.9);
  gloss.addColorStop(0, "rgba(255,255,255,0.30)"); gloss.addColorStop(0.4, "rgba(255,255,255,0.10)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gloss; c.fillRect(-L * 1.05, -Hh * 1.05, L * 2.1, Hh * 1.6);
  c.strokeStyle = "rgba(0,0,0,0.14)"; c.lineWidth = Math.max(0.8, L * 0.03);
  c.beginPath(); c.moveTo(-L * 0.85, -Hh * 0.05); c.quadraticCurveTo(0, Hh * 0.18, L * 0.8, -Hh * 0.05); c.stroke();
  if (fine) {
    c.fillStyle = "rgba(0,10,20,0.08)";
    c.beginPath(); c.ellipse(L * 0.33, 0, L * 0.09, Hh * 0.62, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = shadeColor(body, -0.3); c.globalAlpha *= 0.55; c.lineWidth = Math.max(0.8, L * 0.045);
    c.beginPath(); c.moveTo(L * 0.46, -Hh * 0.62); c.quadraticCurveTo(L * 0.24, 0, L * 0.46, Hh * 0.6); c.stroke();
    c.globalAlpha /= 0.55;
    c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = Math.max(0.6, L * 0.02);
    c.beginPath(); c.moveTo(L * 0.42, -Hh * 0.55); c.quadraticCurveTo(L * 0.21, 0, L * 0.42, Hh * 0.54); c.stroke();
  }
  c.restore();
  c.strokeStyle = shadeColor(body, -0.3); c.globalAlpha *= 0.5; c.lineWidth = Math.max(0.8, L * 0.04);
  istBodyPath(c, L, Hh); c.stroke(); c.globalAlpha /= 0.5;

  if (sp.pattern !== "none") {
    c.save();
    istBodyPath(c, L, Hh); c.clip();
    c.fillStyle = "rgba(0,0,0,0.22)";
    if (sp.pattern === "stripes") {
      for (let i = -2; i <= 2; i++) c.fillRect(i * L * 0.32 - L * 0.07, -Hh, L * 0.14, Hh * 1.4);
    } else if (sp.pattern === "dashes") {
      c.fillStyle = "rgba(230,230,160,0.4)";
      for (let i = 0; i < 6; i++) c.fillRect(-L * 0.8 + i * L * 0.28, -Hh * 0.2 + Math.sin(i) * Hh * 0.3, L * 0.14, Hh * 0.18);
    } else if (sp.pattern === "scales") {
      c.strokeStyle = "rgba(0,0,0,0.15)"; c.lineWidth = 1;
      for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) {
        c.beginPath(); c.arc(-L * 0.7 + i * L * 0.25 + (r % 2) * L * 0.12, -Hh * 0.6 + r * Hh * 0.4, L * 0.12, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
      }
    } else if (sp.pattern === "shark") {
      c.strokeStyle = "rgba(0,0,0,0.3)"; c.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(L * 0.35 - i * L * 0.08, 0, Hh * 0.45, -0.6, 0.6); c.stroke(); }
    } else if (sp.pattern === "teeth" || sp.pattern === "lure") {
      c.fillStyle = "rgba(0,0,0,0.1)"; c.fillRect(-L, -Hh, L * 2, Hh * 0.35);
    }
    c.restore();
  }

  if (sp.pattern === "shark") {
    c.fillStyle = fin;
    c.beginPath(); c.moveTo(-L * 0.35, -Hh * 0.7); c.lineTo(-L * 0.05, -Hh * 2.2); c.lineTo(L * 0.3, -Hh * 0.7); c.closePath(); c.fill();
  }
  if (sp.pattern === "shark" || sp.pattern === "teeth" || sp.pattern === "lure") istMaw(c, sp, L, Hh, fine);
  if (sp.pattern === "lure") {
    c.strokeStyle = fin; c.lineWidth = Math.max(1, L * 0.05);
    c.beginPath(); c.moveTo(L * 0.4, -Hh * 0.9); c.quadraticCurveTo(L * 0.7, -Hh * 2.2, L * 1.15, -Hh * 1.5); c.stroke();
    c.shadowColor = "#9fffe0"; c.shadowBlur = L * 0.6;
    c.fillStyle = "#c8fff0"; c.beginPath(); c.arc(L * 1.15, -Hh * 1.5, Hh * 0.22, 0, Math.PI * 2); c.fill();
    c.shadowBlur = 0;
  }

  const finRot = 0.35 + Math.sin(tail * 0.9 + 1.2) * 0.3;
  c.save();
  istBodyPath(c, L, Hh); c.clip();
  c.translate(L * 0.19, Hh * 0.38); c.rotate(finRot);
  c.fillStyle = "rgba(0,12,22,0.22)";
  c.beginPath(); c.moveTo(0, 0);
  c.quadraticCurveTo(-L * 0.34, Hh * 0.18, -L * 0.42, Hh * 0.62);
  c.quadraticCurveTo(-L * 0.16, Hh * 0.5, 0, 0);
  c.closePath(); c.fill();
  c.restore();
  c.save();
  c.translate(L * 0.16, Hh * 0.3); c.rotate(finRot);
  const fr = hexToRgb(shadeColor(fin, -0.08));
  const fg2 = c.createLinearGradient(0, 0, -L * 0.42, Hh * 0.62);
  fg2.addColorStop(0, `rgba(${fr[0]},${fr[1]},${fr[2]},1)`);
  fg2.addColorStop(1, `rgba(${fr[0]},${fr[1]},${fr[2]},0.5)`);
  c.fillStyle = fg2;
  c.beginPath(); c.moveTo(0, 0);
  c.quadraticCurveTo(-L * 0.34, Hh * 0.18, -L * 0.42, Hh * 0.62);
  c.quadraticCurveTo(-L * 0.16, Hh * 0.5, 0, 0);
  c.closePath(); c.fill();
  c.restore();

  const er = Math.max(1.5, Hh * 0.27), exx = L * 0.58, eyy = -Hh * 0.25;
  c.fillStyle = "rgba(0,0,0,0.25)"; c.beginPath(); c.arc(exx, eyy + er * 0.15, er * 1.08, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#f4f6f2"; c.beginPath(); c.arc(exx, eyy, er, 0, Math.PI * 2); c.fill();
  if (fine) { c.fillStyle = shadeColor(fin, -0.15); c.beginPath(); c.arc(exx + er * 0.22, eyy, er * 0.62, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = "#14161c"; c.beginPath(); c.arc(exx + er * 0.26, eyy, er * 0.42, 0, Math.PI * 2); c.fill();
  if (fine) { c.fillStyle = "rgba(255,255,255,0.9)"; c.beginPath(); c.arc(exx + er * 0.1, eyy - er * 0.3, er * 0.16, 0, Math.PI * 2); c.fill(); }
  if (sp.pattern !== "shark" && sp.pattern !== "teeth" && sp.pattern !== "lure") {
    c.strokeStyle = "rgba(0,0,0,0.35)"; c.lineWidth = Math.max(1, L * 0.03); c.lineCap = "round";
    c.beginPath(); c.moveTo(L * 0.8, Hh * 0.22); c.quadraticCurveTo(L * 0.9, Hh * 0.26, L * 0.99, Hh * 0.12); c.stroke();
  }
  c.restore();
}
