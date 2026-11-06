// Diagramas de la lección «Estructuras de datos jerárquicas» (CE-1103, lección 05).
// kinds: `jerarquicas-trees` (árboles binarios, de expresión, B y tries descritos con una cadena compacta)
//        `jerarquicas-imagegrid` (varias imágenes en fila, con leyenda)
//        `jerarquicas-pila` (construcción de un árbol de expresión desde la postfija: cola de salida + pila de árboles,
//          un panel por paso; la pila se calcula a partir de `postfix` y `steps[].upto`)
//
// jerarquicas-pila: { postfix: "a b c * +", queueLabel, stackLabel, steps: [{ upto: nº de tokens leídos, caption }],
//                     callout, calloutY, calloutH }
//
// Cadena de un árbol: `valor(hijo1,hijo2,...)`; un hijo vacío es «sin hijo» (`10(,14(13,))` = 10 sin hijo izquierdo).
//   - binary / expr: máximo dos hijos (izquierdo, derecho).
//   - btree: cada nodo es una lista de llaves separadas por espacios: `24(15 20(10 12,18,21 23),33 45 48)`.
//   - trie: cada nodo se llama como su prefijo y `*` al final marca fin de palabra: `raíz(a(an(and*,ant*)),d(do*))`.
const C = require('./components');

const { text, box, chip, arrow, callout, codeBlock, card, table } = C;

// ------------------------------------------------------------------ análisis de la cadena
function parse(str) {
  let i = 0;
  const readTok = () => {
    let t = '';
    while (i < str.length && '(),'.indexOf(str[i]) < 0) t += str[i++];
    return t.trim();
  };
  function node() {
    const n = { label: readTok(), kids: [] };
    if (str[i] === '(') {
      i++;
      for (;;) {
        if (str[i] === ',' || str[i] === ')') n.kids.push(null);
        else n.kids.push(node());
        if (str[i] === ',') { i++; continue; }
        if (str[i] === ')') { i++; break; }
        throw new Error(`Árbol mal formado cerca de la posición ${i}: ${str}`);
      }
    }
    return n;
  }
  const root = node();
  if (i < str.length) throw new Error(`Árbol mal formado (sobran caracteres en ${i}): ${str}`);
  return root;
}

const hgt = (b) => (b ? 1 + Math.max(hgt(b.l), hgt(b.r)) : 0);

function prepBinary(root) {
  const nodes = [];
  let ix = 0, maxD = 0;
  const conv = (n, d) => {
    if (!n) return null;
    const b = { label: n.label, d };
    b.l = conv(n.kids[0], d + 1);
    b.ix = ix++;
    b.r = conv(n.kids[1], d + 1);
    maxD = Math.max(maxD, d);
    nodes.push(b);
    return b;
  };
  const top = conv(root, 0);
  nodes.forEach((b) => { b.bf = hgt(b.r) - hgt(b.l); b.leaf = !b.l && !b.r; });
  return { top, nodes, count: ix, levels: maxD + 1, nat: Math.max(1.4, ix * 0.85 + 0.4) };
}

// Disposición genérica para árboles n-arios (B y trie): el padre se centra sobre sus hijos.
function layoutNary(root, nodeW, gap) {
  const all = [];
  let maxD = 0;
  const walk = (n, d) => {
    n.kids = n.kids.filter(Boolean);
    n.depth = d;
    n.w = nodeW(n);
    maxD = Math.max(maxD, d);
    all.push(n);
    n.kids.forEach((k) => walk(k, d + 1));
  };
  walk(root, 0);
  const sub = (n) => {
    const kw = n.kids.map(sub);
    const sum = kw.reduce((a, b) => a + b, 0) + gap * Math.max(0, kw.length - 1);
    n.sw = Math.max(n.w, sum);
    return n.sw;
  };
  const total = sub(root);
  const place = (n, left) => {
    if (!n.kids.length) { n.cx = left + n.sw / 2; return; }
    const span = n.kids.reduce((a, k) => a + k.sw, 0) + gap * (n.kids.length - 1);
    let x = left + (n.sw - span) / 2;
    n.kids.forEach((k) => { place(k, x); x += k.sw + gap; });
    n.cx = (n.kids[0].cx + n.kids[n.kids.length - 1].cx) / 2;
  };
  place(root, 0);
  return { root, all, levels: maxD + 1, total, nat: total + 0.3 };
}

