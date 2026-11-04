const C = require('./components');
const diagrams = require('./diagrams');

const { text, paragraphs, box, chip, circleLabel, header, card, callout, codeBlock, codeHeight, table, image } = C;

// Estimación simple de líneas para calcular alturas (Calibri ~0.5 em por carácter).
function estLines(str, fs, w) {
  const plain = String(str).replace(/\*\*|`/g, '');
  const cpl = Math.max(1, Math.floor((w / (fs * 0.0063)) * 0.95));
  return Math.max(1, Math.ceil(plain.length / cpl));
}
const lineH = (fs) => (fs * 1.25) / 72;

const layouts = {
  // ------------------------------------------------------------ portada
  title(ctx, s) {
    const { colors, fonts } = ctx.theme;
    const { w, h } = ctx.theme.page;
    ctx.slide.background = { color: colors.titleBg };
    // Decoración opcional: ventana de terminal con un fragmento de código (spec: `terminal {file, lang, code}`)
    if (s.terminal) {
      const wx = 7.7, wy = 1.95, ww = w - 0.9 - 7.7, wh = 3.0;
      box(ctx, { x: wx, y: wy, w: ww, h: wh, fill: colors.codeBg, line: colors.border, radius: 0.14 });
      box(ctx, { x: wx, y: wy, w: ww, h: 0.5, fill: colors.panel, line: colors.border, radius: 0.14 });
      box(ctx, { x: wx + 0.01, y: wy + 0.3, w: ww - 0.02, h: 0.21, fill: colors.panel, shape: 'rect' });
      ['FF5F56', 'FFBD2E', '27C93F'].forEach((c, i) => {
        ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: wx + 0.3 + i * 0.28, y: wy + 0.17, w: 0.17, h: 0.17, fill: { color: c }, line: { type: 'none' } });
      });
      text(ctx, s.terminal.file || '', { x: wx, y: wy, w: ww, h: 0.5, fontSize: 12, color: colors.muted, fontFace: fonts.code, align: 'center', valign: 'middle' });
      const runs = [];
      const lines = s.terminal.code.split('\n');
      lines.forEach((ln, i) => {
        const rs = C.highlightLine(ln, s.terminal.lang || 'plain', ctx);
        rs[rs.length - 1].options.breakLine = i < lines.length - 1;
        runs.push(...rs);
      });
      text(ctx, runs, { x: wx + 0.35, y: wy + 0.85, w: ww - 0.6, h: 1.9, fontSize: 17, fontFace: fonts.code, lineSpacing: 30, wrap: false });
    }
    text(ctx, s.tag, {
      x: 0.9, y: 2.2, w: 6.5, h: 0.4, fontSize: 18, color: colors.teal, fontFace: fonts.code, valign: 'middle',
    });
    text(ctx, s.title, {
      x: 0.9, y: 2.7, w: 6.6, h: 1.3, fontSize: 60, bold: true, color: colors.white, fontFace: fonts.heading, valign: 'middle',
    });
    text(ctx, s.subtitle, { x: 0.9, y: 4.1, w: 6.4, h: 1.0, fontSize: 24, color: colors.titleSub });
    text(ctx, s.meta, { x: 0.9, y: h - 1.0, w: 8, h: 0.4, fontSize: 14, color: colors.muted });
  },

  // ------------------------------------------------------------ lista numerada / resumen
  list(ctx, s) {
    const { colors, fonts } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const n = s.items.length;
    const rowH = Math.min(0.95, 4.4 / n);
    const y0 = 1.95;
    s.items.forEach((it, i) => {
      const y = y0 + i * rowH;
      const item = typeof it === 'string' ? { title: it } : it;
      const d = 0.58;
      if (s.marker === 'dot') {
        box(ctx, { x: mx + 0.1, y: y + (rowH - 0.22) / 2, w: 0.22, h: 0.22, fill: colors.teal, radius: 0.05 });
      } else {
        circleLabel(ctx, { x: mx, y: y + (rowH - d) / 2, d, label: String(i + 1), fill: colors.teal, color: ctx.T.teal.on, size: 22 });
      }
      const runs = C.rich(item.title, ctx, { fontSize: s.titleSize || 24, bold: s.bold !== false, color: colors.heading, fontFace: fonts.heading });
      if (item.text) {
        runs[runs.length - 1].options.breakLine = true;
        runs.push(...C.rich(item.text, ctx, { fontSize: 17, color: colors.slate }));
      }
      text(ctx, runs, { x: mx + 0.9, y, w: w - 2 * mx - 0.9, h: rowH, valign: 'middle' });
    });
    if (s.footnote) {
      text(ctx, s.footnote, { x: mx, y: 6.35, w: w - 2 * mx, h: 0.6, fontSize: 12, color: colors.muted, valign: 'bottom' });
    }
  },

  // ------------------------------------------------------------ pasos con flechas
  flow(ctx, s) {
    const { colors, fonts } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const n = s.steps.length;
    const gap = 0.8;
    const bw = (w - 2 * mx - (n - 1) * gap) / n;
    const y = 2.0, h = 3.1;
    s.steps.forEach((st, i) => {
      const x = mx + i * (bw + gap);
      box(ctx, { x, y, w: bw, h, fill: colors.panel, line: colors.border });
      circleLabel(ctx, { x: x + 0.3, y: y + 0.3, d: 0.6, label: String(i + 1), fill: colors.teal, color: ctx.T.teal.on, size: 22 });
      text(ctx, st.title, { x: x + 0.3, y: y + 1.05, w: bw - 0.6, h: 0.5, fontSize: 26, bold: true, color: colors.heading, fontFace: fonts.heading, valign: 'middle' });
      text(ctx, st.text, { x: x + 0.3, y: y + 1.65, w: bw - 0.6, h: h - 1.9, fontSize: 17, color: colors.slate, lineSpacingMultiple: 1.05 });
      if (i < n - 1) {
        ctx.slide.addShape(ctx.pptx.ShapeType.rightArrow, {
          x: x + bw + (gap - 0.5) / 2, y: y + h / 2 - 0.25, w: 0.5, h: 0.5, fill: { color: colors.teal }, line: { type: 'none' },
        });
      }
    });
    if (s.callout) callout(ctx, { x: mx, y: 5.5, w: w - 2 * mx, h: 0.95, ...s.callout });
  },

  // ------------------------------------------------------------ imagen
  image(ctx, s) {
    const { colors } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const hasCap = !!s.caption;
    const area = { x: mx, y: 1.8, w: w - 2 * mx, h: hasCap ? 4.35 : 5.0 };
    // Las imágenes con fondo blanco se enmarcan en una tarjeta clara para que se vean bien en temas oscuros
    box(ctx, { x: area.x + 0.8, y: area.y, w: area.w - 1.6, h: area.h, fill: 'FFFFFF', radius: 0.15 });
    image(ctx, s.image, { x: area.x + 1.0, y: area.y + 0.15, w: area.w - 2.0, h: area.h - 0.3 }, s.alt);
    if (hasCap) {
      text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle' });
    }
  },

  // ------------------------------------------------------------ rejilla de tarjetas
  cards(ctx, s) {
    const { colors } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const n = s.cards.length;
    const cols = s.columns || Math.min(n, 3);
    const rows = Math.ceil(n / cols);
    const gap = 0.3;
    let top = 1.9;
    if (s.intro) {
      text(ctx, s.intro, { x: mx, y: 1.75, w: w - 2 * mx, h: 0.5, fontSize: 19, color: colors.slate, valign: 'middle' });
      top = 2.5;
    }
    const bottom = s.callout ? 5.75 : 6.75;
    const cw = (w - 2 * mx - (cols - 1) * gap) / cols;
    const ch = Math.min((bottom - top - (rows - 1) * gap) / rows, s.cardHeight || 3.1);
    s.cards.forEach((c, i) => {
      const r = Math.floor(i / cols), k = i % cols;
      card(ctx, { titleSize: s.titleSize || (cols <= 3 ? 22 : 20), textSize: s.textSize || (cols <= 3 ? 18 : 17), ...c }, { x: mx + k * (cw + gap), y: top + r * (ch + gap), w: cw, h: ch });
    });
    if (s.callout) {
      const cy = top + rows * ch + (rows - 1) * gap + 0.4;
      callout(ctx, { x: mx, y: cy, w: w - 2 * mx, h: 0.95, ...s.callout });
    }
  },

  // ------------------------------------------------------------ dos paneles
  compare(ctx, s) {
    const { colors, fonts } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const gap = s.vs ? 0.8 : 0.5;
    const pw = (w - 2 * mx - gap) / 2;
    const top = 1.85;
    const bottom = s.panelHeight ? top + s.panelHeight : s.callout ? 5.75 : 6.75;
    s.panels.forEach((p, i) => {
      const x = mx + i * (pw + gap);
      const t = ctx.T[p.tone || 'navy'];
      C.surface(ctx, p.tone, { x, y: top, w: pw, h: bottom - top });
      text(ctx, p.title, { x: x + 0.35, y: top + 0.25, w: pw - 0.7, h: 0.5, fontSize: 24, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
      let cy = top + 0.95;
      const iw = pw - 0.7;
      if (p.text) {
        const fs = p.textSize || 18;
        const th = estLines(p.text, fs, iw) * lineH(fs) + 0.1;
        text(ctx, p.text, { x: x + 0.35, y: cy, w: iw, h: th, fontSize: fs, color: colors.slate });
        cy += th + 0.15;
      }
      if (p.chips) {
        let cx = x + 0.35;
        p.chips.forEach((label) => {
          const cwid = label.length * 0.105 + 0.5;
          chip(ctx, { x: cx, y: cy, w: cwid, h: 0.45, label, tone: p.tone || 'navy', size: 16 });
          cx += cwid + 0.15;
        });
        cy += 0.45 + 0.2;
      }
      if (p.items) {
        const fs = p.itemSize || 18;
        const th = p.items.reduce((a, it) => a + estLines(it, fs, iw - 0.3) * lineH(fs) + 8 / 72, 0);
        paragraphs(ctx, p.items, { x: x + 0.35, y: cy, w: iw, h: th, fontSize: fs, bullet: true, spaceAfter: 8, color: colors.ink });
        cy += th + 0.1;
      }
      if (p.code) {
        const ch = codeBlock(ctx, { x: x + 0.35, y: cy, w: iw, code: p.code, lang: p.codeLang, fontSize: p.codeSize || 15 });
        cy += ch + 0.15;
      }
      if (p.note) {
        text(ctx, p.note, { x: x + 0.35, y: cy, w: iw, h: bottom - cy - 0.2, fontSize: 16, italic: true, color: colors.slate });
      }
    });
    if (s.vs) {
      circleLabel(ctx, { x: w / 2 - 0.3, y: top + (bottom - top) / 2 - 0.3, d: 0.6, label: 'vs', fill: colors.navy, color: colors.white, size: 16 });
    }
    if (s.callout) callout(ctx, { x: mx, y: bottom + 0.25, w: w - 2 * mx, h: 0.85, ...s.callout });
  },

  // ------------------------------------------------------------ tabla comparativa
  table(ctx, s) {
    const { colors } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const fs = s.fontSize || 17;
    const tw = w - 2 * mx;
    const sum = (s.colWeights || s.columns.map(() => 1)).reduce((a, b) => a + b, 0);
    const colW = (s.colWeights || s.columns.map(() => 1)).map((x) => (x / sum) * tw);
    const rowH = [0.55, ...s.rows.map((r) =>
      Math.max(0.6, Math.max(...r.map((v, c) => estLines(v, fs, colW[c] - 0.3))) * lineH(fs) + 0.3)
    )];
    const t = table(ctx, {
      x: mx, y: 1.85, colW, header: s.columns, rows: s.rows, rowH, fontSize: fs,
      cellStyle: (r, c) => (c === 0 && s.firstColBold !== false ? { bold: true, color: colors.heading, fill: colors.tealLight } : {}),
    });
    if (s.callout) {
      const cy = Math.min(Math.max(1.85 + t.h + 0.3, 5.5), 5.9);
      callout(ctx, { x: mx, y: cy, w: tw, h: 0.85, ...s.callout });
    }
  },

  // ------------------------------------------------------------ código en columnas
  code(ctx, s) {
    const { colors } = ctx.theme;
    const { mx, w } = ctx.theme.page;
    header(ctx, s);
    const gap = 0.4;
    const n = s.columns.length;
    const total = s.columns.reduce((a, c) => a + (c.weight || 1), 0);
    const avail = w - 2 * mx - gap * (n - 1);
    let x = mx;
    s.columns.forEach((col) => {
      const cw = (avail * (col.weight || 1)) / total;
      let y = s.top || 1.85;
      (col.blocks || []).forEach((b) => {
        if (b.label) {
          text(ctx, b.label, { x, y, w: cw, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
          y += 0.4;
        }
        const h = codeBlock(ctx, { x, y, w: cw, code: b.code, lang: b.lang, fontSize: b.size || s.codeSize || 15 });
        y += h + 0.1;
        if (b.note) {
          const th = estLines(b.note, 15, cw) * lineH(15) + 0.05;
          text(ctx, b.note, { x, y, w: cw, h: th, fontSize: 15, color: colors.slate });
          y += th;
        }
        y += 0.25;
      });
      (col.cards || []).forEach((c) => {
        const ch = c.h || 1.45;
        card(ctx, { textSize: 16, ...c }, { x, y, w: cw, h: ch });
        y += ch + 0.2;
      });
      x += cw + gap;
    });
    if (s.callouts) {
      const k = s.callouts.length;
      const cwid = (w - 2 * mx - (k - 1) * 0.3) / k;
      s.callouts.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + 0.3), y: s.calloutsY || 5.85, w: cwid, h: s.calloutsH || 0.95, size: 16, ...c }));
    }
  },

  // ------------------------------------------------------------ diagramas a medida
  diagram(ctx, s) {
    header(ctx, s);
    if (!diagrams[s.kind]) throw new Error('Diagrama desconocido: ' + s.kind);
    diagrams[s.kind](ctx, s);
  },
};

layouts.summary = layouts.list;
module.exports = { layouts, estLines, lineH };
