// Diagramas específicos de la lección «Diseño de Algoritmos» (kind con prefijo `diseno-`).
// Se cargan solos desde diagrams.js. Solo usan colores semánticos del tema.
const C = require('./components');

const { text, chip, circleLabel, arrow, callout, codeBlock, card, table, surface, cellBox } = C;

const chipW = (label, size = 14) => String(label).length * (size * 0.0072) + 0.45;

// ------------------------------------------------------------------ matriz / arreglo de celdas
// Tabla con encabezados, celdas resaltadas, línea de corte vertical y, opcionalmente, un bloque de código a la izquierda.
// Campos: cells[[...]], colHeaders[], rowHeaders[], corner, headW, cellW, cellH, size, tones[[tono|null]], highlight[[fila,col,tono]],
//         vline{after,label}, rowTags[{row,label,tone}], code{code,lang,size,w,label}, label, legend[{label,tone}] (chips en la fila del rótulo),
//         cards[], callout o callouts[] (varios lado a lado),
//         colW[] (ancho de cada columna de datos; por defecto cellW), headerSize (tamaño del encabezado; por defecto size).
function matriz(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const cells = s.cells;
  const nc = Math.max(...cells.map((r) => r.length));
  const hasRowH = !!s.rowHeaders;
  const hasColH = !!s.colHeaders;
  const cellW = s.cellW || 0.7;
  const cellH = s.cellH || 0.55;
  const off = hasRowH ? 1 : 0;
  const colW = [...(hasRowH ? [s.headW || 1.0] : []), ...(s.colW || Array(nc).fill(cellW))];
  const tw = colW.reduce((a, b) => a + b, 0);
  const top = s.top || 2.35;

  let rx = mx;
  let rw = w - 2 * mx;
  if (s.code) {
    const cw = s.code.w || 6.2;
    if (s.code.label) text(ctx, s.code.label, { x: mx, y: top - 0.45, w: cw, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
    codeBlock(ctx, { x: mx, y: top, w: cw, code: s.code.code, lang: s.code.lang, fontSize: s.code.size || 14 });
    rx = mx + cw + 0.45;
    rw = w - mx - rx;
  }
  const legendW = (s.legend || []).reduce((a, g) => a + chipW(g.label, 14) + 0.15, 0);
  if (s.label) text(ctx, s.label, { x: rx, y: top - 0.45, w: rw - legendW, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  let lgx = rx + rw - legendW + 0.15;
  (s.legend || []).forEach((g) => {
    const lw = chipW(g.label, 14);
    chip(ctx, { x: lgx, y: top - 0.48, w: lw, h: 0.38, label: g.label, tone: g.tone, size: 14 });
    lgx += lw + 0.15;
  });

  const tx = rx + (rw - tw) / 2;
  const hl = {};
  (s.highlight || []).forEach(([r, c, tone]) => {
    hl[r + ',' + c] = tone || 'teal';
  });
  const header = hasColH ? [...(hasRowH ? [s.corner || ''] : []), ...s.colHeaders] : undefined;
  const rows = cells.map((r, i) => [
    ...(hasRowH ? [s.rowHeaders[i]] : []),
    ...Array.from({ length: nc }, (_, k) => (r[k] === undefined || r[k] === null ? '' : r[k])),
  ]);
  const t = table(ctx, {
    x: tx, y: top, colW, header, rows, rowH: cellH, fontSize: s.size || 20, headerSize: s.headerSize, align: 'center',
    cellStyle: (ri, c) => {
      const k = c - off;
      if (k < 0) return { bold: true, color: colors.heading, fill: colors.panel };
      const tone = hl[ri + ',' + k];
      if (tone) return { fill: ctx.T[tone].accent, color: ctx.T[tone].on, bold: true };
      const soft = s.tones && s.tones[ri] && s.tones[ri][k];
      if (soft) return { fill: ctx.T[soft].soft, color: ctx.T[soft].text, bold: true };
      return {};
    },
  });
  const rowTop = (i) => t.rowTop(i + (hasColH ? 1 : 0));

  if (s.vline) {
    const lx = t.colLeft(off + s.vline.after + 1);
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: lx, y: top - 0.15, w: 0, h: t.h + 0.3, line: { color: colors.heading, width: 3, dashType: 'dash' },
    });
    if (s.vline.label) {
      text(ctx, s.vline.label, { x: lx - 1.5, y: top + t.h + 0.2, w: 3, h: 0.4, fontSize: 16, bold: true, color: colors.heading, align: 'center', valign: 'middle' });
    }
  }
  (s.rowTags || []).forEach((g) => {
    chip(ctx, { x: tx + tw + 0.3, y: rowTop(g.row) + (cellH - 0.4) / 2, w: chipW(g.label, 15), h: 0.4, label: g.label, tone: g.tone || 'teal', size: 15 });
  });
  if (s.cards) {
    const k = s.cards.length;
    const gap = 0.25;
    const cw = (rw - (k - 1) * gap) / k;
    const cy = top + t.h + (s.vline ? 0.9 : 0.4);
    s.cards.forEach((c, i) => card(ctx, { textSize: 16, ...c }, { x: rx + i * (cw + gap), y: cy, w: cw, h: c.h || 1.6 }));
  }
  if (s.callouts) {
    const k = s.callouts.length;
    const cwid = (w - 2 * mx - (k - 1) * 0.3) / k;
    s.callouts.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + 0.3), y: s.calloutY || 5.9, w: cwid, h: s.calloutH || 0.85, size: 16, ...c }));
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: s.calloutH || 0.75, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ tableros de ajedrez (N-reinas)
// Campos: boards[{title,n,queens[[fila,col]],attacked[[fila,col]],conflicts[[fila,col]],caption}], boardSize, boardsW,
//         cards[] o steps[] (a la derecha cuando hay boardsW), callout.
function tablero(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = s.top || 2.4;
  const rw = s.boardsW || w - 2 * mx;
  const k = s.boards.length;
  const gap = 0.45;
  const size = Math.min(s.boardSize || 3.0, (rw - (k - 1) * gap) / k);
  const key = (r, c) => r + ',' + c;
  let bx = mx + (rw - (k * size + (k - 1) * gap)) / 2;
  s.boards.forEach((b) => {
    const n = b.n || s.n || 4;
    const cs = size / n;
    if (b.title) text(ctx, b.title, { x: bx - 0.2, y: top - 0.5, w: size + 0.4, h: 0.4, fontSize: 18, bold: true, color: colors.heading, align: 'center', valign: 'middle' });
    const attacked = new Set((b.attacked || []).map(([r, c]) => key(r, c)));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const bad = attacked.has(key(r, c));
        ctx.slide.addText(bad ? '×' : '', {
          shape: ctx.pptx.ShapeType.rect, x: bx + c * cs, y: top + r * cs, w: cs, h: cs,
          fill: { color: bad ? ctx.T.red.soft : (r + c) % 2 ? colors.border : colors.panel },
          line: { color: colors.border, width: 1 }, color: ctx.T.red.text, bold: true, fontSize: Math.round(cs * 40),
          fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
        });
      }
    }
    const conflicts = new Set((b.conflicts || []).map(([r, c]) => key(r, c)));
    (b.queens || []).forEach(([r, c]) => {
      const T = ctx.T[conflicts.has(key(r, c)) ? 'red' : 'teal'];
      const d = cs * 0.7;
      ctx.slide.addText('R', {
        shape: ctx.pptx.ShapeType.ellipse, x: bx + c * cs + (cs - d) / 2, y: top + r * cs + (cs - d) / 2, w: d, h: d,
        fill: { color: T.accent }, line: { type: 'none' }, color: T.on, bold: true, fontSize: Math.round(d * 40),
        fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
      });
    });
    if (b.caption) text(ctx, b.caption, { x: bx - 0.2, y: top + size + 0.1, w: size + 0.4, h: 0.65, fontSize: 16, color: colors.slate, align: 'center' });
    bx += size + gap;
  });

  if (s.boardsW) {
    const rx = mx + rw + 0.5;
    const rW = w - mx - rx;
    let y = top - 0.5;
    (s.cards || []).forEach((c) => {
      const h = c.h || 1.4;
      card(ctx, { textSize: 17, ...c }, { x: rx, y, w: rW, h });
      y += h + 0.2;
    });
    (s.steps || []).forEach((st, i) => {
      const sy = top - 0.35 + i * 0.95;
      circleLabel(ctx, { x: rx, y: sy + 0.1, d: 0.55, label: String(i + 1), fill: colors.teal, color: ctx.T.teal.on, size: 20 });
      text(ctx, st, { x: rx + 0.8, y: sy, w: rW - 0.8, h: 0.75, fontSize: 20, color: colors.ink, valign: 'middle' });
    });
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.05, w: w - 2 * mx, h: s.calloutH || 0.7, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ árbol con cajas de texto (árbol de recursión)
// Campos: nodes[{id,label,x,y,tone}] (x, y en 0–1), edges[{from,to}], nodeW, nodeH, size, treeHeight, legend[{label,tone}], note, callout.
function arbol(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const y0 = s.top || 2.0;
  const th = s.treeHeight || 3.2;
  const nw = s.nodeW || 2.3;
  const nh = s.nodeH || 0.6;
  const aw = w - 2 * mx;
  const pos = {};
  s.nodes.forEach((n) => {
    pos[n.id] = { cx: mx + nw / 2 + n.x * (aw - nw), cy: y0 + nh / 2 + n.y * (th - nh) };
  });
  s.edges.forEach((e) => {
    const a = pos[e.from];
    const b = pos[e.to];
    arrow(ctx, { x1: a.cx, y1: a.cy + nh / 2, x2: b.cx, y2: b.cy - nh / 2, color: colors.slate, width: 2.5, head: s.arrows !== false });
  });
  s.nodes.forEach((n) => {
    const p = pos[n.id];
    const T = ctx.T[n.tone || 'slate'];
    ctx.slide.addText(n.label, {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.1, x: p.cx - nw / 2, y: p.cy - nh / 2, w: nw, h: nh,
      fill: { color: T.soft }, line: { color: T.accent, width: n.tone ? 2.5 : 1.5 }, color: n.tone ? T.text : colors.heading,
      bold: true, fontSize: s.size || 17, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
    });
  });
  const ly = y0 + th + 0.3;
  let lx = mx;
  (s.legend || []).forEach((g) => {
    const lw = chipW(g.label, 14) + 0.2;
    chip(ctx, { x: lx, y: ly, w: lw, h: 0.38, label: g.label, tone: g.tone, size: 14 });
    lx += lw + 0.2;
  });
  if (s.note) text(ctx, s.note, { x: lx + 0.1, y: ly, w: w - mx - lx - 0.1, h: 0.38, fontSize: 15, italic: true, color: colors.slate, valign: 'middle' });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.85, w: w - 2 * mx, h: s.calloutH || 0.8, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ filtro de Bloom
// Campos: intro, bits[0|1], set[], shared[], probe[], word, wordTone, hashes[], formulas[], card{title,text,tone,h}, callout.
function bloom(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  if (s.intro) text(ctx, s.intro, { x: mx, y: 1.65, w: w - 2 * mx, h: 0.5, fontSize: 19, color: colors.slate, valign: 'middle' });
  const m = s.bits.length;
  const cw = 1.0;
  const gap = 0.08;
  const ch = 0.7;
  const x0 = (w - (m * cw + (m - 1) * gap)) / 2;
  const y = s.top || 2.55;
  const cx = (i) => x0 + i * (cw + gap) + cw / 2;
  const fresh = new Set(s.set || []);
  const marked = new Set([...(s.shared || []), ...(s.probe || [])]);
  s.bits.forEach((b, i) => {
    let fill = colors.panel;
    let line = colors.border;
    let color = colors.slate;
    let lw = 1;
    if (b) {
      fill = ctx.T.teal.soft;
      line = ctx.T.teal.accent;
      color = ctx.T.teal.text;
    }
    if (fresh.has(i)) {
      fill = ctx.T.teal.accent;
      color = ctx.T.teal.on;
    }
    if (marked.has(i)) {
      line = ctx.T.amber.accent;
      lw = 3;
    }
    ctx.slide.addText(String(b), {
      shape: ctx.pptx.ShapeType.rect, x: cx(i) - cw / 2, y, w: cw, h: ch, fill: { color: fill }, line: { color: line, width: lw },
      color, bold: true, fontSize: 28, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
    });
    text(ctx, String(i), { x: cx(i) - cw / 2, y: y + ch + 0.05, w: cw, h: 0.35, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle', fontFace: fonts.code });
  });

  const wy = s.wordY || 5.3;
  const wh = 0.6;
  const ww = Math.max(1.6, chipW(s.word, 22));
  const wcx = s.hashes.reduce((a, i) => a + cx(i), 0) / s.hashes.length;
  const tones = ['teal', 'amber', 'green'];
  const ey = y + ch + 0.5;
  s.hashes.forEach((h, j) => {
    const tone = tones[j % tones.length];
    arrow(ctx, { x1: wcx + (cx(h) - wcx) * 0.12, y1: wy - 0.05, x2: cx(h), y2: ey, color: ctx.T[tone].accent, width: 3 });
    const lx = cx(h) + (wcx - cx(h)) * 0.4;
    const ly = ey + (wy - ey) * 0.4;
    chip(ctx, { x: lx - 0.27, y: ly - 0.16, w: 0.54, h: 0.32, label: 'h' + (j + 1), tone, solid: false, size: 14 });
  });
  chip(ctx, { x: wcx - ww / 2, y: wy, w: ww, h: wh, label: s.word, tone: s.wordTone || 'navy', size: 22 });

  if (s.formulas) codeBlock(ctx, { x: mx, y: s.formulasY || 4.9, w: 3.3, code: s.formulas.join('\n'), lang: 'plain', fontSize: 15 });
  if (s.card) card(ctx, { textSize: 16, ...s.card }, { x: w - mx - 4.0, y: s.card.y || 4.7, w: 4.0, h: s.card.h || 1.7 });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.05, w: w - 2 * mx, h: s.calloutH || 0.75, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ ciclo iterativo (algoritmo genético)
// Campos: steps[{title,text,tone}], loop{from,to,label} (índices base 0), boxH, callout.
function ciclo(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.steps.length;
  const gap = 0.6;
  const bw = (w - 2 * mx - (n - 1) * gap) / n;
  const y = s.top || 2.0;
  const bh = s.boxH || 2.7;
  const xs = (i) => mx + i * (bw + gap);
  s.steps.forEach((st, i) => {
    const x = xs(i);
    const T = ctx.T[st.tone || 'teal'];
    surface(ctx, st.tone || 'teal', { x, y, w: bw, h: bh });
    circleLabel(ctx, { x: x + 0.25, y: y + 0.22, d: 0.5, label: String(i + 1), fill: T.accent, color: T.on, size: 20 });
    text(ctx, st.title, { x: x + 0.25, y: y + 0.85, w: bw - 0.5, h: 0.7, fontSize: 20, bold: true, color: T.text, fontFace: fonts.heading });
    text(ctx, st.text, { x: x + 0.25, y: y + 1.6, w: bw - 0.5, h: bh - 1.75, fontSize: 16, color: colors.slate });
    if (i < n - 1) {
      ctx.slide.addShape(ctx.pptx.ShapeType.rightArrow, {
        x: x + bw + (gap - 0.4) / 2, y: y + bh / 2 - 0.2, w: 0.4, h: 0.4, fill: { color: colors.teal }, line: { type: 'none' },
      });
    }
  });
  if (s.loop) {
    const xf = xs(s.loop.from) + bw / 2;
    const xt = xs(s.loop.to) + bw / 2;
    const yb = y + bh + 0.5;
    const c = colors.teal;
    arrow(ctx, { x1: xf, y1: y + bh, x2: xf, y2: yb, color: c, width: 3, head: false });
    arrow(ctx, { x1: xf, y1: yb, x2: xt, y2: yb, color: c, width: 3, head: false });
    arrow(ctx, { x1: xt, y1: yb, x2: xt, y2: y + bh + 0.03, color: c, width: 3 });
    if (s.loop.label) {
      text(ctx, s.loop.label, { x: Math.min(xf, xt), y: yb + 0.08, w: Math.abs(xf - xt), h: 0.4, fontSize: 17, bold: true, color: ctx.T.teal.text, align: 'center', valign: 'middle' });
    }
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.95, w: w - 2 * mx, h: s.calloutH || 0.8, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ merge sort: dividir, caso base y mezclar
// Campos: values[], labels{unsorted, sorted, divide, base, merge}, cellW, caption.
// Cada nodo se dibuja dos veces (al dividir y al mezclar, ya ordenado); todas las flechas bajan.
function mergesort(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const L = s.labels;
  const build = (arr, depth) => {
    const node = { arr, depth, kids: [] };
    if (arr.length > 1) {
      const mid = Math.ceil(arr.length / 2);
      node.kids = [build(arr.slice(0, mid), depth + 1), build(arr.slice(mid), depth + 1)];
    }
    return node;
  };
  const root = build(s.values, 0);
  let maxD = 0, leaves = 0;
  const place = (n) => {
    maxD = Math.max(maxD, n.depth);
    if (!n.kids.length) n.slot = leaves++;
    else n.kids.forEach(place);
  };
  place(root);
  const slotW = s.slotW || 0.8, cw = s.cellW || 0.45, ch = 0.4;
  const x0 = (w - leaves * slotW) / 2;
  const cx = (n) => (n.kids.length ? (cx(n.kids[0]) + cx(n.kids[1])) / 2 : x0 + (n.slot + 0.5) * slotW);
  const rows = 2 * maxD + 1;
  const top = s.top || 1.95;
  const pitch = Math.min(0.62, (5.85 - top - ch) / (rows - 1));
  const ry = (r) => top + r * pitch;
  const drawBox = (n, r, tone) => {
    const bw = n.arr.length * cw, bx = cx(n) - bw / 2;
    n.arr.forEach((v, i) => cellBox(ctx, v, { x: bx + i * cw, y: ry(r), w: cw, h: ch, tone, size: 14 }));
  };
  const link = (a, ra, b, rb, color) => arrow(ctx, { x1: cx(a), y1: ry(ra) + ch, x2: cx(b), y2: ry(rb), color, width: 1.75 });
  const walk = (n) => {
    const base = n.kids.length === 0 && n.depth === maxD;
    drawBox(n, n.depth, undefined);
    n.sorted = [...n.arr].sort((p, q) => p - q);
    if (!base) {
      const sortedRow = rows - 1 - n.depth;
      drawBox({ ...n, arr: n.sorted }, sortedRow, 'green');
      if (!n.kids.length) link(n, n.depth, n, sortedRow, colors.slate);
    }
    n.kids.forEach((k) => {
      link(n, n.depth, k, k.depth, colors.slate);
      walk(k);
    });
  };
  walk(root);
  const mergeLinks = (n) => {
    n.kids.forEach((k) => {
      const kRow = k.kids.length === 0 && k.depth === maxD ? k.depth : rows - 1 - k.depth;
      link(k, kRow, n, rows - 1 - n.depth, ctx.T.green.accent);
      mergeLinks(k);
    });
  };
  mergeLinks(root);
  const side = (str, r, o) => text(ctx, str, { y: ry(r), h: ch, fontSize: 15, bold: true, valign: 'middle', ...o });
  const rootW = root.arr.length * cw;
  side(L.unsorted, 0, { x: mx, w: cx(root) - rootW / 2 - 0.25 - mx, align: 'right', color: colors.slate });
  side(L.sorted, rows - 1, { x: mx, w: cx(root) - rootW / 2 - 0.25 - mx, align: 'right', color: ctx.T.green.text });
  const chipX = x0 + leaves * slotW + 0.7;
  const mid = (a, b) => (ry(a) + ry(b) + ch) / 2 - 0.2;
  chip(ctx, { x: chipX, y: mid(1, Math.max(1, maxD - 1)), w: 1.5, h: 0.4, label: L.divide, tone: 'teal', size: 14 });
  chip(ctx, { x: chipX, y: mid(maxD, maxD), w: 1.5, h: 0.4, label: L.base, tone: 'slate', solid: false, size: 14 });
  chip(ctx, { x: chipX, y: mid(maxD + 1, rows - 2), w: 1.5, h: 0.4, label: L.merge, tone: 'green', size: 14 });
  if (s.caption) text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle' });
}

// ------------------------------------------------------------------ subproblemas independientes vs. compartidos
// panels[2]{title, tone, text, nodes[{id,x,y,shared}] (x, y en 0–1), edges[[desde,hasta]]}, caption
function subproblemas(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const gap = 0.4, pw = (w - 2 * mx - gap) / 2, top = 1.85, ph = 4.1, d = 0.5;
  s.panels.forEach((p, i) => {
    const x = mx + i * (pw + gap);
    const t = ctx.T[p.tone || 'teal'];
    surface(ctx, p.tone, { x, y: top, w: pw, h: ph });
    text(ctx, p.title, { x: x + 0.3, y: top + 0.15, w: pw - 0.6, h: 0.5, fontSize: 22, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    text(ctx, p.text, { x: x + 0.3, y: top + 0.7, w: pw - 0.6, h: 0.65, fontSize: 16, color: colors.slate });
    const ax = x + 0.9, aw = pw - 1.8, ay = top + 1.65, ah = ph - 2.1;
    const pos = {};
    p.nodes.forEach((n) => {
      pos[n.id] = { cx: ax + n.x * aw, cy: ay + n.y * ah };
    });
    p.edges.forEach(([a, b]) => {
      const A = pos[a], B = pos[b];
      const len = Math.hypot(B.cx - A.cx, B.cy - A.cy), ux = (B.cx - A.cx) / len, uy = (B.cy - A.cy) / len, r = d / 2 + 0.03;
      arrow(ctx, { x1: A.cx + ux * r, y1: A.cy + uy * r, x2: B.cx - ux * r, y2: B.cy - uy * r, color: t.accent, width: 2 });
    });
    p.nodes.forEach((n) => {
      const q = pos[n.id];
      ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
        x: q.cx - d / 2, y: q.cy - d / 2, w: d, h: d,
        fill: { color: n.shared ? ctx.T.amber.accent : colors.codeBg }, line: { color: n.shared ? ctx.T.amber.accent : t.accent, width: 2 },
      });
    });
  });
  if (s.caption) text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle' });
}

module.exports = {
  'diseno-matriz': matriz,
  'diseno-tablero': tablero,
  'diseno-arbol': arbol,
  'diseno-bloom': bloom,
  'diseno-ciclo': ciclo,
  'diseno-mergesort': mergesort,
  'diseno-subproblemas': subproblemas,
};