const CW0 = 0.5, BGAP0 = 0.28, TD0 = 0.62, TGAP0 = 0.22;

function prep(t) {
  if (t._p) return t._p;
  const kind = t.type || 'binary';
  const root = parse(t.tree);
  let p;
  if (kind === 'btree') {
    p = layoutNary(root, (n) => { n.keys = n.label.split(/\s+/).filter(Boolean); return n.keys.length * CW0; }, BGAP0);
  } else if (kind === 'trie') {
    p = layoutNary(root, (n) => { n.end = n.label.endsWith('*'); n.name = n.label.replace(/\*$/, ''); return TD0; }, TGAP0);
  } else p = prepBinary(root);
  p.kind = kind;
  t._p = p;
  return p;
}

// ------------------------------------------------------------------ nodos
function drawNode(ctx, o) {
  const { colors, fonts } = ctx.theme;
  const T = o.tone ? ctx.T[o.tone] : ctx.T.navy;
  const runs = [{ text: String(o.label), options: { fontSize: o.size, bold: true, breakLine: !!o.sub } }];
  if (o.sub) runs.push({ text: String(o.sub), options: { fontSize: o.subSize, bold: true, color: o.subColor || T.on } });
  ctx.slide.addText(runs, {
    shape: o.square ? ctx.pptx.ShapeType.roundRect : ctx.pptx.ShapeType.ellipse,
    ...(o.square ? { rectRadius: 0.1 } : {}),
    x: o.cx - o.d / 2, y: o.cy - o.d / 2, w: o.d, h: o.d,
    fill: { color: o.ghost ? colors.bg : T.accent },
    line: o.ghost ? { color: colors.muted, width: 1.5, dashType: 'dash' } : { color: o.tone ? T.accent : colors.teal, width: 1.5 },
    color: o.ghost ? colors.muted : T.on,
    fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
  });
}

function tag(ctx, label, x, y) {
  chip(ctx, { x, y, w: Math.max(0.34, label.length * 0.13 + 0.2), h: 0.3, label, tone: 'amber', size: 14 });
}

const edgeLine = (ctx, a, b, hot) => {
  const { colors } = ctx.theme;
  arrow(ctx, { x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: hot ? ctx.T.amber.accent : colors.slate, width: hot ? 4 : 2.25, head: false });
};

function pathInfo(t) {
  const idx = {};
  (t.path || []).forEach((l, i) => { idx[l] = i; });
  return { idx, has: (l) => idx[l] !== undefined, edge: (a, b) => idx[a] !== undefined && idx[b] !== undefined && idx[b] === idx[a] + 1 };
}

// ------------------------------------------------------------------ árboles binarios y de expresión
function drawBinary(ctx, t, p, rect) {
  const { colors } = ctx.theme;
  const marks = t.marks || {};
  if (Object.values(marks).some((m) => m.tag)) rect = { x: rect.x + 0.45, y: rect.y, w: rect.w - 0.45, h: rect.h };
  const pi = pathInfo(t);
  const orderIdx = {};
  (t.order || []).forEach((l, i) => { orderIdx[l] = i + 1; });
  const n = p.count, levels = p.levels;
  const hasSub = !!(t.bf || t.order || Object.values(marks).some((m) => m.sub !== undefined));
  let d = t.d || Math.min(t.maxD || 0.74, (rect.w / n) * 0.92, (rect.h / levels) * 0.8);
  d = Math.max(d, 0.3);
  if (hasSub && d < 0.5) d = Math.min(0.5, (rect.w / n) * 0.95);
  const spX = n > 1 ? Math.min((rect.w - d) / (n - 1), 1.25) : 0;
  const stepY = levels > 1 ? Math.min((rect.h - d) / (levels - 1), 1.0) : 0;
  const x0 = rect.x + (rect.w - (spX * (n - 1) + d)) / 2 + d / 2;
  const y0 = rect.y + (rect.h - (stepY * (levels - 1) + d)) / 2 + d / 2;
  const pos = (b) => ({ x: x0 + b.ix * spX, y: y0 + b.d * stepY });
  p.nodes.forEach((b) => {
    [b.l, b.r].forEach((c) => { if (c) edgeLine(ctx, pos(b), pos(c), pi.edge(b.label, c.label)); });
  });
  const size = d >= 0.62 ? (hasSub ? 16 : 18) : d >= 0.5 ? 16 : 14;
  const subSize = d >= 0.6 ? 14 : 12;
  p.nodes.forEach((b) => {
    const m = marks[b.label] || {};
    const c = pos(b);
    let tone = m.tone || (pi.has(b.label) ? 'amber' : null);
    if (!tone && t.type === 'expr' && !b.leaf) tone = 'teal';
    if (!tone && t.bf && Math.abs(b.bf) > 1) tone = 'red';
    let sub = m.sub, subColor;
    if (sub === undefined && t.bf) sub = b.bf > 0 ? '+' + b.bf : String(b.bf);
    if (sub === undefined && orderIdx[b.label]) { sub = String(orderIdx[b.label]); if (!tone) subColor = colors.amber; }
    if (sub !== undefined && !tone && t.bf) subColor = colors.white;
    drawNode(ctx, {
      cx: c.x, cy: c.y, d, label: b.label, sub, subColor, tone, ghost: m.ghost,
      square: t.type === 'expr' && b.leaf, size, subSize: hasSub ? subSize : 14,
    });
    if (m.tag) tag(ctx, m.tag, c.x - d / 2 - Math.max(0.34, m.tag.length * 0.13 + 0.2) - 0.05, c.y - 0.15);
  });
}

