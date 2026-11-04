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

// ------------------------------------------------------------------ imagen + puntos clave
function imageSide(ctx, s) {
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
  box(ctx, { x: ix, y: top, w: imgW, h: bottom - top, fill: WHITE, radius: 0.15 });
  C.image(ctx, s.image, { x: ix + 0.15, y: top + 0.15, w: imgW - 0.3, h: bottom - top - 0.3 }, s.alt);

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
  const barW = w - 2 * mx, gap = 0.05, y = 2.45, h = 0.8;
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
  if (s.bracket) {
    const x1 = xs[s.bracket.from], x2 = xs[s.bracket.to] + widths[s.bracket.to];
    const by = y - 0.14;
    arrow(ctx, { x1, y1: by, x2, y2: by, color: colors.tealDark, width: 2, head: false });
    arrow(ctx, { x1, y1: by, x2: x1, y2: by + 0.1, color: colors.tealDark, width: 2, head: false });
    arrow(ctx, { x1: x2, y1: by, x2, y2: by + 0.1, color: colors.tealDark, width: 2, head: false });
    text(ctx, s.bracket.label, { x: x1, y: by - 0.45, w: x2 - x1, h: 0.4, fontSize: 18, bold: true, color: colors.tealDark, align: 'center', valign: 'middle' });
  }
  const cg = 0.3, cw = (barW - cg * (n - 1)) / n;
  s.segments.forEach((g, i) => {
    card(ctx, { title: g.label, text: g.text, footer: g.range, tone: g.tone, titleSize: 20, textSize: 16, footerSize: 17 }, { x: mx + i * (cw + cg), y: 3.55, w: cw, h: 2.4 });
  });
  if (s.callout) callout(ctx, { x: mx, y: 6.07, w: barW, h: 0.78, size: 16, ...s.callout });
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

module.exports = {
  'externo-image-side': imageSide,
  'externo-images': images,
  'externo-timebar': timebar,
  'externo-bars': bars,
  'externo-partitions': partitions,
  'externo-cache-flow': cacheFlow,
  'externo-cache-trace': cacheTrace,
  'externo-runs': runs,
  'externo-btree': btree,
};
