// Diagramas de la lección «Estructuras de almacenamiento externo» (CE-2103).
// Cada `kind` lleva el prefijo `externo-` para no chocar con otras extensiones.
const C = require('./components');

const { text, box, chip, circleLabel, arrow, callout, card } = C;

const WHITE = 'FFFFFF';
const lineH = (fs) => (fs * 1.25) / 72;
function estLines(str, fs, w) {
  const plain = String(str).replace(/\*\*|`/g, '');
  const cpl = Math.max(1, Math.floor((w / (fs * 0.0063)) * 0.95));
  return Math.max(1, Math.ceil(plain.length / cpl));
}

// ------------------------------------------------------------------ figura (imagen o dibujo) + puntos clave
// `drawFigure(ctx, rect)` dibuja la figura en el rectángulo de la izquierda (o de la derecha con `imageSide: 'right'`).
function sideLayout(ctx, s, drawFigure) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85;
  const bottom = s.callout ? 5.7 : 6.7;
  const imgW = s.imageW || 6.2;
  const right = s.imageSide === 'right';
  const gap = 0.5;
  const ix = right ? w - mx - imgW : mx;
  const tx = right ? mx : mx + imgW + gap;
  const tw = w - 2 * mx - imgW - gap;
  drawFigure(ctx, { x: ix, y: top, w: imgW, h: bottom - top });

  const tSize = s.titleSize || 22, dSize = s.textSize || 17;
  const items = s.items.map((it) => (typeof it === 'string' ? { title: it } : it));
  const heights = items.map((it) => 0.42 + (it.text ? estLines(it.text, dSize, tw - 0.5) * lineH(dSize) + 0.05 : 0));
  const gapI = Math.max(0.1, Math.min(s.itemGap || 0.3, (bottom - top - heights.reduce((a, b) => a + b, 0)) / Math.max(1, items.length - 1)));
  const total = heights.reduce((a, b) => a + b, 0) + gapI * (items.length - 1);
  let y = top + Math.max(0, (bottom - top - total) / 2);
  items.forEach((it, i) => {
    box(ctx, { x: tx, y: y + 0.11, w: 0.2, h: 0.2, fill: colors.teal, radius: 0.04 });
    const runs = C.rich(it.title, ctx, { fontSize: tSize, bold: true, color: colors.heading, fontFace: fonts.heading });
    if (it.text) {
      runs[runs.length - 1].options.breakLine = true;
      runs.push(...C.rich(it.text, ctx, { fontSize: dSize, color: colors.slate }));
    }
    text(ctx, runs, { x: tx + 0.4, y, w: tw - 0.4, h: heights[i] });
    y += heights[i] + gapI;
  });
  if (s.callout) callout(ctx, { x: mx, y: 5.95, w: w - 2 * mx, h: 0.85, ...s.callout });
}

function imageSide(ctx, s) {
  sideLayout(ctx, s, (c, r) => {
    box(c, { x: r.x, y: r.y, w: r.w, h: r.h, fill: WHITE, radius: 0.15 });
    C.image(c, s.image, { x: r.x + 0.15, y: r.y + 0.15, w: r.w - 0.3, h: r.h - 0.3 }, s.alt);
  });
}

// ------------------------------------------------------------------ dos (o más) imágenes con pie
function images(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.images.length, gap = 0.4;
  const cw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = 1.8, capH = 0.8;
  const bottom = s.callout ? 5.7 : 6.75;
  const ih = bottom - top - capH - 0.1;
  s.images.forEach((im, i) => {
    const x = mx + i * (cw + gap);
    box(ctx, { x, y: top, w: cw, h: ih, fill: WHITE, radius: 0.12 });
    C.image(ctx, im.file, { x: x + 0.1, y: top + 0.1, w: cw - 0.2, h: ih - 0.2 }, im.alt);
    text(ctx, im.caption, { x, y: top + ih + 0.1, w: cw, h: capH, fontSize: 16, color: colors.slate, align: 'center' });
  });
  if (s.callout) callout(ctx, { x: mx, y: 5.9, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ barra de tiempos (seek + latencia + transferencia)
function timebar(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const barW = w - 2 * mx, gap = 0.05, y = s.barY || 2.45, h = s.barH || 0.8;
  const n = s.segments.length;
  const totalMs = s.segments.reduce((a, g) => a + g.ms, 0);
  const avail = barW - gap * (n - 1);
  let widths = s.segments.map((g) => Math.max(0.3, (g.ms / totalMs) * avail));
  const k = avail / widths.reduce((a, b) => a + b, 0);
  widths = widths.map((v) => v * k);
  const xs = [];
  let x = mx;
  widths.forEach((v) => {
    xs.push(x);
    x += v + gap;
  });

  s.segments.forEach((g, i) => {
    const t = ctx.T[g.tone || 'teal'];
    ctx.slide.addText(widths[i] > 1.6 ? g.label : '', {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x: xs[i], y, w: widths[i], h,
      fill: { color: t.accent }, line: { type: 'none' }, color: t.on, bold: true, fontSize: 22,
      fontFace: ctx.theme.fonts.heading, align: 'center', valign: 'middle', margin: 0, lang: 'es-ES',
    });
  });
  // Uno o varios corchetes apilados (el primero es el más cercano a la barra)
  const brackets = s.brackets || (s.bracket ? [s.bracket] : []);
  brackets.forEach((br, lvl) => {
    const x1 = xs[br.from], x2 = xs[br.to] + widths[br.to];
    const by = y - 0.14 - lvl * 0.5;
    const col = br.tone ? ctx.T[br.tone].text : colors.tealDark;
    arrow(ctx, { x1, y1: by, x2, y2: by, color: col, width: 2, head: false });
    arrow(ctx, { x1, y1: by, x2: x1, y2: by + 0.1, color: col, width: 2, head: false });
    arrow(ctx, { x1: x2, y1: by, x2, y2: by + 0.1, color: col, width: 2, head: false });
    const lh = brackets.length > 1 ? 0.34 : 0.4;
    text(ctx, br.label, { x: x1, y: by - lh - 0.05, w: x2 - x1, h: lh, fontSize: brackets.length > 1 ? 17 : 18, bold: true, color: col, align: 'center', valign: 'middle' });
  });
  const cg = 0.3, cw = (barW - cg * (n - 1)) / n;
  s.segments.forEach((g, i) => {
    card(ctx, { title: g.label, text: g.text, footer: g.range, tone: g.tone, titleSize: 20, textSize: 16, footerSize: 17 }, { x: mx + i * (cw + cg), y: s.cardsY || 3.55, w: cw, h: s.cardH || 2.4 });
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.07, w: barW, h: 0.78, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ barras horizontales
function bars(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const lw = s.labelW || 4.3, top = s.top || 2.1, bh = s.barH || 0.62, gap = s.gap || 0.35;
  const x0 = mx + lw + 0.2;
  const valueW = s.valueW || 2.4;
  const barMax = w - mx - x0 - valueW;
  const max = Math.max(...s.bars.map((b) => b.value));
  s.bars.forEach((b, i) => {
    const y = top + i * (bh + gap);
    const t = ctx.T[b.tone || 'teal'];
    text(ctx, b.label, { x: mx, y, w: lw, h: bh, fontSize: s.labelSize || 19, color: colors.ink, valign: 'middle', align: 'right' });
    const bw = Math.max(0.1, (b.value / max) * barMax);
    box(ctx, { x: x0, y, w: bw, h: bh, fill: t.accent, radius: 0.08 });
    text(ctx, b.text, { x: x0 + bw + 0.15, y, w: valueW, h: bh, fontSize: 20, bold: true, color: t.text, valign: 'middle' });
  });
  const end = top + s.bars.length * (bh + gap);
  if (s.note) text(ctx, s.note, { x: mx, y: end - 0.05, w: w - 2 * mx, h: 0.45, fontSize: 17, color: colors.slate, align: 'center', valign: 'middle' });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.75, w: w - 2 * mx, h: 0.95, ...s.callout });
}

// ------------------------------------------------------------------ disco dividido en particiones
function partitions(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const y = 2.4, h = 1.0, gap = 0.06;
  text(ctx, s.diskLabel, { x: mx, y: y - 0.5, w: 8, h: 0.4, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
  const n = s.segments.length;
  const total = s.segments.reduce((a, g) => a + g.w, 0);
  const avail = w - 2 * mx - gap * (n - 1);
  let x = mx;
  s.segments.forEach((g) => {
    const sw = (g.w / total) * avail;
    const t = ctx.T[g.tone || 'teal'];
    ctx.slide.addText(
      [
        { text: g.label, options: { fontSize: 19, bold: true, color: t.text, breakLine: true } },
        { text: g.sub, options: { fontSize: 16, color: colors.ink } },
      ],
      {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y, w: sw, h,
        fill: { color: g.dashed ? colors.bg : t.soft }, line: { color: t.accent, width: 2, dashType: g.dashed ? 'dash' : 'solid' },
        fontFace: ctx.theme.fonts.body, align: 'center', valign: 'middle', margin: 0, lang: 'es-ES',
      }
    );
    x += sw + gap;
  });
  const cg = 0.3, k = s.cards.length, cw = (w - 2 * mx - cg * (k - 1)) / k;
  s.cards.forEach((c, i) => card(ctx, { titleSize: 21, textSize: 16, ...c }, { x: mx + i * (cw + cg), y: 3.75, w: cw, h: c.h || 2.0 }));
  if (s.callout) callout(ctx, { x: mx, y: 5.95, w: w - 2 * mx, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ flujo de un cache (hit / miss)
function cacheFlow(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const step = (x, y, bw, bh, tone, num, title, body) => {
    const t = ctx.T[tone];
    box(ctx, { x, y, w: bw, h: bh, fill: t.soft, line: t.accent, lineWidth: 1.5 });
    circleLabel(ctx, { x: x + 0.2, y: y + 0.2, d: 0.5, label: String(num), fill: t.accent, color: t.on, size: 20 });
    text(ctx, title, { x: x + 0.85, y: y + 0.12, w: bw - 1.0, h: 0.66, fontSize: 19, bold: true, color: t.text, valign: 'middle' });
    if (body) text(ctx, body, { x: x + 0.25, y: y + 0.9, w: bw - 0.5, h: bh - 1.0, fontSize: 17, color: colors.ink });
  };
  const my = 4.0;
  const rq = { x: mx, w: 2.7 }, sr = { x: mx + 3.3, w: 3.0 }, ox = mx + 7.3, ow = w - mx - ox;
  step(rq.x, my - 0.75, rq.w, 1.5, 'slate', 1, s.request.title);
  step(sr.x, my - 0.75, sr.w, 1.5, 'teal', 2, s.search.title);
  step(ox, 1.95, ow, 1.7, 'green', 3, s.hit.title, s.hit.text);
  step(ox, 4.0, ow, 1.75, 'red', 4, s.miss.title, s.miss.text);
  arrow(ctx, { x1: rq.x + rq.w + 0.05, y1: my, x2: sr.x - 0.05, y2: my, color: colors.teal, width: 3 });
  arrow(ctx, { x1: sr.x + sr.w + 0.05, y1: my, x2: ox - 0.05, y2: 2.8, color: ctx.T.green.accent, width: 3 });
  arrow(ctx, { x1: sr.x + sr.w + 0.05, y1: my, x2: ox - 0.05, y2: 4.9, color: ctx.T.red.accent, width: 3 });
  const mid = (sr.x + sr.w + ox) / 2;
  chip(ctx, { x: mid - 0.25, y: 3.05 - 0.17, w: 0.5, h: 0.34, label: s.yes || 'sí', tone: 'green', size: 14 });
  chip(ctx, { x: mid - 0.25, y: 4.45 - 0.17, w: 0.5, h: 0.34, label: s.no || 'no', tone: 'red', size: 14 });
  if (s.callout) callout(ctx, { x: mx, y: 5.95, w: w - 2 * mx, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ traza de accesos en un cache (LRU vs FIFO)
function cacheTrace(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.accesses.length;
  const labW = 1.9, gap = 0.12;
  const cw = (w - 2 * mx - labW - n * gap) / n;
  const y0 = 1.85;
  text(ctx, 'Acceso', { x: mx, y: y0, w: labW, h: 0.55, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
  s.accesses.forEach((a, i) => {
    const x = mx + labW + gap + i * (cw + gap);
    circleLabel(ctx, { x: x + cw / 2 - 0.27, y: y0, d: 0.55, label: a, fill: ctx.T.navy.accent, color: ctx.T.navy.on, size: 22 });
  });
  s.rows.forEach((r, ri) => {
    const y = y0 + 0.75 + ri * 1.7;
    const runs = [{ text: r.label, options: { fontSize: 24, bold: true, color: colors.heading, breakLine: true } }, { text: r.sub, options: { fontSize: 14, color: colors.slate } }];
    text(ctx, runs, { x: mx, y, w: labW - 0.1, h: 1.45 });
    r.steps.forEach((st, i) => {
      const x = mx + labW + gap + i * (cw + gap);
      const t = ctx.T[st.hit ? 'green' : 'red'];
      ctx.slide.addText(st.cache.join('  '), {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y, w: cw, h: 0.75,
        fill: { color: t.soft }, line: { color: t.accent, width: 1.5 }, color: colors.heading, bold: true, fontSize: 20,
        fontFace: ctx.theme.fonts.code, align: 'center', valign: 'middle', margin: 0,
      });
      const lines = [{ text: st.hit ? 'hit' : 'miss', options: { fontSize: 17, bold: true, color: t.text } }];
      if (st.out) {
        lines[0].options.breakLine = true;
        lines.push({ text: 'sale ' + st.out, options: { fontSize: 15, color: colors.slate } });
      }
      text(ctx, lines, { x, y: y + 0.8, w: cw, h: 0.65, align: 'center' });
    });
  });
  if (s.callout) callout(ctx, { x: mx, y: 5.85, w: w - 2 * mx, h: 0.9, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ runs de un external merge-sort
function runs(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rowH = s.rowHeight || 0.98, y0 = 1.85, labW = 3.2;
  const pageW = (pg) => Math.max(0.7, pg.join(' ').length * 0.107 + 0.26);
  s.rows.forEach((r, i) => {
    const y = y0 + i * rowH;
    if (i > 0) ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: mx, y, w: w - 2 * mx, h: 0, line: { color: colors.border, width: 0.75 } });
    const lab = C.rich(r.label, ctx, { fontSize: 19, bold: true, color: colors.heading });
    lab[lab.length - 1].options.breakLine = true;
    lab.push(...C.rich(r.sub, ctx, { fontSize: 14, color: colors.slate }));
    text(ctx, lab, { x: mx, y, w: labW - 0.2, h: rowH, valign: 'middle' });
    let x = mx + labW;
    r.runs.forEach((run) => {
      const t = ctx.T[run.tone || 'slate'];
      const widths = run.pages.map(pageW);
      const inner = widths.reduce((a, b) => a + b, 0) + 0.1 * (widths.length - 1);
      box(ctx, { x, y: y + 0.1, w: inner + 0.2, h: rowH - 0.2, line: t.accent, lineWidth: 1.5, radius: 0.1 });
      let px = x + 0.1;
      run.pages.forEach((pg, k) => {
        ctx.slide.addText(pg.join(' '), {
          shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.06, x: px, y: y + (rowH - 0.5) / 2, w: widths[k], h: 0.5,
          fill: { color: t.soft }, line: { color: t.accent, width: 1 }, color: colors.ink, fontSize: 14,
          fontFace: ctx.theme.fonts.code, align: 'center', valign: 'middle', margin: 0,
        });
        px += widths[k] + 0.1;
      });
      x += inner + 0.2 + 0.3;
    });
  });
  if (s.callout) callout(ctx, { x: mx, y: y0 + s.rows.length * rowH + 0.15, w: w - 2 * mx, h: 0.8, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ árboles B / B+ con nodos de varias claves
function drawPanel(ctx, s, p, px, pw, top, bottom, cellW, cellH) {
  const { colors, fonts } = ctx.theme;
  let ty = top;
  if (p.title) {
    text(ctx, p.title, { x: px, y: top, w: pw, h: 0.42, fontSize: 17, bold: true, color: colors.slate, valign: 'middle', align: 'center' });
    ty += 0.55;
  }
  const labelW = p.rowLabels ? s.rowLabelW || 2.7 : 0;
  const treeW = Math.min(s.treeW || pw - labelW, pw - labelW);
  const ax = px + labelW + (pw - labelW - treeW) / 2;
  const cap = s.cap || 0;
  const nodeW = (n) => Math.max(n.keys.length, cap) * cellW;
  const maxW = Math.max(...p.nodes.map(nodeW));
  const span = bottom - ty - 0.3 - cellH - 0.55;
  const nodeTop = (yy) => ty + 0.3 + yy * span;

  const geo = {};
  p.nodes.forEach((n) => {
    const nw = nodeW(n);
    const cx = ax + maxW / 2 + n.x * (treeW - maxW);
    geo[n.id] = { cx, left: cx - nw / 2, w: nw, top: nodeTop(n.y), node: n };
  });

  (p.rowLabels || []).forEach((r) => {
    text(ctx, r.text, { x: px, y: nodeTop(r.y) - 0.15, w: labelW - 0.25, h: cellH + 0.3, fontSize: 16, color: colors.slate, valign: 'middle' });
  });

  const slots = {};
  (p.edges || []).forEach((e) => {
    const a = geo[e.from], b = geo[e.to];
    const slot = e.slot != null ? e.slot : (slots[e.from] = (slots[e.from] === undefined ? 0 : slots[e.from] + 1));
    const x1 = a.left + slot * cellW, y1 = a.top + cellH;
    const tx = b.left + (b.node.keys.length * cellW) / 2;
    arrow(ctx, { x1, y1, x2: tx, y2: b.top, color: e.hl ? colors.amberMid : colors.slate, width: e.hl ? 3.5 : 2, head: false });
    if (e.label) {
      const lx = (x1 + tx) / 2, ly = (y1 + b.top) / 2;
      ctx.slide.addText(e.label, {
        x: lx - 0.5, y: ly - 0.15, w: 1.0, h: 0.3, fill: { color: colors.bg }, color: colors.slate, fontSize: 14,
        fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
      });
    }
  });

  (p.links || []).forEach((l) => {
    const a = geo[l.from], b = geo[l.to];
    const yy = a.top + cellH / 2;
    arrow(ctx, { x1: a.left + a.w + 0.06, y1: yy, x2: b.left - 0.06, y2: yy, color: l.hl ? colors.amberMid : colors.teal, width: l.hl ? 3.5 : 2.5, both: true });
  });

  p.nodes.forEach((n) => {
    const g = geo[n.id];
    const tone = ctx.T[n.tone || 'teal'];
    const amber = ctx.T.amber;
    const cells = Math.max(n.keys.length, cap);
    for (let i = 0; i < cells; i++) {
      const x = g.left + i * cellW;
      if (i >= n.keys.length) {
        ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x, y: g.top, w: cellW, h: cellH, fill: { color: colors.bg }, line: { color: colors.border, width: 1, dashType: 'dash' } });
        continue;
      }
      const hl = (n.hl || []).includes(i);
      const fill = hl ? amber.accent : n.solid ? tone.accent : tone.soft;
      const line = hl ? amber.accent : n.solid ? colors.teal : tone.accent;
      const color = hl ? amber.on : n.solid ? tone.on : colors.heading;
      ctx.slide.addText(String(n.keys[i]), {
        shape: ctx.pptx.ShapeType.rect, x, y: g.top, w: cellW, h: cellH, fill: { color: fill }, line: { color: line, width: 1.5 },
        color, bold: true, fontSize: n.size || 18, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
      });
    }
    if (n.hlNode) {
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: g.left - 0.05, y: g.top - 0.05, w: g.w + 0.1, h: cellH + 0.1, fill: { type: 'none' }, line: { color: colors.amberMid, width: 3.5 } });
    }
    const lw = Math.max(g.w, 1.8);
    if (n.sub) text(ctx, n.sub, { x: g.cx - lw / 2, y: g.top + cellH + 0.07, w: lw, h: 0.32, fontSize: 14, color: colors.slate, align: 'center', valign: 'middle' });
    if (n.label) text(ctx, n.label, { x: g.cx - lw / 2, y: g.top - 0.36, w: lw, h: 0.3, fontSize: 14, bold: true, color: colors.tealDark, align: 'center', valign: 'middle' });
  });

  if (p.note) {
    const maxTop = Math.max(...Object.values(geo).map((g) => g.top));
    text(ctx, p.note, { x: px + labelW + 0.1, y: maxTop + cellH + 0.55, w: pw - labelW - 0.2, h: 0.9, fontSize: 16, color: colors.slate, align: 'center' });
  }
}

function btree(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const panels = s.panels || [{ title: s.panelTitle, nodes: s.nodes, edges: s.edges, links: s.links, rowLabels: s.rowLabels, note: s.note }];
  const top = s.top || 1.85;
  const bottom = s.treeBottom || (s.callout ? 5.65 : 6.6);
  const cellW = s.cellW || 0.5, cellH = s.cellH || 0.52;
  const sideW = s.side ? s.sideW || 4.4 : 0;
  const gapP = s.panelGap || 0.9;
  const areaW = w - 2 * mx - (sideW ? sideW + 0.4 : 0);
  const weights = s.panelWeights || panels.map(() => 1);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const usable = areaW - gapP * (panels.length - 1);
  let px = mx;
  panels.forEach((p, i) => {
    const pw = (usable * weights[i]) / wsum;
    drawPanel(ctx, s, p, px, pw, top, bottom, cellW, cellH);
    if (i < panels.length - 1) {
      const ay = top + 0.3 + (bottom - top) * 0.25;
      arrow(ctx, { x1: px + pw + 0.15, y1: ay, x2: px + pw + gapP - 0.15, y2: ay, color: colors.teal, width: 3.5 });
    }
    px += pw + gapP;
  });
  if (s.side) {
    let y = top + 0.1;
    s.side.forEach((c) => {
      const ch = c.h || 1.7;
      card(ctx, { titleSize: 20, textSize: 16, ...c }, { x: w - mx - sideW, y, w: sideW, h: ch });
      y += ch + 0.25;
    });
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.85, w: w - 2 * mx, h: 0.9, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ celda con texto (bloque de disco, franja, bloque del SO)
function cell(ctx, { x, y, w, h, label, tone = 'teal', solid = false, dashed = false, size = 16, font, color }) {
  const { colors, fonts } = ctx.theme;
  const t = ctx.T[tone];
  ctx.slide.addText(label == null ? '' : String(label), {
    shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.06, x, y, w, h,
    fill: { color: solid ? t.accent : dashed ? colors.bg : t.soft },
    line: { color: t.accent, width: 1.5, dashType: dashed ? 'dash' : 'solid' },
    color: color || (solid ? t.on : colors.heading), bold: true, fontSize: size,
    fontFace: font || fonts.code, align: 'center', valign: 'middle', margin: 0, lang: 'es-ES',
  });
}

// ------------------------------------------------------------------ RAID: técnicas con minidiscos (striping, mirroring, paridad)
// Campos: panels[{ title, tone, disks[{ label, blocks[{ t, parity }] }], text, footer }], panelHeight, callout
function raid(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.panels.length, gap = 0.3;
  const pw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = 1.85, ph = s.panelHeight || 3.95;
  s.panels.forEach((p, i) => {
    const x = mx + i * (pw + gap);
    const tone = p.tone || 'teal';
    const t = ctx.T[tone];
    C.surface(ctx, tone, { x, y: top, w: pw, h: ph });
    text(ctx, p.title, { x: x + 0.3, y: top + 0.2, w: pw - 0.6, h: 0.45, fontSize: 22, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    const nd = p.disks.length, dgap = 0.14;
    const dw = Math.min(1.05, (pw - 0.6 - (nd - 1) * dgap) / nd);
    const rowsN = Math.max(...p.disks.map((d) => d.blocks.length));
    const bh = 0.46, bgap = 0.08;
    const dh = 0.42 + rowsN * (bh + bgap);
    const dy = top + 0.8;
    let dx = x + (pw - (nd * dw + (nd - 1) * dgap)) / 2;
    p.disks.forEach((d) => {
      box(ctx, { x: dx, y: dy, w: dw, h: dh, fill: colors.bg, line: colors.border, radius: 0.1 });
      text(ctx, d.label, { x: dx, y: dy + 0.05, w: dw, h: 0.32, fontSize: 14, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
      d.blocks.forEach((b, k) => {
        cell(ctx, { x: dx + 0.07, y: dy + 0.42 + k * (bh + bgap), w: dw - 0.14, h: bh, label: b.t, tone: b.parity ? 'amber' : p.blockTone || tone, solid: !!b.parity, size: 16 });
      });
      dx += dw + dgap;
    });
    text(ctx, p.text, { x: x + 0.3, y: dy + dh + 0.15, w: pw - 0.6, h: 0.9, fontSize: 16, color: colors.slate });
    if (p.footer) text(ctx, p.footer, { x: x + 0.3, y: top + ph - 0.62, w: pw - 0.6, h: 0.4, fontSize: 15, bold: true, color: t.text, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: 0.8, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ bit de paridad (par / impar) calculado a partir de los datos
// Campos: columns[4], data[cadenas de bits], rules[2 callouts], callout
function paridad(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const W = w - 2 * mx;
  const cols = [2.9, 1.8, 3.6, 3.6].map((v) => (v / 11.9) * W);
  const xs = [];
  let acc = mx;
  cols.forEach((cw) => { xs.push(acc); acc += cw; });
  const y0 = 1.85, hh = 0.45, rh = 0.62;
  s.columns.forEach((hd, c) => text(ctx, hd, { x: xs[c], y: y0, w: cols[c], h: hh, fontSize: 16, bold: true, color: colors.slate, align: 'center', valign: 'middle' }));
  const charW = 0.2; // Consolas 24 pt
  s.data.forEach((d, r) => {
    const y = y0 + hh + r * rh;
    const ones = [...d].filter((b) => b === '1').length;
    const even = ones % 2 === 1 ? '1' : '0';
    const odd = even === '1' ? '0' : '1';
    const bandH = rh - 0.06, mid = y + bandH / 2;
    box(ctx, { x: mx, y, w: W, h: bandH, fill: colors.panel, line: colors.border, radius: 0.08 });
    const bitsAt = (str, cx) => text(ctx, str, { x: cx, y: mid - 0.22, w: str.length * charW, h: 0.44, fontSize: 24, bold: true, fontFace: fonts.code, color: colors.heading, valign: 'middle' });
    bitsAt(d, xs[0] + (cols[0] - d.length * charW) / 2);
    text(ctx, String(ones), { x: xs[1], y: mid - 0.22, w: cols[1], h: 0.44, fontSize: 22, color: colors.ink, align: 'center', valign: 'middle' });
    [even, odd].forEach((bit, k) => {
      const tw = d.length * charW + 0.06 + 0.38;
      const cx = xs[2 + k] + (cols[2 + k] - tw) / 2;
      bitsAt(d, cx);
      cell(ctx, { x: cx + d.length * charW + 0.06, y: mid - 0.23, w: 0.38, h: 0.46, label: bit, tone: 'amber', solid: true, size: 22 });
    });
  });
  const ry = y0 + hh + s.data.length * rh + 0.15;
  const k = (s.rules || []).length;
  const rw = (W - (k - 1) * 0.3) / Math.max(1, k);
  (s.rules || []).forEach((r, i) => callout(ctx, { x: mx + i * (rw + 0.3), y: ry, w: rw, h: 0.85, size: 16, ...r }));
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.95, w: W, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ RAID 5: franjas, paridad rotada y reconstrucción con XOR
// Campos: drives[], stripes[[bloques]], parity[disco de paridad por franja], failed, focus (franja), side{ text, note }, callout.
// Valida que el XOR de cada franja sea 0 y calcula los pasos de la reconstrucción.
function raid5(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const xor = (a, b) => (parseInt(a, 2) ^ parseInt(b, 2)).toString(2).padStart(a.length, '0');
  s.stripes.forEach((st, i) => {
    if (!/^0+$/.test(st.reduce(xor))) throw new Error(`externo-raid5: el XOR de la franja ${i + 1} no es cero`);
  });
  const nd = s.drives.length;
  const labW = 1.3, cw = 1.4, gap = 0.08, rh = 0.62, y0 = 1.85, hh = 0.8;
  const gx = mx + labW;
  s.drives.forEach((d, k) => {
    const x = gx + k * (cw + gap);
    text(ctx, d, { x, y: y0, w: cw, h: 0.36, fontSize: 16, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
    if (k === s.failed) chip(ctx, { x: x + 0.2, y: y0 + 0.42, w: cw - 0.4, h: 0.32, label: 'falló', tone: 'red', size: 14 });
  });
  const gridW = labW + nd * (cw + gap);
  s.stripes.forEach((st, i) => {
    const y = y0 + hh + i * (rh + gap);
    text(ctx, 'Franja ' + (i + 1), { x: mx, y, w: labW - 0.1, h: rh, fontSize: 16, color: colors.slate, valign: 'middle' });
    st.forEach((v, k) => {
      const x = gx + k * (cw + gap);
      if (k === s.failed) cell(ctx, { x, y, w: cw, h: rh, label: '????', tone: 'red', dashed: true, size: 20 });
      else cell(ctx, { x, y, w: cw, h: rh, label: s.parity[i] === k ? 'P ' + v : v, tone: s.parity[i] === k ? 'amber' : 'teal', size: 20 });
    });
    if (i === s.focus) {
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: mx - 0.08, y: y - 0.05, w: gridW + 0.04, h: rh + 0.1, fill: { type: 'none' }, line: { color: colors.amberMid, width: 3 } });
    }
  });
  text(ctx, s.legend || '', { x: mx, y: y0 + hh + s.stripes.length * (rh + gap) + 0.02, w: gridW, h: 0.3, fontSize: 14, color: colors.slate, valign: 'middle' });

  // Panel lateral: reconstrucción de la franja enfocada
  const f = s.focus;
  const others = s.stripes[f].filter((_, k) => k !== s.failed);
  const steps = [];
  let res = others[0];
  for (let k = 1; k < others.length; k++) {
    const r = xor(res, others[k]);
    steps.push(`${res} XOR ${others[k]} = ${r}`);
    res = r;
  }
  if (res !== s.stripes[f][s.failed]) throw new Error('externo-raid5: la reconstrucción no coincide con el bloque perdido');
  const px = mx + gridW + 0.35, pw = w - mx - px;
  C.surface(ctx, 'teal', { x: px, y: y0, w: pw, h: 3.6 });
  text(ctx, `Reconstruir la franja ${f + 1}`, { x: px + 0.3, y: y0 + 0.2, w: pw - 0.6, h: 0.45, fontSize: 21, bold: true, color: ctx.T.teal.text, fontFace: fonts.heading, valign: 'middle' });
  text(ctx, s.side.text, { x: px + 0.3, y: y0 + 0.8, w: pw - 0.6, h: 0.65, fontSize: 16, color: colors.slate });
  const runs = steps.map((ln, i) => ({ text: ln, options: { fontSize: 18, bold: true, fontFace: fonts.code, color: colors.heading, breakLine: i < steps.length - 1 } }));
  text(ctx, runs, { x: px + 0.3, y: y0 + 1.5, w: pw - 0.6, h: 0.8, lineSpacing: 26 });
  cell(ctx, { x: px + 0.3, y: y0 + 2.4, w: pw - 0.6, h: 0.62, label: `${s.drives[s.failed]}, franja ${f + 1} = ${res}`, tone: 'green', solid: true, size: 19, font: fonts.body });
  if (s.side.note) text(ctx, s.side.note, { x: px + 0.3, y: y0 + 3.1, w: pw - 0.6, h: 0.4, fontSize: 15, color: colors.slate, valign: 'middle' });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.95, w: w - 2 * mx, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ el disco visto por el SO: secuencia de bloques + preguntas
// Campos: intro, cells[] (rótulos; «…» deja un hueco), highlight (índice), highlightLabel, opsLabel, ops[], cards[], callout
function bloques(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const W = w - 2 * mx;
  if (s.intro) text(ctx, s.intro, { x: mx, y: 1.75, w: W, h: 0.45, fontSize: 18, color: colors.slate, valign: 'middle' });
  const n = s.cells.length, gap = 0.08, y = 2.35, h = 0.6;
  const cw = (W - (n - 1) * gap) / n;
  s.cells.forEach((c, i) => {
    const x = mx + i * (cw + gap);
    if (c === '…') {
      text(ctx, '…', { x, y, w: cw, h, fontSize: 26, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
      return;
    }
    const hi = i === s.highlight;
    cell(ctx, { x, y, w: cw, h, label: c, tone: hi ? 'amber' : 'teal', solid: hi, size: 16 });
    if (hi && s.highlightLabel) text(ctx, s.highlightLabel, { x: x + cw / 2 - 0.8, y: y + h + 0.05, w: 1.6, h: 0.32, fontSize: 15, bold: true, color: ctx.T.amber.text, align: 'center', valign: 'middle' });
  });
  const cy = 3.5;
  let x = mx;
  if (s.opsLabel) {
    const lw = s.opsLabel.length * 0.105 + 0.3;
    text(ctx, s.opsLabel, { x, y: cy, w: lw, h: 0.42, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
    x += lw + 0.1;
  }
  (s.ops || []).forEach((op) => {
    const ow = op.length * 0.115 + 0.6;
    chip(ctx, { x, y: cy, w: ow, h: 0.42, label: op, tone: 'teal', size: 16 });
    x += ow + 0.2;
  });
  const k = s.cards.length, cg = 0.3, kw = (W - (k - 1) * cg) / k;
  s.cards.forEach((c, i) => card(ctx, { tone: 'amber', titleSize: 21, textSize: 17, footerSize: 15, ...c }, { x: mx + i * (kw + cg), y: 4.2, w: kw, h: s.cardHeight || 2.05 }));
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.4, w: W, h: 0.5, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ asignación de bloques: contigua, lista enlazada, i-nodo
// Campos: blocks (12), legend[{ label, tone, solid, dashed }], rows[{ title, text, kind: contiguous|linked|inode, file[], others[], note }]
function asignacion(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const W = w - 2 * mx;
  const n = s.blocks || 12, bw = 0.5, bgap = 0.07, bh = 0.5;
  const stripW = n * bw + (n - 1) * bgap;
  const sx = w - mx - stripW;
  const labW = sx - mx - 0.4;
  const top = s.top || 2.25, rh = s.rowHeight || 1.4;
  const cx = (k) => sx + k * (bw + bgap) + bw / 2;
  let lx = mx;
  (s.legend || []).forEach((it) => {
    cell(ctx, { x: lx, y: 1.8, w: 0.3, h: 0.3, label: '', tone: it.tone, solid: it.solid, dashed: it.dashed });
    const tw = it.label.length * 0.1 + 0.2;
    text(ctx, it.label, { x: lx + 0.4, y: 1.75, w: tw, h: 0.4, fontSize: 15, color: colors.slate, valign: 'middle' });
    lx += 0.4 + tw + 0.3;
  });
  s.rows.forEach((r, i) => {
    const y = top + i * rh;
    if (i > 0) ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: mx, y: y - 0.03, w: W, h: 0, line: { color: colors.border, width: 0.75 } });
    const runs = C.rich(r.title, ctx, { fontSize: 22, bold: true, color: colors.heading, fontFace: fonts.heading });
    runs[runs.length - 1].options.breakLine = true;
    runs.push(...C.rich(r.text, ctx, { fontSize: 16, color: colors.slate }));
    text(ctx, runs, { x: mx, y: y + 0.05, w: labW, h: rh - 0.1, valign: 'middle' });
    const by = y + 0.78;
    const file = new Set(r.file), others = new Set(r.others || []);
    for (let k = 0; k < n; k++) {
      const mine = file.has(k), other = others.has(k);
      cell(ctx, { x: sx + k * (bw + bgap), y: by, w: bw, h: bh, label: k, tone: mine ? 'teal' : 'slate', solid: mine, dashed: !mine && !other, size: 14 });
    }
    const last = r.file[r.file.length - 1];
    if (r.kind === 'contiguous') {
      const x1 = cx(r.file[0]) - bw / 2, x2 = cx(last) + bw / 2;
      text(ctx, r.note || 'bloques consecutivos', { x: x1 - 0.5, y: by - 0.36, w: x2 - x1 + 1.0, h: 0.3, fontSize: 14, bold: true, color: colors.tealDark, align: 'center', valign: 'middle' });
    } else if (r.kind === 'linked') {
      const lane = by - 0.3;
      r.file.forEach((a, m) => {
        if (m === r.file.length - 1) return;
        const xa = cx(a) + 0.1, xb = cx(r.file[m + 1]) - 0.1;
        arrow(ctx, { x1: xa, y1: by, x2: xa, y2: lane, color: colors.amberMid, width: 2, head: false });
        arrow(ctx, { x1: xa, y1: lane, x2: xb, y2: lane, color: colors.amberMid, width: 2, head: false });
        arrow(ctx, { x1: xb, y1: lane, x2: xb, y2: by - 0.02, color: colors.amberMid, width: 2 });
      });
      text(ctx, r.note || 'fin', { x: cx(last) + 0.02, y: by - 0.36, w: 0.6, h: 0.3, fontSize: 14, bold: true, color: colors.amber, align: 'left', valign: 'middle' });
    } else if (r.kind === 'inode') {
      const bwid = 2.3, bx = sx + stripW / 2 - bwid / 2, byy = y + 0.05;
      cell(ctx, { x: bx, y: byy, w: bwid, h: 0.4, label: r.note || 'i-nodo del archivo', tone: 'amber', solid: true, size: 16, font: fonts.body });
      const m = r.file.length;
      r.file.forEach((k, j) => {
        arrow(ctx, { x1: bx + bwid / 2 + (j - (m - 1) / 2) * 0.5, y1: byy + 0.4, x2: cx(k), y2: by - 0.02, color: colors.amberMid, width: 2 });
      });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.55, w: W, h: 0.5, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ i-nodo: punteros directos e indirectos y tamaño máximo
// Campos: headers[4], rows[{ label, ptr, hops, count, size }], total{ label, formula, count, size }, callout
function inodo(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const W = w - 2 * mx;
  const colW = [2.3, 5.4, 2.35, W - 10.05];
  const xs = [mx, mx + 2.3, mx + 7.7, mx + 10.05];
  const y0 = 1.85, hh = 0.42, rh = s.rowHeight || 0.74;
  s.headers.forEach((hd, c) => {
    text(ctx, hd, { x: xs[c] + (c === 0 ? 0.15 : 0), y: y0, w: colW[c], h: hh, fontSize: 15, bold: true, color: colors.slate, valign: 'middle', align: c >= 2 ? 'center' : 'left' });
  });
  const all = [...s.rows, ...(s.total ? [{ ...s.total, isTotal: true }] : [])];
  all.forEach((r, i) => {
    const y = y0 + hh + i * rh + (r.isTotal ? 0.08 : 0);
    const bandH = rh - 0.08, mid = y + bandH / 2;
    box(ctx, { x: mx, y, w: W, h: bandH, fill: r.isTotal ? ctx.T.teal.soft : colors.panel, line: r.isTotal ? ctx.T.teal.accent : colors.border, radius: 0.08 });
    text(ctx, r.label, { x: xs[0] + 0.15, y, w: colW[0] - 0.15, h: bandH, fontSize: 17, bold: true, color: r.isTotal ? ctx.T.teal.text : colors.heading, valign: 'middle' });
    if (r.isTotal) {
      text(ctx, r.formula, { x: xs[1] + 0.1, y, w: colW[1] - 0.1, h: bandH, fontSize: 19, bold: true, color: colors.heading, valign: 'middle' });
    } else {
      const aW = 0.24, ptrW = 0.7, hopW = 0.95, dW = 0.8, ch = 0.4;
      let x = xs[1] + 0.1;
      chip(ctx, { x, y: mid - ch / 2, w: ptrW, h: ch, label: r.ptr, tone: 'navy', size: 15 });
      x += ptrW;
      for (let k = 0; k < r.hops; k++) {
        arrow(ctx, { x1: x + 0.02, y1: mid, x2: x + aW - 0.02, y2: mid, color: colors.slate, width: 2 });
        x += aW;
        chip(ctx, { x, y: mid - ch / 2, w: hopW, h: ch, label: 'punteros', tone: 'amber', solid: false, size: 15 });
        x += hopW;
      }
      arrow(ctx, { x1: x + 0.02, y1: mid, x2: x + aW - 0.02, y2: mid, color: colors.slate, width: 2 });
      x += aW;
      chip(ctx, { x, y: mid - ch / 2, w: dW, h: ch, label: 'datos', tone: 'teal', size: 15 });
    }
    text(ctx, r.count, { x: xs[2], y, w: colW[2], h: bandH, fontSize: 18, bold: true, color: colors.ink, align: 'center', valign: 'middle' });
    text(ctx, r.size, { x: xs[3], y, w: colW[3], h: bandH, fontSize: 18, bold: true, color: r.isTotal ? ctx.T.green.text : colors.ink, align: 'center', valign: 'middle' });
  });
  const end = y0 + hh + all.length * rh + 0.08;
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || Math.max(end + 0.2, 5.8), w: W, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ anatomía: disco -> partición -> estructuras del sistema de archivos
// Campos: diskLabel, disk[{ label, sub, w, tone }], zoom (índice en disk), zoomLabel, parts[{ label, title, text, w, tone }], callout
function layout(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const W = w - 2 * mx;
  const segBar = (items, y, h, numbered) => {
    const gap = 0.06;
    const total = items.reduce((a, g) => a + g.w, 0);
    const avail = W - gap * (items.length - 1);
    let x = mx;
    return items.map((g, i) => {
      const sw = (g.w / total) * avail;
      const t = ctx.T[g.tone || 'teal'];
      const runs = [{ text: (numbered ? `${i + 1}  ` : '') + g.label, options: { fontSize: 17, bold: true, color: t.text, breakLine: !!g.sub } }];
      if (g.sub) runs.push({ text: g.sub, options: { fontSize: 14, color: colors.ink } });
      ctx.slide.addText(runs, {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y, w: sw, h,
        fill: { color: g.dashed ? colors.bg : t.soft }, line: { color: t.accent, width: 2, dashType: g.dashed ? 'dash' : 'solid' },
        fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0, lang: 'es-ES',
      });
      const r = { x, w: sw };
      x += sw + gap;
      return r;
    });
  };
  text(ctx, s.diskLabel, { x: mx, y: 1.68, w: 8, h: 0.32, fontSize: 15, bold: true, color: colors.slate, valign: 'middle' });
  const topY = 2.05, topH = 0.62, lowY = 3.25, lowH = 0.65;
  const top = segBar(s.disk, topY, topH, false);
  const z = top[s.zoom];
  arrow(ctx, { x1: z.x, y1: topY + topH, x2: mx, y2: lowY, color: colors.slate, width: 1.5, head: false });
  arrow(ctx, { x1: z.x + z.w, y1: topY + topH, x2: mx + W, y2: lowY, color: colors.slate, width: 1.5, head: false });
  if (s.zoomLabel) text(ctx, s.zoomLabel, { x: mx + 2.6, y: topY + topH + 0.12, w: W - 5.2, h: 0.32, fontSize: 15, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
  segBar(s.parts, lowY, lowH, true);
  const k = Math.ceil(s.parts.length / 2), colw = (W - 0.4) / 2, ly = 4.1, lh = 0.6;
  s.parts.forEach((p, i) => {
    const col = Math.floor(i / k), row = i % k;
    const x = mx + col * (colw + 0.4), y = ly + row * lh;
    circleLabel(ctx, { x, y: y + 0.12, d: 0.36, label: String(i + 1), fill: ctx.T[p.tone || 'teal'].accent, color: ctx.T[p.tone || 'teal'].on, size: 15 });
    text(ctx, C.rich(`**${p.title}:** ${p.text}`, ctx, { fontSize: 16, color: colors.ink }), { x: x + 0.5, y, w: colw - 0.5, h: lh, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: W, h: 0.82, size: 16, ...s.callout });
}

// ================================================================== figuras dibujadas con formas (sustituyen a las imágenes del libro)

const rad = (deg) => (deg * Math.PI) / 180;
// Punto a distancia `r` del centro, con el ángulo en grados medido en sentido horario desde las 12.
const polar = (cx, cy, r, deg) => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];

function disc(ctx, cx, cy, r, { fill, line, lineWidth = 1 } = {}) {
  ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
    x: cx - r, y: cy - r, w: 2 * r, h: 2 * r,
    fill: fill ? { color: fill } : { type: 'none' }, line: line ? { color: line, width: lineWidth } : { type: 'none' },
  });
}

// Polígono relleno a partir de puntos absolutos (en pulgadas).
function polygon(ctx, pts, { fill, line, lineWidth = 1 }) {
  const x0 = Math.min(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1]));
  const pw = Math.max(...pts.map((p) => p[0])) - x0, ph = Math.max(...pts.map((p) => p[1])) - y0;
  const points = pts.map(([x, y], i) => (i === 0 ? { x: x - x0, y: y - y0, moveTo: true } : { x: x - x0, y: y - y0 }));
  points.push({ close: true });
  ctx.slide.addShape(ctx.pptx.ShapeType.custGeom, {
    x: x0, y: y0, w: Math.max(pw, 0.01), h: Math.max(ph, 0.01), points,
    fill: fill ? { color: fill } : { type: 'none' }, line: line ? { color: line, width: lineWidth } : { type: 'none' },
  });
}

// Sector anular: entre los radios r1 y r2 y los ángulos a1 y a2.
function annularSector(ctx, cx, cy, r1, r2, a1, a2, style) {
  const steps = Math.max(2, Math.ceil(Math.abs(a2 - a1) / 4));
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push(polar(cx, cy, r2, a1 + ((a2 - a1) * i) / steps));
  for (let i = steps; i >= 0; i--) pts.push(polar(cx, cy, r1, a1 + ((a2 - a1) * i) / steps));
  polygon(ctx, pts, style);
}

function figPanel(ctx, r) {
  const { colors } = ctx.theme;
  box(ctx, { x: r.x, y: r.y, w: r.w, h: r.h, fill: colors.panel, line: colors.border, radius: 0.12 });
}

// Rótulo con línea guía hacia (tx, ty). `y` es el centro del rótulo; `side`: 'left' (texto pegado a la derecha) o 'right'.
function callLabel(ctx, str, { x, w, y, side, tx, ty, h = 0.34, size = 14 }) {
  const { colors } = ctx.theme;
  text(ctx, str, { x, y: y - h / 2, w, h, fontSize: size, bold: true, color: colors.heading, align: side === 'left' ? 'right' : 'left', valign: 'middle' });
  arrow(ctx, { x1: side === 'left' ? x + w + 0.05 : x - 0.05, y1: y, x2: tx, y2: ty, color: colors.slate, width: 1.25 });
}

// ------------------------------------------------------------------ disco duro visto desde arriba: sus partes
// Campos (figure): labels{ chasis, platos, eje, brazo, cabezal }, headRadius (distancia del cabezal al eje, en pulgadas)
function figPartes(ctx, f, a) {
  const { colors } = ctx.theme;
  const T = ctx.T, L = f.labels;
  const colW = 1.3;
  const chX = a.x + colW + 0.05, chW = a.w - 2 * colW - 0.1, chY = a.y + 0.05, chH = a.h - 0.1;
  box(ctx, { x: chX, y: chY, w: chW, h: chH, fill: colors.codeBg, line: colors.slate, lineWidth: 2, radius: 0.12 });
  const r = Math.min((chW - 0.3) / 2, (chH - 1.0) / 2);
  const cx = chX + 0.15 + r, cy = chY + 0.2 + r;
  disc(ctx, cx, cy, r, { fill: T.navy.accent, line: colors.slate, lineWidth: 1.5 });
  [0.82, 0.64, 0.46].forEach((k) => disc(ctx, cx, cy, r * k, { line: colors.muted, lineWidth: 0.75 }));
  disc(ctx, cx, cy, 0.3, { fill: T.slate.accent, line: colors.slate, lineWidth: 1 });
  disc(ctx, cx, cy, 0.12, { fill: T.teal.accent });
  // Actuador, brazo y cabezal: el brazo gira sobre un pivote y lleva el cabezal hasta el plato
  const px = chX + chW - 0.5, py = chY + chH - 0.45;
  const len = Math.hypot(cx - px, cy - py), ux = (cx - px) / len, uy = (cy - py) / len;
  const hr = f.headRadius || 0.5;
  const hx = cx - ux * hr, hy = cy - uy * hr;
  box(ctx, { x: px - 0.38, y: py - 0.12, w: 0.76, h: 0.5, fill: T.amber.soft, line: T.amber.accent, lineWidth: 1.5, radius: 0.08 });
  arrow(ctx, { x1: px, y1: py, x2: hx, y2: hy, color: T.amber.accent, width: 8, head: false });
  disc(ctx, px, py, 0.14, { fill: T.amber.accent });
  disc(ctx, hx, hy, 0.09, { fill: T.red.accent });

  const lw = colW - 0.4, rx = chX + chW + 0.4, rw = a.x + a.w - rx;
  callLabel(ctx, L.chasis, { x: a.x, w: lw, y: chY + 0.25, side: 'left', tx: chX + 0.05, ty: chY + 0.25 });
  const py1 = chY + 0.95;
  callLabel(ctx, L.platos, { x: a.x, w: lw, y: py1, side: 'left', tx: cx - Math.sqrt(r * r - (py1 - cy) ** 2) + 0.06, ty: py1 });
  callLabel(ctx, L.eje, { x: a.x, w: lw, y: cy, side: 'left', tx: cx - 0.3, ty: cy });
  callLabel(ctx, L.cabezal, { x: rx, w: rw, y: hy, side: 'right', tx: hx + 0.1, ty: hy });
  const mx_ = (px + hx) / 2, my_ = (py + hy) / 2;
  callLabel(ctx, L.brazo, { x: rx, w: rw, y: my_ + 0.1, h: 0.55, side: 'right', tx: mx_ + 0.07, ty: my_ });
}

// ------------------------------------------------------------------ plato visto desde arriba: pistas, sectores, cluster, cabezal
// Campos (figure): tracks, sectors, hole (fracción del radio), track (pista resaltada, 0 = la más externa), sector (sector resaltado),
// cluster{ track, from, to }, head (pista bajo el cabezal), armAngle (grados, 12 en punto = 0), labels{ plato, pista, sectorPista, sectorDisco, cluster, cabezal, brazo }
function figPistas(ctx, f, a) {
  const { colors } = ctx.theme;
  const T = ctx.T, L = f.labels;
  const colW = 1.55;
  const R = Math.min((a.w - 2 * colW - 0.2) / 2, (a.h - 0.1) / 2);
  const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
  const rin = R * f.hole, tw = (R - rin) / f.tracks, sa = 360 / f.sectors;
  const band = (t) => [R - (t + 1) * tw, R - t * tw];
  const mid = (t) => (band(t)[0] + band(t)[1]) / 2;
  const sMid = (f.sector + 0.5) * sa;
  disc(ctx, cx, cy, R, { fill: colors.codeBg, line: colors.slate, lineWidth: 1.5 });
  annularSector(ctx, cx, cy, rin, R, f.sector * sa, (f.sector + 1) * sa, { fill: T.navy.accent });
  const cl = f.cluster, [c1, c2] = band(cl.track);
  annularSector(ctx, cx, cy, c1, c2, cl.from * sa, (cl.to + 1) * sa, { fill: T.green.accent });
  disc(ctx, cx, cy, mid(f.track), { line: T.teal.accent, lineWidth: tw * 72 });
  for (let k = 1; k < f.tracks; k++) disc(ctx, cx, cy, R - k * tw, { line: colors.muted, lineWidth: 0.75 });
  for (let k = 0; k < f.sectors; k++) {
    const [x1, y1] = polar(cx, cy, rin, k * sa), [x2, y2] = polar(cx, cy, R, k * sa);
    arrow(ctx, { x1, y1, x2, y2, color: colors.muted, width: 0.75, head: false });
  }
  annularSector(ctx, cx, cy, band(f.track)[0], band(f.track)[1], f.sector * sa, (f.sector + 1) * sa, { fill: T.red.accent });
  disc(ctx, cx, cy, rin, { fill: colors.panel, line: colors.muted, lineWidth: 1 });
  // Brazo actuador con el cabezal sobre una pista interior
  const ang = f.armAngle || 225;
  const [px, py] = polar(cx, cy, R + 0.1, ang), [hx, hy] = polar(cx, cy, mid(f.head), ang);
  arrow(ctx, { x1: px, y1: py, x2: hx, y2: hy, color: T.amber.accent, width: 7, head: false });
  disc(ctx, px, py, 0.2, { fill: T.amber.accent });
  disc(ctx, px, py, 0.08, { fill: colors.codeBg });
  disc(ctx, hx, hy, 0.06, { fill: colors.heading });

  const lw = colW - 0.3, lx = a.x, rx = a.x + a.w - colW + 0.3;
  const onCircle = (r, dy) => Math.sqrt(r * r - dy * dy);
  const ty1 = cy - 0.62 * R;
  callLabel(ctx, L.plato, { x: lx, w: lw, y: ty1, side: 'left', tx: cx - onCircle(R, ty1 - cy) + 0.04, ty: ty1 });
  const ty2 = cy - 0.3 * mid(f.track);
  callLabel(ctx, L.pista, { x: lx, w: lw, y: ty2, side: 'left', tx: cx - onCircle(mid(f.track), ty2 - cy), ty: ty2 });
  callLabel(ctx, L.cabezal, { x: lx, w: lw, y: hy, side: 'left', tx: hx - 0.08, ty: hy });
  const qx = px + 0.2 * (hx - px), qy = py + 0.2 * (hy - py);
  callLabel(ctx, L.brazo, { x: lx, w: lw, y: qy + 0.12, h: 0.5, side: 'left', tx: qx - 0.1, ty: qy });
  const [dx, dy] = polar(cx, cy, 0.96 * R, sMid);
  callLabel(ctx, L.sectorDisco, { x: rx, w: lw, y: dy, side: 'right', tx: dx + 0.05, ty: dy });
  const [sx, sy] = polar(cx, cy, mid(f.track), sMid);
  callLabel(ctx, L.sectorPista, { x: rx, w: lw, y: sy, side: 'right', tx: sx + 0.06, ty: sy });
  const [kx, ky] = polar(cx, cy, mid(cl.track), ((cl.from + cl.to + 1) / 2) * sa);
  callLabel(ctx, L.cluster, { x: rx, w: lw, y: ky, side: 'right', tx: kx + 0.06, ty: ky });
}

function hddPartes(ctx, s) {
  sideLayout(ctx, s, (c, r) => {
    figPanel(c, r);
    figPartes(c, s.figure, { x: r.x + 0.15, y: r.y + 0.15, w: r.w - 0.3, h: r.h - 0.3 });
  });
}

function hddPistas(ctx, s) {
  sideLayout(ctx, s, (c, r) => {
    figPanel(c, r);
    figPistas(c, s.figure, { x: r.x + 0.15, y: r.y + 0.15, w: r.w - 0.3, h: r.h - 0.3 });
  });
}

// ------------------------------------------------------------------ pirámide de la jerarquía de memoria
// Campos: levels[{ level, label, tone }] (de arriba hacia abajo), axisUp, axisDown, groups[{ from, to, label, tone }], callout
function piramide(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.levels.length, top = 1.9, bh = s.bandH || 0.6, gap = 0.05;
  const H = n * bh + (n - 1) * gap;
  const bottomW = s.bottomW || 6.2, topW = s.topW || 3.0, axW = 1.55;
  const px = mx + axW + 0.25, cx = px + bottomW / 2;
  const yTop = (i) => top + i * (bh + gap);
  const widthAt = (y) => topW + ((bottomW - topW) * (y - top)) / H;
  s.levels.forEach((lv, i) => {
    const t = ctx.T[lv.tone || 'teal'];
    const y1 = yTop(i), y2 = y1 + bh, w1 = widthAt(y1), w2 = widthAt(y2);
    polygon(ctx, [[cx - w1 / 2, y1], [cx + w1 / 2, y1], [cx + w2 / 2, y2], [cx - w2 / 2, y2]], { fill: t.accent });
    text(ctx, lv.label, { x: cx - w1 / 2 + 0.15, y: y1, w: w1 - 0.3, h: bh, fontSize: 17, bold: true, color: t.on, fontFace: fonts.heading, align: 'center', valign: 'middle' });
    text(ctx, lv.level, { x: px + bottomW + 0.15, y: y1, w: 1.1, h: bh, fontSize: 17, bold: true, color: t.text, valign: 'middle' });
  });
  // Ejes: arriba más costo y velocidad; abajo más capacidad y tiempo de acceso
  const ax1 = mx + 0.6, ax2 = mx + 1.4;
  arrow(ctx, { x1: ax1, y1: top + H, x2: ax1, y2: top, color: ctx.T.teal.accent, width: 2.5 });
  arrow(ctx, { x1: ax2, y1: top, x2: ax2, y2: top + H, color: ctx.T.amber.accent, width: 2.5 });
  text(ctx, s.axisUp, { x: mx, y: top, w: 0.45, h: H, fontSize: 15, bold: true, color: ctx.T.teal.text, vert: 'vert270', align: 'center', valign: 'middle' });
  text(ctx, s.axisDown, { x: mx + 0.8, y: top, w: 0.45, h: H, fontSize: 15, bold: true, color: ctx.T.amber.text, vert: 'vert270', align: 'center', valign: 'middle' });
  // Llaves que agrupan niveles
  const gx = px + bottomW + 1.35;
  (s.groups || []).forEach((g) => {
    const t = ctx.T[g.tone || 'teal'];
    const y1 = yTop(g.from) + 0.04, y2 = yTop(g.to) + bh - 0.04;
    arrow(ctx, { x1: gx, y1, x2: gx, y2, color: t.accent, width: 2.5, head: false });
    arrow(ctx, { x1: gx - 0.1, y1, x2: gx, y2: y1, color: t.accent, width: 2.5, head: false });
    arrow(ctx, { x1: gx - 0.1, y1: y2, x2: gx, y2, color: t.accent, width: 2.5, head: false });
    text(ctx, g.label, { x: gx + 0.2, y: y1, w: w - mx - gx - 0.2, h: y2 - y1, fontSize: 17, bold: true, color: t.text, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: 5.95, w: w - 2 * mx, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ external merge: disco | buffer, paso a paso
const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

// Simula las acciones (read, merge, write) y devuelve una instantánea por estado (el 0 es el inicial).
function mergeStates(m) {
  const n = m.pageSize, K = m.lists.length;
  const pages = m.lists.map((l) => chunk(l.data, n));
  const consumed = Array(K).fill(0), inF = Array.from({ length: K }, () => []);
  let outF = [], written = [];
  const load = (i) => {
    if (!inF[i].length && consumed[i] < pages[i].length) inF[i] = [...pages[i][consumed[i]++]];
  };
  const acts = {
    read: () => { for (let i = 0; i < K; i++) load(i); },
    merge: () => {
      while (outF.length < n) {
        for (let i = 0; i < K; i++) load(i);
        let best = -1;
        inF.forEach((f, i) => { if (f.length && (best < 0 || f[0] < inF[best][0])) best = i; });
        if (best < 0) break;
        outF.push(inF[best].shift());
      }
    },
    write: () => { if (outF.length) { written.push(outF); outF = []; } },
  };
  const snap = (action) => ({ action, consumed: [...consumed], inF: inF.map((f) => [...f]), outF: [...outF], written: written.map((p) => [...p]) });
  const states = [snap(null)];
  (m.actions || []).forEach((a) => {
    if (!acts[a]) throw new Error(`externo-merge: acción desconocida «${a}»`);
    acts[a]();
    states.push(snap(a));
  });
  return states;
}

// Medidas de la figura (las mismas en todos los estados, para que los recipientes no cambien de tamaño).
function mergeMetrics(m, fs, padC) {
  const n = m.pageSize, sep = m.sep || ', ';
  const charW = fs * 0.0077, gapP = 0.1;
  const pw = (arr) => Math.max(0.5, arr.join(sep).length * charW + 0.16);
  const ph = (fs / 72) * 1.2 + 0.1;
  const rows = [...m.lists.map((r, i) => ({ ...r, live: i })), ...(m.others || [])].map((r) => {
    const pages = chunk(r.data, n);
    const widths = pages.map(pw);
    return { ...r, pages, widths, total: widths.reduce((a, b) => a + b, 0) + gapP * (widths.length - 1) };
  });
  const cw = Math.max(...rows.map((r) => r.total)) + 2 * padC;
  const maxLen = Math.max(...[...m.lists, ...(m.others || [])].flatMap((r) => r.data).map((v) => String(v).length));
  const fullW = (n * maxLen + (n - 1) * sep.length) * charW + 0.16;
  const fLab = 0.36, fw = fullW + 0.12 + fLab;
  const rowH = ph + 2 * padC, outRows = (m.output && m.output.rows) || 1;
  const outH = outRows * ph + (outRows - 1) * gapP + 2 * padC;
  const heights = [...rows.map(() => rowH), outH], rowGap = 0.1;
  const rowTop = [];
  let acc = 0;
  heights.forEach((h) => { rowTop.push(acc); acc += h + rowGap; });
  const lw = m.labelW || 1.0, mid = m.gapMid || 1.0, headH = 0.3;
  return { fs, ph, padC, gapP, pw, sep, rows, cw, fw, fLab, rowH, outH, rowTop, lw, mid, headH, natW: lw + cw + mid + fw, natH: headH + 0.06 + acc - rowGap };
}

function drawMerge(ctx, m, M, st, rect) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  if (M.natW + 0.3 > rect.w + 0.01) throw new Error(`externo-merge: la figura (${(M.natW + 0.3).toFixed(2)}) no cabe en ${rect.w.toFixed(2)}`);
  if (M.natH + 0.24 > rect.h + 0.01) throw new Error(`externo-merge: la figura (${(M.natH + 0.24).toFixed(2)}) no cabe en ${rect.h.toFixed(2)} de alto`);
  figPanel(ctx, rect);
  const x0 = rect.x + (rect.w - M.natW) / 2, y0 = rect.y + (rect.h - M.natH) / 2;
  const cx0 = x0 + M.lw, fx = cx0 + M.cw + M.mid, top = y0 + M.headH + 0.06;
  const L = m.labels;
  text(ctx, L.disk, { x: cx0, y: y0, w: M.cw + M.mid - 0.1, h: M.headH, fontSize: 15, bold: true, color: colors.slate, valign: 'middle' });
  text(ctx, L.buffer, { x: fx, y: y0, w: rect.x + rect.w - fx - 0.1, h: M.headH, fontSize: 15, bold: true, color: colors.slate, valign: 'middle' });
  const divX = cx0 + M.cw + M.mid / 2;
  arrow(ctx, { x1: divX, y1: y0, x2: divX, y2: y0 + M.natH, color: colors.muted, width: 1.25, head: false });

  const dashed = (x, y, w, h) =>
    ctx.slide.addShape(ctx.pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: colors.bg }, line: { color: colors.slate, width: 1.25, dashType: 'dash' } });
  const K = m.lists.length;
  M.rows.forEach((r, i) => {
    const y = top + M.rowTop[i];
    const t = T[r.tone || 'slate'];
    text(ctx, r.label, { x: x0, y, w: M.lw - 0.1, h: M.rowH, fontSize: 15, bold: true, color: t.text, valign: 'middle' });
    dashed(cx0, y, M.cw, M.rowH);
    let px = cx0 + M.padC;
    r.pages.forEach((pg, j) => {
      const gone = r.live !== undefined && j < st.consumed[r.live];
      if (!gone) cell(ctx, { x: px, y: y + M.padC, w: r.widths[j], h: M.ph, label: pg.join(M.sep), tone: r.tone, size: M.fs });
      px += r.widths[j] + M.gapP;
    });
  });
  // Lista de salida: las páginas escritas se acomodan en filas
  const oi = M.rows.length, oy = top + M.rowTop[oi], ot = T[m.output.tone || 'green'];
  text(ctx, m.output.label, { x: x0, y: oy, w: M.lw - 0.1, h: M.outH, fontSize: 15, bold: true, color: ot.text, valign: 'middle' });
  dashed(cx0, oy, M.cw, M.outH);
  let px = cx0 + M.padC, py = oy + M.padC;
  st.written.forEach((pg) => {
    const pgw = M.pw(pg);
    if (px + pgw > cx0 + M.cw - M.padC + 0.001) { px = cx0 + M.padC; py += M.ph + M.gapP; }
    if (py + M.ph > oy + M.outH) throw new Error('externo-merge: la lista de salida no cabe');
    cell(ctx, { x: px, y: py, w: pgw, h: M.ph, label: pg.join(M.sep), tone: m.output.tone || 'green', size: M.fs });
    px += pgw + M.gapP;
  });
  // Frames del buffer: uno por lista de entrada y uno de salida
  const frame = (y, name, data, tone) => {
    dashed(fx, y, M.fw, M.rowH);
    text(ctx, name, { x: fx + 0.08, y, w: M.fLab, h: M.rowH, fontSize: 13, bold: true, color: colors.slate, valign: 'middle' });
    if (!data.length) return;
    const cwid = M.pw(data), areaX = fx + M.fLab, areaW = M.fw - M.fLab;
    cell(ctx, { x: areaX + (areaW - cwid) / 2, y: y + M.padC, w: cwid, h: M.ph, label: data.join(M.sep), tone, size: M.fs });
  };
  for (let i = 0; i < K; i++) frame(top + M.rowTop[i], `F${i + 1}`, st.inF[i], M.rows[i].tone);
  frame(oy, `F${K + 1}`, st.outF, m.output.tone || 'green');
  // Flechas de lectura y escritura; la acción del estado se resalta
  const labW = Math.min(1.2, M.mid - 0.06);
  const lab = (str, y, on) =>
    text(ctx, str, { x: divX - labW / 2, y: y - 0.3, w: labW, h: 0.26, fontSize: 14, bold: true, color: on ? T.amber.text : colors.slate, align: 'center', valign: 'middle', fill: { color: colors.panel } });
  const rx1 = cx0 + M.cw + 0.08, rx2 = fx - 0.08;
  for (let i = 0; i < K; i++) {
    const yc = top + M.rowTop[i] + M.rowH / 2;
    arrow(ctx, { x1: rx1, y1: yc, x2: rx2, y2: yc, color: st.action === 'read' ? T.amber.accent : colors.slate, width: st.action === 'read' ? 3.5 : 2.5 });
  }
  lab(L.read, top + M.rowTop[0] + M.rowH / 2 - 0.02, st.action === 'read');
  const wy = oy + M.rowH / 2;
  arrow(ctx, { x1: rx2, y1: wy, x2: rx1, y2: wy, color: st.action === 'write' ? T.amber.accent : colors.slate, width: st.action === 'write' ? 3.5 : 2.5 });
  lab(L.write, wy - 0.02, st.action === 'write');
}

// Campos: pageSize, sep, labels{ disk, buffer, read, write }, lists[{ label, tone, data[] }] (ordenadas, se mezclan),
// others[{ label, tone, data[] }] (otros archivos en disco, fijos), output{ label, tone, rows }, actions[] (read | merge | write),
// states[{ after (n.º de acciones aplicadas), caption, n }], arrange: side (un estado + items) | stack | columns, items, callout
function merge(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const states = mergeStates(s);
  const shown = s.states.map((x) => {
    if (!states[x.after]) throw new Error(`externo-merge: no existe el estado ${x.after}`);
    return { ...x, st: states[x.after] };
  });
  const arrange = s.arrange || (shown.length === 1 ? 'side' : 'stack');
  const M = mergeMetrics(s, s.fontSize || 16, s.rowPad || 0.1);
  if (arrange === 'side') {
    sideLayout(ctx, s, (c, r) => drawMerge(c, s, M, shown[0].st, r));
    return;
  }
  const top = 1.85, bottom = s.callout ? 5.7 : 6.75, n = shown.length;
  const badge = (x, y, num) => circleLabel(ctx, { x, y, d: 0.46, label: String(num), fill: ctx.T.navy.accent, color: ctx.T.navy.on, size: 20 });
  if (arrange === 'stack') {
    const gap = 0.15, ph = (bottom - top - gap * (n - 1)) / n, capW = s.captionW || 3.3, fx = mx + capW + 0.3;
    shown.forEach((x, i) => {
      const y = top + i * (ph + gap);
      badge(mx, y + ph / 2 - 0.23, x.n || i + 1);
      text(ctx, x.caption, { x: mx + 0.65, y, w: capW - 0.65, h: ph, fontSize: 17, color: colors.ink, valign: 'middle' });
      drawMerge(ctx, s, M, x.st, { x: fx, y, w: w - mx - fx, h: ph });
    });
  } else {
    const gap = 0.3, pw = (w - 2 * mx - gap * (n - 1)) / n, ph = M.natH + 0.24;
    shown.forEach((x, i) => {
      const px = mx + i * (pw + gap);
      drawMerge(ctx, s, M, x.st, { x: px, y: top, w: pw, h: ph });
      badge(px, top + ph + 0.15, x.n || i + 1);
      text(ctx, x.caption, { x: px + 0.6, y: top + ph + 0.1, w: pw - 0.6, h: 0.9, fontSize: 16, color: colors.ink, valign: 'middle' });
    });
  }
  if (s.callout) callout(ctx, { x: mx, y: 5.9, w: w - 2 * mx, h: 0.85, size: 16, ...s.callout });
}

module.exports = {
  'externo-hdd-partes': hddPartes,
  'externo-hdd-pistas': hddPistas,
  'externo-piramide': piramide,
  'externo-merge': merge,
  'externo-image-side': imageSide,
  'externo-images': images,
  'externo-timebar': timebar,
  'externo-bars': bars,
  'externo-partitions': partitions,
  'externo-cache-flow': cacheFlow,
  'externo-cache-trace': cacheTrace,
  'externo-runs': runs,
  'externo-btree': btree,
  'externo-raid': raid,
  'externo-paridad': paridad,
  'externo-raid5': raid5,
  'externo-bloques': bloques,
  'externo-asignacion': asignacion,
  'externo-inodo': inodo,
  'externo-layout': layout,
};
