// Diagramas de la lección «Ordenamiento y Búsqueda» (CE-1103).
//   ordenamiento-array : filas de celdas (arreglos) con estados, marcas e índices, para mostrar algoritmos paso a paso.
//   ordenamiento-hash  : tabla hash con llaves, buckets, colisión y separate chaining. Opciones: bucketWidth, bucketY, nameSize,
//                        callout o callouts[] (varios lado a lado). Si dos llaves de entrada se pisan, la segunda baja una fila.
//   ordenamiento-escalera : filas de comparaciones (una celda por comparación) que forman una escalera, con una tabla a la derecha.
//                        Campos: legend, stairs[{label, cells[], note}], total, table{title, columns, rows, colW, highlight}, callout.
//   ordenamiento-universo : el universo de llaves, el subconjunto usado y la función h que las lleva a una tabla T (con colisión o
//                        con separate chaining). Campos: universe{label, others[]}, keysLabel, keys[{name, slot}] (las llaves con el
//                        mismo slot colisionan), slots, indexLabel, tableLabel, collisionLabel, chains (true: lista enlazada por slot), caption.
//   ordenamiento-franjas : arreglo vertical por tramos con llaves (braces) que lo agrupan en partes (p. ej. ordenada/desordenada).
//                        Campos: heading, segments[{label, tone, weight, dots}], braces[{from, to, tone, title, text}], caption.
//   ordenamiento-estaturas : filas de siluetas (barras con cabeza) que se comparan de dos en dos; el intercambio se calcula con las alturas.
//                        Campos: heights[], compare[[a, b]…] (una fila por comparación), labels{swap, noSwap}, caption.
//   ordenamiento-merge : árbol de merge sort en una de sus dos fases; las mezclas se calculan en código.
//                        Campos: values[], phase ('dividir' | 'mezclar'), legend, caption.
//   `ordenamiento-array` también acepta groupMark (true: una flecha entre grupos; usar con groupGap ≥ 0.45).
const C = require('./components');

const { text, box, chip, arrow, callout, cellBox, rich } = C;

const chipW = (label, size = 14) => label.length * (size * 0.0072) + 0.45;

// Estados de celda (código de una letra en `states`): . neutra · t teal · a ámbar · g verde · n azul · r rojo · d atenuada
const STATE = { '.': 'neutral', t: 'teal', a: 'amber', g: 'green', n: 'navy', r: 'red', d: 'dim' };

function cellStyle(ctx, tone) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  switch (tone) {
    case 'teal': return { fill: T.teal.accent, line: T.teal.accent, color: T.teal.on };
    case 'amber': return { fill: T.amber.accent, line: T.amber.accent, color: T.amber.on };
    case 'green': return { fill: T.green.soft, line: T.green.accent, color: T.green.text };
    case 'navy': return { fill: T.navy.accent, line: colors.teal, color: T.navy.on };
    case 'red': return { fill: T.red.accent, line: T.red.accent, color: T.red.on };
    case 'dim': return { fill: colors.bg, line: colors.border, color: colors.muted };
    default: return { fill: colors.panel, line: colors.border, color: colors.ink };
  }
}

// Texto de celda: los dígitos entre corchetes, p. ej. `17[0]`, se resaltan.
function cellRuns(ctx, str, tone, st) {
  const parts = String(str).split(/(\[[^\]]*\])/g).filter((p) => p !== '');
  const plain = tone === 'neutral' || tone === 'dim';
  const hl = plain ? ctx.theme.colors.amber : st.color;
  return parts.map((p) => {
    if (!p.startsWith('[')) return { text: p, options: {} };
    const options = { color: hl, bold: true };
    if (!plain) options.underline = { style: 'sng' };
    return { text: p.slice(1, -1), options };
  });
}

