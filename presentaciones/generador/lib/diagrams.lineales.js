// Diagramas de la lección «Estructuras de datos lineales» (CE-1103).
// Todos los `kind` llevan el prefijo `lineales-`; solo usan colores semánticos del tema.
const C = require('./components');

const { text, box, chip, circleLabel } = C;

const chipWd = (label, size = 14) => Math.max(0.8, String(label).length * (size * 0.0075) + 0.45);
const PTR = 0.62; // chip de puntero (0.34) + flecha

// Segmento o flecha (admite línea discontinua).
function seg(ctx, x1, y1, x2, y2, { color, width = 2.5, head = false, dash } = {}) {
  const line = { color: color || ctx.theme.colors.slate, width };
  if (head) line.endArrowType = 'triangle';
  if (dash) line.dashType = dash;
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1, line,
  });
}

// `callout` o `callouts[]` al pie del diagrama.
function bottomCallouts(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const list = s.callouts || (s.callout ? [s.callout] : []);
  if (!list.length) return;
  const gap = 0.3, k = list.length, cw = (w - 2 * mx - (k - 1) * gap) / k;
  const y = s.calloutY || 5.85, h = s.calloutH || (k > 1 ? 0.95 : 0.85);
  list.forEach((c, i) => C.callout(ctx, { x: mx + i * (cw + gap), y, w: cw, h, size: k > 1 ? 16 : 17, ...c }));
}

const areaBottom = (s) => ((s.callouts || s.callout) ? (s.calloutY || 5.85) - 0.1 : 6.75);

// Reparte las filas verticalmente (centradas, con separación acotada).
function placeRows(heights, top, bottom, maxGap = 0.4) {
  const sum = heights.reduce((a, b) => a + b, 0);
  const n = heights.length;
  const gap = n > 1 ? Math.max(0.05, Math.min(maxGap, (bottom - top - sum) / (n - 1))) : 0;
  const used = sum + gap * (n - 1);
  let y = top + Math.max(0, (bottom - top - used) / 2);
  return heights.map((h) => {
    const r = y;
    y += h + gap;
    return r;
  });
}

// Pone en `out` los desplazamientos horizontales de punteros que comparten nodo y lado.
function pointerOffsets(ptrs, widthOf) {
  const groups = {};
  ptrs.forEach((p, i) => {
    const key = `${p.at}|${p.pos || 'top'}`;
    (groups[key] = groups[key] || []).push(i);
  });
  const off = {};
  Object.values(groups).forEach((idxs) => {
    const total = idxs.reduce((a, i) => a + widthOf(ptrs[i]) + 0.1, -0.1);
    let x = -total / 2;
    idxs.forEach((i) => {
      const wd = widthOf(ptrs[i]);
      off[i] = x + wd / 2;
      x += wd + 0.1;
    });
  });
  return off;
}

// ------------------------------------------------------------------ arreglo (celdas contiguas con índices)
function drawCell(ctx, c, x, y, cw, ch) {
  const { colors, fonts } = ctx.theme;
  const cell = c !== null && typeof c === 'object' ? c : { v: c };
  const empty = cell.empty || cell.v === null || cell.v === undefined || cell.v === '';
  const t = ctx.T[cell.tone || 'teal'];
  let fill, line, color, dash;
  if (empty) {
    fill = cell.tone ? t.soft : colors.bg;
    line = cell.tone ? t.accent : colors.slate;
    color = colors.slate;
    dash = 'dash';
  } else if (cell.dim) {
    fill = colors.panel; line = colors.border; color = colors.muted;
  } else if (cell.solid) {
    fill = t.accent; line = t.accent; color = t.on;
  } else {
    fill = t.soft; line = t.accent; color = colors.heading;
  }
  const ln = { color: line, width: cell.solid ? 2 : 1.75 };
  if (dash) ln.dashType = dash;
  ctx.slide.addText(empty ? '' : String(cell.v), {
    shape: ctx.pptx.ShapeType.rect, x, y, w: cw, h: ch, fill: { color: fill }, line: ln, color,
    bold: true, fontSize: cell.size || 24, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
  });
}

