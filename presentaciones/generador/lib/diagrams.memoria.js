// Diagramas de la lección «Administración de Memoria» (CE-2103). Todos los `kind` llevan el prefijo `memoria-`.
const fs = require('fs');
const path = require('path');
const C = require('./components');

const { text, box, chip, arrow, card, callout, codeBlock, highlightLine, surface, table, cellBox } = C;

// ------------------------------------------------------------------ utilidades
function pngSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(1, 4).toString() !== 'PNG') throw new Error('Solo se admiten PNG en memoria-*: ' + file);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// Imagen sobre una tarjeta blanca ajustada a su tamaño; se alinea arriba y se centra en horizontal.
function imageCard(ctx, file, alt, area, { pad = 0.15, valign = 'top' } = {}) {
  const p = path.resolve(ctx.assetsDir, file);
  if (!fs.existsSync(p)) throw new Error('No existe la imagen: ' + p);
  const sz = pngSize(p);
  const r = Math.min((area.w - 2 * pad) / sz.w, (area.h - 2 * pad) / sz.h);
  const w = sz.w * r, h = sz.h * r;
  const cx = area.x + (area.w - w - 2 * pad) / 2;
  const cy = valign === 'middle' ? area.y + (area.h - h - 2 * pad) / 2 : area.y;
  box(ctx, { x: cx, y: cy, w: w + 2 * pad, h: h + 2 * pad, fill: 'FFFFFF', radius: 0.12 });
  ctx.slide.addImage({ path: p, x: cx + pad, y: cy + pad, w, h, altText: alt });
  return { x: cx, y: cy, w: w + 2 * pad, h: h + 2 * pad };
}

// Bloque de código con una o varias líneas resaltadas (índices 0-based) y una flecha como marcador.
function codeWithMarker(ctx, { x, y, w, code, lang, fontSize = 14, hl }) {
  const { colors, fonts } = ctx.theme;
  lang = lang || ctx.meta.codeLang || 'c';
  const lines = code.split('\n');
  const lh = (fontSize * 1.3) / 72;
  const h = lines.length * lh + 0.4;
  const marks = hl === undefined || hl === null ? [] : Array.isArray(hl) ? hl : [hl];
  box(ctx, { x, y, w, h, fill: colors.codeBg, line: colors.codeBorder, radius: 0.1 });
  marks.forEach((i) => {
    box(ctx, { x: x + 0.08, y: y + 0.2 + i * lh - 0.01, w: w - 0.16, h: lh + 0.02, fill: colors.amberLight, line: colors.amberMid, radius: 0.04 });
    ctx.slide.addShape(ctx.pptx.ShapeType.rightArrow, {
      x: x + 0.12, y: y + 0.2 + i * lh + lh / 2 - 0.08, w: 0.2, h: 0.16, fill: { color: colors.amber }, line: { type: 'none' },
    });
  });
  const runs = [];
  lines.forEach((ln, i) => {
    const rs = highlightLine(ln, lang, ctx);
    rs[rs.length - 1].options.breakLine = i < lines.length - 1;
    runs.push(...rs);
  });
  const off = marks.length ? 0.4 : 0.25;
  text(ctx, runs, {
    x: x + off, y: y + 0.2, w: w - off - 0.25, h: h - 0.4, fontSize, fontFace: fonts.code, lineSpacing: fontSize * 1.3, wrap: false,
  });
  return h;
}

const label = (ctx, str, o) =>
  text(ctx, str, { h: 0.35, fontSize: 16, bold: true, color: ctx.theme.colors.slate, valign: 'middle', ...o });

// ------------------------------------------------------------------ figuras dibujadas con formas (reemplazan las imágenes del libro)
const smallLabel = (ctx, str, o) =>
  text(ctx, str, { h: 0.3, fontSize: 12, fontFace: ctx.theme.fonts.code, color: ctx.theme.colors.slate, valign: 'middle', ...o });