function drawLegend(ctx, legend, y) {
  const { colors } = ctx.theme;
  let lx = ctx.theme.page.mx;
  legend.forEach(([label, tone]) => {
    const st = cellStyle(ctx, STATE[tone] || tone);
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx, y: y + 0.04, w: 0.3, h: 0.3, fill: { color: st.fill }, line: { color: st.line, width: 1.25 } });
    text(ctx, label, { x: lx + 0.4, y, w: label.length * 0.1 + 0.3, h: 0.38, fontSize: 15, color: colors.slate, valign: 'middle', wrap: false });
    lx += 0.4 + label.length * 0.1 + 0.55;
  });
}

function drawCell(ctx, str, { x, y, w, h, tone, size = 18 }) {
  const st = cellStyle(ctx, STATE[tone] || tone || 'neutral');
  ctx.slide.addText(String(str), {
    shape: ctx.pptx.ShapeType.rect, x, y, w, h,
    fill: { color: st.fill }, line: { color: st.line, width: 1.25 }, color: st.color,
    bold: true, fontSize: size, fontFace: ctx.theme.fonts.code, align: 'center', valign: 'middle', margin: 0,
  });
}

function captionLine(ctx, s) {
  const { mx, w } = ctx.theme.page;
  if (s.caption) text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: ctx.theme.colors.slate, align: 'center', valign: 'middle' });
}

function arrayRows(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const gapS = 0.06, gapB = s.groupGap || 0.3;
  const cellH = s.cellHeight || 0.56;
  const labelW = s.labelW || 1.6;
  const noteMin = s.noteMin || 3.2;
  const T = ctx.T;

  const groupsOf = (r) => (r.groups && r.groups.length ? r.groups : [r.cells.length]);
  const rowW = (r, cw) => {
    const g = groupsOf(r).length;
    return r.cells.length * cw + (r.cells.length - g) * gapS + (g - 1) * gapB;
  };
  let cw = s.cellWidth || 0.62;
  const avail = w - 2 * mx - labelW - noteMin - 0.35;
  while (cw > 0.4 && Math.max(...s.rows.map((r) => rowW(r, cw))) > avail) cw -= 0.02;
  const maxW = Math.max(...s.rows.map((r) => rowW(r, cw)));
  const x0 = mx + labelW;
  const noteX = x0 + maxW + 0.35;
  const noteW = w - mx - noteX;
  const cellFont = s.cellFont || (cw < 0.6 ? 18 : 20);

  // leyenda
  let y = s.legendY || 1.85;
  if (s.legend) {
    drawLegend(ctx, s.legend, y);
    y += 0.6;
  }

  const drawIdx = (r, cy) => {
    let k = 0;
    const gs = groupsOf(r);
    let gx = x0;
    gs.forEach((g, gi) => {
      for (let t = 0; t < g; t++, k++) {
        text(ctx, String(k), { x: gx, y: cy, w: cw, h: 0.26, fontSize: 13, color: colors.muted, fontFace: fonts.code, align: 'center', valign: 'middle' });
        gx += cw + gapS;
      }
      gx += gapB - gapS;
    });
  };

  if (s.indices) {
    drawIdx(s.rows[0], y);
    y += 0.3;
  }

  const rowPad = s.rowPad != null ? s.rowPad : 0.09;
  s.rows.forEach((r, ri) => {
    const states = (r.states || '').trim() ? r.states.trim().split(/\s+/) : [];
    const marks = r.marks || null;
    const idxH = r.idx ? 0.3 : 0;
    const marksH = marks ? 0.32 : 0;
    const rowH = rowPad + idxH + cellH + marksH + rowPad;
    if (ri > 0) ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: mx, y, w: w - 2 * mx, h: 0, line: { color: colors.border, width: 0.75 } });
    const cy = y + rowPad + idxH;
    if (r.idx) drawIdx(r, y + rowPad);
    text(ctx, r.label || '', { x: mx, y: cy, w: labelW - 0.1, h: cellH, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });

    let k = 0;
    let gx = x0;
    groupsOf(r).forEach((g) => {
      for (let t = 0; t < g; t++, k++) {
        const tone = STATE[states[k] || '.'] || 'neutral';
        const st = cellStyle(ctx, tone);
        ctx.slide.addText(cellRuns(ctx, r.cells[k], tone, st), {
          shape: ctx.pptx.ShapeType.rect, x: gx, y: cy, w: cw, h: cellH,
          fill: { color: st.fill }, line: { color: st.line, width: 1.25 }, color: st.color,
          bold: true, fontSize: cellFont, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
        });
        if (marks && marks[String(k)]) {
          text(ctx, marks[String(k)], {
            x: gx - 0.5, y: cy + cellH + 0.03, w: cw + 1.0, h: 0.28, fontSize: 14, bold: true, color: T.teal.text,
            fontFace: fonts.code, align: 'center', valign: 'middle', wrap: false,
          });
        }
        gx += cw + gapS;
      }
      if (s.groupMark && k < r.cells.length) {
        const ax = gx - gapS;
        arrow(ctx, { x1: ax + 0.08, y1: cy + cellH / 2, x2: ax + gapB - 0.08, y2: cy + cellH / 2, color: colors.slate, width: 2.5 });
      }
      gx += gapB - gapS;
    });

    if (r.note) {
      text(ctx, r.note, {
        x: noteX, y: cy - 0.04, w: noteW, h: cellH + marksH + 0.08, fontSize: 16, color: r.noteTone ? T[r.noteTone].text : colors.slate,
        bold: !!r.noteTone, valign: 'middle',
      });
    }
    y += rowH;
  });

  if (s.callout) {
    const cyc = Math.max(y + 0.15, s.calloutY || 0);
    if (cyc + (s.calloutH || 0.7) > 6.95) console.warn(`  aviso: el callout del diagrama "${s.title}" termina en y=${(cyc + (s.calloutH || 0.7)).toFixed(2)}`);
    callout(ctx, { x: mx, y: cyc, w: w - 2 * mx, h: s.calloutH || 0.7, size: 16, ...s.callout });
  }
}

