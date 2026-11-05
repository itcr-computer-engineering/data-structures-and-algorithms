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
  // Un alto negativo o nulo produce un archivo que PowerPoint no puede abrir
  if (o.h !== undefined && o.h < 0.05) o = { ...o, h: 0.05 };
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
function box(ctx, { x, y, w, h, fill, line, radius = 0.12, shape = 'roundRect', lineWidth = 1, lineTransparency }) {
  const opts = { x, y, w, h };
  if (fill) opts.fill = { color: fill };
  if (line) {
    opts.line = { color: line, width: lineWidth };
    if (lineTransparency) opts.line.transparency = lineTransparency;
  } else opts.line = { type: 'none' };
  if (shape === 'roundRect') opts.rectRadius = radius;
  ctx.slide.addShape(ctx.pptx.ShapeType[shape], opts);
}

function chip(ctx, { x, y, w, h = 0.4, label, tone = 'teal', solid = true, size = 14 }) {
  const t = ctx.T[tone];
  const { fonts } = ctx.theme;
  ctx.slide.addText(label, {
    shape: ctx.pptx.ShapeType.roundRect,
    rectRadius: h / 2,
    x,
    y,
    w,
    h,
    fill: { color: solid ? t.accent : t.soft },
    line: { type: 'none' },
    color: solid ? t.on : t.text,
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

function arrow(ctx, { x1, y1, x2, y2, color, width = 2.5, both = false, head = true }) {
  const line = { color: color || ctx.theme.colors.slate, width };
  if (head) line.endArrowType = 'triangle';
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
    if (ctx.theme.sectionStyle === 'comment') {
      text(ctx, '// ' + s.section.toLowerCase(), {
        x: mx, y: 0.4, w: 7, h: 0.32, fontSize: 15, color: colors.teal, fontFace: fonts.code, valign: 'middle',
      });
    } else {
      text(ctx, s.section.toUpperCase(), {
        x: mx, y: 0.42, w: 7, h: 0.3, fontSize: 13, bold: true, color: colors.teal, charSpacing: 3,
      });
    }
  }
  text(ctx, s.title, {
    x: mx, y: 0.74, w: w - 2 * mx, h: 0.75,
    fontSize: 32, bold: true, color: colors.heading, fontFace: fonts.heading, valign: 'middle',
  });
  if (s.step) progress(ctx, s.step, s.stepTotal || 6);
}

// Indicador "paso n/total" para las diapositivas del proceso de diseño.
function progress(ctx, current, total) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const d = 0.16, gap = 0.1;
  const x0 = w - mx - (total * d + (total - 1) * gap);
  text(ctx, `paso ${current}/${total}`, {
    x: x0 - 1.6, y: 0.4, w: 1.45, h: 0.32, fontSize: 13, color: colors.slate, fontFace: fonts.code, align: 'right', valign: 'middle',
  });
  for (let i = 0; i < total; i++) {
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
      x: x0 + i * (d + gap), y: 0.48, w: d, h: d,
      fill: { color: i < current ? colors.teal : colors.border }, line: { type: 'none' },
    });
  }
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
// Fondo de tarjeta/panel: con tono -> fondo suave y borde del acento; sin tono -> superficie neutra con borde.
function surface(ctx, tone, rect) {
  const { colors } = ctx.theme;
  if (tone && tone !== 'navy') {
    const t = ctx.T[tone];
    box(ctx, { ...rect, fill: t.soft, line: t.accent, lineTransparency: 70 });
  } else {
    box(ctx, { ...rect, fill: colors.panel, line: colors.border });
  }
}

