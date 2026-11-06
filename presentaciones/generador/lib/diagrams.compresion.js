// Diagramas de la lección «Algoritmos de Compresión». Se cargan solos desde diagrams.js (prefijo `compresion-`).
const C = require('./components');

const { text, callout, box, arrow } = C;

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

const captionLine = (ctx, str) => {
  const { mx, w } = ctx.theme.page;
  if (str) text(ctx, str, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: ctx.theme.colors.slate, align: 'center', valign: 'middle' });
};

// ------------------------------------------------------------------ imagen reducida a bloques (pérdida de calidad)
// scene{rows[] (una cadena por fila, mismo largo), palette{carácter: color del tema}},
// levels[{label, sub, block (lado del bloque en píxeles de la escena; 1 = sin pérdida), tone, quality (0-100; dibuja un medidor), note}],
// between{label} (flecha entre dos paneles), panelH, caption.
// Cada nivel agrupa la escena en bloques de block×block y pinta cada bloque con el color más frecuente (empate: el primero).
function pixeles(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rows = s.scene.rows, R = rows.length, Cn = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== Cn) throw new Error(`La fila ${i} de la escena mide ${r.length} y no ${Cn}`); });
  const colorOf = (k) => {
    const name = s.scene.palette[k];
    if (!name || !colors[name]) throw new Error(`Carácter «${k}» sin color válido en la paleta`);
    return colors[name];
  };
  const n = s.levels.length;
  const gap = s.between ? 1.5 : 0.3;
  const pw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = 1.85, ph = s.panelH || 4.2, pad = 0.2;

  const reduce = (block) => {
    if (R % block || Cn % block) throw new Error(`El bloque ${block} no divide la escena de ${Cn}×${R}`);
    const grid = [];
    for (let gy = 0; gy < R / block; gy++) {
      const line = [];
      for (let gx = 0; gx < Cn / block; gx++) {
        const count = new Map();
        for (let y = 0; y < block; y++) for (let x = 0; x < block; x++) {
          const k = rows[gy * block + y][gx * block + x];
          count.set(k, (count.get(k) || 0) + 1);
        }
        let best = null;
        count.forEach((v, k) => { if (best === null || v > count.get(best)) best = k; });
        line.push(best);
      }
      grid.push(line);
    }
    return grid;
  };

  s.levels.forEach((lv, i) => {
    const t = ctx.T[lv.tone || 'teal'];
    const x = mx + i * (pw + gap);
    box(ctx, { x, y: top, w: pw, h: ph, fill: t.soft, line: t.accent, lineTransparency: 70 });
    text(ctx, lv.label, { x: x + pad, y: top + 0.12, w: pw - 2 * pad, h: 0.5, fontSize: 24, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    if (lv.sub) text(ctx, lv.sub, { x: x + pad, y: top + 0.6, w: pw - 2 * pad, h: 0.32, fontSize: 15, color: colors.slate, valign: 'middle' });
    const picTop = top + (lv.sub ? 1.0 : 0.7);
    const meterH = lv.quality !== undefined ? 0.5 : 0;
    const noteH = lv.note ? 0.8 : 0;
    const availH = top + ph - pad - noteH - meterH - picTop;
    let iw = pw - 2 * pad, ih = (iw * R) / Cn;
    if (ih > availH) { ih = availH; iw = (ih * Cn) / R; }
    const px = x + (pw - iw) / 2;
    const grid = reduce(lv.block || 1);
    const cw = iw / grid[0].length, chh = ih / grid.length;
    grid.forEach((line, gy) => {
      for (let gx = 0; gx < line.length;) {
        let e = gx;
        while (e + 1 < line.length && line[e + 1] === line[gx]) e++;
        ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
          x: px + gx * cw, y: picTop + gy * chh, w: (e - gx + 1) * cw + 0.012, h: chh + 0.012,
          fill: { color: colorOf(line[gx]) }, line: { type: 'none' },
        });
        gx = e + 1;
      }
    });
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: px, y: picTop, w: iw, h: ih, line: { color: colors.border, width: 1 } });
    let y = picTop + ih + 0.15;
    if (lv.quality !== undefined) {
      const bw = iw - 1.0;
      box(ctx, { x: px, y: y + 0.07, w: bw, h: 0.18, fill: colors.border, shape: 'rect' });
      box(ctx, { x: px, y: y + 0.07, w: Math.max(bw * (lv.quality / 100), 0.02), h: 0.18, fill: t.accent, shape: 'rect' });
      text(ctx, `${lv.quality} %`, { x: px + bw + 0.12, y, w: 0.9, h: 0.32, fontSize: 16, bold: true, color: t.text, fontFace: fonts.code, valign: 'middle' });
      y += meterH;
    }
    if (lv.note) text(ctx, lv.note, { x: x + pad, y, w: pw - 2 * pad, h: noteH - 0.05, fontSize: 16, color: colors.ink, align: 'center', valign: 'middle' });
  });

  if (s.between && n === 2) {
    const ax = mx + pw + 0.2, aw = gap - 0.4, ay = top + ph / 2;
    text(ctx, s.between.label, { x: mx + pw + 0.05, y: ay - 0.8, w: gap - 0.1, h: 0.7, fontSize: 15, bold: true, color: colors.slate, align: 'center', valign: 'bottom' });
    arrow(ctx, { x1: ax, y1: ay, x2: ax + aw, y2: ay, color: colors.slate });
  }
  captionLine(ctx, s.caption);
}