function arrayDiagram(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rows = s.rows;
  const labelW = rows.some((r) => r.label) ? s.labelW || 1.9 : 0;
  const noteW = rows.some((r) => r.note) ? s.noteW || 2.4 : 0;
  const availW = w - 2 * mx - labelW - noteW;
  const maxN = Math.max(...rows.map((r) => r.cells.length));
  const cw = Math.min(s.cellW || 1.4, availW / maxN);
  const ch = s.cellH || 0.8;
  const x0 = mx + labelW + (availW - maxN * cw) / 2;

  const metrics = rows.map((r) => {
    const ptrs = r.pointers || [], anns = r.annotations || [];
    const ptrTop = ptrs.some((p) => (p.pos || 'top') === 'top');
    const ptrBot = ptrs.some((p) => p.pos === 'bottom');
    const annTop = anns.some((a) => (a.pos || 'top') === 'top');
    const annBot = anns.some((a) => a.pos === 'bottom');
    const idx = r.index !== false;
    const top = (annTop ? 0.7 : 0) + (ptrTop ? PTR : 0) + (r.shifts ? 0.5 : 0) + (r.addr ? 0.34 : 0) + 0.05;
    const bot = (idx ? 0.4 : 0.05) + (ptrBot ? PTR : 0) + (annBot ? 0.7 : 0) + 0.05;
    return { ptrTop, ptrBot, annTop, annBot, idx, top, bot, h: top + ch + bot };
  });
  const ys = placeRows(metrics.map((m) => m.h), s.top || 1.9, areaBottom(s));

  rows.forEach((r, ri) => {
    const m = metrics[ri];
    const y = ys[ri];
    const cy = y + m.top;
    const cxOf = (i) => x0 + i * cw + cw / 2;
    if (r.label) {
      text(ctx, r.label, { x: mx, y: cy, w: labelW - 0.2, h: ch, fontSize: 18, bold: true, color: colors.slate, valign: 'middle' });
    }
    r.cells.forEach((c, i) => drawCell(ctx, c, x0 + i * cw, cy, cw, ch));
    if (r.addr) {
      r.cells.forEach((_, i) => {
        text(ctx, String(r.addr.start + i * r.addr.step), {
          x: x0 + i * cw, y: cy - 0.34, w: cw, h: 0.3, fontSize: 14, color: colors.muted, fontFace: fonts.code, align: 'center', valign: 'middle',
        });
      });
    }
    if (m.idx) {
      const start = r.start || 0;
      r.cells.forEach((_, i) => {
        text(ctx, String(start + i), {
          x: x0 + i * cw, y: cy + ch + 0.04, w: cw, h: 0.32, fontSize: 16, color: colors.slate, fontFace: fonts.code, align: 'center', valign: 'middle',
        });
      });
    }
    (r.shifts || []).forEach((sh) => {
      const dir = sh.to > sh.from ? 1 : -1;
      const ay = cy - 0.22;
      seg(ctx, cxOf(sh.from) + 0.1 * dir, ay, cxOf(sh.to) - 0.1 * dir, ay, { color: ctx.T[sh.tone || 'amber'].accent, width: 3, head: true });
    });
    (r.pointers || []).forEach((p) => {
      const t = ctx.T[p.tone || 'teal'];
      const wd = chipWd(p.name, 14);
      const px = cxOf(p.at) + (p.dx || 0);
      if ((p.pos || 'top') === 'top') {
        const chipY = cy - (r.shifts ? 0.5 : 0) - (r.addr ? 0.34 : 0) - PTR;
        chip(ctx, { x: px - wd / 2, y: chipY, w: wd, h: 0.34, label: p.name, tone: p.tone || 'teal', size: 14 });
        seg(ctx, cxOf(p.at), chipY + 0.34, cxOf(p.at), cy - 0.03, { color: t.accent, width: 2.5, head: true });
      } else {
        const baseY = cy + ch + (m.idx ? 0.4 : 0.05);
        chip(ctx, { x: px - wd / 2, y: baseY + 0.28, w: wd, h: 0.34, label: p.name, tone: p.tone || 'teal', size: 14 });
        seg(ctx, cxOf(p.at), baseY + 0.26, cxOf(p.at), baseY, { color: t.accent, width: 2.5, head: true });
      }
    });
    (r.annotations || []).forEach((a) => {
      const t = ctx.T[a.tone || 'teal'];
      const xa = x0 + a.from * cw + 0.06, xb = x0 + (a.to + 1) * cw - 0.06;
      const mid = (xa + xb) / 2;
      const lw = Math.max(xb - xa, 3.2);
      if ((a.pos || 'top') === 'top') {
        const by = y + 0.7 - 0.1;
        seg(ctx, xa, by, xb, by, { color: t.accent, width: 2.5 });
        seg(ctx, xa, by, xa, by + 0.12, { color: t.accent, width: 2.5 });
        seg(ctx, xb, by, xb, by + 0.12, { color: t.accent, width: 2.5 });
        text(ctx, a.text, { x: mid - lw / 2, y: by - 0.42, w: lw, h: 0.38, fontSize: 17, bold: true, color: t.text, align: 'center', valign: 'middle' });
      } else {
        const base = cy + ch + (m.idx ? 0.4 : 0.05) + (m.ptrBot ? PTR : 0);
        const by = base + 0.08;
        seg(ctx, xa, by, xb, by, { color: t.accent, width: 2.5 });
        seg(ctx, xa, by, xa, by - 0.12, { color: t.accent, width: 2.5 });
        seg(ctx, xb, by, xb, by - 0.12, { color: t.accent, width: 2.5 });
        text(ctx, a.text, { x: mid - lw / 2, y: by + 0.06, w: lw, h: 0.38, fontSize: 17, bold: true, color: t.text, align: 'center', valign: 'middle' });
      }
    });
    if (r.note) {
      text(ctx, r.note, { x: x0 + maxN * cw + 0.3, y: cy, w: noteW - 0.3, h: ch, fontSize: 16, color: colors.slate, fontFace: fonts.code, valign: 'middle' });
    }
  });
  bottomCallouts(ctx, s);
}

