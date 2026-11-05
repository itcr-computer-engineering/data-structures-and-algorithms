// Diagramas de la lección «Algoritmos de Búsqueda». Se cargan solos desde diagrams.js (prefijo `busqueda-`).
// kinds: busqueda-array-steps (arreglo con pasos), busqueda-formula, busqueda-paneles y busqueda-grid (rejilla numerada de pathfinding).
const C = require('./components');

const { text, paragraphs, box, chip, arrow, callout, codeBlock, card, table } = C;

const chipW = (label, size = 14) => label.length * (size * 0.0072) + 0.45;

// Estimación simple de líneas (Calibri ~0.5 em por carácter), igual que en layouts.js.
function estLines(str, fs, w) {
  const plain = String(str).replace(/\*\*|`/g, '');
  const cpl = Math.max(1, Math.floor((w / (fs * 0.0063)) * 0.95));
  return Math.max(1, Math.ceil(plain.length / cpl));
}
const lineH = (fs) => (fs * 1.25) / 72;

// ------------------------------------------------------------------ array con pasos de búsqueda
// values[], target, legend[[texto, tono]], rows[{label, active:[lo,hi], teal[], amber[], green[], red[], note: texto | [líneas]}],
// noteWidth (4.0), rowHeight (0.8), callout (uno, ancho completo) o callouts[] (varios lado a lado) con calloutsH (1.4)
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
  const cy = y0 + s.rows.length * rowH + 0.1;
  if (s.callout) callout(ctx, { x: mx, y: cy, w: w - 2 * mx, h: 0.75, size: 17, ...s.callout });
  if (s.callouts) {
    const k = s.callouts.length, cg = 0.3;
    const cwid = (w - 2 * mx - (k - 1) * cg) / k;
    s.callouts.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + cg), y: cy + 0.1, w: cwid, h: s.calloutsH || 1.4, size: 17, ...c }));
  }
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

// ------------------------------------------------------------------ rejilla numerada (pathfinding / A*)
// Los nodos se numeran por filas, de 1 a cols*rows. Estados de celda: free, wall, start, goal, closed, open, next, path.
function cellStyle(ctx, state) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  switch (state) {
    case 'wall': return { fill: T.slate.accent, line: T.slate.accent, color: T.slate.on, id: T.slate.on };
    case 'start': return { fill: T.green.accent, line: T.green.accent, color: T.green.on, id: T.green.on };
    case 'goal': return { fill: colors.heading, line: colors.heading, color: colors.bg, id: colors.bg };
    case 'closed': return { fill: T.teal.soft, line: T.teal.accent, color: T.teal.text, id: T.teal.text };
    case 'open': return { fill: T.amber.soft, line: T.amber.accent, color: T.amber.text, id: T.amber.text };
    case 'next': return { fill: T.amber.accent, line: T.amber.accent, color: T.amber.on, id: T.amber.on };
    case 'path': return { fill: T.green.soft, line: T.green.accent, color: T.green.text, id: T.green.text };
    case 'free': return { fill: colors.panel, line: colors.border, color: colors.ink, id: colors.muted };
    default: throw new Error('Estado de celda desconocido: ' + state);
  }
}

// g: {cols, rows, walls[], start, goal, states{id: estado}, main[fila][col] (texto central), cellW (1.0), cellH (0.66),
//     showId (true), labels (true: «Muro», «Inicio», «Meta»), startLabel, goalLabel, wallLabel, mainSize (18), dimFree (texto gris en celdas libres)}
function drawGrid(ctx, g, x, y) {
  const { colors } = ctx.theme;
  const cw = g.cellW || 1.0, ch = g.cellH || 0.66, inset = 0.025;
  const walls = new Set(g.walls || []);
  const showId = g.showId !== false, labels = g.labels !== false;
  for (let id = 1; id <= g.cols * g.rows; id++) {
    const r = Math.floor((id - 1) / g.cols), c = (id - 1) % g.cols;
    const cx = x + c * cw, cy = y + r * ch;
    const state = (g.states && g.states[id]) || (walls.has(id) ? 'wall' : id === g.start ? 'start' : id === g.goal ? 'goal' : 'free');
    const st = cellStyle(ctx, state);
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
      x: cx + inset, y: cy + inset, w: cw - 2 * inset, h: ch - 2 * inset, fill: { color: st.fill }, line: { color: st.line, width: 1.25 },
    });
    if (showId) text(ctx, String(id), { x: cx + 0.08, y: cy + 0.03, w: 0.5, h: 0.24, fontSize: 14, color: st.id, valign: 'middle' });
    const tag = labels && showId ? (id === g.start ? g.startLabel || 'Inicio' : id === g.goal ? g.goalLabel || 'Meta' : null) : null;
    if (tag) text(ctx, tag, { x: cx + 0.45, y: cy + 0.03, w: cw - 0.53, h: 0.24, fontSize: 14, bold: true, color: st.id, align: 'right', valign: 'middle' });
    const my = cy + (showId ? 0.26 : inset), mh = ch - (showId ? 0.26 : inset) - inset - 0.02;
    if (state === 'wall') {
      if (labels) text(ctx, g.wallLabel || 'Muro', { x: cx, y: my, w: cw, h: mh, fontSize: 14, color: st.color, align: 'center', valign: 'middle' });
      continue;
    }
    const main = g.main && g.main[r] ? g.main[r][c] : '';
    if (main) {
      const dim = g.dimFree && state === 'free';
      text(ctx, String(main), { x: cx, y: my, w: cw, h: mh, fontSize: g.mainSize || 18, bold: !dim, color: dim ? colors.muted : st.color, align: 'center', valign: 'middle' });
    }
  }
  return { w: g.cols * cw, h: g.rows * ch };
}

// items[{state, label}]: muestra de color + etiqueta; salta de línea si no cabe. Devuelve el alto usado.
function drawLegend(ctx, items, x, y, maxW) {
  const { colors } = ctx.theme;
  let lx = x, ly = y;
  items.forEach((it) => {
    const tw = String(it.label).length * 0.095 + 0.1;
    const total = 0.3 + 0.12 + tw;
    if (lx > x && lx + total > x + maxW) { lx = x; ly += 0.42; }
    const st = cellStyle(ctx, it.state);
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx, y: ly + 0.03, w: 0.3, h: 0.3, fill: { color: st.fill }, line: { color: st.line, width: 1.25 } });
    text(ctx, it.label, { x: lx + 0.42, y: ly, w: tw, h: 0.36, fontSize: 14, color: colors.slate, valign: 'middle' });
    lx += total + 0.3;
  });
  return ly + 0.36 - y;
}

// Bloques de la columna derecha de busqueda-grid; cada uno devuelve su alto.
const SIDE = {
  legend: (ctx, b, x, y, w) => drawLegend(ctx, b.items, x, y, w),

  text(ctx, b, x, y, w) {
    const { colors } = ctx.theme;
    let h = 0;
    if (b.label) {
      text(ctx, b.label, { x, y, w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
      h += 0.4;
    }
    const fs = b.size || 17;
    const th = estLines(b.text, fs, w) * lineH(fs) + 0.1;
    text(ctx, b.text, { x, y: y + h, w, h: th, fontSize: fs, color: colors.ink });
    return h + th;
  },

  list(ctx, b, x, y, w) {
    const fs = b.size || 18;
    const h = b.items.reduce((a, it) => a + estLines(it, fs, w - 0.35) * lineH(fs) + 10 / 72, 0);
    paragraphs(ctx, b.items, { x, y, w, h, fontSize: fs, bullet: true, spaceAfter: 10, color: ctx.theme.colors.ink });
    return h;
  },

  note(ctx, b, x, y, w) {
    const fs = b.size || 17;
    const h = Math.max(0.7, estLines((b.label ? b.label + ' ' : '') + b.text, fs, w - 0.5) * lineH(fs) + 0.3);
    callout(ctx, { x, y, w, h, tone: b.tone || 'teal', label: b.label, text: b.text, size: fs });
    return h;
  },

  // columns, rows, colWeights, rowH (0.45), fontSize (16), hlRows[] (filas de datos resaltadas), hlTone ('amber'), label
  table(ctx, b, x, y, w) {
    const { colors } = ctx.theme;
    const T = ctx.T;
    let h = 0;
    if (b.label) {
      text(ctx, b.label, { x, y, w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
      h += 0.4;
    }
    const weights = b.colWeights || b.columns.map(() => 1);
    const sum = weights.reduce((a, c) => a + c, 0);
    const colW = weights.map((v) => (v / sum) * w);
    const rowH = b.rowH || 0.45;
    const hl = new Set(b.hlRows || []);
    const tone = T[b.hlTone || 'amber'];
    const tb = table(ctx, {
      x, y: y + h, colW, header: b.columns, rows: b.rows, rowH: [rowH, ...b.rows.map(() => rowH)], fontSize: b.fontSize || 16,
      align: b.columns.map(() => 'center'),
      cellStyle: (r, c) => {
        if (hl.has(r)) return { fill: tone.soft, color: tone.text, bold: true };
        return c === 0 ? { bold: true, color: colors.heading, fill: colors.tealLight } : {};
      },
    });
    return h + tb.h;
  },
};

function gridPanels(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.grids.length, gap = 0.35;
  const pw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = s.top || 1.85;
  const gh = Math.max(...s.grids.map((g) => g.rows * (g.cellH || 0.66)));
  const ph = 0.62 + gh + 0.15;
  s.grids.forEach((g, i) => {
    const x = mx + i * (pw + gap);
    C.surface(ctx, g.tone, { x, y: top, w: pw, h: ph });
    const t = ctx.T[g.tone || 'teal'];
    text(ctx, g.title, { x: x + 0.3, y: top + 0.08, w: pw - 0.6, h: 0.5, fontSize: 22, bold: true, color: g.tone ? t.text : colors.heading, fontFace: fonts.heading, valign: 'middle' });
    drawGrid(ctx, g, x + (pw - g.cols * (g.cellW || 1.0)) / 2, top + 0.62);
  });
  let y = top + ph + 0.15;
  if (s.legend) y += drawLegend(ctx, s.legend, mx, y, w - 2 * mx) + 0.12;
  if (s.callout) callout(ctx, { x: mx, y, w: w - 2 * mx, h: s.calloutH || 0.55, size: 16, ...s.callout });
}

// Una rejilla (`grid`) con columna derecha de bloques (`side`: legend, text, list, note, table), o varias (`grids[{title, tone, ...rejilla}]`)
// en paneles con `legend` y `callout` debajo.
function gridDiagram(ctx, s) {
  if (s.grids) return gridPanels(ctx, s);
  const { mx, w } = ctx.theme.page;
  const g = s.grid;
  const top = s.top || 1.85;
  drawGrid(ctx, g, mx, top);
  const sx = mx + g.cols * (g.cellW || 1.0) + (s.sideGap || 0.45);
  let y = top;
  (s.side || []).forEach((b) => {
    if (!SIDE[b.type]) throw new Error('Bloque desconocido: ' + b.type);
    y += SIDE[b.type](ctx, b, sx, y, w - mx - sx) + (b.gap !== undefined ? b.gap : 0.25);
  });
}

module.exports = {
  'busqueda-array-steps': arraySteps,
  'busqueda-formula': formula,
  'busqueda-paneles': paneles,
  'busqueda-grid': gridDiagram,
};
