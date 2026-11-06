// Diagramas de la lección «Análisis de Algoritmos» (CE-2103). Todos los `kind` llevan el prefijo `analisis-`.
const C = require('./components');

const { text, box, chip, arrow, card, callout, codeBlock, table, surface, highlightLine } = C;

// ------------------------------------------------------------------ utilidades de gráficas
// Las gráficas son formas nativas: ejes, cuadrícula, curvas (polilíneas con forma libre), puntos y rótulos.
const colorOf = (ctx, k) => (ctx.T[k] ? ctx.T[k].accent : ctx.theme.colors[k]);
const labelColorOf = (ctx, k) => (ctx.T[k] ? ctx.T[k].text : ctx.theme.colors[k]);

// "O(2^n)" -> superíndice, "n_0" -> subíndice
function scriptRuns(str, base) {
  return String(str)
    .split(/([\^_](?:\d+|[a-z]))/g)
    .filter((p) => p !== '')
    .map((p) => (/^[\^_]./.test(p) ? { text: p.slice(1), options: { ...base, [p[0] === '^' ? 'superscript' : 'subscript']: true } } : { text: p, options: { ...base } }));
}

function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  z -= 1;
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] / (z + i);
  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

const FN = {
  n: (x) => x,
  n2: (x) => x * x,
  nlogn: (x) => x * Math.log2(x),
  log: (x) => Math.log2(x),
  '2n': (x) => 2 ** x,
  fact: (x) => gamma(x + 1),
};
const STAT = {
  max: (a) => Math.max(...a),
  min: (a) => Math.min(...a),
  mean: (a) => a.reduce((p, q) => p + q, 0) / a.length,
};

// Spline de Catmull-Rom a través de los puntos de control
function catmull(pts, steps = 14) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// Puntos [x, y] de una serie en coordenadas de datos, recortados por arriba en yMax.
function seriesPoints(c, s) {
  const xMin = c.xMin || 0;
  let pts;
  if (s.fn) {
    const f = FN[s.fn];
    if (!f) throw new Error('Función desconocida: ' + s.fn);
    const a = s.scale === undefined ? 1 : s.scale, b = s.offset || 0;
    const from = Math.max(xMin, s.from === undefined ? xMin : s.from), to = Math.min(c.xMax, s.to === undefined ? c.xMax : s.to);
    pts = [];
    for (let i = 0; i <= 160; i++) {
      const x = from + ((to - from) * i) / 160;
      pts.push([x, a * f(x) + b]);
    }
  } else {
    const base = s.stat ? c.columns.map((col) => [col.x, STAT[s.stat](col.ys)]) : s.pts;
    pts = s.smooth ? catmull(base) : base.slice();
    if (s.extend) {
      const [x1, y1] = base[base.length - 2], [x2, y2] = base[base.length - 1];
      const k = (s.extend.slope === undefined ? 1 : s.extend.slope) * ((y2 - y1) / (x2 - x1));
      pts.push([s.extend.to, y2 + k * (s.extend.to - x2)]);
    }
  }
  const out = [];
  let clipped = false;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (y > c.yMax) {
      if (i > 0 && pts[i - 1][1] <= c.yMax) {
        const [x0, y0] = pts[i - 1];
        out.push([x0 + ((x - x0) * (c.yMax - y0)) / (y - y0), c.yMax]);
      }
      clipped = true;
      break;
    }
    out.push([x, y]);
  }
  return { pts: out, clipped };
}

function valueAt(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

// Última abscisa donde las curvas a y b se cruzan (desde ahí una queda siempre de un mismo lado)
function lastCrossing(a, b, xMin, xMax) {
  let found = null;
  const N = 600;
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    const d = valueAt(a, x) - valueAt(b, x);
    if (prev && Math.sign(prev.d) !== Math.sign(d) && prev.d !== 0) found = prev.x + ((x - prev.x) * Math.abs(prev.d)) / (Math.abs(prev.d) + Math.abs(d));
    prev = { x, d };
  }
  return found;
}

function ticksOf(t) {
  if (!t) return [];
  if (Array.isArray(t)) return t.map((v) => (typeof v === 'object' ? { at: v.at, label: v.label === undefined ? String(v.at) : v.label } : { at: v, label: String(v) }));
  const out = [];
  for (let v = t.from; v <= t.to + 1e-9; v += t.step) out.push({ at: v, label: String(Math.round(v * 1000) / 1000) });
  return out;
}

