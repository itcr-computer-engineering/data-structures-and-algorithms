const fs = require('fs');
const path = require('path');

// ---------- Texto enriquecido: **negrita** y `código en línea` ----------
function rich(content, ctx, base = {}) {
  const { colors, fonts } = ctx.theme;
  return String(content)
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter((p) => p !== '')
    .map((p) => {
      if (p.startsWith('**')) return { text: p.slice(2, -2), options: { ...base, bold: true } };
      if (p.startsWith('`')) {
        return {
          text: p.slice(1, -1),
          options: { ...base, fontFace: fonts.code, color: base.codeColor || colors.tealDark },
        };
      }
      return { text: p, options: { ...base } };
    });
}

function text(ctx, content, o = {}) {
  const { colors, fonts } = ctx.theme;
  const runs = typeof content === 'string' ? rich(content, ctx) : content;
  ctx.slide.addText(runs, {
    fontFace: fonts.body,
    fontSize: 18,
    color: colors.ink,
    margin: 0,
    valign: 'top',
    lang: 'es-ES',
    ...o,
  });
}

// Lista de párrafos (con o sin viñeta) en un solo cuadro de texto.
function paragraphs(ctx, items, { bullet = false, spaceAfter = 6, ...o } = {}) {
  const runs = [];
  items.forEach((item, i) => {
    const rs = rich(item, ctx);
    rs.forEach((r, j) => {
      r.options = { ...r.options };
      // Las propiedades de párrafo solo van en la primera corrida; si no, cada corrida abre un párrafo nuevo.
      if (j === 0) {
        r.options.paraSpaceAfter = spaceAfter;
        if (bullet) r.options.bullet = { indent: 18 };
      }
      if (j === rs.length - 1 && i < items.length - 1) r.options.breakLine = true;
    });
    runs.push(...rs);
  });
  text(ctx, runs, o);
}

// ---------- Formas básicas ----------
function box(ctx, { x, y, w, h, fill, line, radius = 0.12, shape = 'roundRect', lineWidth = 1 }) {
  const opts = { x, y, w, h };
  if (fill) opts.fill = { color: fill };
  if (line) opts.line = { color: line, width: lineWidth };
  else opts.line = { type: 'none' };
  if (shape === 'roundRect') opts.rectRadius = radius;
  ctx.slide.addShape(ctx.pptx.ShapeType[shape], opts);
}

function chip(ctx, { x, y, w, h = 0.4, label, tone = 'teal', solid = true, size = 14 }) {
  const t = ctx.T[tone];
  const { colors, fonts } = ctx.theme;
  ctx.slide.addText(label, {
    shape: ctx.pptx.ShapeType.roundRect,
    rectRadius: h / 2,
    x,
    y,
    w,
    h,
    fill: { color: solid ? t.accent : t.soft },
    line: { type: 'none' },
    color: solid ? (tone === 'amber' ? colors.ink : colors.white) : t.text,
    bold: true,
    fontSize: size,
    fontFace: fonts.body,
    align: 'center',
    valign: 'middle',
    margin: 0,
    lang: 'es-ES',
  });
}

function circleLabel(ctx, { x, y, d, label, fill, color, size = 22 }) {
  ctx.slide.addText(label, {
    shape: ctx.pptx.ShapeType.ellipse,
    x,
    y,
    w: d,
    h: d,
    fill: { color: fill },
    line: { type: 'none' },
    color,
    bold: true,
    fontSize: size,
    fontFace: ctx.theme.fonts.heading,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });
}

function arrow(ctx, { x1, y1, x2, y2, color, width = 2.5, both = false }) {
  const line = { color: color || ctx.theme.colors.slate, width, endArrowType: 'triangle' };
  if (both) line.beginArrowType = 'triangle';
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
    flipH: x2 < x1,
    flipV: y2 < y1,
    line,
  });
}

// ---------- Encabezado y pie ----------
function header(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  if (s.section) {
    text(ctx, s.section.toUpperCase(), {
      x: mx, y: 0.42, w: w - 2 * mx, h: 0.3,
      fontSize: 13, bold: true, color: colors.teal, charSpacing: 3,
    });
  }
  text(ctx, s.title, {
    x: mx, y: 0.74, w: w - 2 * mx, h: 0.75,
    fontSize: 32, bold: true, color: colors.navy, fontFace: fonts.heading, valign: 'middle',
  });
}

