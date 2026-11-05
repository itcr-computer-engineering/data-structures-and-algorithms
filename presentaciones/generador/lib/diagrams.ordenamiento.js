// Diagramas de la lección «Ordenamiento y Búsqueda» (CE-1103).
//   ordenamiento-array : filas de celdas (arreglos) con estados, marcas e índices, para mostrar algoritmos paso a paso.
//   ordenamiento-hash  : tabla hash con llaves, buckets, colisión y separate chaining. Opciones: bucketWidth, bucketY, nameSize,
//                        callout o callouts[] (varios lado a lado). Si dos llaves de entrada se pisan, la segunda baja una fila.
//   ordenamiento-escalera : filas de comparaciones (una celda por comparación) que forman una escalera, con una tabla a la derecha.
//                        Campos: legend, stairs[{label, cells[], note}], total, table{title, columns, rows, colW, highlight}, callout.
const C = require('./components');

const { text, box, chip, arrow, callout } = C;

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
    let lx = mx;
    s.legend.forEach(([label, tone]) => {
      const st = cellStyle(ctx, STATE[tone] || tone);
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx, y: y + 0.04, w: 0.3, h: 0.3, fill: { color: st.fill }, line: { color: st.line, width: 1.25 } });
      text(ctx, label, { x: lx + 0.4, y, w: label.length * 0.1 + 0.3, h: 0.38, fontSize: 15, color: colors.slate, valign: 'middle', wrap: false });
      lx += 0.4 + label.length * 0.1 + 0.55;
    });
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

module.exports = {
  'ordenamiento-array': arrayRows,
  'ordenamiento-hash': hash,
  'ordenamiento-escalera': escalera,
};
