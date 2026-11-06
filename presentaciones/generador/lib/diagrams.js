const C = require('./components');

const { text, paragraphs, box, chip, circleLabel, arrow, callout, codeBlock, card, table } = C;

const chipW = (label, size = 14) => label.length * (size * 0.0072) + 0.45;

// ------------------------------------------------------------------ arquitectura de un DBMS
function dbmsArchitecture(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.9, h = 4.0, side = 2.6, gap = 0.75;
  const cx = mx + side + gap;
  const cw = w - 2 * mx - 2 * (side + gap);

  // Programas
  box(ctx, { x: mx, y: top + 0.7, w: side, h: h - 1.4, fill: colors.panel, line: colors.border });
  text(ctx, s.left.title, { x: mx + 0.2, y: top + 1.0, w: side - 0.4, h: 0.9, fontSize: 22, bold: true, color: colors.heading, align: 'center', valign: 'middle', fontFace: fonts.heading });
  text(ctx, s.left.text, { x: mx + 0.2, y: top + 1.95, w: side - 0.4, h: 0.8, fontSize: 16, color: colors.slate, align: 'center' });

  // DBMS
  box(ctx, { x: cx, y: top, w: cw, h, fill: colors.tealLight, line: colors.teal, lineWidth: 1.5 });
  text(ctx, s.dbms.title, { x: cx, y: top + 0.12, w: cw, h: 0.5, fontSize: 22, bold: true, color: colors.tealDark, align: 'center', valign: 'middle', fontFace: fonts.heading });
  s.dbms.components.forEach((label, i) => {
    const y = top + 0.75 + i * (0.52 + 0.12);
    ctx.slide.addText(label, {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.1, x: cx + 0.3, y, w: cw - 0.6, h: 0.52,
      fill: { color: colors.bg }, line: { color: colors.teal, width: 1 }, color: colors.ink, fontSize: 17,
      fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0, lang: 'es-ES',
    });
  });

  // Datos
  const rx = w - mx - side;
  ctx.slide.addText(s.right.title, {
    shape: ctx.pptx.ShapeType.can, x: rx + 0.2, y: top + 0.5, w: side - 0.4, h: 2.3,
    fill: { color: colors.navy }, line: { type: 'none' }, color: colors.white, fontSize: 22, bold: true,
    fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0, lang: 'es-ES',
  });
  text(ctx, s.right.text, { x: rx, y: top + 3.0, w: side, h: 0.6, fontSize: 16, color: colors.slate, align: 'center' });

  const my = top + h / 2;
  arrow(ctx, { x1: mx + side + 0.05, y1: my, x2: cx - 0.05, y2: my, color: colors.teal, both: true });
  arrow(ctx, { x1: cx + cw + 0.05, y1: my, x2: rx - 0.05 + 0.2, y2: my, color: colors.teal, both: true });

  if (s.callout) callout(ctx, { x: mx, y: 6.05, w: w - 2 * mx, h: 0.75, ...s.callout });
}

// ------------------------------------------------------------------ tabla anotada (terminología)
function annotatedTable(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const tx = 1.0, ty = 2.95;
  const colW = [0.8, 1.25, 0.85, 2.7];
  const t = table(ctx, {
    x: tx, y: ty, colW, header: s.table.columns, rows: s.table.rows, rowH: 0.55, fontSize: 16,
    cellStyle: (r, c) => (c === 0 ? { fill: colors.tealLight, bold: true } : r === 1 ? { fill: colors.amberLight } : {}),
  });
  const L = s.labels;

  // Relación
  chip(ctx, { x: tx, y: 2.2, w: chipW(L.relation, 15), h: 0.42, label: L.relation, tone: 'navy', size: 15 });
  // Atributo -> encabezado de CARRERA
  const ax = t.colLeft(3) + colW[3] / 2;
  const aw = chipW(L.attribute, 15);
  chip(ctx, { x: ax - aw / 2, y: 2.2, w: aw, h: 0.42, label: L.attribute, tone: 'slate', size: 15 });
  arrow(ctx, { x1: ax, y1: 2.64, x2: ax, y2: ty - 0.03, color: colors.slate });
  // Clave primaria -> columna ID
  const kx = t.colLeft(0) + colW[0] / 2;
  const by = ty + t.h;
  chip(ctx, { x: tx, y: by + 0.4, w: chipW(L.key, 15), h: 0.42, label: L.key, tone: 'teal', size: 15 });
  arrow(ctx, { x1: kx, y1: by + 0.38, x2: kx, y2: by + 0.04, color: colors.teal });
  // Tupla -> segunda fila
  const ry = t.rowTop(2) + t.rowH[2] / 2;
  const tw = chipW(L.tuple, 15);
  chip(ctx, { x: tx + t.w + 0.5, y: ry - 0.21, w: tw, h: 0.42, label: L.tuple, tone: 'amber', size: 15 });
  arrow(ctx, { x1: tx + t.w + 0.48, y1: ry, x2: tx + t.w + 0.06, y2: ry, color: colors.amberMid });

  // Panel de términos adicionales
  const px = 9.1, pw = w - mx - px;
  box(ctx, { x: px, y: 2.2, w: pw, h: 3.75, fill: colors.panel, line: colors.border });
  text(ctx, s.termsTitle, { x: px + 0.3, y: 2.4, w: pw - 0.6, h: 0.45, fontSize: 20, bold: true, color: colors.heading, valign: 'middle' });
  paragraphs(ctx, s.terms, { x: px + 0.3, y: 3.0, w: pw - 0.6, h: 2.8, fontSize: 17, color: colors.slate, spaceAfter: 12 });
}