// ------------------------------------------------------------------ árboles B
function drawBTree(ctx, t, p, rect) {
  const { colors, fonts } = ctx.theme;
  const marks = t.marks || {}, nodeMarks = t.nodeMarks || {};
  const pi = pathInfo(t);
  const s = Math.min(1.3, rect.w / p.total);
  const cw = CW0 * s, ch = 0.5 * Math.min(1.25, Math.max(0.85, s));
  const stepY = p.levels > 1 ? Math.min((rect.h - ch) / (p.levels - 1), 1.25) : 0;
  const y0 = rect.y + (rect.h - (stepY * (p.levels - 1) + ch)) / 2;
  const x0 = rect.x + (rect.w - p.total * s) / 2;
  p.all.forEach((n) => {
    n.px = x0 + n.cx * s; n.py = y0 + n.depth * stepY; n.pw = n.keys.length * cw;
    n.left = n.px - n.pw / 2;
  });
  p.all.forEach((n) => {
    n.kids.forEach((k, i) => {
      const ax = n.kids.length === n.keys.length + 1 ? n.left + i * cw : n.left + (n.pw * i) / Math.max(1, n.kids.length - 1);
      edgeLine(ctx, { x: ax, y: n.py + ch }, { x: k.px, y: k.py }, pi.edge(n.label, k.label));
    });
  });
  const fs = cw >= 0.55 ? 18 : cw >= 0.42 ? 16 : 14;
  p.all.forEach((n) => {
    const nm = nodeMarks[n.label] || (pi.has(n.label) && 'amber') || null;
    n.keys.forEach((k, i) => {
      const m = marks[k] || {};
      const tone = m.tone || nm;
      const T = tone ? ctx.T[tone] : ctx.T.navy;
      ctx.slide.addText(k, {
        shape: ctx.pptx.ShapeType.rect, x: n.left + i * cw, y: n.py, w: cw, h: ch,
        fill: { color: m.ghost ? colors.bg : T.accent },
        line: m.ghost ? { color: colors.muted, width: 1.25, dashType: 'dash' } : { color: tone ? colors.bg : colors.teal, width: 1.25 },
        color: m.ghost ? colors.muted : T.on, bold: true, fontSize: fs, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
      });
    });
  });
}