function card(ctx, c, { x, y, w, h }) {
  const { colors, fonts } = ctx.theme;
  const t = ctx.T[c.tone || 'navy'];
  const pad = 0.3;
  surface(ctx, c.tone, { x, y, w, h });
  let cy = y + pad;
  if (c.badge) {
    circleLabel(ctx, {
      x: x + pad, y: cy, d: 0.62, label: c.badge, fill: t.accent, color: t.on, size: String(c.badge).length > 1 ? 16 : 24,
    });
    cy += 0.62 + 0.15;
  }
  const titleH = c.titleH || 0.42;
  text(ctx, c.title, {
    x: x + pad, y: cy, w: w - 2 * pad, h: titleH,
    fontSize: c.titleSize || 20, bold: true, color: c.tone ? t.text : colors.heading, fontFace: fonts.heading, valign: 'middle',
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
// Lenguajes admitidos en `lang`: sql, json, c, cpp, java, csharp, python, pseudo, plain.
// Para agregar otro basta con registrarlo en LANGS (palabras clave, tipos y marca de comentario).
const words = (s) => new Set(s.split(' '));
const C_FLOW = 'if else for while do switch case break continue return goto default';
const LANGS = {
  sql: {
    ignoreCase: true,
    comment: '--',
    kw: words(
      'SELECT FROM WHERE JOIN ON CREATE TABLE INDEX INSERT INTO VALUES UPDATE SET DELETE PRIMARY KEY FOREIGN ' +
        'REFERENCES ALTER DROP AND OR NOT NULL ORDER BY GROUP INNER LEFT RIGHT FULL OUTER AS UNIQUE DEFAULT CONSTRAINT'
    ),
    types: words('INT VARCHAR DATE DECIMAL TEXT'),
  },
  c: {
    comment: '//',
    kw: words(`${C_FLOW} struct typedef sizeof static const enum union extern NULL true false`),
    types: words('int char float double long short unsigned signed void bool size_t'),
  },
  cpp: {
    comment: '//',
    kw: words(`${C_FLOW} struct class public private protected template typename new delete nullptr static const virtual namespace using true false`),
    types: words('int char float double long short unsigned signed void bool string vector size_t auto'),
  },
  java: {
    comment: '//',
    kw: words(`${C_FLOW} class interface extends implements public private protected static final new this super null true false throw throws try catch finally import package`),
    types: words('int char float double long short byte void boolean String List Map ArrayList'),
  },
  csharp: {
    comment: '//',
    kw: words(`${C_FLOW} class interface struct enum public private protected internal static readonly const new this base null true false throw try catch finally using namespace var foreach in abstract virtual override sealed get set value is as out ref async await`),
    types: words('int char float double decimal long short byte void bool string object List Dictionary'),
  },
  rust: {
    comment: '//',
    kw: words('if else for while loop in match return fn let mut const struct enum impl trait use pub mod self Self as ref move where unsafe break continue true false'),
    types: words('i8 i16 i32 i64 u8 u16 u32 u64 usize isize f32 f64 bool char str String Vec Option Result Box'),
  },
  python: {
    comment: '#',
    kw: words('if elif else for while in not and or return def class import from as with try except finally raise lambda None True False break continue pass yield'),
    types: words('int str float bool list dict set tuple'),
  },
  pseudo: {
    comment: '//',
    kw: words(
      'SI ENTONCES SINO MIENTRAS PARA HASTA REPETIR HACER RETORNAR DEVOLVER FIN FUNCION PROCEDIMIENTO LEER ESCRIBIR Y O NO VERDADERO FALSO ' +
        'IF THEN ELSE WHILE FOR DO RETURN END FUNCTION AND OR NOT TRUE FALSE'
    ),
    types: words('ENTERO REAL CADENA BOOLEANO ARREGLO'),
  },
  json: {},
  plain: {},
};

function highlightLine(line, lang, ctx) {
  const { colors, fonts } = ctx.theme;
  const mk = (t, color) => ({ text: t, options: { color, fontFace: fonts.code } });
  const L = LANGS[lang];
  if (!L) throw new Error(`Lenguaje de código desconocido: ${lang}`);
  if (lang === 'plain') return [mk(line || ' ', colors.codeText)];
  // Comentario de línea: desde la marca hasta el final (si no está dentro de una cadena)
  let comment = null;
  if (L.comment) {
    const ci = line.indexOf(L.comment);
    const before = ci >= 0 ? line.slice(0, ci) : '';
    if (ci >= 0 && (before.match(/'/g) || []).length % 2 === 0 && (before.match(/"/g) || []).length % 2 === 0) {
      comment = line.slice(ci);
      line = before;
    }
  }
  const out = [];
  const re = /("[^"]*"|'[^']*')|(\b\d+\b)|([A-Za-zÁÉÍÓÚáéíóúñÑ_][\wÁÉÍÓÚáéíóúñÑ]*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line))) {
    const [tok, str, num, word] = m;
    if (str) {
      const isKey = lang === 'json' && /^\s*:/.test(line.slice(m.index + tok.length));
      out.push(mk(tok, isKey ? colors.codeType : colors.codeStr));
    } else if (num) out.push(mk(tok, colors.codeNum));
    else if (word) {
      const key = L.ignoreCase ? tok.toUpperCase() : tok;
      out.push(mk(tok, L.kw && L.kw.has(key) ? colors.codeKw : L.types && L.types.has(key) ? colors.codeType : colors.codeText));
    } else out.push(mk(tok, colors.codeText));
  }
  if (comment) out.push(mk(comment, colors.codeComment));
  return out.length ? out : [mk(' ', colors.codeText)];
}

function codeHeight(code, fontSize) {
  return code.split('\n').length * ((fontSize * 1.3) / 72) + 0.4;
}

function codeBlock(ctx, { x, y, w, code, lang, fontSize = 15 }) {
  lang = lang || ctx.meta.codeLang || 'sql';
  const lines = code.split('\n');
  const h = codeHeight(code, fontSize);
  box(ctx, { x, y, w, h, fill: ctx.theme.colors.codeBg, line: ctx.theme.colors.codeBorder, radius: 0.1 });
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
function table(ctx, { x, y, colW, header, rows, rowH = 0.5, fontSize = 16, cellStyle, headerFill, headerColor, headerSize, align, cellMargin }) {
  const { colors, fonts } = ctx.theme;
  const border = { type: 'solid', pt: 1, color: colors.border };
  const cell = (txt, o) => {
    const options = {
      fontFace: fonts.body, fontSize, color: colors.ink, valign: 'middle', border,
      margin: cellMargin || [0, 0.12, 0, 0.12], align: align || 'left', ...o,
    };
    const s = String(txt);
    // **negrita** y `código` dentro de la celda: se pasan como corridas con las opciones de texto explícitas
    const content = /\*\*|`/.test(s)
      ? rich(s, ctx, { fontFace: options.fontFace, fontSize: options.fontSize, color: options.color, bold: options.bold })
      : s;
    return { text: content, options };
  };
  const data = [];
  if (header) {
    data.push(
      header.map((h, c) =>
        cell(h, {
          bold: true, color: headerColor || colors.white, fill: { color: headerFill || colors.navy },
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
        else o.fill = { color: ri % 2 ? colors.rowB : colors.rowA };
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
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    // JPEG: buscar un marcador SOFn (0xC0–0xCF salvo 0xC4, 0xC8 y 0xCC) que trae el alto y el ancho
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (buf.slice(0, 3).toString() === 'GIF') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  throw new Error('Formato de imagen no admitido (use PNG, JPEG o GIF): ' + file);
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
  header, footer, card, surface, callout, codeBlock, codeHeight, highlightLine, table, image,
};