// ------------------------------------------------------------------ nodos enlazados (simple, doble, circular, cola)
const NODE_H = 0.9;
const BASE = { single: [1.6, 1.0], circular: [1.6, 1.0], double: [2.1, 1.0], plain: [1.2, 0.85] }; // [ancho nodo, separación]

// Las celdas de referencia son proporcionales al ancho del nodo.
function nodeShape(mode, nw) {
  const plain = mode === 'plain', dbl = mode === 'double';
  const ptrW = plain ? 0 : dbl ? nw * 0.21 : nw * 0.3;
  const valW = plain ? nw : dbl ? nw - 2 * ptrW : nw - ptrW;
  const valX = dbl ? ptrW : 0;
  return { plain, dbl, valW, valX, ptrW };
}

function drawNode(ctx, nd, x, y, nw, nh, mode) {
  const { colors, fonts } = ctx.theme;
  const o = nd !== null && typeof nd === 'object' ? nd : { v: nd };
  const t = ctx.T[o.tone || 'teal'];
  const { plain, dbl, valW, valX, ptrW } = nodeShape(mode, nw);
  const fill = o.dim ? colors.panel : t.soft;
  const line = o.dim ? colors.border : t.accent;
  box(ctx, { x, y, w: nw, h: nh, fill, line, shape: 'rect', lineWidth: 2 });
  if (!plain) {
    seg(ctx, x + valX + valW, y, x + valX + valW, y + nh, { color: line, width: 1.5 });
    if (dbl) seg(ctx, x + valX, y, x + valX, y + nh, { color: line, width: 1.5 });
  }
  const runs = o.sub
    ? [
        { text: String(o.v), options: { fontSize: o.size || 22, bold: true, breakLine: true } },
        { text: String(o.sub), options: { fontSize: 14, bold: false } },
      ]
    : [{ text: String(o.v), options: { fontSize: o.size || 26, bold: true } }];
  text(ctx, runs, {
    x: x + valX, y, w: valW, h: nh, align: 'center', valign: 'middle', color: o.dim ? colors.muted : colors.heading, fontFace: fonts.heading,
  });
  const dot = (cx, cy) => ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
    x: cx - 0.07, y: cy - 0.07, w: 0.14, h: 0.14, fill: { color: o.dim ? colors.muted : colors.slate }, line: { type: 'none' },
  });
  if (!plain && o.next !== false) dot(x + nw - ptrW / 2, y + nh / 2 - (dbl ? 0.17 : 0));
  if (dbl && o.prev !== false) dot(x + ptrW / 2, y + nh / 2 + 0.17);
}

function measureNodeRow(r, s) {
  const mode = r.mode || s.mode || 'single';
  const nh = r.nodeH || s.nodeH || (mode === 'plain' ? 0.68 : NODE_H);
  const ptrs = r.pointers || [];
  const byp = r.bypass || [];
  let top = 0.08, bot = 0.08;
  top += Math.max(ptrs.some((p) => (p.pos || 'top') === 'top') ? PTR : 0, byp.some((b) => (b.pos || 'top') === 'top') ? 0.62 : 0);
  if (byp.some((b) => b.pos === 'bottom')) bot += 0.62;
  if (mode === 'circular') bot += 0.6;
  if (r.nodes.some((n) => n && n.addr)) bot += 0.36;
  if (r.captions) bot += 0.5;
  if (ptrs.some((p) => p.pos === 'bottom')) bot += PTR;
  if (r.float) bot += 0.5 + nh + (r.float.name ? 0.66 : 0.1);
  if (r.caption) bot += 0.5;
  return { mode, nh, top, bot, h: top + nh + bot };
}