function hash(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const T = ctx.T;
  const n = s.buckets || 10;
  const bw = s.bucketWidth || 1.1, gap = 0.06;
  const total = n * bw + (n - 1) * gap;
  const x0 = (w - total) / 2;
  const bucketY = s.bucketY || 3.9, bh = 0.8;
  const nameSize = s.nameSize || 18;
  const cx = (i) => x0 + i * (bw + gap) + bw / 2;

  if (s.formula) {
    const fw = s.formula.length * 0.135 + 0.6;
    box(ctx, { x: mx, y: 1.8, w: fw, h: 0.5, fill: colors.codeBg, line: colors.codeBorder, radius: 0.1 });
    text(ctx, s.formula, { x: mx, y: 1.8, w: fw, h: 0.5, fontSize: 18, fontFace: fonts.code, color: colors.codeText, align: 'center', valign: 'middle', wrap: false });
  }

  const byBucket = {};
  s.entries.forEach((e) => {
    (byBucket[e.index] = byBucket[e.index] || []).push(e);
  });

  // buckets con su índice
  for (let i = 0; i < n; i++) {
    const e = (byBucket[i] || [])[0];
    text(ctx, String(i), { x: x0 + i * (bw + gap), y: bucketY - 0.34, w: bw, h: 0.3, fontSize: 15, bold: true, color: colors.slate, fontFace: fonts.code, align: 'center', valign: 'middle' });
    ctx.slide.addText(e ? e.name : '', {
      shape: ctx.pptx.ShapeType.rect, x: x0 + i * (bw + gap), y: bucketY, w: bw, h: bh,
      fill: { color: e ? T.teal.soft : colors.panel }, line: { color: e ? T.teal.accent : colors.border, width: 1.25 },
      color: colors.heading, bold: true, fontSize: nameSize, fontFace: ctx.theme.fonts.body, align: 'center', valign: 'middle', margin: 0,
    });
  }

  // Si dos llaves de entrada se pisan (buckets contiguos), la segunda baja a una segunda fila
  const chipRow = new Map();
  const rowEnd = [-Infinity, -Infinity];
  s.entries.filter((e) => byBucket[e.index][0] === e).sort((a, b) => a.index - b.index).forEach((e) => {
    const cwid = chipW(e.key, 15) + 0.1;
    const left = cx(e.index) - cwid / 2;
    const r = rowEnd[0] + 0.08 <= left ? 0 : rowEnd[1] + 0.08 <= left ? 1 : 0;
    rowEnd[r] = left + cwid;
    chipRow.set(e, r);
  });

  // llaves que llegan por arriba (la primera de cada bucket) y colisiones o cadenas por abajo
  s.entries.forEach((e) => {
    const first = byBucket[e.index][0] === e;
    const x = cx(e.index);
    if (first) {
      const cwid = chipW(e.key, 15) + 0.1;
      const chipY = 2.55 + chipRow.get(e) * 0.5;
      chip(ctx, { x: x - cwid / 2, y: chipY, w: cwid, h: 0.42, label: e.key, tone: 'teal', size: 15 });
      arrow(ctx, { x1: x, y1: chipY + 0.45, x2: x, y2: bucketY - 0.36, color: colors.teal, width: 2.5 });
    } else if (e.extra === 'chain') {
      const ny = bucketY + bh + 0.5;
      arrow(ctx, { x1: x, y1: bucketY + bh + 0.03, x2: x, y2: ny - 0.03, color: colors.teal, width: 2.5 });
      ctx.slide.addText(e.name, {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.1, x: x - bw / 2, y: ny, w: bw, h: 0.6,
        fill: { color: T.navy.accent }, line: { color: colors.teal, width: 1.5 }, color: T.navy.on, bold: true, fontSize: 18,
        fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
      });
      if (e.key) text(ctx, e.key, { x: x - bw / 2 - 2.0, y: ny, w: 1.9, h: 0.6, fontSize: 15, color: colors.slate, fontFace: fonts.code, align: 'right', valign: 'middle', wrap: false });
    } else {
      const cwid = chipW(e.key, 15) + 0.1;
      const ny = bucketY + bh + 0.55;
      chip(ctx, { x: x - cwid / 2, y: ny, w: cwid, h: 0.42, label: e.key, tone: 'red', size: 15 });
      arrow(ctx, { x1: x, y1: ny - 0.02, x2: x, y2: bucketY + bh + 0.04, color: T.red.accent, width: 2.5 });
      text(ctx, s.collisionLabel || 'Colisión', { x: x - 2.4, y: bucketY + bh + 0.08, w: 2.3, h: 0.4, fontSize: 16, bold: true, color: T.red.text, align: 'right', valign: 'middle' });
    }
  });

  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: s.calloutH || 0.75, size: 16, ...s.callout });
  if (s.callouts) {
    const k = s.callouts.length;
    const cwid = (w - 2 * mx - (k - 1) * 0.3) / k;
    s.callouts.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + 0.3), y: s.calloutY || 6.0, w: cwid, h: s.calloutH || 0.95, size: 16, ...c }));
  }
}