function footer(ctx) {
  const { colors } = ctx.theme;
  const { mx, w, h } = ctx.theme.page;
  text(ctx, ctx.meta.footer || '', {
    x: mx, y: h - 0.5, w: 7, h: 0.3, fontSize: 11, color: colors.muted, valign: 'middle',
  });
  ctx.slide.slideNumber = {
    x: w - mx - 1, y: h - 0.5, w: 1, h: 0.3,
    fontFace: ctx.theme.fonts.body, fontSize: 11, color: colors.muted, align: 'right',
  };
}

// ---------- Tarjetas y avisos ----------
function card(ctx, c, { x, y, w, h }) {
  const { colors, fonts } = ctx.theme;
  const t = ctx.T[c.tone || 'navy'];
  const pad = 0.3;
  box(ctx, { x, y, w, h, fill: c.tone ? t.soft : colors.panel });
  let cy = y + pad;
  if (c.badge) {
    circleLabel(ctx, { x: x + pad, y: cy, d: 0.62, label: c.badge, fill: t.accent, color: colors.white, size: 24 });
    cy += 0.62 + 0.15;
  }
  const titleH = c.titleH || 0.42;
  text(ctx, c.title, {
    x: x + pad, y: cy, w: w - 2 * pad, h: titleH,
    fontSize: c.titleSize || 20, bold: true, color: c.tone ? t.text : colors.navy, fontFace: fonts.heading, valign: 'middle',
  });
  cy += titleH + 0.08;
  if (c.text) {
    text(ctx, c.text, {
      x: x + pad, y: cy, w: w - 2 * pad, h: y + h - cy - pad - (c.footer ? 0.4 : 0),
      fontSize: c.textSize || 16, color: colors.slate, lineSpacingMultiple: 1.05,
    });
  }
  if (c.footer) {
    text(ctx, c.footer, {
      x: x + pad, y: y + h - pad - 0.4, w: w - 2 * pad, h: 0.4,
      fontSize: c.footerSize || 15, bold: true, color: c.tone ? t.text : colors.tealDark, valign: 'middle',
    });
  }
}

function callout(ctx, { x, y, w, h, tone = 'teal', label, text: body, size = 17 }) {
  const t = ctx.T[tone];
  box(ctx, { x, y, w, h, fill: t.soft });
  box(ctx, { x, y, w: 0.09, h, fill: t.accent, shape: 'rect' });
  const runs = [];
  if (label) runs.push({ text: label + ' ', options: { bold: true, color: t.text } });
  runs.push(...rich(body, ctx));
  text(ctx, runs, { x: x + 0.3, y, w: w - 0.5, h, fontSize: size, valign: 'middle', color: ctx.theme.colors.ink });
}

// ---------- Código con resaltado simple ----------
const SQL_KW = new Set(
  ('SELECT FROM WHERE JOIN ON CREATE TABLE INDEX INSERT INTO VALUES UPDATE SET DELETE PRIMARY KEY FOREIGN ' +
    'REFERENCES INT VARCHAR ALTER DROP AND OR NOT NULL ORDER BY GROUP INNER LEFT RIGHT FULL OUTER AS')
    .split(' ')
);

function highlightLine(line, lang, ctx) {
  const { colors, fonts } = ctx.theme;
  const mk = (t, color) => ({ text: t, options: { color, fontFace: fonts.code } });
  if (lang === 'plain') return [mk(line || ' ', colors.codeText)];
  const out = [];
  const re = /("[^"]*"|'[^']*')|(\b\d+\b)|([A-Za-zÁÉÍÓÚáéíóúñÑ_][\wÁÉÍÓÚáéíóúñÑ]*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line))) {
    const [tok, str, num, word] = m;
    if (str) {
      const isKey = lang === 'json' && /^\s*:/.test(line.slice(m.index + tok.length));
      out.push(mk(tok, isKey ? colors.codeKw : colors.codeStr));
    } else if (num) out.push(mk(tok, colors.codeNum));
    else if (word) out.push(mk(tok, lang === 'sql' && SQL_KW.has(tok.toUpperCase()) ? colors.codeKw : colors.codeText));
    else out.push(mk(tok, colors.codeText));
  }
  return out.length ? out : [mk(' ', colors.codeText)];
}