// ------------------------------------------------------------------ tries
function drawTrie(ctx, t, p, rect) {
  const { colors, fonts } = ctx.theme;
  const marks = t.marks || {};
  const pi = pathInfo(t);
  const s = Math.min(1.25, rect.w / p.total);
  const d = Math.min(0.62, TD0 * Math.max(0.8, s));
  const stepY = p.levels > 1 ? Math.min((rect.h - d) / (p.levels - 1), 1.1) : 0;
  const y0 = rect.y + (rect.h - (stepY * (p.levels - 1) + d)) / 2 + d / 2;
  const x0 = rect.x + (rect.w - p.total * s) / 2;
  p.all.forEach((n) => { n.px = x0 + n.cx * s; n.py = y0 + n.depth * stepY; });
  p.all.forEach((n) => n.kids.forEach((k) => edgeLine(ctx, { x: n.px, y: n.py }, { x: k.px, y: k.py }, pi.edge(n.name, k.name))));
  p.all.forEach((n) => n.kids.forEach((k) => {
    const lx = n.px + (k.px - n.px) * 0.5, ly = n.py + (k.py - n.py) * 0.5, e = stepY - d < 0.4 ? 0.26 : 0.3;
    ctx.slide.addText(k.name.slice(-1), {
      shape: ctx.pptx.ShapeType.ellipse, x: lx - e / 2, y: ly - e / 2, w: e, h: e, fill: { color: colors.bg },
      line: { color: colors.border, width: 1 }, color: colors.amber, bold: true, fontSize: 13, fontFace: fonts.code,
      align: 'center', valign: 'middle', margin: 0,
    });
  }));
  p.all.forEach((n) => {
    const m = marks[n.name] || {};
    let tone = m.tone || (pi.has(n.name) && n.depth > 0 ? 'amber' : null);
    if (!tone && n.end) tone = 'teal';
    if (!tone && n.depth === 0) tone = 'slate';
    drawNode(ctx, {
      cx: n.px, cy: n.py, d, label: n.name, tone, ghost: m.ghost, square: n.end,
      size: n.depth === 0 ? 13 : n.name.length > 2 ? 14 : 16, subSize: 14,
    });
  });
}

// ------------------------------------------------------------------ arreglo (heap)
function drawArray(ctx, t, rect) {
  const { colors, fonts } = ctx.theme;
  const n = t.array.length;
  const cw = Math.min(0.9, rect.w / n), ch = 0.48;
  const x0 = rect.x + (rect.w - cw * n) / 2;
  const am = t.arrayMarks || {};
  t.array.forEach((v, i) => {
    const tone = am[i];
    const T = tone ? ctx.T[tone] : null;
    ctx.slide.addText(String(v), {
      shape: ctx.pptx.ShapeType.rect, x: x0 + i * cw, y: rect.y, w: cw, h: ch,
      fill: { color: T ? T.accent : colors.panel }, line: { color: T ? T.accent : colors.border, width: 1 },
      color: T ? T.on : colors.ink, bold: true, fontSize: cw >= 0.5 ? 16 : 14, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
    });
    text(ctx, String(i), { x: x0 + i * cw, y: rect.y + ch + 0.02, w: cw, h: 0.28, fontSize: 13, color: colors.slate, fontFace: fonts.code, align: 'center', valign: 'middle' });
  });
}

// ------------------------------------------------------------------ bloques (título + arreglo + árbol + leyenda)
function drawBlock(ctx, t, rect) {
  const { colors, fonts } = ctx.theme;
  let y = rect.y, h = rect.h;
  if (t.title) {
    text(ctx, t.title, {
      x: rect.x, y, w: rect.w, h: 0.4, fontSize: 18, bold: true, align: 'center', valign: 'middle', fontFace: fonts.heading,
      color: t.titleTone ? ctx.T[t.titleTone].text : colors.slate,
    });
    y += 0.45; h -= 0.45;
  }
  if (t.array) {
    drawArray(ctx, t, { x: rect.x, y, w: rect.w });
    y += 0.9; h -= 0.9;
  }
  if (t.caption) {
    h -= 0.55;
    text(ctx, t.caption, { x: rect.x, y: y + h + 0.05, w: rect.w, h: 0.5, fontSize: 16, color: colors.slate, align: 'center', valign: 'middle' });
  }
  const p = prep(t);
  const r = { x: rect.x, y: y + 0.08, w: rect.w, h: h - 0.16 };
  if (p.kind === 'btree') drawBTree(ctx, t, p, r);
  else if (p.kind === 'trie') drawTrie(ctx, t, p, r);
  else drawBinary(ctx, t, p, r);
}

function drawJoiner(ctx, label, x0, x1, ymid) {
  const { colors } = ctx.theme;
  arrow(ctx, { x1: x0 + 0.06, y1: ymid, x2: x1 - 0.06, y2: ymid, color: colors.teal, width: 3 });
  if (typeof label === 'string') {
    text(ctx, label, { x: x0 - 0.15, y: ymid - 0.62, w: x1 - x0 + 0.3, h: 0.55, fontSize: 14, bold: true, color: colors.teal, align: 'center', valign: 'bottom' });
  }
}

