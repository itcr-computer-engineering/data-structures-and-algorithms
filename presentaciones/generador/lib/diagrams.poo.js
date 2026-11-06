// Diagramas específicos de la lección CE-1103 · 01 · Programación Orientada a Objetos.
// Todos los `kind` llevan el prefijo `poo-`. Solo usan colores semánticos del tema.
// Campos de `poo-relaciones`: panels[2]{title,tone,text,from{name,attrs,methods},to{…},link{kind:'inherit'|'compose',label},code}, vs, callout.
// Los bloques de `poo-code` aceptan `plain: true` (texto sin resaltar, p. ej. la salida de un programa).
const C = require('./components');

const { text, paragraphs, box, chip, circleLabel, arrow, callout, surface, card } = C;

const ROW = 0.34; // alto de una fila de miembros (atributo o método) en un diagrama de clases
const MEM_PT = 14;
const monoW = (chars, pt = MEM_PT) => (chars * pt * 0.55) / 72;
const member = (m) => (typeof m === 'string' ? { t: m } : m);

// ------------------------------------------------------------------ resaltado de C# ampliado
// El lenguaje `csharp` de components.js no conoce abstract/virtual/override/get/set/decimal; este resaltador los agrega.
const CS_KW = new Set(
  ('if else for while do switch case break continue return default class interface public private protected static readonly ' +
    'new this base null true false throw try catch finally using namespace var foreach in abstract virtual override sealed get set').split(' ')
);
const CS_TYPES = new Set('int char float double long short byte void bool string decimal object'.split(' '));