function nodesDiagram(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rows = s.rows || [s];
  const labelW = rows.some((r) => r.label) ? s.labelW || 1.8 : 0;
  const areaX = mx + labelW;
  const areaW = w - 2 * mx - labelW;
  const ms = rows.map((r) => measureNodeRow(r, s));

  // escala común para que todas las filas queden alineadas
  let k = 1;
  rows.forEach((r, i) => {
    const mode = ms[i].mode;
    const plain = mode === 'plain', dbl = mode === 'double';
    const n = r.nodes.length;
    if (!n) return;
    const [baseW, baseGap] = BASE[mode];
    const fixed = (dbl && r.end !== 'none' ? 0.95 : 0) + (!plain && mode !== 'circular' && r.end !== 'none' ? 0.95 : 0) + (r.ends ? 3.2 : 0);
    const need = n * baseW + (n - 1) * baseGap;
    k = Math.min(k, (areaW - fixed) / need);
  });
  const ys = placeRows(ms.map((m) => m.h), s.top || 1.9, areaBottom(s), 0.3);

  // ancho del bloque más ancho para centrarlo
  let maxTotal = 0;
  const geo = rows.map((r, i) => {
    const mode = ms[i].mode;
    const plain = mode === 'plain', dbl = mode === 'double', circ = mode === 'circular';
    const nw = BASE[mode][0] * k;
    const gap = BASE[mode][1] * k;
    const n = r.nodes.length;
    const left = (dbl && r.end !== 'none' ? 0.95 : 0) + (r.ends ? 1.6 : 0);
    const right = (!plain && !circ && r.end !== 'none' ? 0.95 : 0) + (r.ends ? 1.6 : 0);
    const total = left + (n ? n * nw + (n - 1) * gap : 2.6) + right;
    maxTotal = Math.max(maxTotal, total);
    return { nw, gap, left, right, total };
  });
  const bx = areaX + Math.max(0, (areaW - maxTotal) / 2);

  rows.forEach((r, ri) => {
    const m = ms[ri];
    const g = geo[ri];
    const { mode, nh } = m;
    const plain = mode === 'plain', dbl = mode === 'double', circ = mode === 'circular';
    const { valW, ptrW } = nodeShape(mode, g.nw);
    const y = ys[ri];
    const ny = y + m.top;
    const cy = ny + nh / 2;
    const xs = bx + g.left;
    const nodes = r.nodes;
    const n = nodes.length;
    const nxOf = (i) => xs + i * (g.nw + g.gap);
    const cxOf = (i) => nxOf(i) + g.nw / 2;
    const valCx = (i) => nxOf(i) + nodeShape(mode, g.nw).valX + valW / 2;
    const nextDotX = (i) => nxOf(i) + g.nw - ptrW / 2;
    const prevDotX = (i) => nxOf(i) + ptrW / 2;
    const dy = dbl ? 0.17 : 0;
    const lineC = colors.slate;

    if (r.label) {
      text(ctx, r.label, { x: mx, y: ny, w: labelW - 0.2, h: nh, fontSize: 18, bold: true, color: colors.slate, valign: 'middle' });
    }

    if (!n) {
      const ew = 2.6;
      ctx.slide.addText(r.empty || 'vacía', {
        shape: ctx.pptx.ShapeType.rect, x: xs + 0, y: ny, w: ew, h: nh, fill: { color: colors.bg },
        line: { color: colors.slate, width: 1.75, dashType: 'dash' }, color: colors.slate, fontSize: 18, fontFace: fonts.body,
        align: 'center', valign: 'middle', margin: 0,
      });
    }
    nodes.forEach((nd, i) => drawNode(ctx, nd, nxOf(i), ny, g.nw, nh, mode));

    // enlaces entre nodos
    for (let i = 0; i < n - 1; i++) {
      const nxt = nodes[i + 1];
      if (nxt && typeof nxt === 'object' && nxt.link === 'none') continue;
      const hl = (r.hlLinks || []).includes(i);
      const cut = (r.cutLinks || []).includes(i);
      const st = { color: cut ? ctx.T.red.accent : hl ? ctx.T.amber.accent : lineC, width: hl ? 4 : 2.5, dash: cut ? 'dash' : undefined, head: true };
      if (plain) seg(ctx, nxOf(i) + g.nw + 0.03, cy, nxOf(i + 1) - 0.03, cy, st);
      else if (dbl) {
        seg(ctx, nextDotX(i), cy - dy, nxOf(i + 1) - 0.03, cy - dy, st);
        seg(ctx, prevDotX(i + 1), cy + dy, nxOf(i) + g.nw + 0.03, cy + dy, st);
      } else seg(ctx, nextDotX(i), cy, nxOf(i + 1) - 0.03, cy, st);
    }

    // terminales `null`
    if (n && !plain && !circ && r.end !== 'none') {
      const lastX = nxOf(n - 1) + g.nw;
      seg(ctx, nextDotX(n - 1), cy - dy, lastX + 0.5, cy - dy, { color: lineC, head: true });
      text(ctx, 'null', { x: lastX + 0.55, y: cy - dy - 0.2, w: 0.8, h: 0.4, fontSize: 16, color: colors.slate, fontFace: fonts.code, valign: 'middle' });
      if (dbl) {
        seg(ctx, prevDotX(0), cy + dy, xs - 0.5, cy + dy, { color: lineC, head: true });
        text(ctx, 'null', { x: xs - 1.35, y: cy + dy - 0.2, w: 0.8, h: 0.4, fontSize: 16, color: colors.slate, fontFace: fonts.code, align: 'right', valign: 'middle' });
      }
    }

    // extremos de una cola (Frente / Final)
    if (r.ends) {
      const lw = chipWd(r.ends.left, 15), rw = chipWd(r.ends.right, 15);
      if (n) {
        chip(ctx, { x: xs - 1.55, y: cy - 0.2, w: lw, h: 0.4, label: r.ends.left, tone: 'teal', size: 15 });
        seg(ctx, xs - 1.55 + lw + 0.02, cy, xs - 0.03, cy, { color: ctx.T.teal.accent, head: true });
        const lastX = nxOf(n - 1) + g.nw;
        chip(ctx, { x: lastX + 1.55 - rw, y: cy - 0.2, w: rw, h: 0.4, label: r.ends.right, tone: 'amber', size: 15 });
        seg(ctx, lastX + 1.55 - rw - 0.02, cy, lastX + 0.03, cy, { color: ctx.T.amber.accent, head: true });
      } else {
        chip(ctx, { x: xs - 1.55, y: cy - 0.2, w: lw, h: 0.4, label: r.ends.left, tone: 'teal', size: 15 });
        seg(ctx, xs - 1.55 + lw + 0.02, cy, xs - 0.03, cy, { color: ctx.T.teal.accent, head: true });
        chip(ctx, { x: xs + 2.6 + 1.55 - rw, y: cy - 0.2, w: rw, h: 0.4, label: r.ends.right, tone: 'amber', size: 15 });
        seg(ctx, xs + 2.6 + 1.55 - rw - 0.02, cy, xs + 2.6 + 0.03, cy, { color: ctx.T.amber.accent, head: true });
      }
    }

    // lista circular: el último vuelve al primero
    if (circ && n) {
      const yb = ny + nh + 0.45;
      const hl = (r.hlLinks || []).includes(n - 1);
      const st = { color: hl ? ctx.T.amber.accent : lineC, width: hl ? 4 : 2.5 };
      seg(ctx, nextDotX(n - 1), cy, nextDotX(n - 1), yb, st);
      seg(ctx, nextDotX(n - 1), yb, valCx(0), yb, st);
      seg(ctx, valCx(0), yb, valCx(0), ny + nh + 0.03, { ...st, head: true });
    }

    // saltos (bypass) para eliminar nodos
    (r.bypass || []).forEach((b) => {
      const pos = b.pos || 'top';
      const forward = b.to > b.from;
      const sx = forward ? nextDotX(b.from) : prevDotX(b.from);
      const ex = valCx(b.to);
      const yEdge = pos === 'top' ? ny : ny + nh;
      const yMid = pos === 'top' ? ny - 0.46 : ny + nh + 0.46;
      const st = { color: ctx.T[b.tone || 'green'].accent, width: 3.5 };
      seg(ctx, sx, yEdge, sx, yMid, st);
      seg(ctx, sx, yMid, ex, yMid, st);
      seg(ctx, ex, yMid, ex, yEdge + (pos === 'top' ? -0.03 : 0.03), { ...st, head: true });
    });

    // punteros con nombre (head, tail, current, front, rear, top…)
    const ptrs = r.pointers || [];
    const offs = pointerOffsets(ptrs, (p) => chipWd(p.name, 14));
    ptrs.forEach((p, i) => {
      const t = ctx.T[p.tone || 'teal'];
      const wd = chipWd(p.name, 14);
      const px = cxOf(p.at) + offs[i] + (p.dx || 0);
      const ax = Math.min(Math.max(px, nxOf(p.at) + 0.12), nxOf(p.at) + g.nw - 0.12);
      if ((p.pos || 'top') === 'top') {
        const chipY = ny - PTR;
        chip(ctx, { x: px - wd / 2, y: chipY, w: wd, h: 0.34, label: p.name, tone: p.tone || 'teal', size: 14 });
        seg(ctx, ax, chipY + 0.34, ax, ny - 0.03, { color: t.accent, width: 2.5, head: true });
      } else {
        const base = ny + nh + ((r.bypass || []).some((b) => b.pos === 'bottom') ? 0.62 : 0) + (circ ? 0.6 : 0) + (r.nodes.some((q) => q && q.addr) ? 0.36 : 0) + (r.captions ? 0.5 : 0);
        chip(ctx, { x: px - wd / 2, y: base + 0.28, w: wd, h: 0.34, label: p.name, tone: p.tone || 'teal', size: 14 });
        seg(ctx, ax, base + 0.26, ax, base + 0.02, { color: t.accent, width: 2.5, head: true });
      }
    });

    // direcciones de memoria bajo los nodos
    nodes.forEach((nd, i) => {
      if (nd && nd.addr) {
        text(ctx, nd.addr, { x: cxOf(i) - 0.9, y: ny + nh + 0.05, w: 1.8, h: 0.3, fontSize: 14, color: colors.muted, fontFace: fonts.code, align: 'center', valign: 'middle' });
      }
    });

    // rótulos de las partes de un nodo
    (r.captions || []).forEach((c) => {
      const nx = nxOf(c.at);
      const sh = nodeShape(mode, g.nw);
      let px;
      if (c.part === 'next') px = nx + g.nw - sh.ptrW / 2;
      else if (c.part === 'prev') px = nx + sh.ptrW / 2;
      else px = nx + sh.valX + sh.valW / 2;
      const t = ctx.T[c.tone || 'amber'];
      const wd = String(c.text).length * 0.105 + 0.15;
      seg(ctx, px, ny + nh, px, ny + nh + 0.17, { color: t.accent, width: 1.75 });
      text(ctx, c.text, { x: px - wd / 2, y: ny + nh + 0.18, w: wd, h: 0.3, fontSize: 14, bold: true, color: t.text, align: 'center', valign: 'middle' });
    });

    // nodo flotante (recién creado, todavía sin enlazar)
    if (r.float) {
      const f = r.float;
      const at = f.at === undefined ? n - 1 : f.at;
      const i0 = Math.floor(at), frac = at - i0;
      const fcx = cxOf(i0) + frac * (g.nw + g.gap) + (f.dx || 0);
      const fy = ny + nh + (circ ? 0.6 : 0) + 0.5;
      drawNode(ctx, { tone: 'amber', ...f }, fcx - g.nw / 2, fy, g.nw, nh, mode);
      if (!plain && !circ && f.null !== false) {
        const lx = fcx + g.nw / 2;
        seg(ctx, lx - ptrW / 2, fy + nh / 2 - dy, lx + 0.45, fy + nh / 2 - dy, { color: lineC, head: true });
        text(ctx, 'null', { x: lx + 0.5, y: fy + nh / 2 - dy - 0.2, w: 0.8, h: 0.4, fontSize: 16, color: colors.slate, fontFace: fonts.code, valign: 'middle' });
      }
      if (f.name) {
        const wd = chipWd(f.name, 14);
        chip(ctx, { x: fcx - wd / 2, y: fy + nh + 0.32, w: wd, h: 0.34, label: f.name, tone: 'amber', size: 14 });
        seg(ctx, fcx, fy + nh + 0.3, fcx, fy + nh + 0.03, { color: ctx.T.amber.accent, width: 2.5, head: true });
      }
    }

    if (r.caption) {
      text(ctx, r.caption, { x: areaX, y: y + m.h - 0.46, w: areaW, h: 0.4, fontSize: 17, color: colors.slate, align: 'center', valign: 'middle' });
    }
  });
  bottomCallouts(ctx, s);
}