function drawRow(ctx, row, rect) {
  const { colors } = ctx.theme;
  let x = rect.x, W = rect.w;
  if (row.label) {
    text(ctx, row.label, { x, y: rect.y, w: 2.2, h: rect.h, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
    x += 2.4; W -= 2.4;
  }
  const trees = row.trees;
  const gaps = trees.slice(0, -1).map((_, i) => {
    const j = row.joiners && row.joiners[i];
    return j ? (typeof j === 'string' ? 1.35 : 0.8) : 0.35;
  });
  const gapSum = gaps.reduce((a, b) => a + b, 0);
  const avail = W - gapSum;
  const nat = trees.map((t) => prep(t).nat);
  const total = nat.reduce((a, b) => a + b, 0);
  const alloc = nat.map((v) => Math.min((avail * v) / total, v * (row.stretch || 1.7)));
  const used = alloc.reduce((a, b) => a + b, 0) + gapSum;
  let cx = x + (W - used) / 2;
  trees.forEach((t, i) => {
    drawBlock(ctx, t, { x: cx, y: rect.y, w: alloc[i], h: rect.h });
    cx += alloc[i];
    if (i < trees.length - 1) {
      const j = row.joiners && row.joiners[i];
      if (j) drawJoiner(ctx, j, cx, cx + gaps[i], rect.y + rect.h / 2);
      cx += gaps[i];
    }
  });
}

// ------------------------------------------------------------------ panel lateral (código, tarjetas, texto, tabla)
function renderSide(ctx, side, rect) {
  const { colors } = ctx.theme;
  let y = rect.y;
  side.items.forEach((it) => {
    if (it.code) {
      if (it.label) {
        text(ctx, it.label, { x: rect.x, y, w: rect.w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
        y += 0.4;
      }
      y += codeBlock(ctx, { x: rect.x, y, w: rect.w, code: it.code, lang: it.lang, fontSize: it.size || 14 }) + 0.2;
    } else if (it.card) {
      const h = it.card.h || 1.5;
      card(ctx, { textSize: 16, ...it.card }, { x: rect.x, y, w: rect.w, h });
      y += h + 0.2;
    } else if (it.text) {
      const h = it.h || 0.8;
      text(ctx, it.text, { x: rect.x, y, w: rect.w, h, fontSize: it.size || 17, color: colors.slate, valign: it.valign || 'top' });
      y += h + 0.15;
    } else if (it.table) {
      const tb = it.table;
      const sum = tb.colW.reduce((a, b) => a + b, 0);
      const colW = tb.colW.map((v) => (v / sum) * rect.w);
      const t = table(ctx, { x: rect.x, y, colW, header: tb.columns, rows: tb.rows, rowH: tb.rowH || 0.5, fontSize: tb.fontSize || 16, cellStyle: tb.cellStyle });
      y += t.h + 0.2;
    }
  });
}

function jTrees(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const sideW = s.side ? s.side.w || 4.6 : 0;
  const areaW = w - 2 * mx - (s.side ? sideW + 0.4 : 0);
  let top = s.top || 1.85;
  if (s.intro) {
    text(ctx, s.intro, { x: mx, y: 1.65, w: w - 2 * mx, h: s.introH || 0.6, fontSize: s.introSize || 17, color: colors.slate, valign: 'middle' });
    top = 1.65 + (s.introH || 0.6) + 0.2;
  }
  if (s.legend) {
    let lx = mx;
    s.legend.forEach((l) => {
      const lw = l.label.length * 0.1 + 0.5;
      chip(ctx, { x: lx, y: top - 0.05, w: lw, h: 0.38, label: l.label, tone: l.tone || 'navy', solid: l.solid !== false, size: 14 });
      lx += lw + 0.15;
    });
    top += 0.5;
  }
  const bottom = s.callout ? (s.calloutY || 6.0) - 0.15 : s.bottom || 6.85;
  const rows = s.rows || [{ trees: s.trees, joiners: s.joiners }];
  const given = rows.reduce((a, r) => a + (r.h || 0), 0);
  const free = (bottom - top - given) / Math.max(1, rows.filter((r) => !r.h).length);
  let y = top;
  rows.forEach((r) => {
    const h = r.h || free;
    drawRow(ctx, r, { x: mx, y, w: areaW, h });
    y += h;
  });
  if (s.side) renderSide(ctx, s.side, { x: w - mx - sideW, y: top, w: sideW });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.0, w: w - 2 * mx, h: s.calloutH || 0.75, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ imágenes en fila
function imageGrid(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.images.length, gap = 0.35;
  const cw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = s.top || 1.85, ch = s.cardHeight || 3.7;
  s.images.forEach((im, i) => {
    const x = mx + i * (cw + gap);
    box(ctx, { x, y: top, w: cw, h: ch, fill: 'FFFFFF', radius: 0.12 });
    C.image(ctx, im.file, { x: x + 0.15, y: top + 0.15, w: cw - 0.3, h: ch - 0.3 }, im.alt);
    text(ctx, im.caption, { x, y: top + ch + 0.1, w: cw, h: 0.5, fontSize: 18, bold: true, color: colors.ink, align: 'center', valign: 'middle' });
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.05, w: w - 2 * mx, h: s.calloutH || 0.75, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ cola de salida postfija + pila de árboles
const OPERATORS = new Set(['+', '-', '*', '/', '^']);

// Pila de árboles tras leer los primeros `upto` tokens de la postfija (algoritmo de construcción del árbol de expresión).
function buildForest(tokens, upto) {
  const stack = [];
  tokens.slice(0, upto).forEach((tk, i) => {
    if (OPERATORS.has(tk)) {
      if (stack.length < 2) throw new Error(`Postfija mal formada: el operador «${tk}» (posición ${i + 1}) necesita dos operandos`);
      const r = stack.pop(), l = stack.pop();
      stack.push({ label: tk, op: true, l, r });
    } else stack.push({ label: tk, op: false });
  });
  return stack;
}

// Las hojas ocupan casillas consecutivas y cada operador queda centrado sobre sus dos hijos.
function slotTree(n, depth, cur) {
  n.depth = depth;
  if (!n.l) {
    n.slot = cur.i++;
    return { levels: depth + 1 };
  }
  const a = slotTree(n.l, depth + 1, cur), b = slotTree(n.r, depth + 1, cur);
  n.slot = (n.l.slot + n.r.slot) / 2;
  return { levels: Math.max(a.levels, b.levels) };
}

function forestEdges(n, out) {
  if (!n.l) return out;
  out.push([n, n.l], [n, n.r]);
  forestEdges(n.l, out);
  forestEdges(n.r, out);
  return out;
}

function forestNodes(n, out) {
  out.push(n);
  if (n.l) { forestNodes(n.l, out); forestNodes(n.r, out); }
  return out;
}

function tokenCell(ctx, tk, x, y, w, h, state) {
  const { colors, fonts } = ctx.theme;
  const A = ctx.T.amber;
  const cur = state === 'cur', pend = state === 'pend';
  ctx.slide.addText(tk, {
    shape: ctx.pptx.ShapeType.rect, x, y, w, h,
    fill: { color: cur ? A.accent : colors.codeBg },
    line: { color: cur ? A.accent : pend ? colors.muted : colors.slate, width: 1.25, dashType: pend ? 'dash' : 'solid' },
    color: cur ? A.on : pend ? colors.muted : colors.heading,
    bold: true, fontSize: 18, fontFace: fonts.code, align: 'center', valign: 'middle', margin: 0,
  });
}

function drawBuildPanel(ctx, s, tokens, step, forest, rect, G) {
  const { colors } = ctx.theme;
  const n = tokens.length;
  const upto = step.upto;
  const labelH = 0.3, qBoxH = 0.56, pointH = 0.3, capH = 0.55;
  let y = rect.y;
  text(ctx, s.queueLabel, { x: rect.x, y, w: rect.w, h: labelH, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  y += labelH + 0.02;
  box(ctx, { x: rect.x, y, w: rect.w, h: qBoxH, fill: colors.panel, line: colors.border });
  const tw = G.tw, qx = rect.x + (rect.w - n * tw) / 2;
  tokens.forEach((tk, i) => {
    tokenCell(ctx, tk, qx + i * tw + 0.02, y + 0.06, tw - 0.04, qBoxH - 0.12, i < upto - 1 ? 'read' : i === upto - 1 ? 'cur' : 'pend');
  });
  const px = qx + (upto - 0.5) * tw;
  arrow(ctx, { x1: px, y1: y + qBoxH + pointH, x2: px, y2: y + qBoxH + 0.02, color: ctx.T.amber.accent, width: 3.5 });
  y += qBoxH + pointH + 0.06;
  text(ctx, s.stackLabel, { x: rect.x, y, w: rect.w, h: labelH, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  y += labelH + 0.02;
  const boxH = rect.y + rect.h - capH - y;
  box(ctx, { x: rect.x, y, w: rect.w, h: boxH, fill: colors.panel, line: colors.border });

  let left = rect.x + 0.25;
  const top = y + (G.boxH - G.forestH) / 2 + G.d / 2;
  const edgeW = G.d >= 0.5 ? 2.25 : 1.75;
  forest.forEach((root, ti) => {
    const pos = (n_) => ({ x: left + (n_.slot + 0.5) * G.s, y: top + n_.depth * G.stepY });
    forestEdges(root, []).forEach(([a, b]) => {
      const pa = pos(a), pb = pos(b);
      arrow(ctx, { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, color: colors.slate, width: edgeW, head: false });
    });
    const isTop = ti === forest.length - 1;
    forestNodes(root, []).forEach((nd) => {
      const c = pos(nd);
      drawNode(ctx, {
        cx: c.x, cy: c.y, d: G.d, label: nd.label, square: !nd.op, size: G.d >= 0.5 ? 18 : 16, subSize: 14,
        tone: isTop && nd === root ? 'amber' : nd.op ? 'teal' : 'navy',
      });
    });
    left += root.leaves * G.s + G.gap;
  });
  text(ctx, step.caption, {
    x: rect.x, y: rect.y + rect.h - capH + 0.05, w: rect.w, h: capH - 0.05,
    fontSize: 17, bold: true, color: colors.ink, align: 'center', valign: 'middle',
  });
}

function jBuild(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const tokens = s.postfix.trim().split(/\s+/);
  const steps = s.steps;
  const forests = steps.map((st) => {
    if (!(st.upto >= 1 && st.upto <= tokens.length)) throw new Error(`jerarquicas-pila: «upto» fuera de rango (1-${tokens.length}): ${st.upto}`);
    const f = buildForest(tokens, st.upto);
    let levels = 1, leaves = 0;
    f.forEach((root) => {
      const cur = { i: 0 };
      levels = Math.max(levels, slotTree(root, 0, cur).levels);
      root.leaves = cur.i;
      leaves += cur.i;
    });
    return { f, leaves, levels };
  });
  const gapW = 0.3, gap = 0.45;
  const panelW = (w - 2 * mx - (steps.length - 1) * gap) / steps.length;
  const top = s.top || 1.7;
  const callY = s.calloutY || 6.1;
  const H = callY - 0.1 - top;
  const L = Math.max(2, ...forests.map((x) => x.levels));
  // Escala común a todos los paneles: ancho de casilla, diámetro de nodo y paso vertical
  const innerW = panelW - 0.5;
  const sCol = Math.min(1.1, ...forests.map((x) => (innerW - gapW * Math.max(0, x.f.length - 1)) / x.leaves));
  const stackBoxH = H - (0.3 + 0.02 + 0.56 + 0.3 + 0.06 + 0.3 + 0.02) - 0.55;
  const dV = (stackBoxH - 0.24) / (1 + (L - 1) * 1.2);
  const d = Math.max(0.34, Math.min(0.7, sCol * 0.95, dV));
  const stepY = L > 1 ? Math.max(d * 1.05, Math.min(d * 1.5, (stackBoxH - 0.24 - d) / (L - 1))) : 0;
  const G = {
    s: sCol, d, stepY, gap: gapW, boxH: stackBoxH,
    tw: Math.min(0.5, (panelW - 0.3) / tokens.length),
    forestH: d + (L - 1) * stepY,
  };
  steps.forEach((st, i) => {
    drawBuildPanel(ctx, s, tokens, st, forests[i].f, { x: mx + i * (panelW + gap), y: top, w: panelW, h: H }, G);
  });
  if (s.callout) callout(ctx, { x: mx, y: callY, w: w - 2 * mx, h: s.calloutH || 0.7, size: 16, ...s.callout });
}

module.exports = {
  'jerarquicas-trees': jTrees,
  'jerarquicas-imagegrid': imageGrid,
  'jerarquicas-pila': jBuild,
};