// ------------------------------------------------------------------ LZ77: ventana deslizante sobre una cadena
// text, start (caracteres iniciales que ya están en el diccionario; 0), dict (tamaño del diccionario), buffer (tamaño del buffer),
// nextInBuffer (true: el buffer incluye el carácter siguiente, la coincidencia mide como máximo buffer-1; false: la coincidencia ocupa todo el buffer),
// labels{dict, match, next, buffer} (por defecto «Diccionario (tamaño = n)», …), highlight[] (filas que se destacan),
// rowStep, cellH, tripleSize, callout, calloutH, caption.
// Las tripletas (offset, longitud, siguiente) se calculan: la coincidencia más larga (a igual longitud, el offset menor) puede solaparse con el buffer.
function lz77(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const chars = [...s.text], n = chars.length;
  const maxMatch = s.nextInBuffer === false ? s.buffer : s.buffer - 1;
  const steps = [];
  for (let p = s.start || 0; p < n;) {
    let best = { len: 0, off: 0 };
    for (let off = 1; off <= s.dict && p - off >= 0; off++) {
      let l = 0;
      while (l < maxMatch && p + l < n - 1 && chars[p - off + l] === chars[p + l]) l++;
      if (l > best.len) best = { len: l, off };
    }
    steps.push({ p, ...best, next: p + best.len });
    p += best.len + 1;
  }

  const lab = { dict: `Diccionario (tamaño = ${s.dict})`, match: 'Coincidencia más larga', next: 'Siguiente carácter', buffer: `Buffer (tamaño = ${s.buffer})`, ...s.labels };
  const green = ctx.T.green, teal = ctx.T.teal, amber = ctx.T.amber, red = ctx.T.red;
  const sw = 0.3, ls = 15, estW = (str) => str.length * ls * 0.0065 + 0.1;
  const items = [
    { kind: 'dict', label: lab.dict, w: sw },
    { kind: 'match', label: lab.match, w: sw },
    { kind: 'next', label: lab.next, w: sw },
    { kind: 'buffer', label: lab.buffer, w: 4 * 0.2 + 0.1 },
  ];
  const right = w - mx;
  let lx = mx, ly = 1.85;
  const cellStyle = {
    dict: { fill: green.soft, line: green.accent },
    match: { fill: teal.accent, line: teal.accent },
    next: { fill: amber.accent, line: amber.accent },
  };
  items.forEach((it) => {
    const total = it.w + 0.1 + estW(it.label) + 0.3;
    if (lx + total - 0.3 > right + 0.01 && lx > mx) { lx = mx; ly += 0.45; }
    if (it.kind === 'buffer') {
      for (let k = 0; k < 4; k++) ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx + k * 0.2, y: ly + 0.03, w: 0.2, h: 0.28, fill: { color: colors.panel }, line: { color: colors.border, width: 1 } });
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx - 0.015, y: ly - 0.03, w: 0.03, h: 0.4, fill: { color: red.accent }, line: { type: 'none' } });
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx + 0.8 - 0.015, y: ly - 0.03, w: 0.03, h: 0.4, fill: { color: colors.heading }, line: { type: 'none' } });
    } else {
      const st = cellStyle[it.kind];
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx, y: ly + 0.02, w: sw, h: 0.3, fill: { color: st.fill }, line: { color: st.line, width: 1 } });
    }
    text(ctx, it.label, { x: lx + it.w + 0.1, y: ly, w: estW(it.label), h: 0.34, fontSize: ls, color: colors.ink, valign: 'middle' });
    lx += total;
  });

  const tripleW = 1.95, ch = s.cellH || 0.56, step = s.rowStep || 0.72;
  const cw = (right - mx - tripleW - 0.1) / n;
  const top = ly + 0.55;
  const tripleX = mx + n * cw + 0.25;
  const hl = new Set(s.highlight || []);
  const bar = (x, y, color) => ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: x - 0.02, y: y - 0.1, w: 0.04, h: ch + 0.2, fill: { color }, line: { type: 'none' } });

  steps.forEach((st, i) => {
    const y = top + i * step;
    const lo = Math.max(0, st.p - s.dict);
    if (hl.has(i)) box(ctx, { x: mx - 0.12, y: y - 0.14, w: right - mx + 0.24, h: ch + 0.28, fill: amber.soft, line: amber.accent, lineWidth: 1.5 });
    chars.forEach((c, k) => {
      const kind = k === st.next ? 'next' : k >= st.p && k < st.next ? 'match' : k >= lo && k < st.p ? 'dict' : null;
      const sty = kind ? cellStyle[kind] : { fill: colors.panel, line: colors.border };
      const ink = kind === 'match' ? teal.on : kind === 'next' ? amber.on : kind === 'dict' ? green.text : colors.slate;
      ctx.slide.addText(c, {
        shape: ctx.pptx.ShapeType.rect, x: mx + k * cw, y, w: cw, h: ch,
        fill: { color: sty.fill }, line: { color: sty.line, width: 1 }, color: ink,
        bold: true, fontSize: 20, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
      });
    });
    bar(mx + st.p * cw, y, red.accent);
    if (st.p + s.buffer <= n) bar(mx + (st.p + s.buffer) * cw, y, colors.heading);
    const tri = `(${st.len ? st.off : '_'}, ${st.len}, ${chars[st.next]})`;
    text(ctx, tri, { x: tripleX, y, w: tripleW, h: ch, fontSize: s.tripleSize || 22, bold: true, color: colors.heading, fontFace: fonts.code, valign: 'middle' });
  });

  if (s.callout) callout(ctx, { x: mx, y: top + steps.length * step + 0.05, w: w - 2 * mx, h: s.calloutH || 0.8, size: 16, ...s.callout });
  captionLine(ctx, s.caption);
}

module.exports = { 'compresion-intervalos': intervalos, 'compresion-pixeles': pixeles, 'compresion-lz77': lz77 };
