// Diagramas de la lección «Algoritmos de Compresión». Se cargan solos desde diagrams.js (prefijo `compresion-`).
const C = require('./components');

const { text, callout } = C;

// Números sin ruido de coma flotante: 0.27 y no 0.27000000000000002.
const num = (x) => String(Number(x.toFixed(10)));
const interval = (a, b) => `[${num(a)}, ${num(b)})`;

// ------------------------------------------------------------------ intervalos de la codificación aritmética
// probs[[símbolo, probabilidad]], path[símbolos] (mensaje que se codifica o que resulta al decodificar),
// marker (número que se ubica al decodificar; opcional; se señala con un triángulo sobre cada fila), labels[] (una por símbolo y una final; por defecto «Leer «X»» y «Resultado»),
// finalLabel (prefijo del intervalo final), showProbs (porcentajes en la primera fila; true), top, rowStep, callout | callouts[], calloutY, calloutH.
// Cada fila subdivide el intervalo vigente en partes proporcionales a las probabilidades y resalta la parte elegida;
// líneas punteadas la amplían hasta ocupar toda la fila siguiente (los intervalos son semiabiertos: [a, b)).
function intervalos(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rowH = s.rowH || 0.64, step = s.rowStep || 1.0, y0 = s.top || 1.95;
  const labelW = 2.15, barX = mx + 2.3, barW = w - mx - barX;
  const teal = ctx.T.teal, green = ctx.T.green, red = ctx.T.red;

  let lo = 0, hi = 1;
  const rows = s.path.map((sym) => {
    let cum = 0;
    const parts = s.probs.map(([k, p]) => {
      const part = { k, p, cum, a: lo + (hi - lo) * cum, b: lo + (hi - lo) * (cum + p) };
      cum += p;
      return part;
    });
    const row = { lo, hi, parts, pick: sym };
    const chosen = parts.find((q) => q.k === sym);
    if (!chosen) throw new Error(`Símbolo «${sym}» no está en probs`);
    lo = chosen.a;
    hi = chosen.b;
    return row;
  });
  const final = { lo, hi };

  const line = (x1, y1, x2, y2, opts) => {
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.01), h: Math.max(Math.abs(y2 - y1), 0.01),
      flipH: x2 < x1, flipV: y2 < y1, line: opts,
    });
  };
  const marker = (y, a, b) => {
    if (s.marker === undefined) return;
    const x = barX + ((s.marker - a) / (b - a)) * barW;
    ctx.slide.addShape(ctx.pptx.ShapeType.triangle, { x: x - 0.12, y: y - 0.24, w: 0.24, h: 0.22, flipV: true, fill: { color: red.accent }, line: { type: 'none' } });
  };

  rows.forEach((r, i) => {
    const y = y0 + i * step;
    text(ctx, [
      { text: (s.labels && s.labels[i]) || `Leer «${r.pick}»`, options: { bold: true, fontSize: 17, color: colors.heading, breakLine: true } },
      { text: interval(r.lo, r.hi), options: { fontFace: fonts.code, fontSize: 14, color: colors.slate } },
    ], { x: mx, y, w: labelW, h: rowH, valign: 'middle' });
    r.parts.forEach((q) => {
      const chosen = q.k === r.pick;
      const head = i === 0 && s.showProbs !== false ? `${q.k}  ${Math.round(q.p * 100)} %` : q.k;
      ctx.slide.addText([
        { text: head, options: { bold: true, fontSize: 18, breakLine: true } },
        { text: interval(q.a, q.b), options: { fontFace: fonts.code, fontSize: 14 } },
      ], {
        shape: ctx.pptx.ShapeType.rect, x: barX + q.cum * barW, y, w: q.p * barW, h: rowH,
        fill: { color: chosen ? teal.accent : colors.panel },
        line: { color: chosen ? colors.amberMid : colors.border, width: chosen ? 3 : 1 },
        color: chosen ? teal.on : colors.ink, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
      });
    });
    // ampliación de la parte elegida hasta la fila siguiente
    const ch = r.parts.find((q) => q.k === r.pick);
    const x1 = barX + ch.cum * barW, x2 = x1 + ch.p * barW;
    const dash = { color: colors.slate, width: 1.25, dashType: 'dash' };
    line(x1, y + rowH, barX, y + step, dash);
    line(x2, y + rowH, barX + barW, y + step, dash);
    marker(y, r.lo, r.hi);
  });

  // fila final: el intervalo resultante
  const fy = y0 + rows.length * step;
  text(ctx, (s.labels && s.labels[rows.length]) || 'Resultado', { x: mx, y: fy, w: labelW, h: rowH, fontSize: 17, bold: true, color: colors.heading, valign: 'middle' });
  ctx.slide.addText(`${s.finalLabel || ''}${interval(final.lo, final.hi)}`, {
    shape: ctx.pptx.ShapeType.rect, x: barX, y: fy, w: barW, h: rowH, fill: { color: green.soft }, line: { color: green.accent, width: 2 },
    color: green.text, bold: true, fontSize: 20, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
  });
  marker(fy, final.lo, final.hi);

  const cy = s.calloutY || fy + rowH + 0.3, ch = s.calloutH || 0.85;
  if (s.callout) callout(ctx, { x: mx, y: cy, w: w - 2 * mx, h: ch, size: 16, ...s.callout });
  if (s.callouts) {
    const k = s.callouts.length;
    const cw = (w - 2 * mx - (k - 1) * 0.3) / k;
    s.callouts.forEach((c, i) => callout(ctx, { x: mx + i * (cw + 0.3), y: cy, w: cw, h: ch, size: 16, ...c }));
  }
}

module.exports = { 'compresion-intervalos': intervalos };