// Polilínea abierta con forma libre (coordenadas de la diapositiva, en pulgadas)
function polyline(ctx, pts, { color, width = 2.5, dash, arrowHead = false }) {
  if (pts.length < 2) return;
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const line = { color, width };
  if (dash) line.dashType = dash;
  if (arrowHead) line.endArrowType = 'triangle';
  ctx.slide.addShape(ctx.pptx.ShapeType.custGeom, {
    x: x0, y: y0, w: Math.max(Math.max(...xs) - x0, 0.01), h: Math.max(Math.max(...ys) - y0, 0.01),
    points: pts.map((p, i) => ({ x: p.x - x0, y: p.y - y0, ...(i === 0 ? { moveTo: true } : {}) })),
    fill: { type: 'none' }, line,
  });
}

// Gráfica en el rectángulo r = {x, y, w, h}.
// Campos de c: xMin, xMax, yMin, yMax, xLabel, yLabel, xTicks, yTicks ([n] | [{at,label}] | {from,to,step}), grid,
//   title, titleTone, padR, columns[{x, ys[]}] (puntos sueltos), dotTone,
//   series[{fn|pts|stat, scale, offset, from, to, smooth, extend{to,slope}, tone|color, width, dash, arrow,
//           dots{from,to,step,d,tone}, label, labelDx, labelDy}],
//   vlines[{at | cross[serie, serie…], label, tone, marker}] (cross: última abscisa donde se cruzan las series).
function plot(ctx, r, c) {
  const { colors, fonts } = ctx.theme;
  const xMin = c.xMin || 0, yMin = c.yMin || 0;
  const xt = ticksOf(c.xTicks), yt = ticksOf(c.yTicks);
  const hasVLabel = (c.vlines || []).some((v) => v.label);
  const padL = 0.25 + (c.yLabel ? 0.4 : 0) + (yt.length ? 0.45 : 0);
  const padB = 0.25 + (c.xLabel ? 0.4 : 0) + (xt.length || hasVLabel ? 0.35 : 0);
  const padT = c.title ? 0.7 : 0.4;
  const padR = c.padR === undefined ? 0.4 : c.padR;
  const px0 = r.x + padL, px1 = r.x + r.w - padR, py1 = r.y + r.h - padB, py0 = r.y + padT;
  const X = (x) => px0 + ((x - xMin) / (c.xMax - xMin)) * (px1 - px0);
  const Y = (y) => py1 - ((y - yMin) / (c.yMax - yMin)) * (py1 - py0);
  const line = (x1, y1, x2, y2, o) => ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: o });

  surface(ctx, null, r);
  if (c.title) {
    text(ctx, scriptRuns(c.title, { bold: true, fontSize: 19, color: labelColorOf(ctx, c.titleTone || 'heading'), fontFace: fonts.heading }), {
      x: r.x + 0.25, y: r.y + 0.12, w: r.w - 0.5, h: 0.45, valign: 'middle',
    });
  }
  if (c.grid) {
    xt.forEach((t) => line(X(t.at), py0, X(t.at), py1, { color: colors.border, width: 0.75 }));
    yt.forEach((t) => line(px0, Y(t.at), px1, Y(t.at), { color: colors.border, width: 0.75 }));
  }
  xt.forEach((t) => text(ctx, t.label, { x: X(t.at) - 0.3, y: py1 + 0.06, w: 0.6, h: 0.28, fontSize: 13, color: colors.slate, align: 'center', valign: 'middle' }));
  yt.forEach((t) => text(ctx, t.label, { x: px0 - 0.6, y: Y(t.at) - 0.14, w: 0.52, h: 0.28, fontSize: 13, color: colors.slate, align: 'right', valign: 'middle' }));
  arrow(ctx, { x1: px0, y1: py1, x2: px1 + 0.12, y2: py1, color: colors.slate, width: 2 });
  arrow(ctx, { x1: px0, y1: py1, x2: px0, y2: py0 - 0.12, color: colors.slate, width: 2 });
  if (c.xLabel) text(ctx, c.xLabel, { x: px0, y: r.y + r.h - 0.42, w: px1 - px0, h: 0.32, fontSize: 14, color: colors.slate, align: 'center', valign: 'middle' });
  if (c.yLabel) text(ctx, c.yLabel, { x: r.x + 0.1, y: py0, w: 0.4, h: py1 - py0, fontSize: 14, color: colors.slate, align: 'center', valign: 'middle', vert: 'vert270' });

  const sers = (c.series || []).map((s) => ({ s, ...seriesPoints(c, s) }));
  (c.vlines || []).forEach((v) => {
    let x = v.at;
    let yTop = null;
    if (v.cross) {
      const [ref, ...others] = v.cross;
      x = Math.max(...others.map((o) => lastCrossing(sers[ref].pts, sers[o].pts, xMin, c.xMax)));
      yTop = valueAt(sers[ref].pts, x);
    }
    const tone = v.tone || 'slate';
    line(X(x), Y(yTop === null ? c.yMax : yTop), X(x), py1, { color: colorOf(ctx, tone), width: 1.75, dashType: 'dash' });
    if (v.marker && yTop !== null) {
      ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: X(x) - 0.1, y: Y(yTop) - 0.1, w: 0.2, h: 0.2, fill: { color: colors.bg }, line: { color: colorOf(ctx, tone), width: 2.5 } });
    }
    if (v.label) {
      text(ctx, scriptRuns(v.label, { bold: true, fontSize: 15, color: labelColorOf(ctx, tone) }), { x: X(x) - 0.6, y: py1 + 0.05, w: 1.2, h: 0.3, align: 'center', valign: 'middle' });
    }
  });
  sers.forEach(({ s, pts, clipped }) => {
    const color = colorOf(ctx, s.tone || s.color || 'teal');
    polyline(ctx, pts.map(([x, y]) => ({ x: X(x), y: Y(y) })), { color, width: s.width || 3, dash: s.dash, arrowHead: !!s.arrow });
    if (s.dots) {
      const d = s.dots.d || 0.11;
      for (let x = s.dots.from; x <= s.dots.to + 1e-9; x += s.dots.step) {
        ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
          x: X(x) - d / 2, y: Y(valueAt(pts, x)) - d / 2, w: d, h: d, fill: { color: colorOf(ctx, s.dots.tone || 'amber') }, line: { type: 'none' },
        });
      }
    }
    if (s.label) {
      const [ex, ey] = pts[pts.length - 1];
      const dx = s.labelDx || 0, dy = s.labelDy || 0;
      const o = { bold: true, fontSize: s.labelSize || c.labelSize || 16, color: labelColorOf(ctx, s.tone || s.color || 'teal'), fontFace: (s.labelFont || c.labelFont) === 'body' ? fonts.body : fonts.code };
      if (clipped) text(ctx, scriptRuns(s.label, o), { x: X(ex) - 0.8 + dx, y: Y(ey) - 0.36 + dy, w: 1.6, h: 0.3, align: 'center', valign: 'middle' });
      else text(ctx, scriptRuns(s.label, o), { x: X(ex) + 0.12 + dx, y: Y(ey) - 0.15 + dy, w: Math.max(r.x + r.w - X(ex) - 0.14, 0.5), h: 0.3, align: 'left', valign: 'middle' });
    }
  });
  (c.columns || []).forEach((col) => {
    col.ys.forEach((y) => {
      ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: X(col.x) - 0.06, y: Y(y) - 0.06, w: 0.12, h: 0.12, fill: { color: colorOf(ctx, c.dotTone || 'heading') }, line: { type: 'none' } });
    });
  });
}

