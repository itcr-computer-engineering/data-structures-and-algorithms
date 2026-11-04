// Diagramas de la lección «Algoritmos de Búsqueda». Se cargan solos desde diagrams.js (prefijo `busqueda-`).
const C = require('./components');

const { text, paragraphs, box, chip, arrow, callout, codeBlock, card } = C;

const chipW = (label, size = 14) => label.length * (size * 0.0072) + 0.45;

// Estimación simple de líneas (Calibri ~0.5 em por carácter), igual que en layouts.js.
function estLines(str, fs, w) {
  const plain = String(str).replace(/\*\*|`/g, '');
  const cpl = Math.max(1, Math.floor((w / (fs * 0.0063)) * 0.95));
  return Math.max(1, Math.ceil(plain.length / cpl));
}
const lineH = (fs) => (fs * 1.25) / 72;

// ------------------------------------------------------------------ array con pasos de búsqueda
// values[], target, legend[[texto, tono]], rows[{label, active:[lo,hi], teal[], amber[], green[], red[], note: texto | [líneas]}], callout
function arraySteps(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.values.length;
  const gap = 0.05, labelW = 1.1;
  const cw = Math.min(0.66, (w - 2 * mx - labelW - (s.noteWidth || 4.0)) / n - gap);
  const cellH = 0.5, rowH = s.rowHeight || 0.8;
  const x0 = mx + labelW;
  const gridW = n * (cw + gap) - gap;
  const xAt = (k) => x0 + k * (cw + gap);

  const legend = [];
  if (s.target !== undefined) legend.push([`Buscar: ${s.target}`, 'amber']);
  (s.legend || []).forEach((l) => legend.push(l));
  let lx = mx;
  legend.forEach(([label, tone]) => {
    const lw = chipW(label, 14) + 0.1;
    chip(ctx, { x: lx, y: 1.8, w: lw, h: 0.38, label, tone, size: 14 });
    lx += lw + 0.2;
  });

  const iy = 2.32;
  const small = { fontSize: 14, color: colors.slate, fontFace: fonts.code, valign: 'middle' };
  text(ctx, 'Índice', { x: mx, y: iy, w: labelW, h: 0.3, ...small });
  s.values.forEach((_, k) => text(ctx, String(k), { x: xAt(k), y: iy, w: cw, h: 0.3, align: 'center', ...small }));

  const y0 = iy + 0.45;
  s.rows.forEach((r, i) => {
    const y = y0 + i * rowH;
    text(ctx, r.label, { x: mx, y, w: labelW - 0.1, h: cellH, fontSize: 16, bold: true, color: colors.slate, fontFace: fonts.code, valign: 'middle' });
    const hasRange = !!r.active;
    const [lo, hi] = r.active || [0, n - 1];
    s.values.forEach((v, k) => {
      let tone = null;
      ['amber', 'red', 'teal', 'green'].forEach((t) => { if ((r[t] || []).includes(k)) tone = t; });
      let fill, line, color;
      if (tone) {
        const T = ctx.T[tone];
        const solid = tone === 'teal' || tone === 'green';
        fill = solid ? T.accent : T.soft;
        line = T.accent;
        color = solid ? T.on : T.text;
      } else if (hasRange && (k < lo || k > hi)) {
        fill = colors.bg; line = colors.border; color = colors.muted;
      } else {
        fill = colors.panel; line = colors.slate; color = colors.ink;
      }
      ctx.slide.addText(String(v), {
        shape: ctx.pptx.ShapeType.rect, x: xAt(k), y, w: cw, h: cellH, fill: { color: fill }, line: { color: line, width: 1 },
        color, bold: true, fontSize: cw >= 0.6 ? 20 : 16, fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
      });
    });
    if (hasRange) {
      const bx1 = xAt(lo), bx2 = xAt(hi) + cw, by = y + cellH + 0.12;
      const o = { color: colors.teal, width: 2, head: false };
      arrow(ctx, { x1: bx1, y1: by, x2: bx2, y2: by, ...o });
      arrow(ctx, { x1: bx1, y1: by - 0.09, x2: bx1, y2: by, ...o });
      arrow(ctx, { x1: bx2, y1: by - 0.09, x2: bx2, y2: by, ...o });
    }
    if (r.note) {
      const lines = Array.isArray(r.note) ? r.note : [r.note];
      const nx = x0 + gridW + 0.3;
      paragraphs(ctx, lines, { x: nx, y: y - 0.05, w: w - mx - nx, h: cellH + 0.25, fontSize: 16, spaceAfter: 2, valign: 'middle', color: colors.ink });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: y0 + s.rows.length * rowH + 0.1, w: w - 2 * mx, h: 0.75, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ fórmula destacada + tarjetas explicativas
// label, formula, lang, size, parts[{title,text,tone}], cardHeight, callout
function formula(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  if (s.label) text(ctx, s.label, { x: mx, y: 1.8, w: w - 2 * mx, h: 0.4, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  const h = codeBlock(ctx, { x: mx, y: 2.3, w: w - 2 * mx, code: s.formula, lang: s.lang || 'java', fontSize: s.size || 20 });
  const parts = s.parts || [];
  const k = parts.length, gap = 0.3;
  const cw = (w - 2 * mx - (k - 1) * gap) / Math.max(k, 1);
  const cy = 2.3 + h + 0.35, ch = s.cardHeight || 2.2;
  parts.forEach((p, i) => card(ctx, { textSize: 17, titleSize: 20, ...p }, { x: mx + i * (cw + gap), y: cy, w: cw, h: ch }));
  if (s.callout) callout(ctx, { x: mx, y: cy + ch + 0.3, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ paneles con imagen, texto, viñetas o código
// panels[{title, tone, weight, image, alt, caption, imageH, text, items, itemSize, code, lang, codeSize}], panelHeight, callout
function paneles(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.panels.length, gap = 0.35;
  const weights = s.panels.map((p) => p.weight || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const avail = w - 2 * mx - gap * (n - 1);
  const top = 1.85;
  const bottom = s.panelHeight ? top + s.panelHeight : s.callout ? 5.85 : 6.7;
  let x = mx;
  s.panels.forEach((p, i) => {
    const pw = (avail * weights[i]) / total;
    const t = ctx.T[p.tone || 'navy'];
    C.surface(ctx, p.tone, { x, y: top, w: pw, h: bottom - top });
    text(ctx, p.title, {
      x: x + 0.3, y: top + 0.15, w: pw - 0.6, h: 0.5, fontSize: 22, bold: true, color: p.tone ? t.text : colors.heading, fontFace: fonts.heading, valign: 'middle',
    });
    const ix = x + 0.3, iw = pw - 0.6;
    let cy = top + 0.8;
    if (p.image) {
      const ah = p.imageH || bottom - cy - 0.25 - (p.caption ? 0.7 : 0);
      box(ctx, { x: ix, y: cy, w: iw, h: ah, fill: 'FFFFFF', radius: 0.1 });
      C.image(ctx, p.image, { x: ix + 0.12, y: cy + 0.12, w: iw - 0.24, h: ah - 0.24 }, p.alt);
      cy += ah + 0.1;
      if (p.caption) {
        text(ctx, p.caption, { x: ix, y: cy, w: iw, h: 0.55, fontSize: 16, color: colors.slate, align: 'center', valign: 'middle' });
        cy += 0.65;
      }
    }
    if (p.text) {
      const fs = p.textSize || 19;
      const th = estLines(p.text, fs, iw) * lineH(fs) + 0.1;
      text(ctx, p.text, { x: ix, y: cy, w: iw, h: th, fontSize: fs, color: colors.slate });
      cy += th + 0.15;
    }
    if (p.items) {
      const fs = p.itemSize || 20;
      const th = p.items.reduce((a, it) => a + estLines(it, fs, iw - 0.3) * lineH(fs) + 14 / 72, 0);
      paragraphs(ctx, p.items, { x: ix, y: cy, w: iw, h: th, fontSize: fs, bullet: true, spaceAfter: 14, color: colors.ink });
      cy += th + 0.1;
    }
    if (p.code) {
      const ch = codeBlock(ctx, { x: ix, y: cy, w: iw, code: p.code, lang: p.lang, fontSize: p.codeSize || 15 });
      cy += ch + 0.2;
    }
    if (p.note) {
      const fs = p.noteSize || 18;
      text(ctx, p.note, { x: ix, y: cy, w: iw, h: bottom - cy - 0.2, fontSize: fs, color: colors.slate });
    }
    x += pw + gap;
  });
  if (s.callout) callout(ctx, { x: mx, y: bottom + 0.2, w: w - 2 * mx, h: 0.8, ...s.callout });
}

module.exports = {
  'busqueda-array-steps': arraySteps,
  'busqueda-formula': formula,
  'busqueda-paneles': paneles,
};