// ------------------------------------------------------------------ relación muchos-a-muchos
function m2m(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const ty = 2.6, rh = 0.5;
  const widths = s.tables.map((t) => t.colW.reduce((a, b) => a + b, 0));
  const gap = (w - 2 * mx - widths.reduce((a, b) => a + b, 0)) / (s.tables.length - 1);
  let x = mx;
  const placed = [];
  s.tables.forEach((t, i) => {
    const tb = table(ctx, {
      x, y: ty, colW: t.colW, header: t.columns, rows: t.rows, rowH: rh, fontSize: 16,
      cellStyle: (r, c) => ({ fill: t.role === 'fk' ? colors.amberLight : c === 0 ? colors.tealLight : colors.rowA }),
    });
    const lw = chipW(t.name, 16);
    chip(ctx, { x: x + (widths[i] - lw) / 2, y: 2.05, w: lw, h: 0.42, label: t.name, tone: t.role === 'fk' ? 'amber' : 'navy', size: 16 });
    placed.push({ x, w: widths[i], tb });
    x += widths[i] + gap;
  });
  const ay = ty + rh + rh / 2;
  const [A, B, Cc] = placed;
  const fx = (x1, x2) => {
    arrow(ctx, { x1, y1: ay, x2, y2: ay, color: colors.amberMid, width: 3 });
    chip(ctx, { x: (x1 + x2) / 2 - 0.3, y: ay - 0.55, w: 0.6, h: 0.36, label: 'FK', tone: 'amber', size: 14 });
  };
  fx(B.x - 0.06, A.x + A.w + 0.06);
  fx(B.x + B.w + 0.06, Cc.x - 0.06);

  chip(ctx, { x: mx, y: 4.85, w: 2.5, h: 0.4, label: s.legend.pk, tone: 'teal', solid: false, size: 15 });
  chip(ctx, { x: mx + 2.7, y: 4.85, w: 2.5, h: 0.4, label: s.legend.fk, tone: 'amber', solid: false, size: 15 });
  callout(ctx, { x: mx, y: 5.5, w: w - 2 * mx, h: 1.15, ...s.callout });
}