// ------------------------------------------------------------------ pila (marcos con LIFO)
function stackDiagram(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const frames = s.frames;
  const f = frames.length;
  const fw = (w - 2 * mx) / f;
  const cap = s.cap || 4;
  const slotH = s.slotH || 0.52;
  const cw = s.cellW || 1.2;
  const top = s.top || 1.85;
  const hasIO = frames.some((fr) => fr.io);
  const contTop = top + 0.5 + (hasIO ? 1.0 : 0.15);
  const contBottom = contTop + cap * slotH + 0.06;
  const groupW = cw + 0.16 + 0.3 + 0.62;

  frames.forEach((fr, i) => {
    const gx = mx + i * fw + (fw - groupW) / 2;
    const lx = gx, rx = gx + cw + 0.16;
    const cx = (lx + rx) / 2;
    text(ctx, fr.label, { x: mx + i * fw, y: top, w: fw, h: 0.45, fontSize: 20, bold: true, color: colors.heading, fontFace: fonts.code, align: 'center', valign: 'middle' });
    seg(ctx, lx, contTop, lx, contBottom, { color: colors.slate, width: 4 });
    seg(ctx, rx, contTop, rx, contBottom, { color: colors.slate, width: 4 });
    seg(ctx, lx - 0.02, contBottom, rx + 0.02, contBottom, { color: colors.slate, width: 4 });
    const items = fr.items || [];
    if (!items.length && fr.emptyText) {
      text(ctx, fr.emptyText, { x: lx, y: contBottom - slotH - 0.04, w: rx - lx, h: slotH, fontSize: 16, italic: true, color: colors.slate, align: 'center', valign: 'middle' });
    }
    items.forEach((v, k) => {
      const cy = contBottom - 0.04 - (k + 1) * slotH;
      drawCell(ctx, { v, solid: k === items.length - 1, tone: 'teal', size: 22 }, cx - cw / 2, cy, cw, slotH);
    });
    if (items.length) {
      const my = contBottom - 0.04 - items.length * slotH + slotH / 2;
      chip(ctx, { x: rx + 0.45, y: my - 0.17, w: 0.62, h: 0.34, label: 'top', tone: 'amber', size: 14 });
      seg(ctx, rx + 0.43, my, rx + 0.08, my, { color: ctx.T.amber.accent, width: 2.5, head: true });
    }
    if (fr.io) {
      const ioY = top + 0.55;
      drawCell(ctx, { v: fr.io.v, tone: 'amber', size: 22 }, cx - cw / 2, ioY, cw, slotH);
      if (fr.io.dir === 'in') seg(ctx, cx, ioY + slotH + 0.03, cx, contTop + 0.2, { color: ctx.T.amber.accent, width: 3, head: true });
      else seg(ctx, cx, contTop + 0.2, cx, ioY + slotH + 0.03, { color: ctx.T.amber.accent, width: 3, head: true });
    }
    if (fr.sub) {
      text(ctx, fr.sub, { x: mx + i * fw, y: contBottom + 0.1, w: fw, h: 0.4, fontSize: 16, color: colors.slate, fontFace: fonts.code, align: 'center', valign: 'middle' });
    }
  });
  bottomCallouts(ctx, s);
}