function csLine(line, ctx) {
  const { colors, fonts } = ctx.theme;
  const mk = (t, color) => ({ text: t, options: { color, fontFace: fonts.code } });
  let comment = null;
  const ci = line.indexOf('//');
  if (ci >= 0 && (line.slice(0, ci).match(/"/g) || []).length % 2 === 0) {
    comment = line.slice(ci);
    line = line.slice(0, ci);
  }
  const out = [];
  const re = /("[^"]*")|(\b\d+\b)|([\p{L}_][\p{L}\p{N}_]*)|(\s+)|(.)/gu;
  let m;
  let prevWord = '';
  let prevChar = '';
  while ((m = re.exec(line))) {
    const [tok, str, num, word, space] = m;
    if (str) out.push(mk(tok, colors.codeStr));
    else if (num) out.push(mk(tok, colors.codeNum));
    else if (word) {
      let color = colors.codeText;
      if (CS_KW.has(tok)) color = colors.codeKw;
      else if (CS_TYPES.has(tok)) color = colors.codeType;
      else if (/^\p{Lu}/u.test(tok)) {
        // Nombre de tipo: tras class/interface/new/«:» o en una declaración «Tipo variable» o «Tipo[] variable»
        const declared = /^(\[\])?\s+[\p{L}_]/u.test(line.slice(m.index + tok.length));
        if (['class', 'interface', 'new'].includes(prevWord) || prevChar === ':' || declared) color = colors.codeType;
      }
      out.push(mk(tok, color));
      prevWord = tok;
      prevChar = '';
    } else {
      out.push(mk(tok, colors.codeText));
      if (!space) prevChar = tok;
    }
  }
  if (comment) out.push(mk(comment, colors.codeComment));
  return out.length ? out : [mk(' ', colors.codeText)];
}

// `plain: true` muestra el texto sin resaltar (p. ej. la salida de un programa).
function csBlock(ctx, { x, y, w, code, fontSize = 15, plain = false }) {
  const { colors, fonts } = ctx.theme;
  const lines = code.split('\n');
  const h = lines.length * ((fontSize * 1.3) / 72) + 0.4;
  box(ctx, { x, y, w, h, fill: colors.codeBg, line: colors.codeBorder, radius: 0.1 });
  const runs = [];
  lines.forEach((ln, i) => {
    const rs = plain ? [{ text: ln || ' ', options: { color: colors.codeText, fontFace: fonts.code } }] : csLine(ln, ctx);
    rs[rs.length - 1].options.breakLine = i < lines.length - 1;
    runs.push(...rs);
  });
  text(ctx, runs, {
    x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4, fontSize, fontFace: fonts.code, lineSpacing: fontSize * 1.3, wrap: false,
  });
  return h;
}

// Igual que el layout `code`, pero con el resaltador de C# ampliado.
function pooCode(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const gap = 0.4;
  const total = s.columns.reduce((a, c) => a + (c.weight || 1), 0);
  const avail = w - 2 * mx - gap * (s.columns.length - 1);
  let x = mx;
  s.columns.forEach((col) => {
    const cw = (avail * (col.weight || 1)) / total;
    let y = s.top || 1.85;
    (col.blocks || []).forEach((b) => {
      if (b.label) {
        text(ctx, b.label, { x, y, w: cw, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
        y += 0.4;
      }
      y += csBlock(ctx, { x, y, w: cw, code: b.code, fontSize: b.size || s.codeSize || 15, plain: !!b.plain }) + 0.35;
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
    s.callouts.forEach((c, i) =>
      callout(ctx, { x: mx + i * (cwid + 0.3), y: s.calloutsY || 5.85, w: cwid, h: s.calloutsH || 0.95, size: 16, ...c })
    );
  }
}

// ------------------------------------------------------------------ primitivas de líneas
function seg(ctx, x1, y1, x2, y2, { color, width = 2.5, dash = false, head = false }) {
  const line = { color, width };
  if (dash) line.dashType = 'dash';
  if (head) line.endArrowType = 'arrow';
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line,
  });
}

// ------------------------------------------------------------------ diagrama de clases UML
function measure(c) {
  const attrs = (c.attrs || []).map(member);
  const methods = (c.methods || []).map(member);
  const longest = Math.max(0, ...attrs.concat(methods).map((m) => m.t.length));
  const w = c.w || Math.max(2.2, monoW(longest) + 0.45, c.name.length * 0.15 + 0.7);
  const stH = c.stereotype ? 0.3 : 0;
  const headH = 0.5 + stH;
  const comp = (arr, shown) => (shown ? Math.max(arr.length * ROW, 0.2) + 0.14 : 0);
  let attrH = comp(attrs, c.attrs !== undefined);
  let methH = comp(methods, c.methods !== undefined);
  let h = headH + attrH + methH;
  if (c.h && c.h > h) {
    if (methH) methH += c.h - h;
    else attrH += c.h - h;
    h = c.h;
  }
  return { ...c, attrs, methods, w, stH, headH, attrH, methH, h };
}

const attrTop = (L) => L.y + L.headH + 0.07;
const methTop = (L) => L.y + L.headH + L.attrH + 0.07;
const rowY = (L, i) =>
  i < L.attrs.length ? attrTop(L) + i * ROW + ROW / 2 : methTop(L) + (i - L.attrs.length) * ROW + ROW / 2;

function drawClass(ctx, L) {
  const { colors, fonts } = ctx.theme;
  const t = ctx.T[L.tone || 'teal'];
  box(ctx, { x: L.x, y: L.y, w: L.w, h: L.h, fill: colors.panel, line: t.accent, lineWidth: 1.75, shape: 'rect' });
  box(ctx, { x: L.x + 0.02, y: L.y + 0.02, w: L.w - 0.04, h: L.headH - 0.02, fill: t.soft, shape: 'rect' });
  if (L.stereotype) {
    text(ctx, `«${L.stereotype}»`, {
      x: L.x, y: L.y + 0.05, w: L.w, h: 0.28, fontSize: 14, italic: true, color: t.text, align: 'center', valign: 'middle',
    });
  }
  text(ctx, L.name, {
    x: L.x + 0.1, y: L.y + L.stH + 0.04, w: L.w - 0.2, h: 0.44, fontSize: 18, bold: true, color: colors.heading,
    fontFace: fonts.heading, align: 'center', valign: 'middle', underline: !!L.underline,
  });
  if (L.attrH || L.methH) seg(ctx, L.x, L.y + L.headH, L.x + L.w, L.y + L.headH, { color: t.accent, width: 1.25 });
  if (L.attrH && L.methH) seg(ctx, L.x, L.y + L.headH + L.attrH, L.x + L.w, L.y + L.headH + L.attrH, { color: t.accent, width: 1.25 });
  const rows = (arr, top) =>
    arr.forEach((m, i) => {
      const ry = top + i * ROW;
      if (m.tone) box(ctx, { x: L.x + 0.04, y: ry, w: L.w - 0.08, h: ROW, fill: ctx.T[m.tone].soft, shape: 'rect' });
      text(ctx, m.t, {
        x: L.x + 0.14, y: ry, w: L.w - 0.28, h: ROW, fontSize: MEM_PT, fontFace: fonts.code,
        color: m.tone ? ctx.T[m.tone].text : colors.ink, italic: !!m.italic, valign: 'middle', wrap: false,
      });
    });
  rows(L.attrs, attrTop(L));
  rows(L.methods, methTop(L));
}

// Herencia / realización: de la clase hija (a) a la clase padre (b), con triángulo hueco en el padre.
function drawInherit(ctx, a, b, link) {
  const { colors } = ctx.theme;
  const color = link.tone ? ctx.T[link.tone].accent : colors.slate;
  const tw = 0.3, th = 0.26;
  const acx = a.x + a.w / 2;
  const bx = b.x + b.w * (link.anchor != null ? link.anchor : 0.5);
  const below = a.y > b.y + b.h;
  const startY = below ? a.y : a.y + a.h;
  const edgeY = below ? b.y + b.h : b.y;
  const endY = below ? edgeY + th : edgeY - th;
  const midY = (startY + endY) / 2;
  const opts = { color, width: 2.25, dash: link.kind === 'realize' };
  if (Math.abs(acx - bx) < 0.01) seg(ctx, acx, startY, bx, endY, opts);
  else {
    seg(ctx, acx, startY, acx, midY, opts);
    seg(ctx, acx, midY, bx, midY, opts);
    seg(ctx, bx, midY, bx, endY, opts);
  }
  ctx.slide.addShape(ctx.pptx.ShapeType.triangle, {
    x: bx - tw / 2, y: below ? edgeY : edgeY - th, w: tw, h: th,
    fill: { color: colors.bg }, line: { color, width: 2 }, rotate: below ? 0 : 180,
  });
  if (link.label) {
    text(ctx, link.label, {
      x: bx + 0.15, y: (startY + endY) / 2 - 0.17, w: 1.6, h: 0.34, fontSize: 15, italic: true, color: colors.slate, valign: 'middle',
    });
  }
}

// Asociación / uso: flecha horizontal (con codo si hace falta) que puede apuntar a una fila (miembro) concreta.
function drawUse(ctx, F, Tt, link) {
  const { colors } = ctx.theme;
  const blocked = !!link.blocked;
  const color = blocked ? ctx.T.red.accent : link.tone ? ctx.T[link.tone].accent : colors.slate;
  const toRight = Tt.x >= F.x + F.w - 0.01;
  const x1 = toRight ? F.x + F.w : F.x;
  const x2 = toRight ? Tt.x : Tt.x + Tt.w;
  const y2 = link.toMember != null ? rowY(Tt, link.toMember) : Tt.y + Tt.h / 2;
  let y1;
  if (link.fromMember != null) y1 = rowY(F, link.fromMember);
  else if (link.toMember != null) y1 = Math.min(Math.max(y2, F.y + 0.2), F.y + F.h - 0.2);
  else y1 = F.y + F.h / 2;
  const opts = { color, width: 2.5, dash: !!link.dashed || blocked };
  const midX = link.midX != null ? link.midX : (x1 + x2) / 2;
  let lx1 = x1, lx2 = x2;
  if (Math.abs(y1 - y2) < 0.01) seg(ctx, x1, y1, x2, y2, { ...opts, head: true });
  else {
    seg(ctx, x1, y1, midX, y1, opts);
    seg(ctx, midX, y1, midX, y2, opts);
    seg(ctx, midX, y2, x2, y2, { ...opts, head: true });
    lx1 = midX;
  }
  if (link.label) {
    text(ctx, link.label, {
      x: Math.min(lx1, lx2), y: y2 - 0.36, w: Math.abs(lx2 - lx1), h: 0.32, fontSize: 15, italic: true,
      color: colors.slate, align: 'center', valign: 'middle',
    });
  }
  if (blocked) {
    const cx = (x1 + x2) / 2;
    circleLabel(ctx, { x: cx - 0.16, y: y1 - 0.16, d: 0.32, label: 'X', fill: ctx.T.red.accent, color: ctx.T.red.on, size: 13 });
  }
}

function panel(ctx, p) {
  const { colors, fonts } = ctx.theme;
  const t = ctx.T[p.tone || 'navy'];
  surface(ctx, p.tone, { x: p.x, y: p.y, w: p.w, h: p.h });
  let y = p.y + 0.22;
  if (p.title) {
    text(ctx, p.title, {
      x: p.x + 0.3, y, w: p.w - 0.6, h: 0.5, fontSize: p.titleSize || 22, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle',
    });
    y += 0.7;
  }
  paragraphs(ctx, p.items, {
    x: p.x + 0.3, y, w: p.w - 0.6, h: p.y + p.h - y - 0.15, fontSize: p.size || 17, bullet: true, spaceAfter: 10, color: colors.ink,
  });
}

function uml(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const L = {};
  s.classes.forEach((c) => {
    L[c.id] = measure(c);
  });
  (s.labels || []).forEach((l) =>
    chip(ctx, { x: l.x, y: l.y, w: l.w || l.text.length * 0.1 + 0.6, h: 0.4, label: l.text, tone: l.tone || 'navy', size: 15 })
  );
  Object.values(L).forEach((c) => drawClass(ctx, c));
  (s.links || []).forEach((k) => {
    const A = L[k.from], B = L[k.to];
    if (!A || !B) throw new Error(`Vínculo con clase desconocida: ${k.from} -> ${k.to}`);
    if (k.kind === 'inherit' || k.kind === 'realize') drawInherit(ctx, A, B, k);
    else drawUse(ctx, A, B, k);
  });
  if (s.panel) panel(ctx, s.panel);
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: s.calloutH || 0.8, ...s.callout });
}

// ------------------------------------------------------------------ tipo valor vs. tipo referencia
function memoria(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const gap = 0.5, pw = (w - 2 * mx - gap) / 2, top = 1.85, ph = 4.2;
  [['left', 'teal'], ['right', 'amber']].forEach(([key, tone], i) => {
    const p = s[key];
    const t = ctx.T[tone];
    const px = mx + i * (pw + gap);
    surface(ctx, tone, { x: px, y: top, w: pw, h: ph });
    text(ctx, p.title, { x: px + 0.3, y: top + 0.2, w: pw - 0.6, h: 0.5, fontSize: 24, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    text(ctx, p.text, { x: px + 0.3, y: top + 0.8, w: pw - 0.6, h: 0.7, fontSize: 17, color: colors.slate });
    csBlock(ctx, { x: px + 0.3, y: top + 1.6, w: pw - 0.6, code: p.code, fontSize: 15 });
    const my = top + 2.8;
    const slot = (name, row, content) => {
      const sy = my + row * 0.7;
      text(ctx, name, { x: px + 0.3, y: sy, w: 0.6, h: 0.55, fontSize: 18, bold: true, fontFace: fonts.code, color: colors.heading, align: 'right', valign: 'middle' });
      box(ctx, { x: px + 1.0, y: sy, w: 1.2, h: 0.55, fill: colors.bg, line: t.accent, lineWidth: 1.5, shape: 'rect' });
      if (content) text(ctx, content, { x: px + 1.0, y: sy, w: 1.2, h: 0.55, fontSize: 20, bold: true, color: colors.ink, fontFace: fonts.code, align: 'center', valign: 'middle' });
      return sy + 0.275;
    };
    if (key === 'left') {
      slot(p.vars[0], 0, p.values[0]);
      slot(p.vars[1], 1, p.values[1]);
      text(ctx, p.caption, { x: px + 2.6, y: my, w: pw - 2.9, h: 1.25, fontSize: 16, color: colors.slate, valign: 'middle' });
    } else {
      const ox = px + 3.1, ow = pw - 3.1 - 0.3;
      const cys = p.vars.map((v, r) => slot(v, r, ''));
      const runs = [
        { text: p.object, options: { fontSize: 18, bold: true, breakLine: true } },
        { text: p.caption, options: { fontSize: 14 } },
      ];
      ctx.slide.addText(runs, {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.1, x: ox, y: my + 0.1, w: ow, h: 1.05,
        fill: { color: t.soft }, line: { color: t.accent, width: 1.5 }, color: t.text, fontFace: fonts.heading,
        align: 'center', valign: 'middle', margin: 0,
      });
      cys.forEach((cy) => {
        ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: px + 1.6 - 0.1, y: cy - 0.1, w: 0.2, h: 0.2, fill: { color: t.accent }, line: { type: 'none' } });
        arrow(ctx, { x1: px + 1.6, y1: cy, x2: ox - 0.03, y2: cy, color: t.accent, width: 2.5 });
      });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: 6.2, w: w - 2 * mx, h: 0.65, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ A + B = C
function ecuacion(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.items.length, gap = 1.0;
  const bw = (w - 2 * mx - (n - 1) * gap) / n, y = s.top || 1.95, h = s.h || 2.9;
  s.items.forEach((it, i) => {
    const x = mx + i * (bw + gap);
    const t = ctx.T[it.tone || 'navy'];
    surface(ctx, it.tone, { x, y, w: bw, h });
    if (it.tag) chip(ctx, { x: x + 0.3, y: y + 0.3, w: it.tag.length * 0.1 + 0.6, h: 0.4, label: it.tag, tone: it.tone || 'navy', size: 15 });
    text(ctx, it.title, { x: x + 0.3, y: y + 0.85, w: bw - 0.6, h: 0.6, fontSize: 28, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    text(ctx, it.text, { x: x + 0.3, y: y + 1.55, w: bw - 0.6, h: h - 1.75, fontSize: 18, color: colors.slate });
    if (i < n - 1) {
      circleLabel(ctx, { x: x + bw + gap / 2 - 0.3, y: y + h / 2 - 0.3, d: 0.6, label: s.ops[i], fill: colors.navy, color: colors.white, size: 28 });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: y + h + 0.45, w: w - 2 * mx, h: 0.9, ...s.callout });
}

// ------------------------------------------------------------------ imagen a un lado + panel de ideas
function imagenLado(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const iw = s.imageW || 4.2, top = 1.85, ih = s.imageH || 4.1;
  box(ctx, { x: mx, y: top, w: iw, h: ih, fill: 'FFFFFF', radius: 0.15 });
  C.image(ctx, s.image, { x: mx + 0.15, y: top + 0.15, w: iw - 0.3, h: ih - 0.3 }, s.alt);
  panel(ctx, { x: mx + iw + 0.4, y: top, w: w - 2 * mx - iw - 0.4, h: ih, ...s.panel });
  if (s.callout) callout(ctx, { x: mx, y: top + ih + 0.25, w: w - 2 * mx, h: 0.8, ...s.callout });
}

// ------------------------------------------------------------------ herencia vs. composición
// Dos paneles, cada uno con un minidiagrama horizontal (clase `from` -> clase `to`), una línea de texto y un bloque de código.
// `link.kind`: 'inherit' (triángulo hueco en `to`, la superclase) o 'compose' (rombo relleno en `from`, el contenedor).
function miniLink(ctx, A, B, link, tone) {
  const { colors } = ctx.theme;
  const t = ctx.T[tone];
  const cy = A.y + A.h / 2;
  const x1 = A.x + A.w;
  const x2 = B.x;
  const opts = { color: t.accent, width: 2.25 };
  if (link.kind === 'compose') {
    const dw = 0.42, dh = 0.28;
    seg(ctx, x1 + dw, cy, x2, cy, opts);
    ctx.slide.addShape(ctx.pptx.ShapeType.diamond, {
      x: x1, y: cy - dh / 2, w: dw, h: dh, fill: { color: t.accent }, line: { color: t.accent, width: 1.5 },
    });
  } else {
    const tw = 0.3, th = 0.26;
    seg(ctx, x1, cy, x2 - th, cy, opts);
    ctx.slide.addShape(ctx.pptx.ShapeType.triangle, {
      x: x2 - th / 2 - tw / 2, y: cy - th / 2, w: tw, h: th, fill: { color: t.soft }, line: { color: t.accent, width: 2 }, rotate: 90,
    });
  }
  if (link.label) {
    text(ctx, link.label, {
      x: x1, y: cy - 0.4, w: x2 - x1, h: 0.32, fontSize: 15, italic: true, color: colors.slate, align: 'center', valign: 'middle',
    });
  }
}

function relaciones(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const gap = 0.6, pw = (w - 2 * mx - gap) / 2, top = 1.85, ph = s.panelHeight || 4.05;
  s.panels.forEach((p, i) => {
    const x = mx + i * (pw + gap);
    const t = ctx.T[p.tone || 'teal'];
    surface(ctx, p.tone, { x, y: top, w: pw, h: ph });
    text(ctx, p.title, {
      x: x + 0.35, y: top + 0.2, w: pw - 0.7, h: 0.5, fontSize: 24, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle',
    });
    text(ctx, p.text, { x: x + 0.35, y: top + 0.75, w: pw - 0.7, h: 0.4, fontSize: 17, color: colors.slate, valign: 'middle' });
    const cw = p.classW || 1.9;
    const A = measure({ ...p.from, tone: p.tone, x: x + 0.35, y: top + 1.3, w: cw });
    const B = measure({ ...p.to, tone: p.tone, x: x + pw - 0.35 - cw, y: top + 1.3, w: cw });
    drawClass(ctx, A);
    drawClass(ctx, B);
    miniLink(ctx, A, B, p.link, p.tone || 'teal');
    csBlock(ctx, { x: x + 0.35, y: top + 2.45, w: pw - 0.7, code: p.code, fontSize: p.codeSize || 14 });
  });
  if (s.vs) {
    circleLabel(ctx, { x: w / 2 - 0.3, y: top + ph / 2 - 0.3, d: 0.6, label: 'vs', fill: colors.navy, color: colors.white, size: 16 });
  }
  if (s.callout) callout(ctx, { x: mx, y: top + ph + 0.2, w: w - 2 * mx, h: s.calloutH || 0.75, ...s.callout });
}

// ------------------------------------------------------------------ ventana de IDE con autocompletado
// code (la última línea es la que se escribe; el cursor queda al final), codeW, fontSize, popup{items[], selected, w}, caption
function ide(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const fs = s.fontSize || 18;
  const cw = s.codeW || 8.2;
  const x = (w - cw) / 2, y = s.top || 2.15;
  const lines = s.code.split('\n');
  const lh = (fs * 1.3) / 72;
  csBlock(ctx, { x, y, w: cw, code: s.code, fontSize: fs });
  const chars = lines[lines.length - 1].length;
  const px = x + 0.25 + (chars * fs * 0.55) / 72, py = y + 0.2 + lines.length * lh + 0.05;
  const rowH = 0.34, pw = s.popup.w || 3.3, items = s.popup.items;
  const nav = ctx.T.navy;
  box(ctx, { x: px, y: py, w: pw, h: items.length * rowH + 0.12, fill: colors.panel, line: colors.slate, lineWidth: 1.5, radius: 0.06 });
  items.forEach((it, i) => {
    const ry = py + 0.06 + i * rowH;
    if (i === s.popup.selected) box(ctx, { x: px + 0.06, y: ry, w: pw - 0.12, h: rowH, fill: nav.soft, line: nav.accent, radius: 0.04 });
    box(ctx, { x: px + 0.2, y: ry + (rowH - 0.17) / 2, w: 0.17, h: 0.17, fill: nav.accent, radius: 0.03 });
    text(ctx, it, { x: px + 0.5, y: ry, w: pw - 0.6, h: rowH, fontSize: 15, fontFace: fonts.code, color: colors.heading, valign: 'middle' });
  });
  if (s.caption) text(ctx, s.caption, { x: mx, y: 6.3, w: w - 2 * mx, h: 0.5, fontSize: 18, color: colors.slate, align: 'center', valign: 'middle' });
}

module.exports = {
  'poo-code': pooCode,
  'poo-uml': uml,
  'poo-memoria': memoria,
  'poo-ecuacion': ecuacion,
  'poo-imagen-lado': imagenLado,
  'poo-relaciones': relaciones,
  'poo-ide': ide,
};
