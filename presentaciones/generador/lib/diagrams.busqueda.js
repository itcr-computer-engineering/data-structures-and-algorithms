// Diagramas de la lección «Algoritmos de Búsqueda». Se cargan solos desde diagrams.js (prefijo `busqueda-`).
// kinds: busqueda-array-steps (arreglo con pasos), busqueda-recorrido (secuencial / salto con flechas calculadas), busqueda-formula,
// busqueda-paneles (paneles con texto, viñetas, código o una figura nativa) y busqueda-grid (rejilla numerada de pathfinding).
const C = require('./components');

const { text, paragraphs, box, chip, arrow, callout, codeBlock, card, table } = C;

const chipW = (label, size = 14) => label.length * (size * 0.0072) + 0.45;

// Estimación simple de líneas (Calibri ~0.5 em por carácter), igual que en layouts.js.
function estLines(str, fs, w) {
  const plain = String(str).replace(/\*\*|`/g, '');
  const cpl = Math.max(1, Math.floor((w / (fs * 0.0063)) * 0.95));
  return Math.max(1, Math.ceil(plain.length / cpl));
}
const lineH = (fs) => (fs * 1.25) / 72;

// ------------------------------------------------------------------ array con pasos de búsqueda
// values[], target, legend[[texto, tono]], rows[{label, active:[lo,hi], teal[], amber[], green[], red[], note: texto | [líneas]}],
// noteWidth (4.0), rowHeight (0.8), callout (uno, ancho completo) o callouts[] (varios lado a lado) con calloutsH (1.4)
function arraySteps(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.values.length;
  const gap = 0.05, labelW = 1.1;
  const cw = Math.min(0.66, (w - 2 * mx - labelW - (s.noteWidth || 4.0)) / n - gap);
  const cellH = 0.5, rowH = s.rowHeight || 0.8;
  const x0 = mx + labelW;
  const gridW = n * (cw + gap) - gap;
  const xAt = (k) => x0 + k * (cw + gap);

  const legend = [];
  if (s.target !== undefined) legend.push([`Buscar: ${s.target}`, 'amber']);
  (s.legend || []).forEach((l) => legend.push(l));
  let lx = mx;
  legend.forEach(([label, tone]) => {
    const lw = chipW(label, 14) + 0.1;
    chip(ctx, { x: lx, y: 1.8, w: lw, h: 0.38, label, tone, size: 14 });
    lx += lw + 0.2;
  });

  const iy = 2.32;
  const small = { fontSize: 14, color: colors.slate, fontFace: fonts.code, valign: 'middle' };
  text(ctx, 'Índice', { x: mx, y: iy, w: labelW, h: 0.3, ...small });
  s.values.forEach((_, k) => text(ctx, String(k), { x: xAt(k), y: iy, w: cw, h: 0.3, align: 'center', ...small }));

  const y0 = iy + 0.45;
  s.rows.forEach((r, i) => {
    const y = y0 + i * rowH;
    text(ctx, r.label, { x: mx, y, w: labelW - 0.1, h: cellH, fontSize: 16, bold: true, color: colors.slate, fontFace: fonts.code, valign: 'middle' });
    const hasRange = !!r.active;
    const [lo, hi] = r.active || [0, n - 1];
    s.values.forEach((v, k) => {
      let tone = null;
      ['amber', 'red', 'teal', 'green'].forEach((t) => { if ((r[t] || []).includes(k)) tone = t; });
      let fill, line, color;
      if (tone) {
        const T = ctx.T[tone];
        const solid = tone === 'teal' || tone === 'green';
        fill = solid ? T.accent : T.soft;
        line = T.accent;
        color = solid ? T.on : T.text;
      } else if (hasRange && (k < lo || k > hi)) {
        fill = colors.bg; line = colors.border; color = colors.muted;
      } else {
        fill = colors.panel; line = colors.slate; color = colors.ink;
      }
      ctx.slide.addText(String(v), {
        shape: ctx.pptx.ShapeType.rect, x: xAt(k), y, w: cw, h: cellH, fill: { color: fill }, line: { color: line, width: 1 },
        color, bold: true, fontSize: cw >= 0.6 ? 20 : 16, fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
      });
    });
    if (hasRange) {
      const bx1 = xAt(lo), bx2 = xAt(hi) + cw, by = y + cellH + 0.12;
      const o = { color: colors.teal, width: 2, head: false };
      arrow(ctx, { x1: bx1, y1: by, x2: bx2, y2: by, ...o });
      arrow(ctx, { x1: bx1, y1: by - 0.09, x2: bx1, y2: by, ...o });
      arrow(ctx, { x1: bx2, y1: by - 0.09, x2: bx2, y2: by, ...o });
    }
    if (r.note) {
      const lines = Array.isArray(r.note) ? r.note : [r.note];
      const nx = x0 + gridW + 0.3;
      paragraphs(ctx, lines, { x: nx, y: y - 0.05, w: w - mx - nx, h: cellH + 0.25, fontSize: 16, spaceAfter: 2, valign: 'middle', color: colors.ink });
    }
  });
  const cy = y0 + s.rows.length * rowH + 0.1;
  if (s.callout) callout(ctx, { x: mx, y: cy, w: w - 2 * mx, h: 0.75, size: 17, ...s.callout });
  if (s.callouts) {
    const k = s.callouts.length, cg = 0.3;
    const cwid = (w - 2 * mx - (k - 1) * cg) / k;
    s.callouts.forEach((c, i) => callout(ctx, { x: mx + i * (cwid + cg), y: cy + 0.1, w: cwid, h: s.calloutsH || 1.4, size: 17, ...c }));
  }
}

// ------------------------------------------------------------------ recorrido de una búsqueda con flechas (secuencial / salto)
// algoritmo: 'secuencial' | 'salto'; values[], target, step (salto; por defecto la raíz entera de n), legend[[texto, tono]],
// cellsTop, cellW, cellH, calloutY, callout. Las flechas, los colores y el corchete se calculan con el algoritmo.
function traza(s) {
  const v = s.values, n = v.length, t = s.target;
  const st = {}, hops = [], brackets = [];
  if (s.algoritmo === 'secuencial') {
    const f = v.indexOf(t), last = f < 0 ? n - 1 : f;
    for (let i = 0; i <= last; i++) st[i] = i === f ? 'green' : 'amber';
    for (let i = 0; i < last; i++) hops.push({ from: i, to: i + 1, tone: 'amber', lane: 0 });
    return { st, hops, brackets, dimFrom: last + 1, found: f, step: 1, comparaciones: last + 1 };
  }
  if (s.algoritmo === 'salto') {
    const step = s.step || Math.floor(Math.sqrt(n));
    const probes = [0];
    let prev = 0, p = 0;
    while (p < n && v[p] < t) { prev = p; p += step; if (p < n) probes.push(p); }
    const end = Math.min(p, n - 1);
    let found = -1;
    for (let i = prev; i <= end; i++) { if (v[i] === t) { found = i; break; } if (v[i] > t) break; }
    const over = p < n && v[p] > t ? p : -1;
    probes.forEach((k) => { st[k] = 'amber'; });
    if (over >= 0) st[over] = 'red';
    const last = found >= 0 ? found : end;
    for (let i = prev + 1; i < last; i++) if (!probes.includes(i)) st[i] = 'teal';
    if (found >= 0) st[found] = 'green';
    for (let i = 0; i + 1 < probes.length; i++) hops.push({ from: probes[i], to: probes[i + 1], tone: 'amber', lane: 0, label: `+${step}` });
    if (over >= 0 && over !== prev) hops.push({ from: over, to: prev, tone: 'red', lane: 1, label: `${v[over]} > ${t}: retroceder` });
    brackets.push({ from: prev, to: last, tone: 'teal', lane: 2, label: s.bracketLabel || 'búsqueda secuencial en el bloque' });
    return { st, hops, brackets, dimFrom: last + 1, found, step, probes };
  }
  throw new Error('Algoritmo desconocido: ' + s.algoritmo);
}

function recorrido(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const tr = traza(s);
  const n = s.values.length;
  const gap = 0.05, labelW = 0.95;
  const above = s.algoritmo === 'secuencial';
  const cw = Math.min(s.cellW || 1.0, (w - 2 * mx - labelW) / n - gap);
  const cellH = s.cellH || (cw >= 0.9 ? 0.95 : 0.7);
  const x0 = mx + labelW;
  const xl = (k) => x0 + k * (cw + gap), xc = (k) => xl(k) + cw / 2;

  const chips = [[`Buscar: ${s.target}`, 'amber']];
  if (s.algoritmo === 'salto') chips.push([`n = ${n}`, 'slate'], [`√n = ${tr.step}`, 'slate']);
  chips.push(...(s.legend || []));
  let lx = mx;
  chips.forEach(([label, tone]) => {
    const lw = chipW(label, 14) + 0.1;
    chip(ctx, { x: lx, y: 1.85, w: lw, h: 0.38, label, tone, size: 14 });
    lx += lw + 0.2;
  });

  const top = s.cellsTop || (above ? 3.2 : 3.05);
  const small = { fontSize: 14, color: colors.slate, fontFace: fonts.code, valign: 'middle' };
  const iy = above ? top + cellH + 0.08 : top - 0.38;
  text(ctx, 'Índice', { x: mx, y: iy, w: labelW, h: 0.3, ...small });
  text(ctx, 'Valor', { x: mx, y: top, w: labelW - 0.1, h: cellH, ...small });
  s.values.forEach((v, k) => {
    text(ctx, String(k), { x: xl(k), y: iy, w: cw, h: 0.3, align: 'center', ...small });
    const tone = tr.st[k];
    let fill, line, color;
    if (tone) {
      const T = ctx.T[tone];
      const solid = tone === 'teal' || tone === 'green';
      fill = solid ? T.accent : T.soft; line = T.accent; color = solid ? T.on : T.text;
    } else if (k >= tr.dimFrom) {
      fill = colors.bg; line = colors.border; color = colors.muted;
    } else {
      fill = colors.panel; line = colors.slate; color = colors.ink;
    }
    ctx.slide.addText(String(v), {
      shape: ctx.pptx.ShapeType.rect, x: xl(k), y: top, w: cw, h: cellH, fill: { color: fill }, line: { color: line, width: 1 },
      color, bold: true, fontSize: cw >= 0.9 ? 28 : 20, fontFace: fonts.body, align: 'center', valign: 'middle', margin: 0,
    });
  });

  const yBase = above ? top - 0.06 : top + cellH + 0.06;
  const dir = above ? -1 : 1;
  const depth = (lane) => 0.4 + lane * 0.45;
  const lab = (label, tone, cx, wd, y) => text(ctx, label, {
    x: cx - wd / 2, y: above ? y - 0.3 : y + 0.03, w: wd, h: 0.3, fontSize: 14, bold: true, color: ctx.T[tone].text, align: 'center', valign: 'middle',
  });
  tr.hops.forEach((h) => {
    const fwd = h.to > h.from;
    const x1 = xc(h.from) + (fwd ? 0.14 : 0), x2 = xc(h.to) + (fwd ? -0.14 : 0);
    const yd = yBase + dir * depth(h.lane);
    polyline(ctx, [[x1, yBase], [x1, yd], [x2, yd], [x2, yBase]], { color: ctx.T[h.tone].accent, width: 2.5, head: true });
    if (h.label) lab(h.label, h.tone, (x1 + x2) / 2, Math.max(Math.abs(x2 - x1), 1.2), yd);
  });
  tr.brackets.forEach((b) => {
    const bx1 = xl(b.from), bx2 = xl(b.to) + cw, yd = yBase + dir * depth(b.lane);
    polyline(ctx, [[bx1, yd + dir * -0.1], [bx1, yd], [bx2, yd], [bx2, yd + dir * -0.1]], { color: ctx.T[b.tone].accent, width: 2 });
    lab(b.label, b.tone, (bx1 + bx2) / 2, Math.max(bx2 - bx1, 3.2), yd);
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || (above ? 5.35 : 5.75), w: w - 2 * mx, h: 0.85, size: 17, ...s.callout });
}

// ------------------------------------------------------------------ fórmula destacada + tarjetas explicativas
// label, formula, lang, size, parts[{title,text,tone}], cardHeight, callout
function formula(ctx, s) {
  const { colors } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  if (s.label) text(ctx, s.label, { x: mx, y: 1.8, w: w - 2 * mx, h: 0.4, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
  const h = codeBlock(ctx, { x: mx, y: 2.3, w: w - 2 * mx, code: s.formula, lang: s.lang || 'java', fontSize: s.size || 20 });
  const parts = s.parts || [];
  const k = parts.length, gap = 0.3;
  const cw = (w - 2 * mx - (k - 1) * gap) / Math.max(k, 1);
  const cy = 2.3 + h + 0.35, ch = s.cardHeight || 2.2;
  parts.forEach((p, i) => card(ctx, { textSize: 17, titleSize: 20, ...p }, { x: mx + i * (cw + gap), y: cy, w: cw, h: ch }));
  if (s.callout) callout(ctx, { x: mx, y: cy + ch + 0.3, w: w - 2 * mx, h: 0.85, ...s.callout });
}

// ------------------------------------------------------------------ figuras nativas para los paneles (campo `figure` de un panel)
// Segmentos y polígonos en pulgadas absolutas.
function polyline(ctx, pts, { color, width = 2.5, dash, head = false }) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    if (x1 === x2 && y1 === y2) continue;
    const line = { color, width };
    if (dash) line.dashType = dash;
    if (head && i === pts.length - 2) line.endArrowType = 'triangle';
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line,
    });
  }
}

function polygon(ctx, pts, fill) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  const points = pts.map(([px, py], i) => (i === 0 ? { x: px - x, y: py - y, moveTo: true } : { x: px - x, y: py - y }));
  points.push({ close: true });
  ctx.slide.addShape(ctx.pptx.ShapeType.custGeom, {
    x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y, points, fill: { color: fill }, line: { type: 'none' },
  });
}

// Escala un espacio de diseño (f.w x f.h) al rectángulo b, conservando la proporción y centrando.
function fit(f, b) {
  const k = Math.min(b.w / f.w, b.h / f.h);
  const ox = b.x + (b.w - f.w * k) / 2, oy = b.y + (b.h - f.h * k) / 2;
  return { k, X: (v) => ox + v * k, Y: (v) => oy + v * k };
}

// escena: f {w, h, items[]} con coordenadas del espacio de diseño. Elementos (`t`):
//   rect {x,y,w,h,tone}; circle {x,y,r,tone,solid}; tri {x,y,r,tone,rot}; trees {pts[[x,y]],r,tone};
//   line {pts[[x,y]],tone,width,dash,head}; basico {from,to,tone,width,head} (paso en X y en Y hasta alinearse);
//   x {x,y,r,tone}; text {x,y,w,text,size,tone,bold}
function escena(ctx, f, b) {
  const { colors } = ctx.theme;
  const { k, X, Y } = fit(f, b);
  const col = (tone) => (tone ? ctx.T[tone].accent : colors.ink);
  f.items.forEach((it) => {
    switch (it.t) {
      case 'rect':
        ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: X(it.x), y: Y(it.y), w: it.w * k, h: it.h * k, fill: { color: col(it.tone) }, line: { type: 'none' } });
        break;
      case 'circle':
        ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
          x: X(it.x - it.r), y: Y(it.y - it.r), w: 2 * it.r * k, h: 2 * it.r * k,
          fill: it.solid === false ? { color: colors.bg } : { color: col(it.tone) }, line: { color: col(it.tone), width: 2.5 },
        });
        break;
      case 'tri':
        ctx.slide.addShape(ctx.pptx.ShapeType.triangle, {
          x: X(it.x - it.r), y: Y(it.y - it.r), w: 2 * it.r * k, h: 2 * it.r * k, rotate: it.rot || 0,
          fill: { color: col(it.tone) }, line: { type: 'none' },
        });
        break;
      case 'trees':
        it.pts.forEach(([px, py]) => ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
          x: X(px - it.r), y: Y(py - it.r), w: 2 * it.r * k, h: 2 * it.r * k, fill: { color: ctx.T[it.tone || 'green'].soft }, line: { color: col(it.tone || 'green'), width: 1.5 },
        }));
        break;
      case 'line':
        polyline(ctx, it.pts.map(([px, py]) => [X(px), Y(py)]), { color: col(it.tone), width: it.width || 3, dash: it.dash, head: it.head });
        break;
      case 'basico': {
        const [x1, y1] = it.from, [x2, y2] = it.to;
        const m = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
        const mid = [x1 + Math.sign(x2 - x1) * m, y1 + Math.sign(y2 - y1) * m];
        polyline(ctx, [it.from, mid, it.to].map(([px, py]) => [X(px), Y(py)]), { color: col(it.tone), width: it.width || 3, dash: it.dash, head: it.head });
        break;
      }
      case 'x':
        polyline(ctx, [[X(it.x - it.r), Y(it.y - it.r)], [X(it.x + it.r), Y(it.y + it.r)]], { color: col(it.tone), width: 4 });
        polyline(ctx, [[X(it.x - it.r), Y(it.y + it.r)], [X(it.x + it.r), Y(it.y - it.r)]], { color: col(it.tone), width: 4 });
        break;
      case 'text':
        text(ctx, it.text, {
          x: X(it.x) - (it.w * k) / 2, y: Y(it.y) - 0.17, w: it.w * k, h: 0.34, fontSize: it.size || 14, bold: it.bold !== false,
          color: it.tone ? ctx.T[it.tone].text : colors.slate, align: 'center', valign: 'middle',
        });
        break;
      default: throw new Error('Elemento de escena desconocido: ' + it.t);
    }
  });
}

// mapa: f {w, h, layers[{tone, fill: 'soft'|'accent', unit, rects[[x,y,w,h]], polys[[[x,y]]]}], nodes[[x,y]], edges[[i,j]], nodeR, edgeW}
// Un mapa de fondo con un grafo encima: nodos (círculos) y aristas (segmentos entre nodos).
function mapa(ctx, f, b) {
  const { colors } = ctx.theme;
  const { k, X, Y } = fit(f, b);
  f.layers.forEach((L) => {
    const u = L.unit || 1;
    const T = ctx.T[L.tone];
    const fill = L.fill === 'accent' ? T.accent : T.soft;
    (L.rects || []).forEach(([x, y, w, h]) => ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
      x: X(x * u), y: Y(y * u), w: w * u * k, h: h * u * k, fill: { color: fill }, line: { type: 'none' },
    }));
    (L.polys || []).forEach((p) => polygon(ctx, p.map(([px, py]) => [X(px * u), Y(py * u)]), fill));
  });
  const edge = ctx.T.teal.accent;
  (f.edges || []).forEach(([i, j]) => {
    const [x1, y1] = f.nodes[i], [x2, y2] = f.nodes[j];
    polyline(ctx, [[X(x1), Y(y1)], [X(x2), Y(y2)]], { color: edge, width: f.edgeW || 3.5 });
  });
  const r = (f.nodeR || 14) * k;
  (f.nodes || []).forEach(([x, y]) => ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
    x: X(x) - r, y: Y(y) - r, w: 2 * r, h: 2 * r, fill: { color: ctx.T.teal.accent }, line: { color: colors.bg, width: 1.25 },
  }));
}

// rejilla-grafo: f {cols, rows, modo: 'celdas' | 'grafo'}. Una rejilla como celdas o como grafo (un nodo por celda, aristas entre vecinas).
function rejillaGrafo(ctx, f, b) {
  const { colors } = ctx.theme;
  const cs = Math.min(b.w / f.cols, b.h / f.rows);
  const gx = b.x + (b.w - f.cols * cs) / 2, gy = b.y + (b.h - f.rows * cs) / 2;
  const cx = (c) => gx + (c + 0.5) * cs, cy = (r) => gy + (r + 0.5) * cs;
  const grafo = f.modo === 'grafo';
  for (let r = 0; r < f.rows; r++) for (let c = 0; c < f.cols; c++) {
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
      x: gx + c * cs + 0.02, y: gy + r * cs + 0.02, w: cs - 0.04, h: cs - 0.04,
      fill: { color: grafo ? colors.panel : ctx.T.teal.soft }, line: { color: grafo ? colors.border : ctx.T.teal.accent, width: 1.25 },
    });
  }
  if (!grafo) return;
  for (let r = 0; r < f.rows; r++) for (let c = 0; c < f.cols; c++) {
    if (c + 1 < f.cols) polyline(ctx, [[cx(c), cy(r)], [cx(c + 1), cy(r)]], { color: ctx.T.teal.accent, width: 3 });
    if (r + 1 < f.rows) polyline(ctx, [[cx(c), cy(r)], [cx(c), cy(r + 1)]], { color: ctx.T.teal.accent, width: 3 });
  }
  const nr = cs * 0.2;
  for (let r = 0; r < f.rows; r++) for (let c = 0; c < f.cols; c++) {
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, { x: cx(c) - nr, y: cy(r) - nr, w: 2 * nr, h: 2 * nr, fill: { color: ctx.T.teal.accent }, line: { color: colors.bg, width: 1.25 } });
  }
}

// Exploración sobre un mapa ASCII: '#' muro, 'S' inicio, 'G' meta, 'f' bosque, 'o' punto de ruta, '.' libre.
// opts {algo: 'bfs' | 'dijkstra', radius | steps, forestCost}: radius expande los nodos con distancia < radius (la frontera queda a radius);
// steps expande exactamente ese número de nodos. Devuelve {closed: Set, open: Set, n}.
function explorar(map, opts) {
  const rows = map.length, cols = Math.max(...map.map((r) => r.length));
  const at = (c, r) => (map[r] && map[r][c]) || '.';
  let start = null;
  map.forEach((row, r) => { [...row].forEach((ch, c) => { if (ch === 'S') start = [c, r]; }); });
  if (!start) throw new Error('La rejilla no tiene inicio (S)');
  const key = (c, r) => r * cols + c;
  const cost = (c, r) => (opts.algo === 'dijkstra' && at(c, r) === 'f' ? opts.forestCost || 5 : 1);
  const best = new Map([[key(...start), 0]]);
  const queue = [{ c: start[0], r: start[1], d: 0, seq: 0 }];
  const closed = new Set();
  let seq = 1, n = 0;
  while (queue.length) {
    queue.sort((a, b) => a.d - b.d || a.seq - b.seq);
    const cur = queue[0];
    if (closed.has(key(cur.c, cur.r)) || cur.d > best.get(key(cur.c, cur.r))) { queue.shift(); continue; }
    if (opts.radius !== undefined && cur.d >= opts.radius) break;
    if (opts.steps !== undefined && n >= opts.steps) break;
    queue.shift();
    closed.add(key(cur.c, cur.r));
    n++;
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dc, dr]) => {
      const c = cur.c + dc, r = cur.r + dr;
      if (c < 0 || r < 0 || c >= cols || r >= rows || at(c, r) === '#') return;
      const nd = cur.d + cost(c, r);
      if (!best.has(key(c, r)) || nd < best.get(key(c, r))) { best.set(key(c, r), nd); queue.push({ c, r, d: nd, seq: seq++ }); }
    });
  }
  const open = new Set();
  queue.forEach((q) => { if (!closed.has(key(q.c, q.r))) open.add(key(q.c, q.r)); });
  return { closed, open, n, cols, rows };
}

// Celda de rejilla: base ('free' | 'wall' | 'closed' | 'open') e icono ('start' triángulo, 'goal' cuadrado, 'dot' punto, 'tree' árbol).
function paintCell(ctx, x, y, w, h, { base = 'free', icon, tone = 'teal' }) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  const st = {
    free: { fill: colors.panel, line: colors.border },
    wall: { fill: T.slate.accent, line: T.slate.accent },
    closed: { fill: T.teal.soft, line: T.teal.accent },
    open: { fill: T.amber.soft, line: T.amber.accent },
  }[base];
  const ins = 0.015;
  ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: x + ins, y: y + ins, w: w - 2 * ins, h: h - 2 * ins, fill: { color: st.fill }, line: { color: st.line, width: 0.75 } });
  const m = Math.min(w, h), cx = x + w / 2, cy = y + h / 2;
  const shape = (type, d, fill) => ctx.slide.addShape(ctx.pptx.ShapeType[type], { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: fill }, line: { type: 'none' } });
  if (icon === 'start') shape('triangle', m * 0.66, T.green.accent);
  else if (icon === 'goal') shape('rect', m * 0.5, colors.heading);
  else if (icon === 'dot') shape('ellipse', m * 0.46, T[tone].accent);
  else if (icon === 'tree') shape('ellipse', m * 0.5, T.green.accent);
}

// Leyenda en filas: items[{k: 'free' | 'wall' | 'closed' | 'open' | 'start' | 'goal' | 'dot' | 'tree', label}]
function legendLayout(items, maxW) {
  const rows = [];
  let cur = [], x = 0;
  items.forEach((it) => {
    const tw = String(it.label).length * 0.095 + 0.1;
    const total = 0.3 + 0.12 + tw;
    if (cur.length && x + total > maxW) { rows.push(cur); cur = []; x = 0; }
    cur.push({ it, x, tw });
    x += total + 0.3;
  });
  if (cur.length) rows.push(cur);
  return rows;
}
const legendH = (rows) => rows.length * 0.4;

function legendDraw(ctx, rows, x, y, tone) {
  rows.forEach((row, i) => row.forEach(({ it, x: lx, tw }) => {
    const base = ['wall', 'closed', 'open'].includes(it.k) ? it.k : 'free';
    const icon = { start: 'start', goal: 'goal', dot: 'dot', tree: 'tree' }[it.k];
    paintCell(ctx, x + lx, y + i * 0.4 + 0.03, 0.3, 0.3, { base, icon, tone: it.tone || tone });
    text(ctx, it.label, { x: x + lx + 0.42, y: y + i * 0.4, w: tw, h: 0.36, fontSize: 14, color: ctx.theme.colors.slate, valign: 'middle' });
  }));
}

// rejilla: f {map[], explore, dotTone, legend[], legendSide (la leyenda va en la columna derecha), side (texto a la derecha), sideW (1.9),
// ex (exploración ya calculada)}
function rejilla(ctx, f, b) {
  const { colors } = ctx.theme;
  const rows = f.map.length, cols = Math.max(...f.map.map((r) => r.length));
  const ex = f.ex || (f.explore ? explorar(f.map, f.explore) : null);
  const lg = f.legend && !f.legendSide ? legendLayout(f.legend, b.w) : [];
  const lh = lg.length ? legendH(lg) + 0.1 : 0;
  const sideW = f.side || f.legendSide ? f.sideW || 1.9 : 0;
  const aw = b.w - sideW - (sideW ? 0.2 : 0), ah = b.h - lh;
  const cs = Math.min(aw / cols, ah / rows);
  const gx = b.x + (aw - cols * cs) / 2, gy = b.y + (ah - rows * cs) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const ch = (f.map[r] && f.map[r][c]) || '.';
    const id = r * cols + c;
    let base = 'free';
    if (ch === '#') base = 'wall';
    else if (ex && ex.closed.has(id)) base = 'closed';
    else if (ex && ex.open.has(id)) base = 'open';
    const icon = { S: 'start', G: 'goal', o: 'dot', f: 'tree' }[ch];
    paintCell(ctx, gx + c * cs, gy + r * cs, cs, cs, { base, icon, tone: f.dotTone });
  }
  if (sideW) {
    let sy = gy;
    if (f.side) {
      const th = f.sideH || estLines(f.side, 16, sideW) * lineH(16) + 0.1;
      text(ctx, f.side, { x: b.x + aw + 0.2, y: sy, w: sideW, h: th, fontSize: 16, color: colors.slate });
      sy += th + 0.25;
    }
    if (f.legendSide && f.legend) legendDraw(ctx, legendLayout(f.legend, sideW), b.x + aw + 0.2, sy, f.dotTone);
  }
  if (lg.length) legendDraw(ctx, lg, b.x + (b.w - Math.max(...lg.map((row) => row[row.length - 1].x + 0.42 + row[row.length - 1].tw))) / 2, b.y + b.h - legendH(lg), f.dotTone);
}

// rejillas: f {map (compartido), grids[{title, map, explore, dotTone}], legend[]}. Varias rejillas lado a lado con título y recuento.
function rejillas(ctx, f, b) {
  const { colors, fonts } = ctx.theme;
  const n = f.grids.length, gap = 0.3;
  const gw = (b.w - gap * (n - 1)) / n;
  const lg = f.legend ? legendLayout(f.legend, b.w) : [];
  const lh = lg.length ? legendH(lg) + 0.1 : 0;
  const th = 0.7;
  f.grids.forEach((g, i) => {
    const map = g.map || f.map;
    const ex = g.explore ? explorar(map, g.explore) : null;
    const x = b.x + i * (gw + gap);
    text(ctx, g.title, { x, y: b.y, w: gw, h: 0.36, fontSize: 18, bold: true, color: colors.heading, fontFace: fonts.heading, valign: 'middle', align: 'center' });
    if (ex) {
      const forest = [...ex.closed].filter((id) => map[Math.floor(id / ex.cols)][id % ex.cols] === 'f').length;
      text(ctx, `${ex.n} celdas expandidas, ${forest} de bosque`, { x, y: b.y + 0.36, w: gw, h: 0.3, fontSize: 14, color: colors.slate, valign: 'middle', align: 'center' });
    }
    rejilla(ctx, { map, ex }, { x, y: b.y + th, w: gw, h: b.h - th - lh });
  });
  if (lg.length) legendDraw(ctx, lg, b.x + (b.w - Math.max(...lg.map((row) => row[row.length - 1].x + 0.42 + row[row.length - 1].tw))) / 2, b.y + b.h - legendH(lg));
}

const FIGURAS = { escena, mapa, 'rejilla-grafo': rejillaGrafo, rejilla, rejillas };

// ------------------------------------------------------------------ paneles con imagen, figura nativa, texto, viñetas o código
// panels[{title (vacío: sin encabezado), tone, weight, figure, image, alt, caption, imageH, text, items, itemSize, code, lang, codeSize, note}],
// panelHeight, legend[{k, label}] (leyenda de rejilla bajo los paneles), callout. `figure` es una figura nativa ({type: escena | mapa | rejilla-grafo |
// rejilla | rejillas, ...}); ocupa el mismo lugar que `image` y también admite `caption` e `imageH`.
function paneles(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.panels.length, gap = 0.35;
  const weights = s.panels.map((p) => p.weight || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const avail = w - 2 * mx - gap * (n - 1);
  const top = 1.85;
  const bottom = s.panelHeight ? top + s.panelHeight : s.callout ? 5.85 : 6.7;
  let x = mx;
  s.panels.forEach((p, i) => {
    const pw = (avail * weights[i]) / total;
    const t = ctx.T[p.tone || 'navy'];
    C.surface(ctx, p.tone, { x, y: top, w: pw, h: bottom - top });
    if (p.title) {
      text(ctx, p.title, {
        x: x + 0.3, y: top + 0.15, w: pw - 0.6, h: 0.5, fontSize: 22, bold: true, color: p.tone ? t.text : colors.heading, fontFace: fonts.heading, valign: 'middle',
      });
    }
    const ix = x + 0.3, iw = pw - 0.6;
    let cy = top + (p.title ? 0.8 : 0.2);
    if (p.figure) {
      if (!FIGURAS[p.figure.type]) throw new Error('Figura desconocida: ' + p.figure.type);
      const ah = p.imageH || bottom - cy - 0.25 - (p.caption ? 0.7 : 0);
      box(ctx, { x: ix, y: cy, w: iw, h: ah, fill: colors.bg, line: colors.border, radius: 0.1 });
      FIGURAS[p.figure.type](ctx, p.figure, { x: ix + 0.12, y: cy + 0.12, w: iw - 0.24, h: ah - 0.24 });
      cy += ah + 0.1;
      if (p.caption) {
        text(ctx, p.caption, { x: ix, y: cy, w: iw, h: 0.55, fontSize: 16, color: colors.slate, align: 'center', valign: 'middle' });
        cy += 0.65;
      }
    }
    if (p.image) {
      const ah = p.imageH || bottom - cy - 0.25 - (p.caption ? 0.7 : 0);
      box(ctx, { x: ix, y: cy, w: iw, h: ah, fill: 'FFFFFF', radius: 0.1 });
      C.image(ctx, p.image, { x: ix + 0.12, y: cy + 0.12, w: iw - 0.24, h: ah - 0.24 }, p.alt);
      cy += ah + 0.1;
      if (p.caption) {
        text(ctx, p.caption, { x: ix, y: cy, w: iw, h: 0.55, fontSize: 16, color: colors.slate, align: 'center', valign: 'middle' });
        cy += 0.65;
      }
    }
    if (p.text) {
      const fs = p.textSize || 19;
      const th = estLines(p.text, fs, iw) * lineH(fs) + 0.1;
      text(ctx, p.text, { x: ix, y: cy, w: iw, h: th, fontSize: fs, color: colors.slate });
      cy += th + 0.15;
    }
    if (p.items) {
      const fs = p.itemSize || 20;
      const th = p.items.reduce((a, it) => a + estLines(it, fs, iw - 0.3) * lineH(fs) + 14 / 72, 0);
      paragraphs(ctx, p.items, { x: ix, y: cy, w: iw, h: th, fontSize: fs, bullet: true, spaceAfter: 14, color: colors.ink });
      cy += th + 0.1;
    }
    if (p.code) {
      const ch = codeBlock(ctx, { x: ix, y: cy, w: iw, code: p.code, lang: p.lang, fontSize: p.codeSize || 15 });
      cy += ch + 0.2;
    }
    if (p.note) {
      const fs = p.noteSize || 18;
      text(ctx, p.note, { x: ix, y: cy, w: iw, h: bottom - cy - 0.2, fontSize: fs, color: colors.slate });
    }
    x += pw + gap;
  });
  let cy = bottom + 0.2;
  if (s.legend) {
    const lg = legendLayout(s.legend, w - 2 * mx);
    legendDraw(ctx, lg, mx, bottom + 0.12);
    cy = bottom + 0.12 + legendH(lg) + 0.12;
  }
  if (s.callout) callout(ctx, { x: mx, y: cy, w: w - 2 * mx, h: s.calloutH || 0.8, ...s.callout });
}

// ------------------------------------------------------------------ rejilla numerada (pathfinding / A*)
// Los nodos se numeran por filas, de 1 a cols*rows. Estados de celda: free, wall, start, goal, closed, open, next, path.
function cellStyle(ctx, state) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  switch (state) {
    case 'wall': return { fill: T.slate.accent, line: T.slate.accent, color: T.slate.on, id: T.slate.on };
    case 'start': return { fill: T.green.accent, line: T.green.accent, color: T.green.on, id: T.green.on };
    case 'goal': return { fill: colors.heading, line: colors.heading, color: colors.bg, id: colors.bg };
    case 'closed': return { fill: T.teal.soft, line: T.teal.accent, color: T.teal.text, id: T.teal.text };
    case 'open': return { fill: T.amber.soft, line: T.amber.accent, color: T.amber.text, id: T.amber.text };
    case 'next': return { fill: T.amber.accent, line: T.amber.accent, color: T.amber.on, id: T.amber.on };
    case 'path': return { fill: T.green.soft, line: T.green.accent, color: T.green.text, id: T.green.text };
    case 'free': return { fill: colors.panel, line: colors.border, color: colors.ink, id: colors.muted };
    default: throw new Error('Estado de celda desconocido: ' + state);
  }
}

// g: {cols, rows, walls[], start, goal, states{id: estado}, main[fila][col] (texto central), cellW (1.0), cellH (0.66),
//     showId (true), labels (true: «Muro», «Inicio», «Meta»), startLabel, goalLabel, wallLabel, mainSize (18), dimFree (texto gris en celdas libres)}
function drawGrid(ctx, g, x, y) {
  const { colors } = ctx.theme;
  const cw = g.cellW || 1.0, ch = g.cellH || 0.66, inset = 0.025;
  const walls = new Set(g.walls || []);
  const showId = g.showId !== false, labels = g.labels !== false;
  for (let id = 1; id <= g.cols * g.rows; id++) {
    const r = Math.floor((id - 1) / g.cols), c = (id - 1) % g.cols;
    const cx = x + c * cw, cy = y + r * ch;
    const state = (g.states && g.states[id]) || (walls.has(id) ? 'wall' : id === g.start ? 'start' : id === g.goal ? 'goal' : 'free');
    const st = cellStyle(ctx, state);
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
      x: cx + inset, y: cy + inset, w: cw - 2 * inset, h: ch - 2 * inset, fill: { color: st.fill }, line: { color: st.line, width: 1.25 },
    });
    if (showId) text(ctx, String(id), { x: cx + 0.08, y: cy + 0.03, w: 0.5, h: 0.24, fontSize: 14, color: st.id, valign: 'middle' });
    const tag = labels && showId ? (id === g.start ? g.startLabel || 'Inicio' : id === g.goal ? g.goalLabel || 'Meta' : null) : null;
    if (tag) text(ctx, tag, { x: cx + 0.45, y: cy + 0.03, w: cw - 0.53, h: 0.24, fontSize: 14, bold: true, color: st.id, align: 'right', valign: 'middle' });
    const my = cy + (showId ? 0.26 : inset), mh = ch - (showId ? 0.26 : inset) - inset - 0.02;
    if (state === 'wall') {
      if (labels) text(ctx, g.wallLabel || 'Muro', { x: cx, y: my, w: cw, h: mh, fontSize: 14, color: st.color, align: 'center', valign: 'middle' });
      continue;
    }
    const main = g.main && g.main[r] ? g.main[r][c] : '';
    if (main) {
      const dim = g.dimFree && state === 'free';
      text(ctx, String(main), { x: cx, y: my, w: cw, h: mh, fontSize: g.mainSize || 18, bold: !dim, color: dim ? colors.muted : st.color, align: 'center', valign: 'middle' });
    }
  }
  return { w: g.cols * cw, h: g.rows * ch };
}

// items[{state, label}]: muestra de color + etiqueta; salta de línea si no cabe. Devuelve el alto usado.
function drawLegend(ctx, items, x, y, maxW) {
  const { colors } = ctx.theme;
  let lx = x, ly = y;
  items.forEach((it) => {
    const tw = String(it.label).length * 0.095 + 0.1;
    const total = 0.3 + 0.12 + tw;
    if (lx > x && lx + total > x + maxW) { lx = x; ly += 0.42; }
    const st = cellStyle(ctx, it.state);
    ctx.slide.addShape(ctx.pptx.ShapeType.rect, { x: lx, y: ly + 0.03, w: 0.3, h: 0.3, fill: { color: st.fill }, line: { color: st.line, width: 1.25 } });
    text(ctx, it.label, { x: lx + 0.42, y: ly, w: tw, h: 0.36, fontSize: 14, color: colors.slate, valign: 'middle' });
    lx += total + 0.3;
  });
  return ly + 0.36 - y;
}

// Bloques de la columna derecha de busqueda-grid; cada uno devuelve su alto.
const SIDE = {
  legend: (ctx, b, x, y, w) => drawLegend(ctx, b.items, x, y, w),

  text(ctx, b, x, y, w) {
    const { colors } = ctx.theme;
    let h = 0;
    if (b.label) {
      text(ctx, b.label, { x, y, w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
      h += 0.4;
    }
    const fs = b.size || 17;
    const th = estLines(b.text, fs, w) * lineH(fs) + 0.1;
    text(ctx, b.text, { x, y: y + h, w, h: th, fontSize: fs, color: colors.ink });
    return h + th;
  },

  list(ctx, b, x, y, w) {
    const fs = b.size || 18;
    const h = b.items.reduce((a, it) => a + estLines(it, fs, w - 0.35) * lineH(fs) + 10 / 72, 0);
    paragraphs(ctx, b.items, { x, y, w, h, fontSize: fs, bullet: true, spaceAfter: 10, color: ctx.theme.colors.ink });
    return h;
  },

  note(ctx, b, x, y, w) {
    const fs = b.size || 17;
    const h = Math.max(0.7, estLines((b.label ? b.label + ' ' : '') + b.text, fs, w - 0.5) * lineH(fs) + 0.3);
    callout(ctx, { x, y, w, h, tone: b.tone || 'teal', label: b.label, text: b.text, size: fs });
    return h;
  },

  // columns, rows, colWeights, rowH (0.45), fontSize (16), hlRows[] (filas de datos resaltadas), hlTone ('amber'), label
  table(ctx, b, x, y, w) {
    const { colors } = ctx.theme;
    const T = ctx.T;
    let h = 0;
    if (b.label) {
      text(ctx, b.label, { x, y, w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
      h += 0.4;
    }
    const weights = b.colWeights || b.columns.map(() => 1);
    const sum = weights.reduce((a, c) => a + c, 0);
    const colW = weights.map((v) => (v / sum) * w);
    const rowH = b.rowH || 0.45;
    const hl = new Set(b.hlRows || []);
    const tone = T[b.hlTone || 'amber'];
    const tb = table(ctx, {
      x, y: y + h, colW, header: b.columns, rows: b.rows, rowH: [rowH, ...b.rows.map(() => rowH)], fontSize: b.fontSize || 16,
      align: b.columns.map(() => 'center'),
      cellStyle: (r, c) => {
        if (hl.has(r)) return { fill: tone.soft, color: tone.text, bold: true };
        return c === 0 ? { bold: true, color: colors.heading, fill: colors.tealLight } : {};
      },
    });
    return h + tb.h;
  },
};

function gridPanels(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.grids.length, gap = 0.35;
  const pw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = s.top || 1.85;
  const gh = Math.max(...s.grids.map((g) => g.rows * (g.cellH || 0.66)));
  const ph = 0.62 + gh + 0.15;
  s.grids.forEach((g, i) => {
    const x = mx + i * (pw + gap);
    C.surface(ctx, g.tone, { x, y: top, w: pw, h: ph });
    const t = ctx.T[g.tone || 'teal'];
    text(ctx, g.title, { x: x + 0.3, y: top + 0.08, w: pw - 0.6, h: 0.5, fontSize: 22, bold: true, color: g.tone ? t.text : colors.heading, fontFace: fonts.heading, valign: 'middle' });
    drawGrid(ctx, g, x + (pw - g.cols * (g.cellW || 1.0)) / 2, top + 0.62);
  });
  let y = top + ph + 0.15;
  if (s.legend) y += drawLegend(ctx, s.legend, mx, y, w - 2 * mx) + 0.12;
  if (s.callout) callout(ctx, { x: mx, y, w: w - 2 * mx, h: s.calloutH || 0.55, size: 16, ...s.callout });
}

// Una rejilla (`grid`) con columna derecha de bloques (`side`: legend, text, list, note, table), o varias (`grids[{title, tone, ...rejilla}]`)
// en paneles con `legend` y `callout` debajo.
function gridDiagram(ctx, s) {
  if (s.grids) return gridPanels(ctx, s);
  const { mx, w } = ctx.theme.page;
  const g = s.grid;
  const top = s.top || 1.85;
  drawGrid(ctx, g, mx, top);
  const sx = mx + g.cols * (g.cellW || 1.0) + (s.sideGap || 0.45);
  let y = top;
  (s.side || []).forEach((b) => {
    if (!SIDE[b.type]) throw new Error('Bloque desconocido: ' + b.type);
    y += SIDE[b.type](ctx, b, sx, y, w - mx - sx) + (b.gap !== undefined ? b.gap : 0.25);
  });
}

module.exports = {
  'busqueda-array-steps': arraySteps,
  'busqueda-recorrido': recorrido,
  'busqueda-formula': formula,
  'busqueda-paneles': paneles,
  'busqueda-grid': gridDiagram,
};