// Panel de referencias: filas con muestra de color, rótulo y descripción.
// rows[{label, text, tone|color, swatch: 'line' | 'dash' | 'dot' | 'ring'}]
function legendPanel(ctx, r, rows) {
  const { colors, fonts } = ctx.theme;
  surface(ctx, null, r);
  const pad = 0.15, rh = (r.h - 2 * pad) / rows.length;
  rows.forEach((row, i) => {
    const y = r.y + pad + i * rh;
    const color = colorOf(ctx, row.tone || row.color || 'teal');
    const cy = y + rh / 2, sx = r.x + 0.3;
    if (row.swatch === 'dot') ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: sx + 0.15, y: cy - 0.07, w: 0.14, h: 0.14, fill: { color }, line: { type: 'none' } });
    else if (row.swatch === 'ring') ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: sx + 0.1, y: cy - 0.1, w: 0.2, h: 0.2, fill: { color: colors.bg }, line: { color, width: 2.5 } });
    else ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: sx, y: cy, w: 0.45, h: 0, line: { color, width: 4, dashType: row.swatch === 'dash' ? 'dash' : 'solid' } });
    const runs = [{ text: row.label, options: { bold: true, fontSize: 18, color: labelColorOf(ctx, row.tone || row.color || 'teal'), fontFace: fonts.heading } }];
    if (row.text) {
      runs[0].options.breakLine = true;
      runs.push({ text: row.text, options: { fontSize: 15, color: colors.slate } });
    }
    text(ctx, runs, { x: r.x + 0.95, y, w: r.w - 1.15, h: rh, valign: 'middle' });
  });
}

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