// ------------------------------------------------------------------ cola circular (anillo de celdas)
function ringDiagram(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rings = s.rings;
  const k = rings.length;
  const R = s.radius || 1.4, cs = s.cell || 0.76;
  const cyc = s.cy || 4.3;
  const availW = w - 2 * mx;

  rings.forEach((rg, ri) => {
    const cx = mx + (availW * (ri + 0.5)) / k;
    const n = rg.cells.length;
    text(ctx, rg.title, { x: cx - 2.8, y: cyc - R - cs / 2 - 0.55, w: 5.6, h: 0.42, fontSize: 20, bold: true, color: colors.heading, fontFace: fonts.code, align: 'center', valign: 'middle' });
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
      x: cx - R, y: cyc - R, w: 2 * R, h: 2 * R, fill: { color: colors.bg, transparency: 100 }, line: { color: colors.border, width: 2, dashType: 'dash' },
    });
    rg.cells.forEach((v, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const px = cx + R * Math.cos(a), py = cyc + R * Math.sin(a);
      const isF = i === rg.front, isR = i === rg.rear;
      const cell = { v, size: 22 };
      if (v === null || v === undefined) cell.empty = true;
      if (isF) { cell.solid = true; cell.tone = 'teal'; }
      else if (isR) { cell.solid = true; cell.tone = 'amber'; }
      drawCell(ctx, cell, px - cs / 2, py - cs / 2, cs, cs);
      if (isF && isR) {
        box(ctx, { x: px - cs / 2, y: py - cs / 2, w: cs, h: cs, line: ctx.T.amber.accent, lineWidth: 4, shape: 'rect' });
      }
      const ir = R - 0.62;
      text(ctx, String(i), { x: cx + ir * Math.cos(a) - 0.2, y: cyc + ir * Math.sin(a) - 0.16, w: 0.4, h: 0.32, fontSize: 15, color: colors.muted, fontFace: fonts.code, align: 'center', valign: 'middle' });
    });
    if (rg.caption) {
      text(ctx, rg.caption, { x: cx - 2.8, y: cyc + R + cs / 2 + 0.1, w: 5.6, h: 0.7, fontSize: 17, color: colors.slate, fontFace: fonts.code, align: 'center' });
    }
  });
  const mid = mx + availW / 2;
  if (k === 2 && s.between) {
    seg(ctx, mid - 0.6, cyc, mid + 0.6, cyc, { color: ctx.T.amber.accent, width: 3.5, head: true });
    const wd = chipWd(s.between, 15);
    chip(ctx, { x: mid - wd / 2, y: cyc - 0.62, w: wd, h: 0.4, label: s.between, tone: 'amber', size: 15 });
  }
  [['front', 'teal'], ['rear', 'amber']].forEach(([label, tone], i) => {
    const wd = chipWd(label, 14);
    chip(ctx, { x: mid - wd / 2, y: cyc + 0.5 + i * 0.5, w: wd, h: 0.36, label, tone, size: 14 });
  });
  bottomCallouts(ctx, s);
}