function codeHeight(code, fontSize) {
  return code.split('\n').length * ((fontSize * 1.3) / 72) + 0.4;
}

function codeBlock(ctx, { x, y, w, code, lang = 'sql', fontSize = 15 }) {
  const lines = code.split('\n');
  const h = codeHeight(code, fontSize);
  box(ctx, { x, y, w, h, fill: ctx.theme.colors.codeBg, radius: 0.1 });
  const runs = [];
  lines.forEach((ln, i) => {
    const rs = highlightLine(ln, lang, ctx);
    rs[rs.length - 1].options.breakLine = i < lines.length - 1;
    runs.push(...rs);
  });
  text(ctx, runs, {
    x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4,
    fontSize, fontFace: ctx.theme.fonts.code, lineSpacing: fontSize * 1.3, wrap: false,
  });
  return h;
}

// ---------- Tablas ----------
// cellStyle(r, c) -> { fill, color, bold, align } opcional por celda de datos.
function table(ctx, { x, y, colW, header, rows, rowH = 0.5, fontSize = 16, cellStyle, headerFill, headerSize, align }) {
  const { colors, fonts } = ctx.theme;
  const border = { type: 'solid', pt: 1, color: colors.border };
  const cell = (txt, o) => ({
    text: String(txt),
    options: {
      fontFace: fonts.body, fontSize, color: colors.ink, valign: 'middle', border,
      margin: [0, 0.12, 0, 0.12], align: align || 'left', ...o,
    },
  });
  const data = [];
  if (header) {
    data.push(
      header.map((h, c) =>
        cell(h, {
          bold: true, color: colors.white, fill: { color: headerFill || colors.navy },
          fontSize: headerSize || fontSize, align: (Array.isArray(align) ? align[c] : align) || 'left',
        })
      )
    );
  }
  rows.forEach((r, ri) => {
    data.push(
      r.map((v, c) => {
        const st = (cellStyle && cellStyle(ri, c)) || {};
        const o = { ...st };
        if (st.fill) o.fill = { color: st.fill };
        else o.fill = { color: ri % 2 ? colors.panel : colors.white };
        if (Array.isArray(align)) o.align = st.align || align[c];
        return cell(v, o);
      })
    );
  });
  const hs = Array.isArray(rowH) ? rowH : data.map(() => rowH);
  ctx.slide.addTable(data, { x, y, colW, rowH: hs });
  const totalH = hs.reduce((a, b) => a + b, 0);
  const totalW = colW.reduce((a, b) => a + b, 0);
  const rowTop = (i) => y + hs.slice(0, i).reduce((a, b) => a + b, 0); // i=0 -> encabezado
  const colLeft = (j) => x + colW.slice(0, j).reduce((a, b) => a + b, 0);
  return { w: totalW, h: totalH, rowTop, colLeft, rowH: hs };
}

// ---------- Imágenes ----------
function imageSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(1, 4).toString() === 'PNG') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  throw new Error('Solo se admiten PNG para calcular proporciones: ' + file);
}

function image(ctx, file, box_, altText) {
  const p = path.resolve(ctx.assetsDir, file);
  if (!fs.existsSync(p)) throw new Error('No existe la imagen: ' + p);
  const sz = imageSize(p);
  const r = Math.min(box_.w / sz.w, box_.h / sz.h);
  const w = sz.w * r;
  const h = sz.h * r;
  ctx.slide.addImage({ path: p, x: box_.x + (box_.w - w) / 2, y: box_.y + (box_.h - h) / 2, w, h, altText });
  return { w, h };
}

module.exports = {
  rich, text, paragraphs, box, chip, circleLabel, arrow,
  header, footer, card, callout, codeBlock, codeHeight, table, image,
};