// ------------------------------------------------------------------ código a la izquierda y gráfica a la derecha
// Campos: codeLabel, code, codeLang, codeSize, codeWidth, cards[], chart (ver `plot`), chartHeight, callout, calloutY
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
  const ix = mx + lw + 0.4, iw = w - mx - ix;
  plot(ctx, { x: ix, y: 1.85, w: iw, h: s.chartHeight || 3.9 }, s.chart);
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: 0.75, ...s.callout });
}

// ------------------------------------------------------------------ una o varias gráficas y, opcionalmente, un panel de referencias
// Campos: charts[] (ver `plot`; cada una admite subtitle), chartH, legend[] (ver `legendPanel`), legendW, caption, callout, calloutY
function grafica(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = s.top || 1.85, h = s.chartH || 4.2;
  const legendW = s.legend ? s.legendW || 3.7 : 0;
  const aw = w - 2 * mx - (legendW ? legendW + 0.35 : 0);
  const n = s.charts.length, gap = 0.3;
  const cw = (aw - (n - 1) * gap) / n;
  s.charts.forEach((c, i) => {
    const x = mx + i * (cw + gap);
    plot(ctx, { x, y: top, w: cw, h }, c);
    if (c.subtitle) text(ctx, scriptRuns(c.subtitle, {}), { x, y: top + h + 0.1, w: cw, h: 0.65, fontSize: 16, color: colors.slate, align: 'center' });
  });
  if (s.legend) legendPanel(ctx, { x: mx + aw + 0.35, y: top, w: legendW, h }, s.legend);
  if (s.caption) text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle' });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: 0.75, ...s.callout });
}

// ------------------------------------------------------------------ árbol de llamadas recursivas y tabla por nivel
// Campos: fn, root, branches, table{columns, colW, totalLabel}, legend[{label,tone}], rowH, callout
// El árbol baja hasta el caso base (argumento 0) y cada fila de la tabla se alinea con su nivel; todo se calcula de root y branches.
function arbolTabla(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const b = s.branches || 2, levels = s.root + 1;
  const pitch = s.rowH || 0.62, headH = 0.42, totalH = 0.5, top = 1.85;
  const colW = s.table.colW;
  const tw = colW.reduce((a, c) => a + c, 0);
  const tx = w - mx - tw;
  const count = (k) => b ** k;
  const rows = Array.from({ length: levels }, (_, k) => [String(k), String(count(k)), `${b}^${k}`]);
  const total = rows.reduce((a, r) => a + Number(r[1]), 0);
  const t = table(ctx, {
    x: tx, y: top, colW, header: s.table.columns, rows: [...rows, [s.table.totalLabel, String(total), `${b}^${levels} - 1`]],
    rowH: [headH, ...rows.map(() => pitch), totalH], fontSize: 17, align: 'center',
    cellStyle: (r, c) => (r === levels ? { bold: true, color: colors.heading, fill: colors.tealLight } : c === 0 ? { bold: true, color: colors.heading } : {}),
  });
  const aw = tx - 0.3 - mx;
  const leaves = count(s.root), slotLeaf = aw / leaves;
  const cx = [];
  cx[s.root] = Array.from({ length: leaves }, (_, i) => mx + slotLeaf * (i + 0.5));
  for (let k = s.root - 1; k >= 0; k--) {
    cx[k] = Array.from({ length: count(k) }, (_, j) => {
      const kids = cx[k + 1].slice(j * b, (j + 1) * b);
      return kids.reduce((a, c) => a + c, 0) / kids.length;
    });
  }
  const cy = (k) => t.rowTop(1 + k) + pitch / 2;
  const nh = 0.4;
  for (let k = 0; k < s.root; k++) {
    cx[k].forEach((x, j) => {
      cx[k + 1].slice(j * b, (j + 1) * b).forEach((x2) => arrow(ctx, { x1: x, y1: cy(k) + nh / 2, x2, y2: cy(k + 1) - nh / 2, color: colors.slate, width: 1.5, head: false }));
    });
  }
  for (let k = 0; k <= s.root; k++) {
    const tone = k === s.root ? 'slate' : 'teal';
    const T = ctx.T[tone];
    const nw = Math.min(0.9, aw / count(k) - (k === s.root ? 0.08 : 0.25));
    cx[k].forEach((x) => {
      ctx.slide.addText(`${s.fn || 'f'}(${s.root - k})`, {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.06, x: x - nw / 2, y: cy(k) - nh / 2, w: nw, h: nh,
        fill: { color: T.soft }, line: { color: T.accent, width: 1.5 }, color: T.text, bold: true,
        fontSize: k === s.root ? 12 : k === s.root - 1 ? 14 : 16, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
      });
    });
  }
  let lx = mx;
  (s.legend || []).forEach((g) => {
    const lw = String(g.label).length * 0.105 + 0.5;
    chip(ctx, { x: lx, y: t.rowTop(levels + 1) + 0.05, w: lw, h: 0.38, label: g.label, tone: g.tone, solid: false, size: 14 });
    lx += lw + 0.2;
  });
  if (s.callout) callout(ctx, { x: mx, y: top + t.h + 0.2, w: w - 2 * mx, h: 0.75, ...s.callout });
}