function escalera(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const T = ctx.T;
  const cw = s.cellWidth || 0.7, gap = 0.06, ch = s.cellHeight || 0.5, rowGap = s.rowGap || 0.14;
  const labelW = s.labelW || 1.4;
  const leftW = s.leftW || 6.9;
  let y = 1.85;
  if (s.legend) {
    text(ctx, s.legend, { x: mx, y, w: leftW, h: 0.4, fontSize: 16, color: colors.slate, valign: 'middle' });
    y += 0.55;
  }
  const x0 = mx + labelW;
  const maxN = Math.max(...s.stairs.map((r) => r.cells.length));
  const noteX = x0 + maxN * (cw + gap) + 0.15;
  const st = cellStyle(ctx, 'teal');
  s.stairs.forEach((r) => {
    text(ctx, r.label, { x: mx, y, w: labelW - 0.1, h: ch, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
    r.cells.forEach((c, k) => {
      ctx.slide.addText(String(c), {
        shape: ctx.pptx.ShapeType.rect, x: x0 + k * (cw + gap), y, w: cw, h: ch,
        fill: { color: st.fill }, line: { color: st.line, width: 1.25 }, color: st.color,
        bold: true, fontSize: 20, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
      });
    });
    if (r.note) text(ctx, r.note, { x: noteX, y, w: mx + leftW - noteX, h: ch, fontSize: 16, color: colors.slate, valign: 'middle' });
    y += ch + rowGap;
  });
  if (s.total) {
    box(ctx, { x: mx, y: y + 0.05, w: leftW, h: 0.55, fill: T.amber.soft, line: T.amber.accent, lineTransparency: 40 });
    text(ctx, s.total, { x: mx + 0.3, y: y + 0.05, w: leftW - 0.6, h: 0.55, fontSize: 18, bold: true, color: T.amber.text, valign: 'middle' });
  }

  if (s.table) {
    const rx = mx + leftW + 0.6;
    const rw = w - mx - rx;
    const t = s.table;
    let ty = 1.85;
    if (t.title) {
      text(ctx, t.title, { x: rx, y: ty, w: rw, h: 0.4, fontSize: 16, color: colors.slate, valign: 'middle' });
      ty += 0.55;
    }
    const hl = new Set(t.highlight || []);
    const sum = (t.colW || [1, 2]).reduce((a, b) => a + b, 0);
    const colW = (t.colW || [1, 2]).map((c) => (c / sum) * rw);
    C.table(ctx, {
      x: rx, y: ty, colW, header: t.columns, rows: t.rows, rowH: t.rowH || 0.5, fontSize: t.fontSize || 17,
      align: t.align || ['center', 'right'],
      cellStyle: (r, c) => (hl.has(r) ? { fill: colors.amberLight } : c === 0 ? { bold: true, color: colors.heading, fill: colors.tealLight } : {}),
    });
  }

  if (s.callout) {
    const cyc = s.calloutY || 5.75;
    if (cyc + (s.calloutH || 0.95) > 6.95) console.warn(`  aviso: el callout del diagrama "${s.title}" termina en y=${(cyc + (s.calloutH || 0.95)).toFixed(2)}`);
    callout(ctx, { x: mx, y: cyc, w: w - 2 * mx, h: s.calloutH || 0.95, size: 16, ...s.callout });
  }
}

// ------------------------------------------------------------------ universo de llaves → tabla T
function universo(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx } = ctx.theme.page;
  const T = ctx.T;
  const n = s.slots;
  const top = 2.3, bottom = 6.1;
  const sh = Math.min(0.58, (bottom - top) / n);
  const tw = 1.1, tx = s.tableX || 7.4;
  const hx = tx - 1.15;
  const slotY = (i) => top + i * sh;
  const slotC = (i) => slotY(i) + sh / 2;
  const bySlot = {};
  s.keys.forEach((k) => (bySlot[k.slot] = bySlot[k.slot] || []).push(k));

  // el universo y el subconjunto de llaves usadas
  const U = s.universe || {};
  const ux = mx, uy = 2.1, uw = 4.7, uh = 4.0;
  ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: ux, y: uy, w: uw, h: uh, fill: { color: T.navy.accent }, line: { color: colors.border, width: 1.5 } });
  text(ctx, U.label || '', { x: ux, y: uy + 0.3, w: uw, h: 0.45, fontSize: 22, bold: true, color: T.navy.on, align: 'center', valign: 'middle' });
  (U.others || []).forEach((name, i) => {
    text(ctx, name, { x: ux + 0.85 + (i % 2) * -0.25, y: uy + 1.15 + i * 0.6, w: 0.6, h: 0.4, fontSize: 20, bold: true, color: T.navy.on, valign: 'middle' });
  });
  const r = 1.3;
  const icx = ux + uw / 2 + 0.55, icy = uy + uh / 2 + 0.1;
  ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: icx - r, y: icy - r, w: 2 * r, h: 2 * r, fill: { color: T.teal.soft }, line: { color: T.teal.accent, width: 2.5 } });
  text(ctx, s.keysLabel || '', { x: icx - r + 0.2, y: icy - 0.25, w: 1.2, h: 0.5, fontSize: 20, bold: true, color: T.teal.text, valign: 'middle' });

  // llaves dentro del círculo y flechas hacia h(k) junto a la tabla
  const m = s.keys.length;
  const span = Math.min(1.9, 0.45 * (m - 1));
  const seen = {};
  s.keys.forEach((k, i) => {
    const ky = m > 1 ? icy - span / 2 + (i * span) / (m - 1) : icy;
    const edge = icx + Math.sqrt(r * r - (ky - icy) * (ky - icy));
    text(ctx, k.name, { x: edge - 0.65, y: ky - 0.2, w: 0.5, h: 0.4, fontSize: 20, bold: true, color: T.teal.text, valign: 'middle', wrap: false });
    const cnt = bySlot[k.slot].length;
    const j = (seen[k.slot] = (seen[k.slot] || 0) + 1) - 1;
    const hy = slotC(k.slot) + (j - (cnt - 1) / 2) * 0.3;
    text(ctx, `h(${k.name})`, { x: hx, y: hy - 0.15, w: 1.0, h: 0.3, fontSize: 18, color: colors.ink, valign: 'middle', wrap: false });
    arrow(ctx, { x1: edge + 0.02, y1: ky, x2: hx - 0.08, y2: hy, color: colors.teal, width: 2 });
  });

  // tabla T
  text(ctx, s.indexLabel || '', { x: hx, y: 1.8, w: 1.0, h: 0.4, fontSize: 18, bold: true, color: colors.slate, valign: 'middle' });
  text(ctx, s.tableLabel || '', { x: tx, y: 1.8, w: tw, h: 0.4, fontSize: 20, bold: true, color: colors.heading, align: 'center', valign: 'middle' });
  for (let i = 0; i < n; i++) {
    const cnt = (bySlot[i] || []).length;
    const tone = cnt === 0 ? undefined : cnt > 1 ? (s.chains ? 'amber' : 'red') : 'teal';
    cellBox(ctx, cnt === 0 ? '/' : '', { x: tx, y: slotY(i), w: tw, h: sh, tone, size: 18 });
  }

  Object.keys(bySlot).forEach((sl) => {
    const list = bySlot[sl];
    const yc = slotC(Number(sl));
    if (s.chains) {
      const cws = [0.4, 0.6, 0.4], nw = 1.4, nh = Math.min(0.5, sh - 0.06), gapN = 0.5;
      let nx = tx + tw + 0.6;
      arrow(ctx, { x1: tx + tw / 2, y1: yc, x2: nx - 0.02, y2: yc, color: colors.teal, width: 2 });
      list.forEach((k, i) => {
        const vals = [i === 0 ? '/' : '', k.name, i === list.length - 1 ? '/' : ''];
        let cx = nx;
        vals.forEach((v, c) => {
          cellBox(ctx, v, { x: cx, y: yc - nh / 2, w: cws[c], h: nh, tone: 'teal', size: 18 });
          cx += cws[c];
        });
        if (i < list.length - 1) {
          arrow(ctx, { x1: nx + cws[0] + cws[1] + cws[2] / 2, y1: yc, x2: nx + nw + gapN - 0.02, y2: yc, color: colors.teal, width: 2 });
          nx += nw + gapN;
        }
      });
    } else if (list.length > 1) {
      const eq = list.map((k) => `h(${k.name})`).join(' = ');
      text(ctx, `${s.collisionLabel || ''}: ${eq}`, { x: tx + tw + 0.35, y: yc - 0.25, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: T.red.text, valign: 'middle' });
    }
  });
  captionLine(ctx, s);
}

