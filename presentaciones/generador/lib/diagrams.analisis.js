// Diagramas de la lección «Análisis de Algoritmos» (CE-2103). Todos los `kind` llevan el prefijo `analisis-`.
const C = require('./components');

const { text, box, chip, card, callout, codeBlock, table, image } = C;

// ------------------------------------------------------------------ búsqueda secuencial: mejor, promedio y peor caso
// Campos: intro, n, rows[{label, tone, hit, count, note}], callout
function casosBusqueda(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.n || 8;
  if (s.intro) text(ctx, s.intro, { x: mx, y: 1.75, w: w - 2 * mx, h: 0.5, fontSize: 19, color: colors.slate, valign: 'middle' });
  const rowH = 0.95, gapY = 0.1, y0 = 2.4;
  const cw = 0.62, ch = 0.55, gap = 0.06;
  const cx0 = mx + 2.45;
  const rx = cx0 + n * (cw + gap) + 0.3;
  s.rows.forEach((r, i) => {
    const y = y0 + i * (rowH + gapY);
    const t = ctx.T[r.tone || 'teal'];
    C.surface(ctx, r.tone || 'teal', { x: mx, y, w: w - 2 * mx, h: rowH });
    text(ctx, r.label, { x: mx + 0.3, y, w: 2.1, h: rowH, fontSize: 21, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    for (let k = 0; k < n; k++) {
      const hit = k === r.hit - 1;
      const visited = k < r.hit - 1;
      ctx.slide.addText(String(k + 1), {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x: cx0 + k * (cw + gap), y: y + (rowH - ch) / 2, w: cw, h: ch,
        fill: { color: hit ? t.accent : visited ? colors.panel : colors.bg },
        line: { color: hit || visited ? t.accent : colors.border, width: hit ? 2.5 : 1.5 },
        color: hit ? t.on : visited ? t.text : colors.muted, bold: true, fontSize: 18, fontFace: fonts.body,
        align: 'center', valign: 'middle', margin: 0,
      });
    }
    const runs = [
      { text: r.count, options: { fontSize: 20, bold: true, color: t.text, breakLine: true } },
      { text: r.note, options: { fontSize: 16, color: colors.slate } },
    ];
    text(ctx, runs, { x: rx, y, w: w - mx - rx - 0.2, h: rowH, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: y0 + 3 * (rowH + gapY) + 0.15, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ código a la izquierda y gráfica (imagen) a la derecha
// Campos: codeLabel, code, codeLang, codeSize, codeWidth, cards[], image, alt, callout
function codigoGrafica(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const lw = s.codeWidth || 5.7;
  text(ctx, s.codeLabel, { x: mx, y: 1.8, w: lw, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  let y = 2.25;
  y += codeBlock(ctx, { x: mx, y, w: lw, code: s.code, lang: s.codeLang, fontSize: s.codeSize || 15 }) + 0.3;
  (s.cards || []).forEach((c) => {
    const h = c.h || 1.8;
    card(ctx, { textSize: 16, ...c }, { x: mx, y, w: lw, h });
    y += h + 0.2;
  });
  const ix = mx + lw + 0.4, iw = w - mx - ix, ih = s.imageHeight || 3.9;
  box(ctx, { x: ix, y: 1.85, w: iw, h: ih, fill: colors.white, radius: 0.15 });
  image(ctx, s.image, { x: ix + 0.15, y: 2.0, w: iw - 0.3, h: ih - 0.3 }, s.alt);
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: 0.75, ...s.callout });
}

// ------------------------------------------------------------------ imagen arriba y tabla horizontal abajo
// Campos: image, alt, imageHeight, table{columns, rows, colW}, callout
function imagenTabla(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const ih = s.imageHeight || 2.3;
  const cardW = w - 2 * mx - 1.6;
  box(ctx, { x: mx + 0.8, y: 1.85, w: cardW, h: ih, fill: colors.white, radius: 0.15 });
  image(ctx, s.image, { x: mx + 1.0, y: 2.0, w: cardW - 0.4, h: ih - 0.3 }, s.alt);
  const colW = s.table.colW;
  const tw = colW.reduce((a, b) => a + b, 0);
  const ty = 1.85 + ih + 0.3;
  const rh = 0.46;
  const t = table(ctx, {
    x: (w - tw) / 2, y: ty, colW, header: s.table.columns, rows: s.table.rows, rowH: rh, fontSize: 18, align: 'center',
    cellStyle: (r, c) => (c === 0 ? { bold: true, color: colors.heading, fill: colors.tealLight } : {}),
  });
  if (s.callout) callout(ctx, { x: mx, y: ty + t.h + 0.3, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ árbol de recursión con el costo de cada nivel
// Campos: intro, treeHeader, totalHeader, levels[{label, nodes[], total, dots}], callout
function arbolNiveles(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const t = ctx.T.teal;
  if (s.intro) text(ctx, s.intro, { x: mx, y: 1.75, w: w - 2 * mx, h: 0.45, fontSize: 18, color: colors.slate, valign: 'middle' });
  const labelW = 1.9, treeX = mx + labelW, treeW = 6.3, totX = treeX + treeW + 0.4, totW = w - mx - totX;
  text(ctx, s.treeHeader, { x: treeX, y: 2.25, w: treeW, h: 0.3, fontSize: 14, bold: true, color: colors.muted, align: 'center', valign: 'middle' });
  text(ctx, s.totalHeader, { x: totX, y: 2.25, w: totW, h: 0.3, fontSize: 14, bold: true, color: colors.muted, valign: 'middle' });
  const nodeH = 0.46;
  let y = 2.6;
  const rows = s.levels.map((lv) => {
    const rh = lv.dots ? 0.36 : 0.66;
    const m = lv.nodes ? lv.nodes.length : 0;
    const slot = m ? treeW / m : 0;
    const nw = Math.min(1.3, slot - 0.1);
    const cy = y + rh / 2;
    const centers = (lv.nodes || []).map((_, i) => treeX + slot * (i + 0.5));
    const row = { lv, y, rh, cy, nw, centers };
    y += rh;
    return row;
  });
  // aristas (antes que los nodos); no se dibujan hacia o desde la fila de puntos suspensivos
  rows.forEach((row, li) => {
    const prev = rows[li - 1];
    if (!prev || prev.lv.dots || row.lv.dots) return;
    row.centers.forEach((cx, i) => {
      const px = prev.centers[Math.floor(i / 2)];
      ctx.slide.addShape(ctx.pptx.ShapeType.line, {
        x: Math.min(px, cx), y: prev.cy + nodeH / 2, w: Math.abs(cx - px), h: row.cy - prev.cy - nodeH,
        flipH: cx < px, line: { color: colors.slate, width: 1.5 },
      });
    });
  });
  rows.forEach((row) => {
    const { lv, y: ry, rh, cy, nw, centers } = row;
    text(ctx, lv.label, { x: mx, y: ry, w: labelW - 0.1, h: rh, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
    if (lv.dots) {
      text(ctx, '…', { x: treeX + treeW / 2 - 0.2, y: ry, w: 0.4, h: rh, fontSize: 24, bold: true, color: colors.slate, align: 'center', valign: 'middle', rotate: 90 });
    } else {
      lv.nodes.forEach((label, i) => {
        ctx.slide.addText(label, {
          shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x: centers[i] - nw / 2, y: cy - nodeH / 2, w: nw, h: nodeH,
          fill: { color: t.soft }, line: { color: t.accent, width: 1.5 }, color: t.text, bold: true, fontSize: 16, fontFace: fonts.code,
          align: 'center', valign: 'middle', margin: 0,
        });
      });
    }
    text(ctx, lv.total, { x: totX, y: ry, w: totW, h: rh, fontSize: 19, bold: true, color: lv.dots ? colors.slate : t.text, fontFace: fonts.code, valign: 'middle' });
  });
  ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: totX - 0.2, y: 2.3, w: 0, h: y - 2.3, line: { color: colors.border, width: 1 } });
  if (s.callout) callout(ctx, { x: mx, y: y + 0.2, w: w - 2 * mx, h: 0.8, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ costo real de cada push_back (arreglo dinámico)
// Campos: costs[], avg, avgLabel, legendOk, legendCopy, axisLabel, yLabel, callout
function costosPush(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const costs = s.costs;
  const n = costs.length;
  const max = Math.max(...costs);
  chip(ctx, { x: mx, y: 1.8, w: 3.4, h: 0.4, label: s.legendOk, tone: 'teal', size: 15 });
  chip(ctx, { x: mx + 3.6, y: 1.8, w: 5.4, h: 0.4, label: s.legendCopy, tone: 'red', size: 15 });
  const x0 = mx + 0.2, chartW = w - 2 * mx - 0.4, baseY = 5.1, maxH = 2.45;
  const slot = chartW / n, bw = Math.min(0.5, slot * 0.65);
  if (s.yLabel) text(ctx, s.yLabel, { x: x0, y: 2.4, w: 5.0, h: 0.3, fontSize: 14, color: colors.slate, valign: 'middle' });
  const ay = baseY - (s.avg / max) * maxH;
  ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: x0, y: ay, w: chartW, h: 0, line: { color: ctx.T.amber.accent, width: 2, dashType: 'dash' } });
  costs.forEach((c, i) => {
    const h = (c / max) * maxH;
    const x = x0 + i * slot + (slot - bw) / 2;
    const big = c > 1;
    box(ctx, { x, y: baseY - h, w: bw, h, fill: ctx.T[big ? 'red' : 'teal'].accent, shape: 'rect' });
    if (big) text(ctx, String(c), { x: x - 0.1, y: baseY - h - 0.33, w: bw + 0.2, h: 0.3, fontSize: 15, bold: true, color: ctx.T.red.text, align: 'center', valign: 'middle', fill: { color: colors.bg } });
    text(ctx, String(i + 1), { x: x - 0.1, y: baseY + 0.06, w: bw + 0.2, h: 0.28, fontSize: 14, color: colors.slate, align: 'center', valign: 'middle' });
  });
  ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: x0, y: baseY, w: chartW, h: 0, line: { color: colors.slate, width: 1.5 } });
  text(ctx, s.avgLabel, { x: x0 + 6.2, y: ay - 0.38, w: 4.6, h: 0.32, fontSize: 16, bold: true, color: ctx.T.amber.text, valign: 'middle' });
  text(ctx, s.axisLabel, { x: x0, y: baseY + 0.4, w: chartW, h: 0.32, fontSize: 15, color: colors.slate, align: 'center', valign: 'middle' });
  if (s.callout) callout(ctx, { x: mx, y: 6.0, w: w - 2 * mx, h: 0.8, ...s.callout });
}

module.exports = {
  'analisis-casos-busqueda': casosBusqueda,
  'analisis-codigo-grafica': codigoGrafica,
  'analisis-imagen-tabla': imagenTabla,
  'analisis-arbol-niveles': arbolNiveles,
  'analisis-costos-push': costosPush,
};