// ------------------------------------------------------------------ cuatro representaciones de un mismo algoritmo
// Campos: panels[{title, tone, type: 'code'|'text'|'lines', code, lang, text, lines[], weight}], topH,
//         flow{title, tone, cols, rowGap, nodes[{id,label,shape,col,row,tone}], edges[{from,to,label,join[a,b]}]}
function representaciones(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.8, topH = s.topH || 2.3, gap = 0.3;
  const total = s.panels.reduce((a, p) => a + (p.weight || 1), 0);
  const avail = w - 2 * mx - gap * (s.panels.length - 1);
  let x = mx;
  s.panels.forEach((p) => {
    const pw = (avail * (p.weight || 1)) / total;
    const t = ctx.T[p.tone || 'teal'];
    surface(ctx, p.tone || 'teal', { x, y: top, w: pw, h: topH });
    text(ctx, p.title, { x: x + 0.3, y: top + 0.1, w: pw - 0.6, h: 0.42, fontSize: 20, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    const area = { x: x + 0.3, y: top + 0.6, w: pw - 0.6, h: topH - 0.7 };
    if (p.type === 'code') {
      const lines = p.code.split('\n');
      const runs = [];
      lines.forEach((ln, i) => {
        const rs = highlightLine(ln, p.lang || 'plain', ctx);
        rs[rs.length - 1].options.breakLine = i < lines.length - 1;
        runs.push(...rs);
      });
      text(ctx, runs, { ...area, fontSize: p.size || 14, fontFace: fonts.code, lineSpacing: (p.size || 14) * 1.18, wrap: false });
    } else if (p.type === 'lines') {
      text(ctx, p.lines.map((ln, i) => ({ text: ln, options: { breakLine: i < p.lines.length - 1 } })), { ...area, fontSize: p.size || 16, color: colors.ink, lineSpacing: (p.size || 16) * 1.45, wrap: false });
    } else {
      text(ctx, p.text, { ...area, fontSize: p.size || 17, color: colors.ink, valign: 'middle' });
    }
    x += pw + gap;
  });

  const f = s.flow;
  const fy = top + topH + 0.15, fh = 6.82 - fy;
  const ft = ctx.T[f.tone || 'slate'];
  surface(ctx, f.tone || 'slate', { x: mx, y: fy, w: w - 2 * mx, h: fh });
  text(ctx, f.title, { x: mx + 0.3, y: fy + 0.1, w: 5, h: 0.42, fontSize: 20, bold: true, color: ft.text, fontFace: fonts.heading, valign: 'middle' });
  const ax = mx + 0.3, aw = w - 2 * mx - 0.6, slot = aw / f.cols;
  const rowY = (r) => fy + 0.9 + r * (f.rowGap || 1.1);
  const size = { terminal: { w: 1.25, h: 0.55 }, process: { w: 1.35, h: 0.55 }, decision: { w: 1.55, h: 0.9 } };
  const node = {};
  f.nodes.forEach((n) => {
    const sz = { ...size[n.shape], ...(n.shape === 'process' && n.label.includes('\n') ? { h: 0.75 } : {}) };
    node[n.id] = { ...n, ...sz, cx: ax + slot * (n.col + 0.5), cy: rowY(n.row) };
  });
  f.nodes.forEach((n) => {
    const q = node[n.id];
    const T = ctx.T[n.tone || 'teal'];
    const shape = { terminal: ctx.pptx.ShapeType.roundRect, process: ctx.pptx.ShapeType.roundRect, decision: ctx.pptx.ShapeType.diamond }[n.shape];
    const o = {
      shape, x: q.cx - q.w / 2, y: q.cy - q.h / 2, w: q.w, h: q.h, fill: { color: T.soft }, line: { color: T.accent, width: 2 },
      color: colors.heading, bold: true, fontSize: 16, fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
    };
    if (n.shape !== 'decision') o.rectRadius = n.shape === 'terminal' ? q.h / 2 : 0.08;
    ctx.slide.addText(n.label, o);
  });
  const side = (a, b) => {
    if (Math.abs(a.cy - b.cy) < 0.01) return b.cx > a.cx ? [{ x: a.cx + a.w / 2, y: a.cy }, { x: b.cx - b.w / 2, y: b.cy }] : [{ x: a.cx - a.w / 2, y: a.cy }, { x: b.cx + b.w / 2, y: b.cy }];
    return b.cy > a.cy ? [{ x: a.cx, y: a.cy + a.h / 2 }, { x: b.cx, y: b.cy - b.h / 2 }] : [{ x: a.cx, y: a.cy - a.h / 2 }, { x: b.cx, y: b.cy + b.h / 2 }];
  };
  f.edges.forEach((e) => {
    const a = node[e.from], b = node[e.to];
    let pts;
    if (e.join) {
      const [j1, j2] = e.join.map((id) => node[id]);
      const xm = (j1.cx + j1.w / 2 + j2.cx - j2.w / 2) / 2;
      pts = [{ x: a.cx - a.w / 2, y: a.cy }, { x: xm, y: a.cy }, { x: xm, y: j1.cy }];
    } else pts = side(a, b);
    polyline(ctx, pts, { color: colors.slate, width: 2.5, arrowHead: true });
    if (e.label) {
      const horiz = Math.abs(pts[0].y - pts[1].y) < 0.01;
      const mx2 = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      text(ctx, e.label, {
        ...(horiz ? { x: mx2 - 0.3, y: my - 0.36, w: 0.6, h: 0.3, align: 'center' } : { x: mx2 + 0.12, y: my - 0.15, w: 0.6, h: 0.3, align: 'left' }),
        fontSize: 16, bold: true, color: colors.heading, valign: 'middle',
      });
    }
  });
}

// ------------------------------------------------------------------ definición, ventajas y desventajas de dos enfoques
// Campos: rows[{title, tone, text, items[{kind: 'pro'|'con', text}]}], labels{pro, con}, bandH, leftW, caption
function ventajas(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85, gap = 0.2, bh = s.bandH || 2.1;
  const lw = s.leftW || 5.6, rx = mx + lw + 0.35, rw = w - mx - rx;
  s.rows.forEach((r, i) => {
    const y = top + i * (bh + gap);
    const t = ctx.T[r.tone || 'teal'];
    surface(ctx, r.tone || 'teal', { x: mx, y, w: lw, h: bh });
    text(ctx, r.title, { x: mx + 0.3, y: y + 0.15, w: lw - 0.6, h: 0.45, fontSize: 22, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    text(ctx, r.text, { x: mx + 0.3, y: y + 0.7, w: lw - 0.6, h: bh - 0.85, fontSize: 16, color: colors.slate });
    surface(ctx, null, { x: rx, y, w: rw, h: bh });
    const ih = (bh - 0.2) / r.items.length;
    r.items.forEach((it, k) => {
      const iy = y + 0.1 + k * ih;
      chip(ctx, { x: rx + 0.25, y: iy + (ih - 0.4) / 2, w: 1.55, h: 0.4, label: s.labels[it.kind], tone: it.kind === 'pro' ? 'green' : 'red', size: 15 });
      text(ctx, it.text, { x: rx + 2.0, y: iy, w: rw - 2.2, h: ih, fontSize: 18, color: colors.ink, valign: 'middle' });
    });
  });
  if (s.caption) text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle' });
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

// ------------------------------------------------------------------ tabla numérica: ¿qué término domina el crecimiento?
// Campos: lead, formula, table{columns, colW, rows}, highlightCols[], callout
function tablaTerminos(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const t = ctx.T.teal;
  text(ctx, [
    { text: s.lead + '  ', options: { fontSize: 20, color: colors.slate } },
    { text: s.formula, options: { fontSize: 24, bold: true, fontFace: fonts.code, color: t.text } },
  ], { x: mx, y: 1.8, w: w - 2 * mx, h: 0.6, align: 'center', valign: 'middle' });
  const hl = new Set(s.highlightCols || []);
  const colW = s.table.colW;
  const tw = colW.reduce((a, b) => a + b, 0);
  const ty = 2.6;
  const tb = table(ctx, {
    x: (w - tw) / 2, y: ty, colW, header: s.table.columns, rows: s.table.rows, rowH: 0.5, fontSize: 17, align: 'center',
    cellStyle: (r, c) => (c === 0 ? { bold: true, color: colors.heading } : hl.has(c) ? { bold: true, color: t.text, fill: colors.tealLight } : {}),
  });
  if (s.callout) callout(ctx, { x: mx, y: ty + tb.h + 0.3, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ traza de loops: valor de i en cada iteración
// Campos: rows[{label, count, code, codeLang, values[], exit, note, tone}], exitLabel, callout
function trazaLoops(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rowH = 1.9, gap = 0.12, y0 = 1.85, codeW = 3.1;
  const red = ctx.T.red;
  s.rows.forEach((r, i) => {
    const y = y0 + i * (rowH + gap);
    const tone = r.tone || 'teal';
    const t = ctx.T[tone];
    C.surface(ctx, tone, { x: mx, y, w: w - 2 * mx, h: rowH });
    codeBlock(ctx, { x: mx + 0.25, y: y + 0.12, w: codeW, code: r.code, lang: r.codeLang, fontSize: 14 });
    const sx = mx + 0.25 + codeW + 0.35;
    const sw = w - mx - 0.25 - sx;
    text(ctx, r.label, { x: sx, y: y + 0.1, w: sw - 2.0, h: 0.4, fontSize: 18, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    chip(ctx, { x: sx + sw - 1.8, y: y + 0.12, w: 1.8, h: 0.38, label: r.count, tone, size: 15 });
    const slot = sw / (r.values.length + 1);
    const cw = slot - 0.07;
    const all = [...r.values, r.exit];
    all.forEach((v, k) => {
      const x = sx + k * slot;
      const isExit = k === r.values.length;
      text(ctx, isExit ? s.exitLabel : String(k + 1), {
        x, y: y + 0.58, w: cw, h: 0.26, fontSize: 14, bold: isExit, color: isExit ? red.text : colors.slate, align: 'center', valign: 'middle',
      });
      ctx.slide.addText(v, {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y: y + 0.86, w: cw, h: 0.55,
        fill: { color: colors.bg },
        line: isExit ? { color: red.accent, width: 2, dashType: 'dash' } : { color: t.accent, width: 1.5 },
        color: isExit ? red.text : t.text, bold: true, fontSize: 16, fontFace: fonts.code,
        align: 'center', valign: 'middle', margin: 0,
      });
    });
    text(ctx, r.note, { x: sx, y: y + 1.47, w: sw, h: 0.35, fontSize: 16, color: colors.slate, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: y0 + 2 * (rowH + gap) + 0.12, w: w - 2 * mx, h: 0.85, ...s.callout });
}

module.exports = {
  'analisis-casos-busqueda': casosBusqueda,
  'analisis-codigo-grafica': codigoGrafica,
  'analisis-grafica': grafica,
  'analisis-arbol-tabla': arbolTabla,
  'analisis-representaciones': representaciones,
  'analisis-ventajas': ventajas,
  'analisis-arbol-niveles': arbolNiveles,
  'analisis-costos-push': costosPush,
  'analisis-tabla-terminos': tablaTerminos,
  'analisis-traza-loops': trazaLoops,
};