// ------------------------------------------------------------------ arreglo vertical por tramos con llaves
function franjas(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const T = ctx.T;
  const top = 2.3;
  const total = s.segments.reduce((a, g) => a + (g.weight || 1), 0);
  const u = Math.min(0.46, (s.height || 3.8) / total);
  const ax = s.arrayX || 3.4, aw = s.cellW || 2.4;
  text(ctx, s.heading || '', { x: ax, y: 1.85, w: aw, h: 0.4, fontSize: 20, bold: true, fontFace: fonts.code, color: colors.slate, align: 'center', valign: 'middle' });

  let y = top;
  const pos = s.segments.map((g) => {
    const h = (g.weight || 1) * u;
    const p = { y, h };
    drawCell(ctx, '', { x: ax, y, w: aw, h, tone: g.tone });
    if (g.dots) {
      for (let d = 0; d < 3; d++) ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: ax + aw / 2 - 0.05, y: y + h / 2 - 0.2 + d * 0.15, w: 0.1, h: 0.1, fill: { color: colors.slate }, line: { type: 'none' } });
    }
    if (g.label) text(ctx, g.label, { x: ax - 1.9, y, w: 1.75, h, fontSize: 16, fontFace: fonts.code, color: colors.slate, align: 'right', valign: 'middle', wrap: false });
    y += h;
    return p;
  });

  const bx = ax + aw + 0.12;
  s.braces.forEach((b) => {
    const t = T[b.tone || 'teal'];
    const y1 = pos[b.from].y, y2 = pos[b.to].y + pos[b.to].h;
    ctx.slide.addShape(ctx.pptx.ShapeType.rightBrace, { x: bx, y: y1 + 0.03, w: 0.3, h: y2 - y1 - 0.06, line: { color: t.accent, width: 2 } });
    const runs = [{ text: b.title, options: { bold: true, fontSize: 20, color: t.text, breakLine: !!b.text } }];
    if (b.text) runs.push(...rich(b.text, ctx, { fontSize: 16, color: colors.ink }));
    text(ctx, runs, { x: bx + 0.5, y: y1, w: w - mx - (bx + 0.5), h: y2 - y1, valign: 'middle' });
  });
  captionLine(ctx, s);
}