// Mapas de memoria: columns[{label, blocks[{t, tone, h}]}] (bloques de arriba hacia abajo; h = alto relativo), top (rótulo de la dirección más alta)
function figMapas(ctx, f, a) {
  const { colors } = ctx.theme;
  const n = f.columns.length, axisW = 0.85, gap = 0.25, labelH = 0.45;
  const cw = (a.w - axisW - (n - 1) * gap) / n;
  const H = a.h - labelH - 0.05;
  smallLabel(ctx, f.top || '0xFFF…', { x: a.x, y: a.y - 0.02, w: axisW - 0.1, align: 'right', fontSize: 13 });
  smallLabel(ctx, '0', { x: a.x, y: a.y + H - 0.3, w: axisW - 0.1, align: 'right', fontSize: 13 });
  f.columns.forEach((c, i) => {
    const x = a.x + axisW + i * (cw + gap);
    const total = c.blocks.reduce((s, b) => s + (b.h || 1), 0);
    let y = a.y;
    c.blocks.forEach((b) => {
      const h = (H * (b.h || 1)) / total;
      cellBox(ctx, b.t, { x, y, w: cw, h, tone: b.tone, size: 15 });
      y += h;
    });
    text(ctx, c.label, { x, y: a.y + H + 0.08, w: cw, h: 0.35, fontSize: 16, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
  });
}

// Columnas de celdas con direcciones a la derecha, alineadas abajo (dirección 0):
// columns[{label, w, chan, rows[{addr, t, tone}]}] (filas de arriba hacia abajo; sin addr ni tone = puntos suspensivos; {gap:true} = espacio),
// arrow{col, from, to} (flecha roja por el canal izquierdo de la columna, entre dos filas)
function figReubicacion(ctx, f, a) {
  const { colors } = ctx.theme;
  const addrW = 0.62, gap = 0.12, labelH = 0.45;
  const maxRows = Math.max(...f.columns.map((c) => c.rows.length));
  const rh = Math.min(0.42, (a.h - labelH) / maxRows);
  const yB = a.y + maxRows * rh;
  const total = f.columns.reduce((s, c) => s + (c.chan || 0) + c.w + addrW, 0) + gap * (f.columns.length - 1);
  let x = a.x + (a.w - total) / 2;
  const pos = [];
  f.columns.forEach((c) => {
    x += c.chan || 0;
    pos.push({ x, rowY: (j) => yB - (c.rows.length - j) * rh });
    c.rows.forEach((r, j) => {
      const y = yB - (c.rows.length - j) * rh;
      if (r.gap) return;
      if (!r.addr && !r.tone && !r.t) return;
      if (r.t === '…') text(ctx, '…', { x, y, w: c.w, h: rh, fontSize: 18, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
      else cellBox(ctx, r.t, { x, y, w: c.w, h: rh, tone: r.tone, size: 14, code: true });
      if (r.addr) smallLabel(ctx, r.addr, { x: x + c.w + 0.06, y: y + (rh - 0.3) / 2, w: addrW });
    });
    text(ctx, c.label, { x, y: yB + 0.08, w: c.w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
    x += c.w + addrW + gap;
  });
  if (f.arrow) {
    const c = f.columns[f.arrow.col], p = pos[f.arrow.col];
    const y1 = p.rowY(f.arrow.from) + rh / 2, y2 = p.rowY(f.arrow.to) + rh / 2;
    const xc = p.x - (c.chan || 0.3) / 2, col = ctx.T.red.accent;
    arrow(ctx, { x1: p.x, y1, x2: xc, y2: y1, color: col, width: 2.5, head: false });
    arrow(ctx, { x1: xc, y1, x2: xc, y2, color: col, width: 2.5, head: false });
    arrow(ctx, { x1: xc, y1: y2, x2: p.x, y2, color: col, width: 2.5 });
  }
}

// CPU, MMU, memoria y controlador de disco conectados por un bus: labels{package, cpu, mmu, memory, disk, bus, virtual, physical}
function figMmu(ctx, f, a) {
  const { colors } = ctx.theme;
  const L = f.labels;
  const px = a.x + 0.05, py = a.y + 0.05 + Math.max(0, (a.h - 3.95) / 2), pkgW = 2.4, pkgH = 2.85;
  box(ctx, { x: px, y: py, w: pkgW, h: pkgH, fill: colors.codeBg, line: colors.slate, radius: 0.1, lineWidth: 1.5 });
  text(ctx, L.package, { x: px, y: py + 0.08, w: pkgW, h: 0.4, fontSize: 15, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
  const bx = px + 0.3, bw = 1.2, cx = bx + bw / 2;
  cellBox(ctx, L.cpu, { x: bx, y: py + 0.65, w: bw, h: 0.6, tone: 'navy', size: 18 });
  cellBox(ctx, L.mmu, { x: bx, y: py + 1.85, w: bw, h: 0.6, tone: 'teal', size: 18 });
  arrow(ctx, { x1: cx, y1: py + 1.25, x2: cx, y2: py + 1.85, color: ctx.T.amber.accent, width: 2.5 });
  chip(ctx, { x: cx + 0.12, y: py + 1.38, w: 0.95, h: 0.32, label: L.virtual, tone: 'amber', size: 12 });
  const busY = py + pkgH + 0.6;
  arrow(ctx, { x1: cx, y1: py + 2.45, x2: cx, y2: busY, color: ctx.T.teal.accent, width: 2.5 });
  chip(ctx, { x: cx + 0.12, y: py + pkgH + 0.14, w: 0.95, h: 0.32, label: L.physical, tone: 'teal', size: 12 });
  const right = a.x + a.w - 0.05;
  arrow(ctx, { x1: cx, y1: busY, x2: right, y2: busY, color: colors.slate, width: 3, head: false });
  smallLabel(ctx, L.bus, { x: right - 0.7, y: busY + 0.06, w: 0.7, align: 'right', fontSize: 14 });
  const memW = 1.25, diskW = 1.45, memX = px + pkgW + 0.4, diskX = memX + memW + 0.25, boxH = 1.2, boxY = busY - 0.4 - boxH;
  [[memX, memW, L.memory], [diskX, diskW, L.disk]].forEach(([x, w, t]) => {
    cellBox(ctx, t, { x, y: boxY, w, h: boxH, size: 15 });
    arrow(ctx, { x1: x + w / 2, y1: boxY + boxH, x2: x + w / 2, y2: busY, color: colors.slate, width: 2, head: false });
  });
}

// Tabla de páginas: pages[] (de abajo hacia arriba; "X" = no cargada, número = marco), frames (cantidad de marcos), headers{virtual, physical}
function figPaginas(ctx, f, a) {
  const { colors } = ctx.theme;
  const n = f.pages.length, headH = 0.6;
  const ch = Math.min(0.28, (a.h - headH) / n);
  const yB = a.y + headH + n * ch;
  const rangeW = 0.95, cellW = 0.62, gapW = 1.55, frameW = 0.62, labelW = 0.95;
  const total = rangeW + cellW + gapW + frameW + labelW;
  const rx = a.x + (a.w - total) / 2, vx = rx + rangeW, fx = vx + cellW + gapW;
  const rowY = (i) => yB - (i + 1) * ch;
  text(ctx, f.headers.virtual, { x: rx - 0.1, y: a.y, w: rangeW + cellW + 0.2, h: headH - 0.05, fontSize: 13, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
  text(ctx, f.headers.physical, { x: fx - 0.2, y: a.y, w: frameW + labelW + 0.2, h: headH - 0.05, fontSize: 13, bold: true, color: colors.slate, align: 'center', valign: 'middle' });
  for (let k = 0; k < f.frames; k++) {
    cellBox(ctx, k, { x: fx, y: rowY(k), w: frameW, h: ch, tone: 'teal', size: 12 });
    smallLabel(ctx, `${4 * k}K–${4 * k + 4}K`, { x: fx + frameW + 0.06, y: rowY(k) + (ch - 0.3) / 2, w: labelW });
  }
  f.pages.forEach((v, i) => {
    smallLabel(ctx, `${4 * i}K–${4 * i + 4}K`, { x: rx, y: rowY(i) + (ch - 0.3) / 2, w: rangeW - 0.08, align: 'right' });
    cellBox(ctx, v, { x: vx, y: rowY(i), w: cellW, h: ch, tone: v === 'X' ? undefined : 'amber', size: 12 });
  });
  f.pages.forEach((v, i) => {
    if (v === 'X') return;
    arrow(ctx, { x1: vx + cellW, y1: rowY(i) + ch / 2, x2: fx, y2: rowY(Number(v)) + ch / 2, color: ctx.T.amber.accent, width: 1.25 });
  });
}

const FIGURES = { mapas: figMapas, reubicacion: figReubicacion, mmu: figMmu, paginas: figPaginas };

// ------------------------------------------------------------------ imagen con texto al lado
// left{label,code,codeLang,codeSize,cards[{title,text,tone,h}]}, image+alt | figure{type: mapas|reubicacion|mmu|paginas, …}, caption, callout
function memImagen(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85;
  const bottom = s.callout ? 5.75 : 6.75;
  const leftW = s.leftW || 5.2;
  const L = s.left || {};
  let y = top;
  if (L.label) {
    label(ctx, L.label, { x: mx, y, w: leftW });
    y += 0.4;
  }
  if (L.code) y += codeBlock(ctx, { x: mx, y, w: leftW, code: L.code, lang: L.codeLang, fontSize: L.codeSize || 16 }) + 0.25;
  const cards = L.cards || [];
  if (cards.length) {
    const gap = 0.2;
    const fixed = cards.reduce((a, c) => a + (c.h || 0), 0);
    const free = cards.filter((c) => !c.h).length;
    const auto = free ? (bottom - y - (cards.length - 1) * gap - fixed) / free : 0;
    cards.forEach((c) => {
      const h = c.h || auto;
      card(ctx, { titleSize: 20, textSize: 16, ...c }, { x: mx, y, w: leftW, h });
      y += h + gap;
    });
  }
  const ix = mx + leftW + 0.35;
  const capH = s.caption ? 0.6 : 0;
  let rect;
  if (s.figure) {
    const fh = bottom - top - capH;
    box(ctx, { x: ix, y: top, w: w - mx - ix, h: fh, fill: colors.panel, line: colors.border, radius: 0.12 });
    FIGURES[s.figure.type](ctx, s.figure, { x: ix + 0.2, y: top + 0.2, w: w - mx - ix - 0.4, h: fh - 0.4 });
    rect = { y: top, h: fh };
  } else rect = imageCard(ctx, s.image, s.alt, { x: ix, y: top, w: w - mx - ix, h: bottom - top - capH });
  if (s.caption) {
    text(ctx, s.caption, { x: ix, y: rect.y + rect.h + 0.1, w: w - mx - ix, h: 0.5, fontSize: 16, color: colors.slate, align: 'center' });
  }
  if (s.callout) callout(ctx, { x: mx, y: bottom + 0.2, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ código + tabla(s) de memoria
// blocks[{label,code,lang,size}], codeW, tables[{label,rows[[dir,alias,valor,tam,ubic,tipo]],hl[],hlCells[[r,c]]}], columns, colW, valueCols (columnas en negrita; [2]), callout
function memTabla(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85;
  const codeW = s.codeW || 5.0;
  let y = top;
  (s.blocks || []).forEach((b) => {
    if (b.label) {
      label(ctx, b.label, { x: mx, y, w: codeW });
      y += 0.4;
    }
    y += codeBlock(ctx, { x: mx, y, w: codeW, code: b.code, lang: b.lang, fontSize: b.size || s.codeSize || 15 }) + 0.25;
  });
  const codeBottom = y;
  const tx = mx + codeW + 0.4, tw = w - mx - tx;
  const base = s.colW || [1.15, 0.95, 1.0, 0.9, 1.15, 1.1];
  const k = tw / base.reduce((a, b) => a + b, 0);
  const colW = base.map((v) => v * k);
  const fs = s.tableSize || 15;
  const rowH = s.rowH || 0.42;
  let ty = top;
  (s.tables || []).forEach((t) => {
    if (t.label) {
      label(ctx, t.label, { x: tx, y: ty, w: tw });
      ty += 0.4;
    }
    const hl = new Set(t.hl || []);
    const cells = new Set((t.hlCells || []).map(([r, c]) => `${r}:${c}`));
    const tb = table(ctx, {
      x: tx, y: ty, colW, header: s.columns || ['Dirección', 'Alias', 'Valor', 'Tamaño', 'Ubicación', 'Tipo'], rows: t.rows,
      rowH: [0.45, ...t.rows.map(() => rowH)], fontSize: fs, cellMargin: [0, 0.08, 0, 0.08],
      cellStyle: (r, c) => {
        const st = {};
        if ((s.valueCols || [2]).includes(c)) Object.assign(st, { bold: true, color: colors.heading });
        if (c === 4 && t.rows[r][4] === 'Stack') Object.assign(st, { bold: true, color: colors.tealDark });
        if (c === 4 && t.rows[r][4] === 'Heap') Object.assign(st, { bold: true, color: colors.amber });
        if (hl.has(r)) st.fill = colors.amberLight;
        if (cells.has(`${r}:${c}`)) Object.assign(st, { fill: colors.amberLight, color: colors.amber, bold: true });
        return st;
      },
    });
    ty += tb.h + 0.3;
  });
  if (s.callout) {
    const cy = s.calloutY || Math.min(Math.max(codeBottom, ty) + 0.05, 5.9);
    callout(ctx, { x: mx, y: cy, w: w - 2 * mx, h: s.calloutH || 0.85, ...s.callout });
  }
}

// ------------------------------------------------------------------ memory layout de un programa en C
// segments[{name,note,tone}|{gap:true,note}], segH, gapH, note
function memLayout(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.9, segH = s.segH || 0.62, gapH = s.gapH || 0.95;
  const bx = mx + 1.8, bw = 5.2;
  const nx = bx + bw + 0.3, nw = w - mx - nx;
  const total = s.segments.reduce((a, g) => a + (g.gap ? gapH : segH), 0);
  const bottom = top + total;
  text(ctx, 'Direcciones altas', { x: mx, y: top, w: 1.6, h: 0.5, fontSize: 14, color: colors.slate, valign: 'middle' });
  text(ctx, 'Direcciones bajas', { x: mx, y: bottom - 0.5, w: 1.6, h: 0.5, fontSize: 14, color: colors.slate, valign: 'middle' });
  arrow(ctx, { x1: mx + 0.35, y1: bottom - 0.6, x2: mx + 0.35, y2: top + 0.6, color: colors.border, width: 2.5 });
  let y = top;
  s.segments.forEach((g) => {
    if (g.gap) {
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
        x: bx, y: y + 0.05, w: bw, h: gapH - 0.1, fill: { type: 'none' }, line: { color: colors.border, width: 1.25, dashType: 'dash' },
      });
      arrow(ctx, { x1: bx + bw * 0.28, y1: y + 0.15, x2: bx + bw * 0.28, y2: y + gapH - 0.15, color: ctx.T.teal.accent, width: 3 });
      arrow(ctx, { x1: bx + bw * 0.72, y1: y + gapH - 0.15, x2: bx + bw * 0.72, y2: y + 0.15, color: ctx.T.amber.accent, width: 3 });
      if (g.note) text(ctx, g.note, { x: nx, y, w: nw, h: gapH, fontSize: 15, color: colors.slate, valign: 'middle' });
      y += gapH;
      return;
    }
    const t = ctx.T[g.tone || 'slate'];
    box(ctx, { x: bx, y, w: bw, h: segH, fill: t.soft, line: t.accent, lineWidth: 1.5, radius: 0.08 });
    text(ctx, g.name, { x: bx, y, w: bw, h: segH, fontSize: 17, bold: true, color: t.text, align: 'center', valign: 'middle', fontFace: ctx.theme.fonts.heading });
    text(ctx, g.note, { x: nx, y, w: nw, h: segH, fontSize: 15, color: colors.slate, valign: 'middle' });
    y += segH;
  });
}

// ------------------------------------------------------------------ código con línea actual + estado del stack / heap
// code, highlight, codeW, codeSize, panels[{title,caption,frames[{title,items[],tone}]|blocks[{addr,text}],empty}], callout
function memTrace(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85;
  const codeW = s.codeW || 5.0;
  const ch = codeWithMarker(ctx, { x: mx, y: top, w: codeW, code: s.code, lang: s.codeLang, fontSize: s.codeSize || 14, hl: s.highlight });
  const px = mx + codeW + 0.35, pw = w - mx - px;
  const n = s.panels.length, gap = 0.3;
  const pwid = (pw - (n - 1) * gap) / n;
  const ph = s.panelHeight || Math.max(ch, 4.4);
  s.panels.forEach((p, i) => {
    const x = px + i * (pwid + gap);
    box(ctx, { x, y: top, w: pwid, h: ph, fill: colors.panel, line: colors.border });
    text(ctx, p.title, { x: x + 0.25, y: top + 0.12, w: pwid - 0.5, h: 0.4, fontSize: 18, bold: true, color: colors.heading, valign: 'middle', fontFace: fonts.heading });
    const bodyTop = top + 0.62, bodyBottom = top + ph - 0.15;
    if (p.frames) {
      let fy = bodyTop;
      p.frames.forEach((f) => {
        const t = ctx.T[f.tone || 'teal'];
        const items = f.items || [];
        const fh = 0.46 + items.length * 0.3 + (items.length ? 0.08 : 0);
        box(ctx, { x: x + 0.2, y: fy, w: pwid - 0.4, h: fh, fill: t.soft, line: t.accent, lineWidth: 1.25, radius: 0.08 });
        text(ctx, f.title, { x: x + 0.4, y: fy + 0.02, w: pwid - 0.8, h: 0.42, fontSize: 16, bold: true, color: t.text, fontFace: fonts.code, valign: 'middle' });
        items.forEach((it, j) => {
          text(ctx, it, { x: x + 0.4, y: fy + 0.44 + j * 0.3, w: pwid - 0.8, h: 0.3, fontSize: 14, color: colors.ink, valign: 'middle' });
        });
        fy += fh + 0.12;
      });
    } else if (p.blocks && p.blocks.length) {
      const bh = 0.68;
      p.blocks.forEach((b, j) => {
        const by = bodyBottom - (j + 1) * bh - j * 0.1;
        const t = ctx.T.amber;
        box(ctx, { x: x + 0.2, y: by, w: pwid - 0.4, h: bh, fill: t.soft, line: t.accent, lineWidth: 1.25, radius: 0.08 });
        text(ctx, b.addr, { x: x + 0.38, y: by + 0.04, w: pwid - 0.76, h: 0.3, fontSize: 14, bold: true, color: t.text, fontFace: fonts.code, valign: 'middle' });
        text(ctx, b.text, { x: x + 0.38, y: by + 0.34, w: pwid - 0.76, h: 0.3, fontSize: 14, color: colors.ink, valign: 'middle' });
      });
    } else {
      text(ctx, p.empty || 'Vacío', { x: x + 0.25, y: bodyTop, w: pwid - 0.5, h: bodyBottom - bodyTop, fontSize: 16, italic: true, color: colors.slate, align: 'center', valign: 'middle' });
    }
    if (p.caption) {
      text(ctx, p.caption, { x: x + 0.25, y: top + ph - 0.5, w: pwid - 0.5, h: 0.4, fontSize: 14, italic: true, color: colors.slate, align: 'center', valign: 'middle' });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: Math.max(top + ph + 0.2, 5.9), w: w - 2 * mx, h: 0.8, ...s.callout });
}

// ------------------------------------------------------------------ el stack paso a paso (crece y decrece)
// tones{nombre:tono}, steps[{event:"push|pop|start",eventLabel,caption,frames[]}], boxH, callout | callouts[] (lado a lado), calloutY, calloutH
function memPilaPasos(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.steps.length, gap = 0.32;
  const cw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = 1.85, boxTop = top + 0.48, boxH = s.boxH || 2.4;
  const evTone = { push: 'teal', pop: 'red', start: 'slate' };
  s.steps.forEach((st, i) => {
    const x = mx + i * (cw + gap);
    chip(ctx, { x: x + (cw - 1.1) / 2, y: top, w: 1.1, h: 0.38, label: `Paso ${i + 1}`, tone: 'navy', size: 14 });
    box(ctx, { x, y: boxTop, w: cw, h: boxH, fill: colors.panel, line: colors.border, radius: 0.1 });
    st.frames.forEach((f, j) => {
      const t = ctx.T[(s.tones && s.tones[f]) || 'slate'];
      ctx.slide.addText(f, {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x: x + 0.12, y: boxTop + 0.15 + j * 0.72, w: cw - 0.24, h: 0.62,
        fill: { color: t.soft }, line: { color: t.accent, width: 1.5 }, color: t.text, bold: true, fontSize: 14, fontFace: fonts.code,
        align: 'center', valign: 'middle', margin: 0,
      });
    });
    chip(ctx, { x: x + (cw - 1.2) / 2, y: boxTop + boxH + 0.12, w: 1.2, h: 0.36, label: st.eventLabel || st.event, tone: evTone[st.event] || 'slate', solid: false, size: 14 });
    text(ctx, st.caption, { x: x + 0.05, y: boxTop + boxH + 0.56, w: cw - 0.1, h: 0.85, fontSize: 15, color: colors.ink, align: 'center' });
    if (i < n - 1) arrow(ctx, { x1: x + cw + 0.05, y1: boxTop + boxH / 2, x2: x + cw + gap - 0.05, y2: boxTop + boxH / 2, color: colors.teal, width: 2.5 });
  });
  const list = s.callouts || (s.callout ? [s.callout] : []);
  if (list.length) {
    const cg = 0.3, cwid = (w - 2 * mx - (list.length - 1) * cg) / list.length;
    list.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + cg), y: s.calloutY || 6.15, w: cwid, h: s.calloutH || 0.7, ...(list.length > 1 ? { size: 16 } : {}), ...c }));
  }
}

// ------------------------------------------------------------------ espacios de direcciones virtuales -> memoria física
// virtual[{title,tone,marker,target}], physical[{label,tone,pct}], virtualLabel, physicalLabel, callout
function memEspacios(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const lw = 1.7;
  const barX = mx + lw + 0.1, barW = w - mx - barX;
  const vy = 2.0, vh = 1.0, py = 4.65, ph = 0.8;
  label(ctx, s.virtualLabel || 'Espacios virtuales', { x: mx, y: vy, w: lw, h: vh, fontSize: 16, valign: 'middle' });
  label(ctx, s.physicalLabel || 'Memoria física', { x: mx, y: py, w: lw, h: ph, fontSize: 16, valign: 'middle' });
  // región física
  const regions = [];
  let px = barX;
  s.physical.forEach((r) => {
    const rw = (barW * r.pct) / 100;
    const t = ctx.T[r.tone || 'slate'];
    ctx.slide.addText(r.label, {
      shape: ctx.pptx.ShapeType.rect, x: px, y: py, w: rw, h: ph, fill: { color: t.soft }, line: { color: t.accent, width: 1.5 },
      color: t.text, bold: true, fontSize: r.size || 16, fontFace: ctx.theme.fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
    regions.push({ x: px, w: rw });
    px += rw;
  });
  const gap = 0.4;
  const vw = (barW - (s.virtual.length - 1) * gap) / s.virtual.length;
  s.virtual.forEach((v, i) => {
    const x = barX + i * (vw + gap);
    const t = ctx.T[v.tone || 'teal'];
    box(ctx, { x, y: vy, w: vw, h: vh, fill: t.soft, line: t.accent, lineWidth: 1.5, radius: 0.08 });
    text(ctx, v.title, { x: x + 0.7, y: vy, w: vw - 0.8, h: vh, fontSize: 16, bold: true, color: t.text, valign: 'middle' });
    chip(ctx, { x: x + 0.12, y: vy + vh / 2 - 0.2, w: 0.5, h: 0.4, label: v.marker, tone: v.tone || 'teal', size: 15 });
    const r = regions[v.target];
    const ex = r.x + Math.min(0.9, r.w * 0.2);
    arrow(ctx, { x1: x + 0.37, y1: vy + vh / 2 + 0.2, x2: ex, y2: py - 0.04, color: t.accent, width: 2.5 });
    if (v.physical) {
      text(ctx, v.physical, { x: r.x, y: py + ph + 0.08, w: r.w, h: 0.4, fontSize: 15, bold: true, color: t.text, align: 'center', valign: 'middle' });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.95, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ registros base y límite
// registers[{label,tone}], boxes[{title,value,tone}], fail, callout
function memBaseLimite(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  let cx = mx;
  if (s.registersLabel) {
    label(ctx, s.registersLabel, { x: mx, y: 1.85, w: 4.2, h: 0.42 });
    cx += 4.3;
  }
  s.registers.forEach((r) => {
    const cwid = r.label.length * 0.105 + 0.6;
    chip(ctx, { x: cx, y: 1.85, w: cwid, h: 0.42, label: r.label, tone: r.tone || 'teal', size: 15 });
    cx += cwid + 0.2;
  });
  const n = s.boxes.length, gap = 0.7;
  const bw = (w - 2 * mx - (n - 1) * gap) / n;
  const by = 2.75, bh = 1.7;
  s.boxes.forEach((b, i) => {
    const x = mx + i * (bw + gap);
    const t = ctx.T[b.tone || 'slate'];
    box(ctx, { x, y: by, w: bw, h: bh, fill: t.soft, line: t.accent, lineWidth: 1.5, radius: 0.1 });
    text(ctx, b.title, { x: x + 0.15, y: by + 0.15, w: bw - 0.3, h: 0.5, fontSize: 17, bold: true, color: t.text, align: 'center', valign: 'middle' });
    text(ctx, b.value, { x: x + 0.15, y: by + 0.7, w: bw - 0.3, h: 0.8, fontSize: b.size || 24, bold: true, color: colors.heading, align: 'center', valign: 'middle', fontFace: fonts.code });
    if (i < n - 1) {
      ctx.slide.addShape(ctx.pptx.ShapeType.rightArrow, {
        x: x + bw + (gap - 0.5) / 2, y: by + bh / 2 - 0.25, w: 0.5, h: 0.5, fill: { color: colors.teal }, line: { type: 'none' },
      });
    }
  });
  if (s.fail) {
    const x = mx + (s.fail.from || 1) * (bw + gap);
    arrow(ctx, { x1: x + bw / 2, y1: by + bh + 0.05, x2: x + bw / 2, y2: by + bh + 0.5, color: ctx.T.red.accent, width: 2.5 });
    chip(ctx, { x: x + bw / 2 - 1.6, y: by + bh + 0.55, w: 3.2, h: 0.45, label: s.fail.label, tone: 'red', size: 15 });
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.75, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ celdas de memoria (arreglos, aritmética de punteros)
// code, codeW, cells[{top,v,addr,tone}], groups[{from,to,label}], callout
function memCeldas(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85;
  const codeW = s.codeW || 4.9;
  if (s.code) codeBlock(ctx, { x: mx, y: top, w: codeW, code: s.code, lang: s.codeLang, fontSize: s.codeSize || 14 });
  const x0 = s.code ? mx + codeW + 0.4 : mx;
  const aw = w - mx - x0;
  const n = s.cells.length, g = 0.08;
  const cw = Math.min(1.3, (aw - (n - 1) * g) / n);
  const total = n * cw + (n - 1) * g;
  const sx = x0 + (aw - total) / 2;
  const y0 = s.top || 2.35;
  const chH = s.cellH || 0.85;
  s.cells.forEach((c, i) => {
    const x = sx + i * (cw + g);
    const t = ctx.T[c.tone || 'navy'];
    if (c.top) text(ctx, c.top, { x: x - 0.1, y: y0, w: cw + 0.2, h: 0.4, fontSize: 16, bold: true, color: t.text === colors.heading ? colors.slate : t.text, fontFace: fonts.code, align: 'center', valign: 'middle' });
    ctx.slide.addText(String(c.v), {
      shape: ctx.pptx.ShapeType.rect, x, y: y0 + 0.5, w: cw, h: chH, fill: { color: c.tone ? t.soft : colors.panel }, line: { color: c.tone ? t.accent : colors.slate, width: 1.5 },
      color: colors.heading, bold: true, fontSize: 26, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
    if (c.addr) text(ctx, c.addr, { x: x - 0.1, y: y0 + 0.55 + chH, w: cw + 0.2, h: 0.35, fontSize: 15, color: colors.slate, fontFace: fonts.code, align: 'center', valign: 'middle' });
  });
  (s.groups || []).forEach((gr) => {
    const gx1 = sx + gr.from * (cw + g), gx2 = sx + gr.to * (cw + g) + cw;
    ctx.slide.addShape(ctx.pptx.ShapeType.line, { x: gx1, y: y0 + 1.1 + chH, w: gx2 - gx1, h: 0, line: { color: colors.teal, width: 2.5 } });
    text(ctx, gr.label, { x: gx1, y: y0 + 1.17 + chH, w: gx2 - gx1, h: 0.4, fontSize: 16, bold: true, color: colors.tealDark, align: 'center', valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 5.7, w: w - 2 * mx, h: 0.95, ...s.callout });
}

// ------------------------------------------------------------------ esquema de punteros dibujado con formas (sin imagen)
// d{ pointers[{name,addr}], targets[{v,addr}], links[[puntero,destino]] }: cada puntero muestra la dirección que guarda y una flecha a su celda destino.
function ptrDiagram(ctx, d, area, tone) {
  const { colors, fonts } = ctx.theme;
  const t = ctx.T[tone || 'teal'];
  const cellH = 0.4, nameW = 1.5, ptrW = 1.1, linkW = 0.85, tgtW = 0.8, labelW = 0.75;
  const x0 = area.x + (area.w - (nameW + 0.1 + ptrW + linkW + tgtW + 0.05 + labelW)) / 2;
  const px = x0 + nameW + 0.1, tx = px + ptrW + linkW;
  const n = d.pointers.length;
  const pitch = n > 1 ? Math.min(0.7, (area.h - cellH) / (n - 1)) : 0;
  const yTop = area.y + Math.max(0, (area.h - cellH - pitch * (n - 1)) / 2);
  const pc = (i) => yTop + i * pitch + cellH / 2;
  const tc = (j) => {
    const ys = d.links.filter((l) => l[1] === j).map((l) => pc(l[0]));
    return ys.reduce((a, b) => a + b, 0) / ys.length;
  };
  d.pointers.forEach((p, i) => {
    text(ctx, p.name, { x: x0, y: pc(i) - cellH / 2, w: nameW, h: cellH, fontSize: 15, fontFace: fonts.code, color: colors.heading, align: 'right', valign: 'middle' });
    ctx.slide.addText(p.addr, {
      shape: ctx.pptx.ShapeType.rect, x: px, y: pc(i) - cellH / 2, w: ptrW, h: cellH, fill: { color: colors.codeBg }, line: { color: t.accent, width: 1.5 },
      color: t.text, bold: true, fontSize: 14, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
    });
  });
  d.targets.forEach((g, j) => {
    const yc = tc(j);
    if (g.addr) text(ctx, g.addr, { x: tx + tgtW + 0.05, y: yc - cellH / 2, w: labelW, h: cellH, fontSize: 13, fontFace: fonts.code, color: colors.slate, align: 'left', valign: 'middle' });
    ctx.slide.addText(String(g.v), {
      shape: ctx.pptx.ShapeType.rect, x: tx, y: yc - cellH / 2, w: tgtW, h: cellH, fill: { color: t.accent }, line: { type: 'none' },
      color: t.on, bold: true, fontSize: 20, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
  });
  d.links.forEach(([i, j]) => arrow(ctx, { x1: px + ptrW, y1: pc(i), x2: tx, y2: tc(j), color: t.text, width: 2 }));
}

// ------------------------------------------------------------------ dos paneles con código y esquema (shallow vs deep copy)
// panels[{title,tone,code,codeLang,diagram|image+alt,text}], panelHeight, callout
function memCopias(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const top = 1.85, gap = 0.4;
  const pw = (w - 2 * mx - gap) / 2;
  const ph = s.panelHeight || 3.85;
  s.panels.forEach((p, i) => {
    const x = mx + i * (pw + gap);
    const t = ctx.T[p.tone || 'teal'];
    surface(ctx, p.tone, { x, y: top, w: pw, h: ph });
    text(ctx, p.title, { x: x + 0.3, y: top + 0.15, w: pw - 0.6, h: 0.5, fontSize: 22, bold: true, color: t.text, fontFace: ctx.theme.fonts.heading, valign: 'middle' });
    const ch = codeBlock(ctx, { x: x + 0.3, y: top + 0.75, w: pw - 0.6, code: p.code, lang: p.codeLang, fontSize: s.codeSize || 14 });
    const iy = top + 0.75 + ch + 0.15;
    const area = { x: x + 0.3, y: iy, w: pw - 0.6, h: top + ph - iy - 0.5 };
    if (p.diagram) ptrDiagram(ctx, p.diagram, area, p.tone);
    else imageCard(ctx, p.image, p.alt, area, { pad: 0.1 });
    if (p.text) text(ctx, p.text, { x: x + 0.3, y: top + ph - 0.45, w: pw - 0.6, h: 0.35, fontSize: 15, bold: true, color: t.text, align: 'center', valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: top + ph + 0.2, w: w - 2 * mx, h: 0.85, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ fragmentación: franjas de celdas ocupadas / libres
// legend:true, between{label}, rows[{label,cells[],caption,tag{label,tone}}], cellH, callout | callouts[] (lado a lado), calloutY, calloutH
// cells: "." = libre, "+X" = bloque recién atendido (verde), cualquier otra cadena = bloque ocupado con esa etiqueta.
function memFragmentos(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const aw = w - 2 * mx;
  const n = Math.max(...s.rows.map((r) => r.cells.length));
  const g = 0.08;
  const cw = Math.min(1.0, (aw - (n - 1) * g) / n);
  const ch = s.cellH || 0.7;
  const kinds = {
    used: { fill: ctx.T.amber.soft, line: ctx.T.amber.accent, color: ctx.T.amber.text, dash: 'solid' },
    free: { fill: colors.panel, line: colors.slate, color: colors.slate, dash: 'dash' },
    done: { fill: ctx.T.green.soft, line: ctx.T.green.accent, color: ctx.T.green.text, dash: 'solid' },
  };
  const cell = (k, x, y, cwid, chei, label, size) =>
    ctx.slide.addText(label, {
      shape: ctx.pptx.ShapeType.rect, x, y, w: cwid, h: chei, fill: { color: kinds[k].fill },
      line: { color: kinds[k].line, width: 1.5, dashType: kinds[k].dash }, color: kinds[k].color, bold: k !== 'free',
      fontSize: size, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
  let y = 1.85;
  let betweenY = 0;
  s.rows.forEach((r, ri) => {
    label(ctx, r.label, { x: mx, y, w: aw * 0.55, h: 0.4, fontSize: 17 });
    if (r.tag) {
      const tw = r.tag.label.length * 0.115 + 0.6;
      chip(ctx, { x: mx + aw - tw, y: y + 0.01, w: tw, h: 0.38, label: r.tag.label, tone: r.tag.tone || 'slate', size: 15 });
    }
    y += 0.45;
    r.cells.forEach((c, i) => {
      const x = mx + i * (cw + g);
      if (c === '.') cell('free', x, y, cw, ch, 'libre', 14);
      else if (c[0] === '+') cell('done', x, y, cw, ch, c.slice(1), 22);
      else cell('used', x, y, cw, ch, c, 22);
    });
    y += ch + 0.05;
    if (r.caption) text(ctx, r.caption, { x: mx, y, w: aw, h: 0.38, fontSize: 16, color: colors.ink, valign: 'middle' });
    y += 0.4;
    if (ri < s.rows.length - 1) {
      betweenY = y;
      y += s.betweenH || 0.8;
    }
  });
  if (s.between) {
    arrow(ctx, { x1: mx + 0.5, y1: betweenY + 0.08, x2: mx + 0.5, y2: betweenY + (s.betweenH || 0.8) - 0.08, color: colors.teal, width: 3 });
    text(ctx, s.between.label, { x: mx + 0.85, y: betweenY, w: Math.min(aw * 0.6, aw - 0.85 - 5.4), h: s.betweenH || 0.8, fontSize: 17, color: colors.ink, valign: 'middle' });
  }
  if (s.legend) {
    const items = [
      { k: 'used', t: 'Ocupado' },
      { k: 'free', t: 'Libre' },
      { k: 'done', t: 'Pedido atendido' },
    ];
    const widths = items.map((it) => 0.4 + it.t.length * 0.11 + 0.35);
    let lx = mx + aw - widths.reduce((a, b) => a + b, 0);
    const ly = betweenY + ((s.betweenH || 0.8) - 0.3) / 2;
    items.forEach((it, i) => {
      cell(it.k, lx, ly, 0.3, 0.3, '', 12);
      text(ctx, it.t, { x: lx + 0.4, y: ly - 0.05, w: widths[i] - 0.4, h: 0.4, fontSize: 15, color: colors.slate, valign: 'middle' });
      lx += widths[i];
    });
  }
  const list = s.callouts || (s.callout ? [s.callout] : []);
  if (list.length) {
    const cg = 0.3, cwid = (aw - (list.length - 1) * cg) / list.length;
    list.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + cg), y: s.calloutY || 5.8, w: cwid, h: s.calloutH || 0.95, size: 16, ...c }));
  }
}

module.exports = {
  'memoria-fragmentos': memFragmentos,
  'memoria-imagen': memImagen,
  'memoria-tabla': memTabla,
  'memoria-layout': memLayout,
  'memoria-trace': memTrace,
  'memoria-pila-pasos': memPilaPasos,
  'memoria-espacios': memEspacios,
  'memoria-base-limite': memBaseLimite,
  'memoria-celdas': memCeldas,
  'memoria-copias': memCopias,
};