// ------------------------------------------------------------------ matriz: Java (arreglo de arreglos) vs. C# (contigua)
function matrixRefs(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const vals = s.values;
  const [hr, hc] = s.hl || [1, 2];
  const pw = (w - 2 * mx - 0.4) / 2;
  const py = 1.85, ph = 3.75;
  const T = ctx.T.amber;

  // ---- Java
  C.surface(ctx, null, { x: mx, y: py, w: pw, h: ph });
  text(ctx, s.java.title, { x: mx + 0.3, y: py + 0.15, w: pw - 0.6, h: 0.45, fontSize: 21, bold: true, color: colors.heading, valign: 'middle' });
  const rh = 0.55, rgap = 0.2, refW = 1.3, ic = 0.66;
  const ry0 = py + 0.85;
  const jx = mx + 0.35;
  vals.forEach((row, i) => {
    const y = ry0 + i * (rh + rgap);
    const isH = i === hr;
    drawCell(ctx, { v: `matriz[${i}]`, tone: isH ? 'amber' : 'navy', size: 16 }, jx, y, refW, rh);
    const ax = jx + refW + 0.04, bx = jx + refW + 0.85;
    seg(ctx, ax, y + rh / 2, bx - 0.04, y + rh / 2, { color: isH ? T.accent : colors.slate, width: isH ? 3.5 : 2.5, head: true });
    row.forEach((v, j) => drawCell(ctx, { v, tone: isH ? 'amber' : 'teal', solid: isH && j === hc, size: 20 }, bx + j * ic, y, ic, rh));
  });
  circleLabel(ctx, { x: jx + refW + 0.2, y: ry0 + hr * (rh + rgap) - 0.2, d: 0.34, label: '1', fill: T.accent, color: T.on, size: 14 });
  const finalX = jx + refW + 0.85 + hc * ic + ic - 0.1;
  circleLabel(ctx, { x: finalX, y: ry0 + hr * (rh + rgap) - 0.2, d: 0.34, label: '2', fill: T.accent, color: T.on, size: 14 });
  text(ctx, s.java.caption, { x: mx + 0.3, y: py + ph - 0.62, w: pw - 0.6, h: 0.5, fontSize: 17, color: colors.slate, valign: 'middle' });

  // ---- C#
  const px2 = mx + pw + 0.4;
  C.surface(ctx, null, { x: px2, y: py, w: pw, h: ph });
  text(ctx, s.csharp.title, { x: px2 + 0.3, y: py + 0.15, w: pw - 0.6, h: 0.45, fontSize: 21, bold: true, color: colors.heading, valign: 'middle' });
  const cw = 0.8, chh = 0.6;
  const gx = px2 + (pw - 3 * cw) / 2, gy = py + 0.85;
  vals.forEach((row, i) => row.forEach((v, j) => {
    const isH = i === hr && j === hc;
    drawCell(ctx, { v, tone: isH ? 'amber' : 'teal', solid: isH, size: 20 }, gx + j * cw, gy + i * (chh + 0.12), cw, chh);
  }));
  circleLabel(ctx, { x: gx + hc * cw + cw - 0.1, y: gy + hr * (chh + 0.12) - 0.2, d: 0.34, label: '1', fill: T.accent, color: T.on, size: 14 });
  text(ctx, s.csharp.caption, { x: px2 + 0.3, y: py + ph - 0.62, w: pw - 0.6, h: 0.5, fontSize: 17, color: colors.slate, valign: 'middle' });
  bottomCallouts(ctx, s);
}

module.exports = {
  'lineales-array': arrayDiagram,
  'lineales-nodes': nodesDiagram,
  'lineales-stack': stackDiagram,
  'lineales-ring': ringDiagram,
  'lineales-matrix-refs': matrixRefs,
};