// ------------------------------------------------------------------ siluetas que se comparan de dos en dos
function estaturas(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const T = ctx.T;
  const hs = [...s.heights];
  const n = hs.length;
  const sp = Math.min(1.1, (w - 2 * mx) / n);
  const x0 = (w - n * sp) / 2;
  const cx = (i) => x0 + (i + 0.5) * sp;
  const maxH = s.maxHeight || 1.1, headD = 0.28, bw = 0.5;
  const hmax = Math.max(...hs);
  let y = 1.85;
  s.compare.forEach(([a, b]) => {
    const swap = hs[a] > hs[b];
    const tone = swap ? 'amber' : 'teal';
    const base = y + 0.5 + maxH;
    const ph = (v) => (v / hmax) * maxH;
    hs.forEach((v, i) => {
      const hi = i === a || i === b;
      const color = hi ? T[tone].accent : colors.slateFill;
      const p = ph(v);
      ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: cx(i) - headD / 2, y: base - p, w: headD, h: headD, fill: { color }, line: { type: 'none' } });
      box(ctx, { x: cx(i) - bw / 2, y: base - p + headD + 0.03, w: bw, h: p - headD - 0.03, fill: color, radius: 0.12 });
      text(ctx, String(i), {
        x: cx(i) - sp / 2, y: base + 0.1, w: sp, h: 0.28, fontSize: 14, bold: hi, fontFace: fonts.code, color: hi ? T[tone].text : colors.muted, align: 'center', valign: 'middle',
      });
    });
    ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: x0, y: base + 0.04, w: n * sp, h: 0, line: { color: colors.slate, width: 2.5 } });
    // corchete sobre la pareja comparada y flechas hacia sus cabezas
    const by = y + 0.22;
    arrow(ctx, { x1: cx(a), y1: by, x2: cx(b), y2: by, color: T[tone].accent, width: 2.5, head: false });
    [a, b].forEach((i) => arrow(ctx, { x1: cx(i), y1: by, x2: cx(i), y2: base - ph(hs[i]) - 0.04, color: T[tone].accent, width: 2.5 }));
    text(ctx, swap ? s.labels.swap : s.labels.noSwap, { x: cx(b) + 0.4, y: by - 0.22, w: w - mx - cx(b) - 0.4, h: 0.44, fontSize: 18, color: T[tone].text, valign: 'middle' });
    if (swap) [hs[a], hs[b]] = [hs[b], hs[a]];
    y += 0.5 + maxH + 0.4 + 0.1;
  });
  captionLine(ctx, s);
}