// ------------------------------------------------------------------ full table scan
function scan(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  codeBlock(ctx, { x: mx, y: 1.85, w: 7.0, code: s.query, fontSize: 17 });
  text(ctx, s.cost, { x: 8.5, y: 1.7, w: w - mx - 8.5, h: 1.1, fontSize: 60, bold: true, color: ctx.T.red.accent, valign: 'middle' });
  text(ctx, s.costText, { x: 8.5, y: 2.8, w: w - mx - 8.5, h: 0.5, fontSize: 17, color: colors.slate });

  text(ctx, s.stripLabel, { x: mx, y: 3.45, w: 8, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  const n = s.rows, gap = 0.1;
  const bw = (w - 2 * mx - (n - 1) * gap) / n;
  for (let i = 0; i < n; i++) {
    const hit = i === s.match - 1;
    ctx.slide.addText(String(i + 1), {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x: mx + i * (bw + gap), y: 3.9, w: bw, h: 0.75,
      fill: { color: hit ? colors.teal : colors.amberLight }, line: { color: hit ? colors.teal : colors.amberMid, width: 1 },
      color: hit ? ctx.T.teal.on : colors.amber, bold: true, fontSize: 18, fontFace: ctx.theme.fonts.body,
      align: 'center', valign: 'middle', margin: 0,
    });
  }
  arrow(ctx, { x1: mx, y1: 4.9, x2: w - mx, y2: 4.9, color: ctx.T.red.accent, width: 3 });
  text(ctx, s.caption, { x: mx, y: 5.0, w: w - 2 * mx, h: 0.45, fontSize: 17, color: colors.slate, align: 'center', valign: 'middle' });
  if (s.callout) callout(ctx, { x: mx, y: 5.85, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ índice secundario
function indexMap(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  text(ctx, s.intro, { x: mx, y: 1.75, w: w - 2 * mx, h: 0.55, fontSize: 19, color: colors.slate, valign: 'middle' });
  const ty = 3.15, rh = 0.55;
  const ix = mx;
  const iw = s.index.colW.reduce((a, b) => a + b, 0);
  const tx = 5.0;
  const tw = s.table.colW.reduce((a, b) => a + b, 0);
  const it = table(ctx, {
    x: ix, y: ty, colW: s.index.colW, header: s.index.columns, rows: s.index.rows, rowH: [0.5, rh, rh, rh], fontSize: 16,
    cellStyle: () => ({ fill: colors.tealLight }),
  });
  const tt = table(ctx, { x: tx, y: ty, colW: s.table.colW, header: s.table.columns, rows: s.table.rows, rowH: [0.5, rh, rh, rh], fontSize: 16 });
  const l1 = chipW(s.index.title, 15), l2 = chipW(s.table.title, 15);
  chip(ctx, { x: ix, y: 2.5, w: l1, h: 0.42, label: s.index.title, tone: 'teal', size: 15 });
  chip(ctx, { x: tx, y: 2.5, w: l2, h: 0.42, label: s.table.title, tone: 'navy', size: 15 });
  for (let i = 0; i < 3; i++) {
    const y = it.rowTop(i + 1) + rh / 2;
    arrow(ctx, { x1: ix + iw + 0.04, y1: y, x2: tx - 0.04, y2: y, color: colors.teal, width: 2.5 });
  }
  const rx = 8.65, rw = w - mx - rx;
  let y = 2.5;
  s.cards.forEach((c) => {
    card(ctx, { textSize: 16, ...c }, { x: rx, y, w: rw, h: c.h });
    y += c.h + 0.2;
  });
  if (s.callout) callout(ctx, { x: mx, y: 5.7, w: rx - mx - 0.4, h: 1.0, ...s.callout });
}

// ------------------------------------------------------------------ JOIN con resultado
function joinResult(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  text(ctx, s.queryLabel, { x: mx, y: 1.8, w: 6, h: 0.4, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  const ch = codeBlock(ctx, { x: mx, y: 2.3, w: 6.5, code: s.query, lang: s.queryLang, fontSize: s.queryFontSize || 16 });
  ctx.slide.addShape(ctx.pptx.ShapeType.rightArrow, {
    x: 7.45, y: 2.3 + ch / 2 - 0.25, w: 0.5, h: 0.5, fill: { color: colors.teal }, line: { type: 'none' },
  });
  const rw = s.result.colW.reduce((a, b) => a + b, 0);
  const rx = w - mx - rw;
  text(ctx, s.resultLabel, { x: rx, y: 1.8, w: 4, h: 0.4, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  const rt = table(ctx, {
    x: rx, y: 2.3, colW: s.result.colW, header: s.result.columns, rows: s.result.rows, rowH: 0.55, fontSize: 17, headerFill: colors.teal, headerColor: ctx.T.teal.on,
    cellStyle: (r, c) => (String(s.result.rows[r][c]) === 'NULL' ? { color: ctx.T.amber.text, bold: true } : undefined),
  });
  if (s.callout) callout(ctx, { x: mx, y: Math.max(5.2, 2.3 + rt.h + 0.3), w: w - 2 * mx, h: 1.0, ...s.callout });
}

// ------------------------------------------------------------------ diagramas de Venn para JOIN
function lensPoints(r, d, steps = 40) {
  const th = Math.acos(d / (2 * r));
  const pts = [];
  const raw = [];
  for (let i = 0; i <= steps; i++) {
    const t = -th + (2 * th * i) / steps;
    raw.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI - th + (2 * th * i) / steps;
    raw.push([d + r * Math.cos(t), r * Math.sin(t)]);
  }
  const x0 = d - r, hh = r * Math.sin(th);
  raw.forEach(([x, y], i) => pts.push(i === 0 ? { x: x - x0, y: y + hh, moveTo: true } : { x: x - x0, y: y + hh }));
  pts.push({ close: true });
  return { pts, x0, w: 2 * r - d, h: 2 * hh };
}

function venn(ctx, { cx, y, type }) {
  const { colors, fonts } = ctx.theme;
  const r = 0.55, d = 0.72;
  const ax = cx - (d + 2 * r) / 2;
  const bx = ax + d;
  const circle = (x, o) => ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x, y, w: 2 * r, h: 2 * r, ...o });
  const excl = type.endsWith('-excl'); // «solo A», «solo B» o «A o B pero no ambas»: se excluye la intersección
  const base = excl ? type.slice(0, -5) : type;
  const fillA = base === 'left' || base === 'full';
  const fillB = base === 'right' || base === 'full';
  circle(ax, { fill: { color: fillA ? colors.teal : colors.panel }, line: { type: 'none' } });
  circle(bx, { fill: { color: fillB ? colors.teal : colors.panel }, line: { type: 'none' } });
  if (type === 'inner' || excl) {
    const lens = lensPoints(r, d);
    ctx.slide.addShape(ctx.pptx.ShapeType.custGeom, {
      x: bx, y: y + r - lens.h / 2, w: lens.w, h: lens.h, points: lens.pts,
      fill: { color: excl ? colors.panel : colors.teal }, line: { type: 'none' },
    });
  }
  circle(ax, { line: { color: colors.heading, width: 2 } });
  circle(bx, { line: { color: colors.heading, width: 2 } });
  const label = (t, x, on) =>
    text(ctx, t, { x: x + r - 0.2, y: y + r - 0.2, w: 0.4, h: 0.4, fontSize: 18, bold: true, color: on ? ctx.T.teal.on : colors.heading, align: 'center', valign: 'middle', fontFace: fonts.heading });
  label('A', ax - 0.2, fillA);
  label('B', bx + 0.2, fillB);
}

function vennGrid(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  text(ctx, s.intro, { x: mx, y: 1.75, w: w - 2 * mx, h: 0.55, fontSize: 19, color: colors.slate, valign: 'middle' });
  const n = s.items.length, gap = 0.27;
  const cw = (w - 2 * mx - (n - 1) * gap) / n;
  const y = 2.45, h = 3.45;
  s.items.forEach((it, i) => {
    const x = mx + i * (cw + gap);
    box(ctx, { x, y, w: cw, h, fill: colors.panel, line: colors.border });
    venn(ctx, { cx: x + cw / 2, y: y + 0.35, type: it.type });
    text(ctx, it.title, { x: x + 0.2, y: y + 1.65, w: cw - 0.4, h: 0.45, fontSize: 19, bold: true, color: colors.heading, align: 'center', valign: 'middle', fontFace: fonts.heading });
    text(ctx, it.text, { x: x + 0.25, y: y + 2.2, w: cw - 0.5, h: 1.1, fontSize: 16, color: colors.slate, align: 'center' });
  });
  if (s.callout) callout(ctx, { x: mx, y: 6.05, w: w - 2 * mx, h: 0.75, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ línea de tiempo + tarjetas
function timelineCards(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const lineY = 2.75;
  ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: mx, y: lineY, w: w - 2 * mx, h: 0, line: { color: colors.border, width: 3 } });
  const n = s.events.length;
  const colW = (w - 2 * mx) / n;
  s.events.forEach((e, i) => {
    const x = mx + i * colW;
    text(ctx, e.year, { x, y: 1.8, w: colW, h: 0.75, fontSize: 40, bold: true, color: colors.teal, valign: 'middle', fontFace: fonts.heading });
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x, y: lineY - 0.13, w: 0.26, h: 0.26, fill: { color: colors.teal }, line: { color: colors.bg, width: 2 } });
    text(ctx, e.title, { x, y: 3.0, w: colW - 0.5, h: 0.4, fontSize: 19, bold: true, color: colors.heading, valign: 'middle' });
    text(ctx, e.text, { x, y: 3.45, w: colW - 0.5, h: 0.9, fontSize: 16, color: colors.slate });
  });
  const k = s.cards.length, gap = 0.3;
  const cw = (w - 2 * mx - (k - 1) * gap) / k;
  s.cards.forEach((c, i) => card(ctx, { textSize: 16, ...c }, { x: mx + i * (cw + gap), y: 4.6, w: cw, h: 2.15 }));
}

// ------------------------------------------------------------------ escalar hacia arriba / afuera
function server(ctx, { x, y, w, h }) {
  const { colors } = ctx.theme;
  box(ctx, { x, y, w, h, fill: colors.serverFill, line: colors.slate, lineWidth: 1.5, radius: 0.06 });
  const slit = h * 0.1;
  for (let i = 0; i < 3; i++) {
    box(ctx, { x: x + w * 0.15, y: y + h * 0.12 + i * slit * 1.5, w: w * 0.7, h: slit, fill: colors.serverSlit, shape: 'rect' });
  }
  ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: x + w * 0.15, y: y + h * 0.78, w: h * 0.07, h: h * 0.07, fill: { color: colors.teal }, line: { type: 'none' } });
}

function scale(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const pw = (w - 2 * mx - 0.5) / 2, top = 1.85, h = 4.0;
  const floor = top + 3.3;
  [['up', mx], ['out', mx + pw + 0.5]].forEach(([key, x]) => {
    const p = s[key];
    box(ctx, { x, y: top, w: pw, h, fill: key === 'out' ? colors.tealLight : colors.panel, line: key === 'out' ? colors.teal : colors.border, lineTransparency: key === 'out' ? 70 : 0 });
    text(ctx, p.title, { x: x + 0.35, y: top + 0.2, w: pw - 0.7, h: 0.45, fontSize: 22, bold: true, color: key === 'out' ? colors.tealDark : colors.heading, valign: 'middle', fontFace: fonts.heading });
    text(ctx, p.subtitle, { x: x + 0.35, y: top + 0.7, w: pw - 0.7, h: 0.65, fontSize: 17, color: colors.slate });
    const sw = 0.7, sh = 1.1;
    const ay = floor - 0.55;
    if (key === 'up') {
      server(ctx, { x: x + 0.8, y: floor - sh, w: sw, h: sh });
      arrow(ctx, { x1: x + 1.8, y1: ay, x2: x + 2.8, y2: ay, color: colors.teal, width: 3 });
      server(ctx, { x: x + 3.3, y: floor - 1.85, w: 1.3, h: 1.85 });
    } else {
      server(ctx, { x: x + 0.35, y: floor - sh, w: sw, h: sh });
      arrow(ctx, { x1: x + 1.25, y1: ay, x2: x + 1.85, y2: ay, color: colors.teal, width: 3 });
      for (let i = 0; i < 4; i++) server(ctx, { x: x + 2.1 + i * 0.85, y: floor - sh, w: sw, h: sh });
    }
    text(ctx, p.caption, { x: x + 0.35, y: top + h - 0.5, w: pw - 0.7, h: 0.35, fontSize: 16, bold: true, color: key === 'out' ? colors.tealDark : colors.slate, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: 6.05, w: w - 2 * mx, h: 0.75, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ diseño: tabla plana con redundancia
function flatTable(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const hl = new Set((s.highlight || []).map(([r, c]) => `${r}:${c}`));
  chip(ctx, { x: mx, y: 1.78, w: chipW(s.tableLabel, 15), h: 0.4, label: s.tableLabel, tone: 'navy', size: 15 });
  table(ctx, {
    x: mx, y: 2.3, colW: s.table.colW, header: s.table.columns, rows: s.table.rows, rowH: 0.5, fontSize: 16,
    cellStyle: (r, c) => (hl.has(`${r}:${c}`) ? { fill: colors.amberLight, color: colors.amber, bold: true } : {}),
  });
  const k = s.cards.length, gap = 0.3;
  const cw = (w - 2 * mx - (k - 1) * gap) / k;
  s.cards.forEach((c, i) => card(ctx, { textSize: 16, titleSize: 20, ...c }, { x: mx + i * (cw + gap), y: 5.0, w: cw, h: 1.8 }));
}

// ------------------------------------------------------------------ diseño: entidades con atributos
function entities(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.entities.length, gap = 0.3;
  const pw = s.puzzle ? 3.0 : 0;
  const areaW = w - 2 * mx - (s.puzzle ? pw + 0.4 : 0);
  const ew = (areaW - (n - 1) * gap) / n;
  const rows = Math.max(...s.entities.map((e) => e.attrs.length));
  const y = 1.95, hd = 0.6, rh = 0.5;
  const h = hd + rows * rh + 0.35;
  s.entities.forEach((e, i) => {
    const x = mx + i * (ew + gap);
    box(ctx, { x, y, w: ew, h, fill: colors.panel, line: colors.border });
    box(ctx, { x, y, w: ew, h: hd, fill: colors.teal });
    box(ctx, { x, y: y + hd - 0.2, w: ew, h: 0.2, fill: colors.teal, shape: 'rect' });
    text(ctx, e.name, { x, y, w: ew, h: hd, fontSize: 20, bold: true, color: ctx.T.teal.on, align: 'center', valign: 'middle', fontFace: fonts.heading });
    e.attrs.forEach((a, j) => {
      const at = typeof a === 'string' ? { name: a } : a;
      const ay = y + hd + 0.2 + j * rh;
      text(ctx, at.name, { x: x + 0.3, y: ay, w: ew - 0.6, h: rh - 0.05, fontSize: 18, color: colors.ink, fontFace: fonts.code, valign: 'middle' });
      if (at.tag) {
        text(ctx, at.tag, { x: x + 0.3, y: ay, w: ew - 0.6, h: rh - 0.05, fontSize: 13, color: colors.teal, align: 'right', valign: 'middle' });
      }
    });
  });
  if (s.puzzle) {
    const px = w - mx - pw;
    card(ctx, { textSize: 17, titleSize: 22, ...s.puzzle }, { x: px, y, w: pw, h });
  }
  if (s.callout) callout(ctx, { x: mx, y: y + h + 0.45, w: w - 2 * mx, h: 1.0, ...s.callout });
}

// ------------------------------------------------------------------ diseño: modelo entidad-relación
function er(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.entities.length;
  const ew = 2.6, eh = 1.0, y = 2.0;
  const step = (w - 2 * mx - ew) / (n - 1);
  const xs = s.entities.map((_, i) => mx + i * step);
  s.entities.forEach((e, i) => {
    ctx.slide.addText(e.name, {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.12, x: xs[i], y, w: ew, h: eh,
      fill: { color: colors.panel }, line: { color: colors.teal, width: 2 }, color: colors.heading, bold: true, fontSize: 22,
      fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
  });
  const ly = y + eh / 2;
  s.links.forEach((l) => {
    const x1 = xs[l.from] + ew, x2 = xs[l.to];
    ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: x1, y: ly, w: x2 - x1, h: 0, line: { color: colors.slate, width: 2.5 } });
    const tag = (t, x, align) => text(ctx, t, { x, y: ly - 0.5, w: 0.55, h: 0.4, fontSize: 22, bold: true, color: colors.teal, align, valign: 'middle', fontFace: fonts.code });
    tag(l.fromCard, x1 + 0.12, 'left');
    tag(l.toCard, x2 - 0.67, 'right');
    const lw = l.label.length * 0.12 + 0.6;
    chip(ctx, { x: (x1 + x2) / 2 - lw / 2, y: ly - 0.2, w: lw, h: 0.4, label: l.label, tone: 'navy', size: 15 });
    if (l.attr) {
      const aw = l.attr.length * 0.11 + 0.5;
      chip(ctx, { x: (x1 + x2) / 2 - aw / 2, y: ly + 0.3, w: aw, h: 0.38, label: l.attr, tone: 'amber', solid: false, size: 14 });
    }
  });
  const k = s.cards.length, gap = 0.3;
  const cw = (w - 2 * mx - (k - 1) * gap) / k;
  s.cards.forEach((c, i) => card(ctx, { textSize: 18, titleSize: 20, ...c }, { x: mx + i * (cw + gap), y: 3.9, w: cw, h: 2.0 }));
  if (s.callout) callout(ctx, { x: mx, y: 6.05, w: w - 2 * mx, h: 0.7, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ diseño: esquema relacional con claves
function schema(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.tables.length, tw = 2.7;
  const gap = (w - 2 * mx - n * tw) / (n - 1);
  const ty = 2.7, rh = 0.5;
  const hl = new Set((s.highlight || []).map(([t, r]) => `${t}:${r}`));
  const placed = s.tables.map((t, i) => {
    const x = mx + i * (tw + gap);
    const tb = table(ctx, {
      x, y: ty, colW: [tw - 0.95, 0.95], rows: t.rows, rowH: rh, fontSize: 16, cellMargin: [0, 0.08, 0, 0.08],
      cellStyle: (r, c) => {
        const key = t.rows[r][1];
        if (c === 1) {
          if (!key) return {};
          const fk = key.includes('FK');
          return { fill: fk ? colors.amberLight : colors.tealLight, color: fk ? colors.amber : colors.tealDark, bold: true, align: 'center' };
        }
        return hl.has(`${i}:${r}`) ? { fill: colors.amberLight } : {};
      },
    });
    const lw = chipW(t.name, 15);
    chip(ctx, { x: x + (tw - lw) / 2, y: ty - 0.6, w: lw, h: 0.42, label: t.name, tone: 'navy', size: 15 });
    return { x, tb };
  });
  const seg = (xa, ya, xb, yb) =>
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: Math.min(xa, xb), y: Math.min(ya, yb), w: Math.abs(xb - xa), h: Math.abs(yb - ya), line: { color: colors.amberMid, width: 2.5 },
    });
  s.links.forEach(({ from, to }) => {
    const [ft, fr] = from, [tt, tr] = to;
    const left = ft > tt;
    const xf = left ? placed[ft].x - 0.04 : placed[ft].x + tw + 0.04;
    const xt = left ? placed[tt].x + tw + 0.04 : placed[tt].x - 0.04;
    const yf = ty + fr * rh + rh / 2, yt = ty + tr * rh + rh / 2;
    const mid = (xf + xt) / 2;
    if (Math.abs(yf - yt) < 0.01) {
      C.arrow(ctx, { x1: xf, y1: yf, x2: xt, y2: yt, color: colors.amberMid, width: 2.5 });
    } else {
      seg(xf, yf, mid, yf);
      seg(mid, yf, mid, yt);
      C.arrow(ctx, { x1: mid, y1: yt, x2: xt, y2: yt, color: colors.amberMid, width: 2.5 });
    }
  });
  const by = ty + 3 * rh + 0.35;
  chip(ctx, { x: mx, y: by, w: 2.5, h: 0.4, label: s.legend.pk, tone: 'teal', solid: false, size: 15 });
  chip(ctx, { x: mx + 2.7, y: by, w: 2.5, h: 0.4, label: s.legend.fk, tone: 'amber', solid: false, size: 15 });
  if (s.callout) callout(ctx, { x: mx, y: by + 0.65, w: w - 2 * mx, h: 1.2, ...s.callout });
}

// ------------------------------------------------------------------ árbol genérico (Huffman, trie) con tabla opcional
function tree(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const hasTable = !!s.table;
  const tw = hasTable ? s.treeWidth || 6.4 : w - 2 * mx;
  const y0 = s.top || 1.95, th = s.treeHeight || 3.9;
  const pos = {};
  s.nodes.forEach((n) => {
    pos[n.id] = { x: mx + 0.45 + n.x * (tw - 0.9), y: y0 + 0.45 + n.y * (th - 0.9) };
  });
  // aristas primero (los nodos las tapan en los extremos)
  s.edges.forEach((e) => {
    const a = pos[e.from], b = pos[e.to];
    C.arrow(ctx, { x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: colors.slate, width: 2.5, head: !!s.arrows });
  });
  s.nodes.forEach((n) => {
    const p = pos[n.id];
    const square = n.shape === 'square';
    const tone = ctx.T[n.tone || (square ? 'navy' : 'teal')];
    const d = square ? 0.82 : 0.72;
    const runs = [{ text: String(n.label), options: { fontSize: n.sub ? 18 : 20, bold: true, breakLine: !!n.sub } }];
    if (n.sub) runs.push({ text: String(n.sub), options: { fontSize: 14, bold: false } });
    ctx.slide.addText(runs, {
      shape: square ? ctx.pptx.ShapeType.roundRect : ctx.pptx.ShapeType.ellipse, ...(square ? { rectRadius: 0.1 } : {}),
      x: p.x - d / 2, y: p.y - d / 2, w: d, h: d, fill: { color: tone.accent },
      line: square ? { color: colors.teal, width: 1.5 } : { type: 'none' }, color: tone.on,
      fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
  });
  s.edges.forEach((e) => {
    if (e.label === undefined) return;
    const a = pos[e.from], b = pos[e.to];
    const lx = a.x + (b.x - a.x) * 0.5, ly = a.y + (b.y - a.y) * 0.5, d = 0.34;
    ctx.slide.addText(String(e.label), {
      shape: ctx.pptx.ShapeType.ellipse, x: lx - d / 2, y: ly - d / 2, w: d, h: d, fill: { color: colors.bg },
      line: { color: colors.border, width: 1 }, color: colors.amber, bold: true, fontSize: 14, fontFace: fonts.code,
      align: 'center', valign: 'middle', margin: 0,
    });
  });
  if (hasTable) {
    const tx = mx + tw + 0.4;
    const emph = s.table.emphasisCol;
    table(ctx, {
      x: tx, y: y0 + 0.1, colW: s.table.colW, header: s.table.columns, rows: s.table.rows, rowH: s.table.rowH || 0.5, fontSize: s.table.fontSize || 17,
      cellStyle: (r, c) => (c === emph ? { bold: true, color: colors.tealDark, fill: colors.tealLight } : {}),
    });
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.05, w: w - 2 * mx, h: s.calloutH || 0.75, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ pasos de unión de nodos (Huffman)
function mergeSteps(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const rowH = s.rowHeight || 1.05, y0 = 1.95;
  s.rows.forEach((r, i) => {
    const y = y0 + i * rowH;
    if (i > 0) ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: mx, y, w: w - 2 * mx, h: 0, line: { color: colors.border, width: 0.75 } });
    text(ctx, r.label, { x: mx, y, w: 1.5, h: rowH, fontSize: 18, bold: true, color: colors.slate, valign: 'middle' });
    let x = mx + 1.7;
    r.nodes.forEach((n) => {
      const leaf = n.leaf !== undefined;
      const d = 0.78;
      const tone = ctx.T[leaf ? 'navy' : 'teal'];
      const runs = leaf
        ? [{ text: String(n.leaf), options: { fontSize: 18, bold: true, breakLine: true } }, { text: String(n.freq), options: { fontSize: 14 } }]
        : [{ text: String(n.sum), options: { fontSize: 22, bold: true } }];
      ctx.slide.addText(runs, {
        shape: leaf ? ctx.pptx.ShapeType.roundRect : ctx.pptx.ShapeType.ellipse, ...(leaf ? { rectRadius: 0.1 } : {}),
        x, y: y + (rowH - d) / 2, w: d, h: d, fill: { color: tone.accent },
        line: n.hl ? { color: colors.amberMid, width: 3 } : leaf ? { color: colors.teal, width: 1.5 } : { type: 'none' },
        color: tone.on, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
      });
      x += d + 0.25;
    });
    text(ctx, r.note, { x: 7.1, y, w: w - mx - 7.1, h: rowH, fontSize: 17, color: colors.slate, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: y0 + s.rows.length * rowH + 0.2, w: w - 2 * mx, h: 0.7, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ flujo de bits o códigos con su valor (+ barras de tamaño)
function bitstream(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const unit0 = s.unit || 0.34, gap = 0.06, y = s.top || 2.2, segH = 0.65;
  const raw = s.segments.map((g) => (s.equalWidth ? s.equalWidth : Math.max(0.45, g.bits.length * unit0)));
  const avail = w - 2 * mx;
  const rawTotal = raw.reduce((a, b) => a + b, 0) + gap * (raw.length - 1);
  const k = rawTotal > avail ? (avail - gap * (raw.length - 1)) / (rawTotal - gap * (raw.length - 1)) : 1;
  const widths = raw.map((v) => v * k);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
  let x = mx + (w - 2 * mx - total) / 2;
  if (s.streamLabel) text(ctx, s.streamLabel, { x: mx, y: y - 0.55, w: w - 2 * mx, h: 0.4, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
  s.segments.forEach((g, i) => {
    const tone = i % 2 ? 'navy' : 'teal';
    ctx.slide.addText(g.bits, {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y, w: widths[i], h: segH,
      fill: { color: ctx.T[tone].soft }, line: { color: ctx.T[tone].accent, width: 1.5 }, color: colors.ink, bold: true,
      fontSize: s.bitsSize || 20, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
    });
    text(ctx, g.sym, { x, y: y + segH + 0.05, w: widths[i], h: 0.5, fontSize: s.symSize || 22, bold: true, color: colors.teal, fontFace: fonts.code, align: 'center', valign: 'middle' });
    x += widths[i] + gap;
  });
  let by = y + segH + 0.85;
  if (s.chips) {
    text(ctx, s.chips.label, { x: mx, y: by, w: w - 2 * mx, h: 0.4, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
    by += 0.5;
    let cx = mx;
    s.chips.items.forEach((label) => {
      const cw = chipW(label, 15) + 0.1;
      if (cx > mx && cx + cw > w - mx) {
        cx = mx;
        by += 0.55;
      }
      chip(ctx, { x: cx, y: by, w: cw, h: 0.42, label, tone: 'navy', size: 15 });
      cx += cw + 0.12;
    });
    by += 0.7;
  }
  if (s.bars) {
    const max = Math.max(...s.bars.map((b) => b.value));
    const lw = 3.2, bx = mx + lw + 0.1, barMax = w - mx - bx - 1.5;
    s.bars.forEach((b, i) => {
      const yy = by + i * 0.75;
      text(ctx, b.label, { x: mx, y: yy, w: lw, h: 0.55, fontSize: 18, color: colors.ink, valign: 'middle', align: 'right' });
      const bw = (b.value / max) * barMax;
      box(ctx, { x: bx, y: yy + 0.05, w: bw, h: 0.45, fill: ctx.T[b.tone || 'teal'].accent, radius: 0.08 });
      text(ctx, b.text, { x: bx + bw + 0.15, y: yy, w: 1.5, h: 0.55, fontSize: 18, bold: true, color: ctx.T[b.tone || 'teal'].text, valign: 'middle' });
    });
    by += s.bars.length * 0.75;
  }
  if (s.callout) callout(ctx, { x: mx, y: Math.max(by + 0.25, 5.75), w: w - 2 * mx, h: 0.85, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ cadena con diccionario / coincidencia / siguiente (LZ77)
function strips(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const cw = 0.56, ch = 0.56, gap = 0.05;
  const legend = [['Procesado (diccionario)', 'green'], ['Coincidencia más larga', 'teal'], ['Siguiente carácter', 'amber']];
  let lx = mx;
  legend.forEach(([label, tone]) => {
    const lw = chipW(label, 14) + 0.2;
    chip(ctx, { x: lx, y: 1.85, w: lw, h: 0.38, label, tone, size: 14 });
    lx += lw + 0.2;
  });
  const inRange = (k, r) => r && k >= r[0] && k <= r[1];
  const x0 = mx + 1.1;
  s.rows.forEach((r, i) => {
    const y = 2.5 + i * 0.72;
    text(ctx, `Paso ${i + 1}`, { x: mx, y, w: 1.0, h: ch, fontSize: 16, color: colors.slate, valign: 'middle', fontFace: fonts.code });
    s.chars.forEach((c, k) => {
      let tone = null;
      if (k === r.next) tone = 'amber';
      else if (inRange(k, r.match)) tone = 'teal';
      else if (inRange(k, r.dict)) tone = 'green';
      const T = tone && ctx.T[tone];
      ctx.slide.addText(c, {
        shape: ctx.pptx.ShapeType.rect, x: x0 + k * (cw + gap), y, w: cw, h: ch,
        fill: { color: T ? (tone === 'green' ? T.soft : T.accent) : colors.panel },
        line: { color: T ? T.accent : colors.border, width: 1 }, color: T ? (tone === 'green' ? T.text : T.on) : colors.slate,
        bold: true, fontSize: 20, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
      });
    });
    text(ctx, r.out, { x: x0 + s.chars.length * (cw + gap) + 0.4, y, w: 3.4, h: ch, fontSize: 24, bold: true, color: colors.heading, fontFace: fonts.code, valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: 2.5 + s.rows.length * 0.72 + 0.15, w: w - 2 * mx, h: 0.65, size: 16, ...s.callout });
}

const builtin = {
  'dbms-architecture': dbmsArchitecture,
  'annotated-table': annotatedTable,
  m2m,
  scan,
  'index-map': indexMap,
  'join-result': joinResult,
  'venn-grid': vennGrid,
  'timeline-cards': timelineCards,
  scale,
  'flat-table': flatTable,
  entities,
  er,
  schema,
  tree,
  'merge-steps': mergeSteps,
  bitstream,
  strips,
};

// Extensiones por tema: cada archivo `lib/diagrams.<tema>.js` exporta { 'kind': (ctx, slideSpec) => void }.
// Los `kind` de una extensión deben llevar el prefijo del tema (p. ej. `memoria-heap`) para no chocar con otros.
const fs = require('fs');
const path = require('path');
const extensions = {};
fs.readdirSync(__dirname)
  .filter((f) => /^diagrams\..+\.js$/.test(f))
  .sort()
  .forEach((f) => {
    const ext = require(path.join(__dirname, f));
    Object.keys(ext).forEach((kind) => {
      if (builtin[kind] || extensions[kind]) throw new Error(`Diagrama duplicado "${kind}" en ${f}`);
      extensions[kind] = ext[kind];
    });
  });

module.exports = { ...builtin, ...extensions };