// ------------------------------------------------------------------ merge sort: una fase del árbol
function mergeTwo(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}

function mergeFase(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const T = ctx.T;
  const mezclar = s.phase === 'mezclar';
  const build = (arr, depth) => {
    const node = { arr, depth, kids: [] };
    if (arr.length > 1) {
      const mid = Math.ceil(arr.length / 2);
      node.kids = [build(arr.slice(0, mid), depth + 1), build(arr.slice(mid), depth + 1)];
      node.sorted = mergeTwo(node.kids[0].sorted, node.kids[1].sorted);
    } else node.sorted = arr;
    return node;
  };
  const root = build(s.values, 0);
  const expected = [...s.values].sort((p, q) => p - q);
  if (root.sorted.join() !== expected.join()) throw new Error(`ordenamiento-merge: la mezcla no coincide con el orden esperado (${root.sorted} ≠ ${expected})`);

  let maxD = 0, leaves = 0;
  const place = (n) => {
    maxD = Math.max(maxD, n.depth);
    if (!n.kids.length) n.slot = leaves++;
    else n.kids.forEach(place);
  };
  place(root);
  const slotW = s.slotW || 1.25, cw = s.cellW || 0.55, ch = 0.5;
  const x0 = (w - leaves * slotW) / 2;
  const cx = (n) => (n.kids.length ? (cx(n.kids[0]) + cx(n.kids[1])) / 2 : x0 + (n.slot + 0.5) * slotW);
  let top = 1.95;
  if (s.legend) {
    drawLegend(ctx, s.legend, 1.8);
    top = 2.45;
  }
  const pitch = Math.min(1.1, (5.95 - top - ch) / maxD);
  const ry = (n) => top + (mezclar ? maxD - n.depth : n.depth) * pitch;
  const draw = (n) => {
    const arr = mezclar ? n.sorted : n.arr;
    const bx = cx(n) - (arr.length * cw) / 2;
    const tone = n.kids.length === 0 ? 'green' : mezclar ? 'teal' : undefined;
    arr.forEach((v, i) => drawCell(ctx, v, { x: bx + i * cw + 0.025, y: ry(n), w: cw - 0.05, h: ch, tone, size: 18 }));
    n.kids.forEach((k) => {
      const off = (cx(k) < cx(n) ? -1 : 1) * Math.min(0.25, (n.arr.length * cw) / 4);
      if (mezclar) arrow(ctx, { x1: cx(k), y1: ry(k) + ch + 0.05, x2: cx(n) + off, y2: ry(n) - 0.05, color: T.green.accent, width: 2 });
      else arrow(ctx, { x1: cx(n) + off, y1: ry(n) + ch + 0.05, x2: cx(k), y2: ry(k) - 0.05, color: ctx.theme.colors.slate, width: 2 });
      draw(k);
    });
  };
  draw(root);
  captionLine(ctx, s);
}

module.exports = {
  'ordenamiento-array': arrayRows,
  'ordenamiento-hash': hash,
  'ordenamiento-escalera': escalera,
  'ordenamiento-universo': universo,
  'ordenamiento-franjas': franjas,
  'ordenamiento-estaturas': estaturas,
  'ordenamiento-merge': mergeFase,
};
